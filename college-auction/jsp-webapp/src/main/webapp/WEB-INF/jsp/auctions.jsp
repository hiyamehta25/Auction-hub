<%@ page contentType="text/html;charset=UTF-8" language="java" %>
<%@ page import="java.util.List" %>
<%@ page import="com.auctionhub.model.AuctionRow" %>
<%@ page import="java.math.BigDecimal" %>
<%
  @SuppressWarnings("unchecked")
  List<AuctionRow> auctions = (List<AuctionRow>) request.getAttribute("auctions");
%>
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width, initial-scale=1"/>
  <title>Open auctions</title>
  <link rel="stylesheet" href="${pageContext.request.contextPath}/css/style.css"/>
</head>
<body>
<header class="site-header">
  <span class="brand">Auction Hub</span>
  <nav class="nav">
    <a href="${pageContext.request.contextPath}/">Home</a>
    <% if (session.getAttribute("userId") != null) { %>
      <span class="muted">Hi, <%= session.getAttribute("username") %></span>
      <a href="${pageContext.request.contextPath}/auction/new">New listing</a>
      <form method="post" action="${pageContext.request.contextPath}/logout">
        <button type="submit" class="btn btn-ghost">Log out</button>
      </form>
    <% } else { %>
      <a href="${pageContext.request.contextPath}/login">Log in</a>
      <a href="${pageContext.request.contextPath}/register">Register</a>
    <% } %>
  </nav>
</header>
<main>
  <h1>Open auctions</h1>
  <p class="muted">Server-rendered list (JSP). Detail page refreshes current price from the Node API.</p>
  <% if (auctions == null || auctions.isEmpty()) { %>
    <div class="card"><p>No open auctions.</p></div>
  <% } else { %>
    <div class="auction-list">
      <% for (AuctionRow a : auctions) {
           BigDecimal cur = a.getCurrentPrice();
      %>
        <div class="card row">
          <div>
            <h2><a href="${pageContext.request.contextPath}/auction?id=<%= a.getAuctionId() %>"><%= a.getTitle() %></a></h2>
            <p class="muted">Seller: <%= a.getSellerName() %> · ends <%= a.getEndsAt() %></p>
          </div>
          <div>
            <span class="price-tag"><%= cur %></span>
          </div>
        </div>
      <% } %>
    </div>
  <% } %>
</main>
</body>
</html>
