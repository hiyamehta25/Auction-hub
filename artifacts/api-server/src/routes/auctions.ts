import { Router, Request, Response } from "express";
import multer from "multer";
import path from "path";
import fs from "fs";
import { db, auctionsTable, usersTable, bidsTable } from "@workspace/db";
import { eq, desc, ilike, and, or, count, sql } from "drizzle-orm";
import { authenticateToken, optionalAuth, AuthRequest } from "../middleware/auth.js";

const router = Router();

const uploadsDir = path.join(process.cwd(), "uploads");
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `${Date.now()}-${Math.random().toString(36).substr(2, 9)}${ext}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    const allowed = ["image/jpeg", "image/png", "image/webp", "image/gif"];
    if (allowed.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error("Only image files are allowed"));
    }
  },
});

async function formatAuction(auction: typeof auctionsTable.$inferSelect & { sellerUsername?: string; bidCount?: number }) {
  const bidCountResult = await db
    .select({ cnt: count() })
    .from(bidsTable)
    .where(eq(bidsTable.auctionId, auction.id));

  return {
    id: auction.id,
    title: auction.title,
    description: auction.description,
    imageUrl: auction.imageUrl,
    startingPrice: parseFloat(auction.startingPrice as unknown as string),
    currentPrice: parseFloat(auction.currentPrice as unknown as string),
    category: auction.category,
    endTime: auction.endTime,
    sellerId: auction.sellerId,
    sellerUsername: auction.sellerUsername || "",
    status: auction.status,
    bidCount: Number(bidCountResult[0]?.cnt ?? 0),
    createdAt: auction.createdAt,
  };
}

router.get("/", optionalAuth, async (req: Request, res: Response) => {
  try {
    const { category, search, page = "1", limit = "12" } = req.query as Record<string, string>;
    const pageNum = Math.max(1, parseInt(page));
    const limitNum = Math.min(50, Math.max(1, parseInt(limit)));
    const offset = (pageNum - 1) * limitNum;

    const conditions: ReturnType<typeof eq>[] = [];

    if (category && category !== "all") {
      conditions.push(eq(auctionsTable.category, category));
    }

    const rows = await db
      .select({
        id: auctionsTable.id,
        title: auctionsTable.title,
        description: auctionsTable.description,
        imageUrl: auctionsTable.imageUrl,
        startingPrice: auctionsTable.startingPrice,
        currentPrice: auctionsTable.currentPrice,
        category: auctionsTable.category,
        endTime: auctionsTable.endTime,
        sellerId: auctionsTable.sellerId,
        sellerUsername: usersTable.username,
        status: auctionsTable.status,
        createdAt: auctionsTable.createdAt,
      })
      .from(auctionsTable)
      .innerJoin(usersTable, eq(auctionsTable.sellerId, usersTable.id))
      .where(
        search
          ? and(
              ...conditions,
              or(
                ilike(auctionsTable.title, `%${search}%`),
                ilike(auctionsTable.description, `%${search}%`)
              )
            )
          : conditions.length > 0
          ? and(...conditions)
          : undefined
      )
      .orderBy(desc(auctionsTable.createdAt))
      .limit(limitNum)
      .offset(offset);

    const totalResult = await db
      .select({ cnt: count() })
      .from(auctionsTable)
      .innerJoin(usersTable, eq(auctionsTable.sellerId, usersTable.id))
      .where(
        search
          ? and(
              ...conditions,
              or(
                ilike(auctionsTable.title, `%${search}%`),
                ilike(auctionsTable.description, `%${search}%`)
              )
            )
          : conditions.length > 0
          ? and(...conditions)
          : undefined
      );

    const auctions = await Promise.all(rows.map(row => formatAuction(row as any)));

    res.json({
      auctions,
      total: Number(totalResult[0]?.cnt ?? 0),
      page: pageNum,
      limit: limitNum,
    });
  } catch (err) {
    console.error("Get auctions error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/", authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const { title, description, startingPrice, category, endTime } = req.body;

    if (!title || !description || !startingPrice || !category || !endTime) {
      res.status(400).json({ error: "All fields are required" });
      return;
    }

    const price = parseFloat(startingPrice);
    if (isNaN(price) || price <= 0) {
      res.status(400).json({ error: "Starting price must be a positive number" });
      return;
    }

    const end = new Date(endTime);
    if (isNaN(end.getTime()) || end <= new Date()) {
      res.status(400).json({ error: "End time must be in the future" });
      return;
    }

    const [auction] = await db
      .insert(auctionsTable)
      .values({
        title,
        description,
        startingPrice: price.toString(),
        currentPrice: price.toString(),
        category,
        endTime: end,
        sellerId: req.userId!,
        status: "active",
      })
      .returning();

    const [user] = await db.select().from(usersTable).where(eq(usersTable.id, req.userId!)).limit(1);

    res.status(201).json(await formatAuction({ ...auction, sellerUsername: user?.username }));
  } catch (err) {
    console.error("Create auction error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/:id", optionalAuth, async (req: Request, res: Response) => {
  try {
    const auctionId = parseInt(req.params.id);
    if (isNaN(auctionId)) {
      res.status(400).json({ error: "Invalid auction ID" });
      return;
    }

    const [row] = await db
      .select({
        id: auctionsTable.id,
        title: auctionsTable.title,
        description: auctionsTable.description,
        imageUrl: auctionsTable.imageUrl,
        startingPrice: auctionsTable.startingPrice,
        currentPrice: auctionsTable.currentPrice,
        category: auctionsTable.category,
        endTime: auctionsTable.endTime,
        sellerId: auctionsTable.sellerId,
        sellerUsername: usersTable.username,
        status: auctionsTable.status,
        createdAt: auctionsTable.createdAt,
      })
      .from(auctionsTable)
      .innerJoin(usersTable, eq(auctionsTable.sellerId, usersTable.id))
      .where(eq(auctionsTable.id, auctionId))
      .limit(1);

    if (!row) {
      res.status(404).json({ error: "Auction not found" });
      return;
    }

    const bids = await db
      .select({
        id: bidsTable.id,
        auctionId: bidsTable.auctionId,
        userId: bidsTable.userId,
        username: usersTable.username,
        amount: bidsTable.amount,
        createdAt: bidsTable.createdAt,
      })
      .from(bidsTable)
      .innerJoin(usersTable, eq(bidsTable.userId, usersTable.id))
      .where(eq(bidsTable.auctionId, auctionId))
      .orderBy(desc(bidsTable.createdAt));

    const formattedBids = bids.map(b => ({
      ...b,
      amount: parseFloat(b.amount as unknown as string),
    }));

    const auction = await formatAuction(row as any);

    res.json({ auction, bids: formattedBids });
  } catch (err) {
    console.error("Get auction error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/:id/image", authenticateToken, upload.single("image"), async (req: AuthRequest, res: Response) => {
  try {
    const auctionId = parseInt(req.params.id);
    if (isNaN(auctionId)) {
      res.status(400).json({ error: "Invalid auction ID" });
      return;
    }

    if (!req.file) {
      res.status(400).json({ error: "No image provided" });
      return;
    }

    const [auction] = await db
      .select()
      .from(auctionsTable)
      .where(and(eq(auctionsTable.id, auctionId), eq(auctionsTable.sellerId, req.userId!)))
      .limit(1);

    if (!auction) {
      res.status(404).json({ error: "Auction not found or not authorized" });
      return;
    }

    const imageUrl = `/api/uploads/${req.file.filename}`;

    const [updated] = await db
      .update(auctionsTable)
      .set({ imageUrl })
      .where(eq(auctionsTable.id, auctionId))
      .returning();

    const [user] = await db.select().from(usersTable).where(eq(usersTable.id, req.userId!)).limit(1);

    res.json(await formatAuction({ ...updated, sellerUsername: user?.username }));
  } catch (err) {
    console.error("Upload image error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
