package com.auctionhub.web;

import com.auctionhub.dao.UserDao;
import java.io.IOException;
import javax.servlet.ServletException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

@WebServlet(name = "RegisterServlet", urlPatterns = "/register")
public class RegisterServlet extends HttpServlet {

  @Override
  protected void doGet(HttpServletRequest req, HttpServletResponse resp)
      throws ServletException, IOException {
    req.getRequestDispatcher("/WEB-INF/jsp/register.jsp").forward(req, resp);
  }

  @Override
  protected void doPost(HttpServletRequest req, HttpServletResponse resp)
      throws ServletException, IOException {
    String username = req.getParameter("username");
    String email = req.getParameter("email");
    String password = req.getParameter("password");
    if (username == null || email == null || password == null
        || username.isBlank() || email.isBlank() || password.isBlank()) {
      req.setAttribute("error", "All fields are required.");
      req.getRequestDispatcher("/WEB-INF/jsp/register.jsp").forward(req, resp);
      return;
    }
    try {
      UserDao dao = new UserDao();
      if (dao.existsUsernameOrEmail(username.trim(), email.trim())) {
        req.setAttribute("error", "Username or email already taken.");
        req.getRequestDispatcher("/WEB-INF/jsp/register.jsp").forward(req, resp);
        return;
      }
      dao.insert(username.trim(), email.trim(), password);
      resp.sendRedirect(req.getContextPath() + "/login");
    } catch (Exception e) {
      throw new ServletException(e);
    }
  }
}
