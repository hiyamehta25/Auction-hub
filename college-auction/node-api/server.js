"use strict";

require("dotenv").config();

const express = require("express");
const cors = require("cors");
const mysql = require("mysql2/promise");

const PORT = Number(process.env.PORT || 3000);
const pool = mysql.createPool({
  host: process.env.DB_HOST || "localhost",
  port: Number(process.env.DB_PORT || 3306),
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "0000",
  database: process.env.DB_NAME || "auction_hub",
  waitForConnections: true,
  connectionLimit: 10,
});

const app = express();
app.use(cors({ origin: true }));
app.use(express.json());

app.get("/", (_req, res) => {
  res.type("json").json({
    service: "Auction Hub Node API",
    endpoints: {
      health: "GET /health",
      listAuctions: "GET /api/auctions",
      auctionById: "GET /api/auctions/:id",
    },
    note: "The JSP app runs on Tomcat; this server is JSON only.",
  });
});

app.get("/health", (_req, res) => {
  res.json({ ok: true });
});

app.get("/api/auctions", async (_req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT a.id AS auctionId, i.title, a.current_price AS currentPrice, a.status, a.ends_at AS endsAt
       FROM auctions a
       JOIN items i ON i.id = a.item_id
       WHERE a.status = 'OPEN'
       ORDER BY a.ends_at ASC`
    );
    res.json(rows);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "database_error" });
  }
});

app.get("/api/auctions/:id", async (req, res) => {
  const id = Number(req.params.id);
  if (!Number.isInteger(id) || id < 1) {
    return res.status(400).json({ error: "invalid_id" });
  }
  try {
    const [rows] = await pool.query(
      `SELECT a.id AS auctionId, i.title, i.description, a.starting_price AS startingPrice,
              a.current_price AS currentPrice, a.status, a.ends_at AS endsAt, u.username AS sellerName
       FROM auctions a
       JOIN items i ON i.id = a.item_id
       JOIN users u ON u.id = i.seller_id
       WHERE a.id = ?`,
      [id]
    );
    if (!rows.length) {
      return res.status(404).json({ error: "not_found" });
    }
    res.json(rows[0]);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "database_error" });
  }
});

app.listen(PORT, () => {
  console.log(`Auction Hub Node API http://localhost:${PORT}`);
});
