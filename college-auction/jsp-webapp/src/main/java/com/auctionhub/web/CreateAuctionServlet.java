package com.auctionhub.web;

import com.auctionhub.dao.AuctionDao;
import java.io.IOException;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.time.format.DateTimeParseException;
import javax.servlet.ServletException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import javax.servlet.http.HttpSession;

@WebServlet(name = "CreateAuctionServlet", urlPatterns = "/auction/new")
public class CreateAuctionServlet extends HttpServlet {

  private static final DateTimeFormatter DT = DateTimeFormatter.ofPattern("yyyy-MM-dd'T'HH:mm");

  @Override
  protected void doGet(HttpServletRequest req, HttpServletResponse resp)
      throws ServletException, IOException {
    HttpSession session = req.getSession(false);
    if (session == null || session.getAttribute("userId") == null) {
      resp.sendRedirect(req.getContextPath() + "/login");
      return;
    }
    req.getRequestDispatcher("/WEB-INF/jsp/create-auction.jsp").forward(req, resp);
  }

  @Override
  protected void doPost(HttpServletRequest req, HttpServletResponse resp)
      throws ServletException, IOException {
    HttpSession session = req.getSession(false);
    if (session == null || session.getAttribute("userId") == null) {
      resp.sendRedirect(req.getContextPath() + "/login");
      return;
    }
    int sellerId = (Integer) session.getAttribute("userId");
    String title = req.getParameter("title");
    String description = req.getParameter("description");
    String starting = req.getParameter("startingPrice");
    String ends = req.getParameter("endsAt");
    if (title == null || description == null || starting == null || ends == null
        || title.isBlank() || starting.isBlank() || ends.isBlank()) {
      req.setAttribute("error", "Title, starting price, and end date are required.");
      req.getRequestDispatcher("/WEB-INF/jsp/create-auction.jsp").forward(req, resp);
      return;
    }
    BigDecimal startingPrice;
    LocalDateTime endsAt;
    try {
      startingPrice = new BigDecimal(starting.trim());
      if (startingPrice.compareTo(BigDecimal.ZERO) <= 0) {
        throw new IllegalArgumentException();
      }
      endsAt = LocalDateTime.parse(ends.trim(), DT);
    } catch (IllegalArgumentException | DateTimeParseException e) {
      req.setAttribute("error", "Invalid price or date/time.");
      req.getRequestDispatcher("/WEB-INF/jsp/create-auction.jsp").forward(req, resp);
      return;
    }
    if (!endsAt.isAfter(LocalDateTime.now())) {
      req.setAttribute("error", "End time must be in the future.");
      req.getRequestDispatcher("/WEB-INF/jsp/create-auction.jsp").forward(req, resp);
      return;
    }
    try {
      AuctionDao dao = new AuctionDao();
      dao.createItemAndAuction(sellerId, title.trim(), description.trim(), startingPrice, endsAt);
      resp.sendRedirect(req.getContextPath() + "/auctions");
    } catch (Exception e) {
      throw new ServletException(e);
    }
  }
}
