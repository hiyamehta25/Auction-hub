<%@ page contentType="text/html;charset=UTF-8" language="java" %>
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width, initial-scale=1"/>
  <title>Register</title>
  <link rel="stylesheet" href="${pageContext.request.contextPath}/css/style.css"/>
</head>
<body>
<header class="site-header">
  <span class="brand">Auction Hub</span>
  <nav class="nav">
    <a href="${pageContext.request.contextPath}/">Home</a>
    <a href="${pageContext.request.contextPath}/auctions">Browse</a>
    <a href="${pageContext.request.contextPath}/login">Log in</a>
  </nav>
</header>
<main>
  <div class="card" style="max-width:420px;margin-left:auto;margin-right:auto;">
    <h1>Create account</h1>
    <% if (request.getAttribute("error") != null) { %>
      <div class="alert alert-error"><%= request.getAttribute("error") %></div>
    <% } %>
    <form method="post" action="${pageContext.request.contextPath}/register" class="form-grid">
      <label>Username <input type="text" name="username" required maxlength="64"/></label>
      <label>Email <input type="email" name="email" required/></label>
      <label>Password <input type="password" name="password" required/></label>
      <label style="margin-top:1rem;"><button type="submit" class="btn">Register</button></label>
    </form>
  </div>
</main>
</body>
</html>
