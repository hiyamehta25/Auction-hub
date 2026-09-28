package com.auctionhub.web;

import com.auctionhub.dao.AuctionDao;
import java.io.IOException;
import javax.servlet.ServletException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

@WebServlet(name = "AuctionListServlet", urlPatterns = "/auctions")
public class AuctionListServlet extends HttpServlet {

  @Override
  protected void doGet(HttpServletRequest req, HttpServletResponse resp)
      throws ServletException, IOException {
    try {
      AuctionDao dao = new AuctionDao();
      dao.closeExpired();
      req.setAttribute("auctions", dao.listOpen());
      req.getRequestDispatcher("/WEB-INF/jsp/auctions.jsp").forward(req, resp);
    } catch (Exception e) {
      throw new ServletException(e);
    }
  }
}
