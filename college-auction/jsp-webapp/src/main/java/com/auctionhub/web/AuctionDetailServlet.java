package com.auctionhub.web;

import com.auctionhub.dao.AuctionDao;
import com.auctionhub.model.AuctionRow;
import java.io.IOException;
import java.util.Optional;
import javax.servlet.ServletException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

@WebServlet(name = "AuctionDetailServlet", urlPatterns = "/auction")
public class AuctionDetailServlet extends HttpServlet {

  @Override
  protected void doGet(HttpServletRequest req, HttpServletResponse resp)
      throws ServletException, IOException {
    String idParam = req.getParameter("id");
    if (idParam == null) {
      resp.sendError(HttpServletResponse.SC_BAD_REQUEST, "Missing id");
      return;
    }
    int id;
    try {
      id = Integer.parseInt(idParam);
    } catch (NumberFormatException e) {
      resp.sendError(HttpServletResponse.SC_BAD_REQUEST, "Invalid id");
      return;
    }
    try {
      AuctionDao dao = new AuctionDao();
      dao.closeExpired();
      Optional<AuctionRow> row = dao.findByAuctionId(id);
      if (row.isEmpty()) {
        resp.sendError(HttpServletResponse.SC_NOT_FOUND);
        return;
      }
      req.setAttribute("auction", row.get());
      req.getRequestDispatcher("/WEB-INF/jsp/auction-detail.jsp").forward(req, resp);
    } catch (Exception e) {
      throw new ServletException(e);
    }
  }
}
