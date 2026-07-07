// Wishlist page (requires login).
async function loadWishlistPage() {
  const grid = document.getElementById("wishlistGrid");
  if (!getUser()) {
    grid.innerHTML = `<div class="empty">Please <a href="login.html" style="color:var(--accent)">log in</a> to view your wishlist.</div>`;
    return;
  }
  try {
    const items = await api("/users/wishlist");
    localStorage.setItem("wishlist", JSON.stringify(items.map((p) => p._id)));
    if (!items.length) {
      grid.className = "";
      grid.innerHTML = `<div class="empty">Your wishlist is empty. <br/><br/><a href="shop.html" class="btn">Browse products</a></div>`;
      return;
    }
    renderGrid(grid, items);
  } catch (e) {
    grid.innerHTML = `<div class="empty">${e.message}</div>`;
  }
}

document.addEventListener("DOMContentLoaded", loadWishlistPage);
