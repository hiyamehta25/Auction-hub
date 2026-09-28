<%@ page contentType="text/html;charset=UTF-8" language="java" %>
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width, initial-scale=1"/>
  <title>New listing</title>
  <link rel="stylesheet" href="${pageContext.request.contextPath}/css/style.css"/>
</head>
<body>
<header class="site-header">
  <span class="brand">Auction Hub</span>
  <nav class="nav">
    <a href="${pageContext.request.contextPath}/auctions">Browse</a>
    <form method="post" action="${pageContext.request.contextPath}/logout">
      <button type="submit" class="btn btn-ghost">Log out</button>
    </form>
  </nav>
</header>
<main>
  <div class="card" style="max-width:520px;">
    <h1>New auction</h1>
    <% if (request.getAttribute("error") != null) { %>
      <div class="alert alert-error"><%= request.getAttribute("error") %></div>
    <% } %>
    <form method="post" action="${pageContext.request.contextPath}/auction/new" class="form-grid">
      <label>Item title <input type="text" name="title" required maxlength="255"/></label>
      <label>Description <textarea name="description" rows="4"></textarea></label>
      <label>Starting price <input type="number" name="startingPrice" step="0.01" min="0.01" required/></label>
      <label>Ends at (local)
        <input type="datetime-local" name="endsAt" required/>
      </label>
      <label style="margin-top:1rem;"><button type="submit" class="btn">Publish</button></label>
    </form>
  </div>
</main>
</body>
</html>
