package com.auctionhub.web;

import com.auctionhub.dao.AuctionDao;
import java.io.IOException;
import java.math.BigDecimal;
import java.util.Optional;
import javax.servlet.ServletException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import javax.servlet.http.HttpSession;

@WebServlet(name = "PlaceBidServlet", urlPatterns = "/bid")
public class PlaceBidServlet extends HttpServlet {

  @Override
  protected void doPost(HttpServletRequest req, HttpServletResponse resp)
      throws ServletException, IOException {
    HttpSession session = req.getSession(false);
    if (session == null || session.getAttribute("userId") == null) {
      resp.sendRedirect(req.getContextPath() + "/login");
      return;
    }
    int userId = (Integer) session.getAttribute("userId");
    String auctionIdStr = req.getParameter("auctionId");
    String amountStr = req.getParameter("amount");
    if (auctionIdStr == null || amountStr == null) {
      resp.sendError(HttpServletResponse.SC_BAD_REQUEST);
      return;
    }
    int auctionId;
    BigDecimal amount;
    try {
      auctionId = Integer.parseInt(auctionIdStr);
      amount = new BigDecimal(amountStr.trim());
    } catch (Exception e) {
      resp.sendError(HttpServletResponse.SC_BAD_REQUEST);
      return;
    }
    if (amount.scale() > 2 || amount.compareTo(BigDecimal.ZERO) <= 0) {
      resp.sendRedirect(req.getContextPath() + "/auction?id=" + auctionId + "&err=invalid");
      return;
    }
    try {
      AuctionDao dao = new AuctionDao();
      Optional<Integer> seller = dao.getSellerIdForAuction(auctionId);
      if (seller.isPresent() && seller.get() == userId) {
        resp.sendRedirect(req.getContextPath() + "/auction?id=" + auctionId + "&err=seller");
        return;
      }
      boolean ok = dao.placeBid(auctionId, userId, amount);
      if (!ok) {
        resp.sendRedirect(req.getContextPath() + "/auction?id=" + auctionId + "&err=bid");
        return;
      }
      resp.sendRedirect(req.getContextPath() + "/auction?id=" + auctionId + "&ok=1");
    } catch (Exception e) {
      throw new ServletException(e);
    }
  }
}
