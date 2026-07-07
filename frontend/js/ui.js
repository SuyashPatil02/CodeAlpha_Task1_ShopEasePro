// Shared product-card renderer + grid wiring (used by home, shop, wishlist)
function productCardHTML(p) {
  const wished = isWished(p._id) ? "active" : "";
  const discount = p.oldPrice && p.oldPrice > p.price;
  return `
    <div class="product-card">
      ${discount ? `<span class="tag">${Math.round((1 - p.price / p.oldPrice) * 100)}%</span>` : ""}
      <button class="wish-btn ${wished}" data-wish="${p._id}" title="Wishlist">♥</button>
      <a href="product.html?slug=${p.slug}" class="thumb">
        <img src="${p.image}" alt="${p.name}" loading="lazy" />
      </a>
      <div class="body">
        <span class="cat">${p.category}</span>
        <a href="product.html?slug=${p.slug}" class="name">${p.name}</a>
        <span class="stars">${starString(p.rating)} <span class="muted" style="font-size:.78rem">(${p.numReviews})</span></span>
        <div class="price-row">
          <span class="price">${money(p.price)}</span>
          ${discount ? `<span class="old-price">${money(p.oldPrice)}</span>` : ""}
        </div>
        <div class="actions">
          <button class="btn btn-sm" data-add="${p._id}">Add to Cart</button>
        </div>
      </div>
    </div>`;
}

// Render a list of products into a grid element and wire buttons
function renderGrid(el, products) {
  if (!products.length) {
    el.innerHTML = `<div class="empty">No products found.</div>`;
    return;
  }
  el.innerHTML = products.map(productCardHTML).join("");

  el.querySelectorAll("[data-add]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const p = products.find((x) => x._id === btn.dataset.add);
      if (p) addToCart(p);
    });
  });

  el.querySelectorAll("[data-wish]").forEach((btn) => {
    btn.addEventListener("click", async () => {
      const added = await toggleWishlist(btn.dataset.wish);
      btn.classList.toggle("active", added);
    });
  });
}
