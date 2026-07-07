// Wishlist: stored as an array of product IDs in localStorage,
// and synced to the server when the user is logged in.
function getWishlist() {
  try {
    return JSON.parse(localStorage.getItem("wishlist")) || [];
  } catch {
    return [];
  }
}

function isWished(productId) {
  return getWishlist().includes(productId);
}

async function toggleWishlist(productId) {
  if (!getUser()) {
    toast("Please log in to use your wishlist");
    setTimeout(() => (window.location.href = "login.html"), 800);
    return false;
  }
  try {
    const res = await api(`/users/wishlist/${productId}`, { method: "POST" });
    localStorage.setItem("wishlist", JSON.stringify(res.wishlist));
    toast(res.added ? "Added to wishlist ♥" : "Removed from wishlist");
    return res.added;
  } catch (e) {
    toast(e.message);
    return false;
  }
}

// Pull the server wishlist into localStorage (called on load when logged in)
async function syncWishlist() {
  if (!getUser()) return;
  try {
    const items = await api("/users/wishlist");
    localStorage.setItem("wishlist", JSON.stringify(items.map((p) => p._id)));
  } catch {
    /* ignore */
  }
}
