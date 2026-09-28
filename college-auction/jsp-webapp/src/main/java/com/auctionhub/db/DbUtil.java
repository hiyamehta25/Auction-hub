package com.auctionhub.db;

import java.io.IOException;
import java.io.InputStream;
import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.SQLException;
import java.util.Properties;

public final class DbUtil {
  private static final Properties PROPS = new Properties();

  static {
    try (InputStream in = DbUtil.class.getClassLoader().getResourceAsStream("db.properties")) {
      if (in == null) {
        throw new IllegalStateException("db.properties missing on classpath");
      }
      PROPS.load(in);
      Class.forName("com.mysql.cj.jdbc.Driver");
    } catch (IOException | ClassNotFoundException e) {
      throw new ExceptionInInitializerError(e);
    }
  }

  private DbUtil() {}

  public static Connection getConnection() throws SQLException {
    return DriverManager.getConnection(
        PROPS.getProperty("jdbc.url"),
        PROPS.getProperty("jdbc.user"),
        PROPS.getProperty("jdbc.password"));
  }
}
