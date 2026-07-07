// Home / shop page: list products with search + category filter.
let allCategories = [];

async function loadCategories() {
  try {
    allCategories = await api("/products/categories");
    const sel = document.getElementById("categoryFilter");
    sel.innerHTML =
      `<option value="all">All categories</option>` +
      allCategories.map((c) => `<option value="${c}">${c}</option>`).join("");
  } catch (e) {
    /* ignore */
  }
}

async function loadProducts() {
  const grid = document.getElementById("productGrid");
  const search = document.getElementById("searchInput").value.trim();
  const category = document.getElementById("categoryFilter").value;

  grid.innerHTML = `<p class="muted">Loading products…</p>`;

  const params = new URLSearchParams();
  if (search) params.set("search", search);
  if (category) params.set("category", category);

  try {
    const products = await api(`/products?${params.toString()}`);
    if (!products.length) {
      grid.innerHTML = `<div class="empty">No products found.</div>`;
      return;
    }
    grid.innerHTML = products.map(productCard).join("");

    // Wire up "Add to cart" buttons
    products.forEach((p) => {
      const btn = document.getElementById(`add-${p._id}`);
      if (btn) btn.addEventListener("click", () => addToCart(p));
    });
  } catch (e) {
    grid.innerHTML = `<div class="empty">Error: ${e.message}</div>`;
  }
}

function productCard(p) {
  return `
    <div class="product-card">
      <a href="product.html?slug=${p.slug}">
        <img src="${p.image}" alt="${p.name}" loading="lazy" />
      </a>
      <div class="body">
        <span class="cat">${p.category}</span>
        <a href="product.html?slug=${p.slug}" class="name">${p.name}</a>
        <span class="price">${money(p.price)}</span>
        <div class="actions">
          <a href="product.html?slug=${p.slug}" class="btn btn-outline btn-sm">Details</a>
          <button id="add-${p._id}" class="btn btn-sm">Add to cart</button>
        </div>
      </div>
    </div>`;
}

let searchTimer;
document.addEventListener("DOMContentLoaded", async () => {
  await loadCategories();
  await loadProducts();

  document.getElementById("searchInput").addEventListener("input", () => {
    clearTimeout(searchTimer);
    searchTimer = setTimeout(loadProducts, 300);
  });
  document.getElementById("categoryFilter").addEventListener("change", loadProducts);
});
