<%@ page contentType="text/html;charset=UTF-8" language="java" %>
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width, initial-scale=1"/>
  <title>Auction Hub</title>
  <link rel="stylesheet" href="${pageContext.request.contextPath}/css/style.css"/>
</head>
<body>
<header class="site-header">
  <span class="brand">Auction Hub</span>
  <nav class="nav">
    <a href="${pageContext.request.contextPath}/auctions">Browse</a>
    <a href="${pageContext.request.contextPath}/login">Log in</a>
    <a href="${pageContext.request.contextPath}/register">Register</a>
  </nav>
</header>
<main>
  <div class="card">
    <h1>Online auction system</h1>
    <p class="muted">College demo: JSP + Servlets + MySQL (Java), plus a Node.js JSON API for live reads.</p>
    <p><a class="btn" href="${pageContext.request.contextPath}/auctions">View open auctions</a></p>
  </div>
</main>
</body>
</html>
