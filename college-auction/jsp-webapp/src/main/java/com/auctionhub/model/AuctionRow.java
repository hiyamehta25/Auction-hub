package com.auctionhub.model;

import java.math.BigDecimal;
import java.time.LocalDateTime;

/** List/detail row for JSP. */
public class AuctionRow {
  private final int auctionId;
  private final int itemId;
  private final String title;
  private final String description;
  private final String sellerName;
  private final BigDecimal startingPrice;
  private final BigDecimal currentPrice;
  private final LocalDateTime endsAt;
  private final String status;

  public AuctionRow(
      int auctionId,
      int itemId,
      String title,
      String description,
      String sellerName,
      BigDecimal startingPrice,
      BigDecimal currentPrice,
      LocalDateTime endsAt,
      String status) {
    this.auctionId = auctionId;
    this.itemId = itemId;
    this.title = title;
    this.description = description;
    this.sellerName = sellerName;
    this.startingPrice = startingPrice;
    this.currentPrice = currentPrice;
    this.endsAt = endsAt;
    this.status = status;
  }

  public int getAuctionId() {
    return auctionId;
  }

  public int getItemId() {
    return itemId;
  }

  public String getTitle() {
    return title;
  }

  public String getDescription() {
    return description;
  }

  public String getSellerName() {
    return sellerName;
  }

  public BigDecimal getStartingPrice() {
    return startingPrice;
  }

  public BigDecimal getCurrentPrice() {
    return currentPrice;
  }

  public LocalDateTime getEndsAt() {
    return endsAt;
  }

  public String getStatus() {
    return status;
  }
}
