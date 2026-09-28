package com.auctionhub.web;

import com.auctionhub.dao.UserDao;
import com.auctionhub.model.User;
import java.io.IOException;
import java.util.Optional;
import javax.servlet.ServletException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import javax.servlet.http.HttpSession;

@WebServlet(name = "LoginServlet", urlPatterns = "/login")
public class LoginServlet extends HttpServlet {

  @Override
  protected void doGet(HttpServletRequest req, HttpServletResponse resp)
      throws ServletException, IOException {
    req.getRequestDispatcher("/WEB-INF/jsp/login.jsp").forward(req, resp);
  }

  @Override
  protected void doPost(HttpServletRequest req, HttpServletResponse resp)
      throws ServletException, IOException {
    String username = req.getParameter("username");
    String password = req.getParameter("password");
    if (username == null || password == null || username.isBlank()) {
      req.setAttribute("error", "Enter username and password.");
      req.getRequestDispatcher("/WEB-INF/jsp/login.jsp").forward(req, resp);
      return;
    }
    try {
      UserDao dao = new UserDao();
      Optional<User> u = dao.findByCredentials(username.trim(), password);
      if (u.isEmpty()) {
        req.setAttribute("error", "Invalid credentials.");
        req.getRequestDispatcher("/WEB-INF/jsp/login.jsp").forward(req, resp);
        return;
      }
      HttpSession session = req.getSession(true);
      session.setAttribute("userId", u.get().getId());
      session.setAttribute("username", u.get().getUsername());
      resp.sendRedirect(req.getContextPath() + "/auctions");
    } catch (Exception e) {
      throw new ServletException(e);
    }
  }
}
