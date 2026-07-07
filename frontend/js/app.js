// ============================================================
// ShopEase Pro — shared frontend helpers
// ============================================================
const API_BASE = "/api";

// ---------- API ----------
async function api(path, options = {}) {
  const token = getToken();
  const res = await fetch(API_BASE + path, {
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers || {}),
    },
    ...options,
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.message || "Request failed");
  return data;
}

// ---------- Money ----------
function money(n) {
  return "₹" + Number(n || 0).toLocaleString("en-IN", { maximumFractionDigits: 0 });
}

// ---------- Auth state ----------
function getToken() { return localStorage.getItem("token"); }
function getUser() {
  try { return JSON.parse(localStorage.getItem("user")); } catch { return null; }
}
function setAuth(token, user) {
  localStorage.setItem("token", token);
  localStorage.setItem("user", JSON.stringify(user));
}
function logout() {
  localStorage.removeItem("token");
  localStorage.removeItem("user");
  localStorage.removeItem("wishlist");
  window.location.href = "index.html";
}

// ---------- Theme ----------
function getTheme() { return localStorage.getItem("theme") || "light"; }
function applyTheme(t) {
  document.documentElement.setAttribute("data-theme", t);
  localStorage.setItem("theme", t);
  const btn = document.getElementById("themeToggle");
  if (btn) btn.textContent = t === "dark" ? "☀️" : "🌙";
}
function toggleTheme() { applyTheme(getTheme() === "dark" ? "light" : "dark"); }
applyTheme(getTheme());

// ---------- Toast ----------
let toastTimer;
function toast(msg) {
  let el = document.getElementById("toast");
  if (!el) {
    el = document.createElement("div");
    el.id = "toast";
    document.body.appendChild(el);
  }
  el.textContent = msg;
  el.classList.add("show");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => el.classList.remove("show"), 2400);
}

// ---------- Star helper ----------
function starString(rating) {
  const full = Math.round(rating);
  return "★★★★★☆☆☆☆☆".slice(5 - full, 10 - full);
}

// ---------- Header ----------
const NAV = [
  ["index.html", "Home"],
  ["shop.html", "Shop"],
  ["about.html", "About"],
  ["contact.html", "Contact"],
  ["faq.html", "FAQ"],
];

function currentPage() {
  return window.location.pathname.split("/").pop() || "index.html";
}

function renderHeader() {
  const host = document.getElementById("header");
  if (!host) return;
  const user = getUser();
  const cartCount = (typeof getCart === "function" ? getCart() : []).reduce((s, i) => s + i.quantity, 0);
  const cur = currentPage();
  const links = NAV.map(
    ([href, label]) =>
      `<a href="${href}" class="${cur === href ? "active" : ""}">${label}</a>`
  ).join("");

  host.innerHTML = `
  <header class="site-header">
    <div class="container nav">
      <a href="index.html" class="logo">ShopEase<span>Pro</span></a>
      <nav class="nav-links" id="navLinks">${links}</nav>
      <div class="nav-actions">
        <button class="icon-btn" id="themeToggle" title="Toggle theme">🌙</button>
        <a href="wishlist.html" class="icon-btn" title="Wishlist">♡</a>
        <a href="cart.html" class="icon-btn" title="Cart">🛒${cartCount ? `<span class="badge-count">${cartCount}</span>` : ""}</a>
        ${
          user
            ? `<a href="${user.role === "admin" ? "admin/index.html" : "dashboard.html"}" class="icon-btn" title="${user.name}">👤</a>`
            : `<a href="login.html" class="btn btn-sm">Login</a>`
        }
        <button class="icon-btn menu-toggle" id="menuToggle" title="Menu">☰</button>
      </div>
    </div>
  </header>`;

  document.getElementById("themeToggle").addEventListener("click", toggleTheme);
  applyTheme(getTheme());
  const menuToggle = document.getElementById("menuToggle");
  if (menuToggle)
    menuToggle.addEventListener("click", () =>
      document.getElementById("navLinks").classList.toggle("open")
    );
}

// ---------- Footer ----------
function renderFooter() {
  const host = document.getElementById("footer");
  if (!host) return;
  host.innerHTML = `
  <footer class="site-footer">
    <div class="container footer-grid">
      <div>
        <a href="index.html" class="logo">ShopEase<span>Pro</span></a>
        <p class="muted" style="margin-top:10px;max-width:280px;">A curated Indian e-commerce store for fashion, electronics, footwear, accessories, beauty, and home essentials.</p>
        <div class="socials">
          <a href="https://facebook.com" target="_blank" rel="noopener" title="Facebook">f</a>
          <a href="https://twitter.com" target="_blank" rel="noopener" title="Twitter">𝕏</a>
          <a href="https://instagram.com" target="_blank" rel="noopener" title="Instagram">◎</a>
          <a href="https://linkedin.com" target="_blank" rel="noopener" title="LinkedIn">in</a>
        </div>
      </div>
      <div>
        <h4>Shop</h4>
        <a href="shop.html">All Products</a>
        <a href="shop.html?category=Electronics">Electronics</a>
        <a href="shop.html?category=Fashion">Fashion</a>
        <a href="shop.html?category=Footwear">Footwear</a>
        <a href="shop.html?category=Home%20%26%20Living">Home & Living</a>
      </div>
      <div>
        <h4>Company</h4>
        <a href="about.html">About Us</a>
        <a href="contact.html">Contact Us</a>
        <a href="faq.html">FAQ</a>
      </div>
      <div>
        <h4>Legal</h4>
        <a href="privacy.html">Privacy Policy</a>
        <a href="terms.html">Terms & Conditions</a>
      </div>
    </div>
    <div class="footer-bottom">© ${new Date().getFullYear()} ShopEase Pro. All rights reserved.</div>
  </footer>`;
}

document.addEventListener("DOMContentLoaded", () => {
  renderHeader();
  renderFooter();
});
