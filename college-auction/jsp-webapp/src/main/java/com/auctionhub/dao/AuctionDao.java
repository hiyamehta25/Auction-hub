package com.auctionhub.dao;

import com.auctionhub.db.DbUtil;
import com.auctionhub.model.AuctionRow;
import java.math.BigDecimal;
import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Timestamp;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

public class AuctionDao {

  private static AuctionRow mapRow(ResultSet rs) throws SQLException {
    Timestamp ends = rs.getTimestamp("ends_at");
    LocalDateTime endsAt = ends != null ? ends.toLocalDateTime() : null;
    return new AuctionRow(
        rs.getInt("auction_id"),
        rs.getInt("item_id"),
        rs.getString("title"),
        rs.getString("description"),
        rs.getString("seller_name"),
        rs.getBigDecimal("starting_price"),
        rs.getBigDecimal("current_price"),
        endsAt,
        rs.getString("status"));
  }

  public List<AuctionRow> listOpen() throws SQLException {
    String sql =
        "SELECT a.id AS auction_id, i.id AS item_id, i.title, i.description, u.username AS seller_name, "
            + "a.starting_price, a.current_price, a.ends_at, a.status "
            + "FROM auctions a "
            + "JOIN items i ON i.id = a.item_id "
            + "JOIN users u ON u.id = i.seller_id "
            + "WHERE a.status = 'OPEN' "
            + "ORDER BY a.ends_at ASC";
    try (Connection c = DbUtil.getConnection();
        PreparedStatement ps = c.prepareStatement(sql);
        ResultSet rs = ps.executeQuery()) {
      List<AuctionRow> list = new ArrayList<>();
      while (rs.next()) {
        list.add(mapRow(rs));
      }
      return list;
    }
  }

  public Optional<AuctionRow> findByAuctionId(int auctionId) throws SQLException {
    String sql =
        "SELECT a.id AS auction_id, i.id AS item_id, i.title, i.description, u.username AS seller_name, "
            + "a.starting_price, a.current_price, a.ends_at, a.status "
            + "FROM auctions a "
            + "JOIN items i ON i.id = a.item_id "
            + "JOIN users u ON u.id = i.seller_id "
            + "WHERE a.id = ?";
    try (Connection c = DbUtil.getConnection();
        PreparedStatement ps = c.prepareStatement(sql)) {
      ps.setInt(1, auctionId);
      try (ResultSet rs = ps.executeQuery()) {
        if (!rs.next()) {
          return Optional.empty();
        }
        return Optional.of(mapRow(rs));
      }
    }
  }

  public void createItemAndAuction(
      int sellerId, String title, String description, BigDecimal startingPrice, LocalDateTime endsAt)
      throws SQLException {
    String insertItem = "INSERT INTO items (title, description, seller_id) VALUES (?,?,?)";
    String insertAuction =
        "INSERT INTO auctions (item_id, starting_price, current_price, ends_at, status) VALUES (?,?,?,?, 'OPEN')";
    try (Connection c = DbUtil.getConnection()) {
      c.setAutoCommit(false);
      try {
        int itemId;
        try (PreparedStatement ps = c.prepareStatement(insertItem, PreparedStatement.RETURN_GENERATED_KEYS)) {
          ps.setString(1, title);
          ps.setString(2, description);
          ps.setInt(3, sellerId);
          ps.executeUpdate();
          try (ResultSet keys = ps.getGeneratedKeys()) {
            keys.next();
            itemId = keys.getInt(1);
          }
        }
        try (PreparedStatement ps = c.prepareStatement(insertAuction)) {
          ps.setInt(1, itemId);
          ps.setBigDecimal(2, startingPrice);
          ps.setBigDecimal(3, startingPrice);
          ps.setTimestamp(4, Timestamp.valueOf(endsAt));
          ps.executeUpdate();
        }
        c.commit();
      } catch (SQLException e) {
        c.rollback();
        throw e;
      } finally {
        c.setAutoCommit(true);
      }
    }
  }

  /**
   * Places bid if amount &gt; current_price, auction OPEN, and before ends_at. Updates current_price and
   * optional winner_id.
   */
  public boolean placeBid(int auctionId, int bidderId, BigDecimal amount) throws SQLException {
    String lock =
        "SELECT id, current_price, ends_at, status FROM auctions WHERE id = ? FOR UPDATE";
    String insertBid = "INSERT INTO bids (auction_id, bidder_id, amount) VALUES (?,?,?)";
    String update =
        "UPDATE auctions SET current_price = ?, winner_id = ? WHERE id = ? AND status = 'OPEN'";
    try (Connection c = DbUtil.getConnection()) {
      c.setAutoCommit(false);
      try {
        BigDecimal current;
        LocalDateTime endsAt;
        String status;
        try (PreparedStatement ps = c.prepareStatement(lock)) {
          ps.setInt(1, auctionId);
          try (ResultSet rs = ps.executeQuery()) {
            if (!rs.next()) {
              c.rollback();
              return false;
            }
            current = rs.getBigDecimal("current_price");
            Timestamp ends = rs.getTimestamp("ends_at");
            endsAt = ends != null ? ends.toLocalDateTime() : null;
            status = rs.getString("status");
          }
        }
        if (!"OPEN".equals(status) || endsAt == null || LocalDateTime.now().isAfter(endsAt)) {
          c.rollback();
          return false;
        }
        if (amount.compareTo(current) <= 0) {
          c.rollback();
          return false;
        }
        try (PreparedStatement ps = c.prepareStatement(insertBid)) {
          ps.setInt(1, auctionId);
          ps.setInt(2, bidderId);
          ps.setBigDecimal(3, amount);
          ps.executeUpdate();
        }
        try (PreparedStatement ps = c.prepareStatement(update)) {
          ps.setBigDecimal(1, amount);
          ps.setInt(2, bidderId);
          ps.setInt(3, auctionId);
          int n = ps.executeUpdate();
          c.commit();
          return n == 1;
        }
      } catch (SQLException e) {
        c.rollback();
        throw e;
      } finally {
        c.setAutoCommit(true);
      }
    }
  }

  public void closeExpired() throws SQLException {
    String sql = "UPDATE auctions SET status = 'CLOSED' WHERE status = 'OPEN' AND ends_at < NOW()";
    try (Connection c = DbUtil.getConnection();
        PreparedStatement ps = c.prepareStatement(sql)) {
      ps.executeUpdate();
    }
  }

  public Optional<Integer> getSellerIdForAuction(int auctionId) throws SQLException {
    String sql = "SELECT i.seller_id FROM auctions a JOIN items i ON i.id = a.item_id WHERE a.id = ?";
    try (Connection c = DbUtil.getConnection();
        PreparedStatement ps = c.prepareStatement(sql)) {
      ps.setInt(1, auctionId);
      try (ResultSet rs = ps.executeQuery()) {
        if (!rs.next()) {
          return Optional.empty();
        }
        int sid = rs.getInt(1);
        if (rs.wasNull()) {
          return Optional.empty();
        }
        return Optional.of(sid);
      }
    }
  }
}
