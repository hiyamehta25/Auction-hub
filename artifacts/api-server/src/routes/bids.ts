import { Router, Response } from "express";
import { db, auctionsTable, bidsTable, usersTable } from "@workspace/db";
import { eq, desc } from "drizzle-orm";
import { authenticateToken, AuthRequest } from "../middleware/auth.js";

const router = Router();

router.post("/", authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const { auctionId, amount } = req.body;

    if (!auctionId || !amount) {
      res.status(400).json({ error: "Auction ID and bid amount are required" });
      return;
    }

    const bidAmount = parseFloat(amount);
    if (isNaN(bidAmount) || bidAmount <= 0) {
      res.status(400).json({ error: "Bid amount must be a positive number" });
      return;
    }

    const [auction] = await db
      .select()
      .from(auctionsTable)
      .where(eq(auctionsTable.id, parseInt(auctionId)))
      .limit(1);

    if (!auction) {
      res.status(404).json({ error: "Auction not found" });
      return;
    }

    if (auction.status !== "active") {
      res.status(400).json({ error: "Auction is no longer active" });
      return;
    }

    if (new Date(auction.endTime) < new Date()) {
      await db
        .update(auctionsTable)
        .set({ status: "ended" })
        .where(eq(auctionsTable.id, auction.id));
      res.status(400).json({ error: "Auction has ended" });
      return;
    }

    const currentPrice = parseFloat(auction.currentPrice as unknown as string);
    if (bidAmount <= currentPrice) {
      res.status(400).json({ error: `Bid must be higher than current price of $${currentPrice.toFixed(2)}` });
      return;
    }

    const [bid] = await db
      .insert(bidsTable)
      .values({
        auctionId: parseInt(auctionId),
        userId: req.userId!,
        amount: bidAmount.toString(),
      })
      .returning();

    await db
      .update(auctionsTable)
      .set({ currentPrice: bidAmount.toString() })
      .where(eq(auctionsTable.id, parseInt(auctionId)));

    const [user] = await db
      .select()
      .from(usersTable)
      .where(eq(usersTable.id, req.userId!))
      .limit(1);

    res.status(201).json({
      id: bid.id,
      auctionId: bid.auctionId,
      userId: bid.userId,
      username: user?.username || "",
      amount: parseFloat(bid.amount as unknown as string),
      createdAt: bid.createdAt,
    });
  } catch (err) {
    console.error("Place bid error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
