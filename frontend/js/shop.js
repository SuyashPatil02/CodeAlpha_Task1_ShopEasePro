// Shop page: list products with search, category filter and sorting.
let allCategories = [];

function qsParam(name) {
  return new URLSearchParams(window.location.search).get(name) || "";
}

async function loadCategories() {
  try {
    allCategories = await api("/products/categories");
    const strip = document.getElementById("catStrip");
    const active = document.getElementById("categoryFilter").value;
    strip.innerHTML =
      `<button class="cat-pill ${active === "all" ? "active" : ""}" data-cat="all">All</button>` +
      allCategories
        .map(
          (c) =>
            `<button class="cat-pill ${active === c ? "active" : ""}" data-cat="${c}">${c}</button>`
        )
        .join("");
    strip.querySelectorAll("[data-cat]").forEach((b) =>
      b.addEventListener("click", () => {
        document.getElementById("categoryFilter").value = b.dataset.cat;
        loadProducts();
        strip.querySelectorAll(".cat-pill").forEach((x) => x.classList.remove("active"));
        b.classList.add("active");
      })
    );
  } catch (e) {
    /* ignore */
  }
}

async function loadProducts() {
  const grid = document.getElementById("productGrid");
  const search = document.getElementById("searchInput").value.trim();
  const category = document.getElementById("categoryFilter").value;
  const sort = document.getElementById("sortSelect").value;

  grid.innerHTML = `<div class="skel"></div><div class="skel"></div><div class="skel"></div><div class="skel"></div>`;
  grid.className = "skeleton-grid";

  const params = new URLSearchParams();
  if (search) params.set("search", search);
  if (category) params.set("category", category);
  if (sort) params.set("sort", sort);

  try {
    const products = await api(`/products?${params.toString()}`);
    grid.className = "grid";
    document.getElementById("resultCount").textContent = `${products.length} product${products.length !== 1 ? "s" : ""}`;
    renderGrid(grid, products);
  } catch (e) {
    grid.className = "grid";
    grid.innerHTML = `<div class="empty">Error: ${e.message}</div>`;
  }
}

let searchTimer;
document.addEventListener("DOMContentLoaded", async () => {
  await syncWishlist();
  const presetCat = qsParam("category");
  const presetSearch = qsParam("search");
  if (presetCat) document.getElementById("categoryFilter").value = presetCat;
  if (presetSearch) document.getElementById("searchInput").value = presetSearch;

  await loadCategories();
  await loadProducts();

  document.getElementById("searchInput").addEventListener("input", () => {
    clearTimeout(searchTimer);
    searchTimer = setTimeout(loadProducts, 300);
  });
  document.getElementById("categoryFilter").addEventListener("change", () => {
    loadCategories();
    loadProducts();
  });
  document.getElementById("sortSelect").addEventListener("change", loadProducts);
});
