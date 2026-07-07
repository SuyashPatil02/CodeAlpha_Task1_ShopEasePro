// Home page: hero + featured products + category strip
async function loadHome() {
  await syncWishlist();
  // Featured products
  try {
    const featured = await api("/products?featured=true");
    const grid = document.getElementById("featuredGrid");
    if (grid) renderGrid(grid, featured.slice(0, 8));
  } catch (e) {
    /* ignore */
  }

  // Newest products
  try {
    const newest = await api("/products?sort=newest");
    const grid = document.getElementById("newGrid");
    if (grid) renderGrid(grid, newest.slice(0, 8));
  } catch (e) {
    /* ignore */
  }

  // Category strip
  try {
    const cats = await api("/products/categories");
    const strip = document.getElementById("catStrip");
    if (strip)
      strip.innerHTML = cats
        .map(
          (c) =>
            `<a href="shop.html?category=${encodeURIComponent(c)}" class="cat-pill">${c}</a>`
        )
        .join("");
  } catch (e) {
    /* ignore */
  }
}

document.addEventListener("DOMContentLoaded", loadHome);
