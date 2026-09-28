<%@ page contentType="text/html;charset=UTF-8" language="java" %>
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width, initial-scale=1"/>
  <title>Log in</title>
  <link rel="stylesheet" href="${pageContext.request.contextPath}/css/style.css"/>
</head>
<body>
<header class="site-header">
  <span class="brand">Auction Hub</span>
  <nav class="nav">
    <a href="${pageContext.request.contextPath}/">Home</a>
    <a href="${pageContext.request.contextPath}/auctions">Browse</a>
    <a href="${pageContext.request.contextPath}/register">Register</a>
  </nav>
</header>
<main>
  <div class="card" style="max-width:420px;margin-left:auto;margin-right:auto;">
    <h1>Log in</h1>
    <% if (request.getAttribute("error") != null) { %>
      <div class="alert alert-error"><%= request.getAttribute("error") %></div>
    <% } %>
    <p class="muted">Demo: alice / demo or bob / demo</p>
    <form method="post" action="${pageContext.request.contextPath}/login" class="form-grid">
      <label>Username <input type="text" name="username" required autocomplete="username"/></label>
      <label>Password <input type="password" name="password" required autocomplete="current-password"/></label>
      <label style="margin-top:1rem;"><button type="submit" class="btn">Sign in</button></label>
    </form>
  </div>
</main>
</body>
</html>
