package com.auctionhub.dao;

import com.auctionhub.db.DbUtil;
import com.auctionhub.model.User;
import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.Optional;

public class UserDao {

  public Optional<User> findByCredentials(String username, String password) throws SQLException {
    String sql = "SELECT id, username, email FROM users WHERE username = ? AND password_plain = ?";
    try (Connection c = DbUtil.getConnection();
        PreparedStatement ps = c.prepareStatement(sql)) {
      ps.setString(1, username);
      ps.setString(2, password);
      try (ResultSet rs = ps.executeQuery()) {
        if (!rs.next()) {
          return Optional.empty();
        }
        return Optional.of(
            new User(rs.getInt("id"), rs.getString("username"), rs.getString("email")));
      }
    }
  }

  public boolean existsUsernameOrEmail(String username, String email) throws SQLException {
    String sql = "SELECT 1 FROM users WHERE username = ? OR email = ? LIMIT 1";
    try (Connection c = DbUtil.getConnection();
        PreparedStatement ps = c.prepareStatement(sql)) {
      ps.setString(1, username);
      ps.setString(2, email);
      try (ResultSet rs = ps.executeQuery()) {
        return rs.next();
      }
    }
  }

  public void insert(String username, String email, String passwordPlain) throws SQLException {
    String sql = "INSERT INTO users (username, email, password_plain) VALUES (?,?,?)";
    try (Connection c = DbUtil.getConnection();
        PreparedStatement ps = c.prepareStatement(sql)) {
      ps.setString(1, username);
      ps.setString(2, email);
      ps.setString(3, passwordPlain);
      ps.executeUpdate();
    }
  }
}
