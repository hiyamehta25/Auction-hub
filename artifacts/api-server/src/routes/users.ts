import { Router, Response } from "express";
import { db, auctionsTable, bidsTable, usersTable } from "@workspace/db";
import { eq, desc, count } from "drizzle-orm";
import { authenticateToken, AuthRequest } from "../middleware/auth.js";

const router = Router();

router.get("/dashboard", authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId!;

    const myAuctionRows = await db
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
      .where(eq(auctionsTable.sellerId, userId))
      .orderBy(desc(auctionsTable.createdAt));

    const myBidRows = await db
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
      .where(eq(bidsTable.userId, userId))
      .orderBy(desc(bidsTable.createdAt));

    const wonAuctions: typeof myAuctionRows = [];
    for (const auction of myAuctionRows) {
      if (auction.status === "ended") {
        const [topBid] = await db
          .select()
          .from(bidsTable)
          .where(eq(bidsTable.auctionId, auction.id))
          .orderBy(desc(bidsTable.amount))
          .limit(1);
        if (topBid && topBid.userId === userId) {
          wonAuctions.push(auction);
        }
      }
    }

    const bidCountResult = await db
      .select({ cnt: count() })
      .from(bidsTable)
      .where(eq(bidsTable.userId, userId));

    const activeAuctions = myAuctionRows.filter(a => a.status === "active").length;

    const formatAuctionRow = async (row: typeof myAuctionRows[0]) => {
      const bidCountRes = await db
        .select({ cnt: count() })
        .from(bidsTable)
        .where(eq(bidsTable.auctionId, row.id));
      return {
        id: row.id,
        title: row.title,
        description: row.description,
        imageUrl: row.imageUrl,
        startingPrice: parseFloat(row.startingPrice as unknown as string),
        currentPrice: parseFloat(row.currentPrice as unknown as string),
        category: row.category,
        endTime: row.endTime,
        sellerId: row.sellerId,
        sellerUsername: row.sellerUsername || "",
        status: row.status,
        bidCount: Number(bidCountRes[0]?.cnt ?? 0),
        createdAt: row.createdAt,
      };
    };

    const myAuctions = await Promise.all(myAuctionRows.map(formatAuctionRow));
    const wonAuctionsFormatted = await Promise.all(wonAuctions.map(formatAuctionRow));
    const formattedBids = myBidRows.map(b => ({
      ...b,
      amount: parseFloat(b.amount as unknown as string),
    }));

    res.json({
      myAuctions,
      myBids: formattedBids,
      wonAuctions: wonAuctionsFormatted,
      stats: {
        activeAuctions,
        totalBids: Number(bidCountResult[0]?.cnt ?? 0),
        auctionsWon: wonAuctions.length,
      },
    });
  } catch (err) {
    console.error("Dashboard error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
