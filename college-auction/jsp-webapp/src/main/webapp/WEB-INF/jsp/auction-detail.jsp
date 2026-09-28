<%@ page contentType="text/html;charset=UTF-8" language="java" %>
<%@ page import="com.auctionhub.model.AuctionRow" %>
<%@ page import="com.auctionhub.util.JsString" %>
<%
  AuctionRow a = (AuctionRow) request.getAttribute("auction");
  String apiBase = System.getenv("NODE_API_URL");
  if (apiBase == null || apiBase.isBlank()) {
    apiBase = "http://localhost:3000";
  }
%>
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width, initial-scale=1"/>
  <title><%= a.getTitle() %></title>
  <link rel="stylesheet" href="${pageContext.request.contextPath}/css/style.css"/>
</head>
<body>
<header class="site-header">
  <span class="brand">Auction Hub</span>
  <nav class="nav">
    <a href="${pageContext.request.contextPath}/auctions">All auctions</a>
    <% if (session.getAttribute("userId") != null) { %>
      <form method="post" action="${pageContext.request.contextPath}/logout">
        <button type="submit" class="btn btn-ghost">Log out</button>
      </form>
    <% } else { %>
      <a href="${pageContext.request.contextPath}/login">Log in</a>
    <% } %>
  </nav>
</header>
<main>
  <% if ("1".equals(request.getParameter("ok"))) { %>
    <div class="alert alert-ok">Bid placed.</div>
  <% } %>
  <% if ("bid".equals(request.getParameter("err"))) { %>
    <div class="alert alert-error">Bid not accepted (too low, closed, or ended).</div>
  <% } %>
  <% if ("seller".equals(request.getParameter("err"))) { %>
    <div class="alert alert-error">You cannot bid on your own listing.</div>
  <% } %>
  <% if ("invalid".equals(request.getParameter("err"))) { %>
    <div class="alert alert-error">Enter a valid amount.</div>
  <% } %>

  <div class="card">
    <h1><%= a.getTitle() %> <span class="live-pill" id="live-label">Node API</span></h1>
    <p class="muted">Seller: <%= a.getSellerName() %> · Status: <%= a.getStatus() %> · Ends <%= a.getEndsAt() %></p>
    <p><%= a.getDescription() %></p>
    <p>Starting price: <strong><%= a.getStartingPrice() %></strong></p>
    <p>Current price (page load): <strong><%= a.getCurrentPrice() %></strong></p>
    <p>Live from Node: <strong id="live-price">—</strong> <span class="muted" id="live-status"></span></p>
  </div>

  <% if (session.getAttribute("userId") != null && "OPEN".equals(a.getStatus())) { %>
    <div class="card">
      <h2>Place bid</h2>
      <form method="post" action="${pageContext.request.contextPath}/bid" class="form-grid">
        <input type="hidden" name="auctionId" value="<%= a.getAuctionId() %>"/>
        <label>Your bid (must exceed current)
          <input type="number" name="amount" step="0.01" min="0.01" required/>
        </label>
        <label style="margin-top:1rem;"><button type="submit" class="btn">Submit bid</button></label>
      </form>
    </div>
  <% } else if (session.getAttribute("userId") == null) { %>
    <p><a href="${pageContext.request.contextPath}/login">Log in</a> to bid.</p>
  <% } %>
</main>
<script>
(function () {
  var id = <%= a.getAuctionId() %>;
  var api = <%= com.auctionhub.util.JsString.escape(apiBase) %>;
  var el = document.getElementById('live-price');
  var st = document.getElementById('live-status');
  function poll() {
    fetch(api + '/api/auctions/' + id)
      .then(function (r) { return r.ok ? r.json() : Promise.reject(); })
      .then(function (data) {
        el.textContent = data.currentPrice;
        st.textContent = '(updated ' + new Date().toLocaleTimeString() + ')';
      })
      .catch(function () {
        el.textContent = 'unavailable';
        st.textContent = '(start Node server on port 3000)';
      });
  }
  poll();
  setInterval(poll, 8000);
})();
</script>
</body>
</html>
