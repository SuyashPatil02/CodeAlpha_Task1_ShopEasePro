// ============================================================
// ShopEase Pro — Admin panel logic
// Admin pages live in /admin/, so site links use "../"
// ============================================================
function requireAdmin() {
  const user = getUser();
  if (!user) {
    window.location.href = "../login.html";
    return null;
  }
  if (user.role !== "admin") {
    window.location.href = "../dashboard.html";
    return null;
  }
  return user;
}

function adminHeader(active) {
  const tabs = [
    ["index.html", "Dashboard"],
    ["products.html", "Products"],
    ["orders.html", "Orders"],
    ["users.html", "Users"],
  ];
  return `
  <header class="site-header">
    <div class="container nav">
      <a href="../index.html" class="logo">ShopEase<span>Pro</span> · Admin</a>
      <div class="nav-actions" style="margin-left:auto">
        <button class="icon-btn" id="themeToggle" title="Toggle theme">🌙</button>
        <a href="../index.html" class="btn btn-outline btn-sm">View Store</a>
        <button class="btn btn-sm" id="adminLogout">Logout</button>
      </div>
    </div>
  </header>
  <div class="container" style="padding-top:24px">
    <nav class="admin-tabs">
      ${tabs.map(([h, l]) => `<a href="${h}" class="${h === active ? "active" : ""}">${l}</a>`).join("")}
    </nav>
  </div>`;
}

function initAdminChrome(active) {
  const host = document.getElementById("adminHeader");
  if (host) host.innerHTML = adminHeader(active);
  applyTheme(getTheme());
  const tt = document.getElementById("themeToggle");
  if (tt) tt.addEventListener("click", toggleTheme);
  const lo = document.getElementById("adminLogout");
  if (lo) lo.addEventListener("click", logout);
}

// ---------- Dashboard ----------
async function loadAdminDashboard() {
  if (!requireAdmin()) return;
  initAdminChrome("index.html");
  try {
    const s = await api("/users/stats");
    document.getElementById("stats").innerHTML = `
      <div class="stat-card"><div class="val">${s.products}</div><div class="lbl">Products</div></div>
      <div class="stat-card"><div class="val">${s.orders}</div><div class="lbl">Orders</div></div>
      <div class="stat-card"><div class="val">${s.users}</div><div class="lbl">Users</div></div>
      <div class="stat-card"><div class="val">${money(s.revenue)}</div><div class="lbl">Revenue</div></div>
      <div class="stat-card"><div class="val">${s.lowStock}</div><div class="lbl">Low Stock (&lt;10)</div></div>`;
  } catch (e) {
    document.getElementById("stats").innerHTML = `<div class="empty">${e.message}</div>`;
  }

  // Recent orders preview
  try {
    const orders = await api("/orders/all");
    document.getElementById("recent").innerHTML = renderOrdersTable(orders.slice(0, 8), false);
  } catch (e) {
    /* ignore */
  }
}

// ---------- Products ----------
let editingId = null;
const CATEGORIES = ["Fashion", "Electronics", "Footwear", "Accessories", "Beauty", "Home & Living"];

async function loadAdminProducts() {
  if (!requireAdmin()) return;
  initAdminChrome("products.html");
  document.getElementById("addProductBtn").addEventListener("click", () => openProductForm());
  document.getElementById("cancelForm").addEventListener("click", closeProductForm);
  document.getElementById("productForm").addEventListener("submit", saveProduct);
  document.getElementById("catSelect").innerHTML = CATEGORIES.map((c) => `<option>${c}</option>`).join("");
  const fileInput = document.getElementById("f_imageFile");
  if (fileInput) fileInput.addEventListener("change", uploadProductImage);
  await refreshProducts();
}

// Upload an image file via Multer-backed endpoint, then set the Image URL field.
async function uploadProductImage(e) {
  const file = e.target.files[0];
  if (!file) return;
  const fd = new FormData();
  fd.append("image", file);
  try {
    toast("Uploading image…");
    const token = getToken();
    const res = await fetch("/api/products/upload", {
      method: "POST",
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      body: fd,
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || "Upload failed");
    document.getElementById("f_image").value = data.url;
    toast("Image uploaded");
  } catch (err) {
    toast(err.message);
  }
}

async function refreshProducts() {
  const tbody = document.getElementById("productRows");
  try {
    const products = await api("/products");
    tbody.innerHTML = products
      .map(
        (p) => `
        <tr>
          <td><img src="${p.image}" alt=""></td>
          <td>${p.name}</td>
          <td>${p.category}</td>
          <td>${money(p.price)}</td>
          <td>
            <input type="number" value="${p.stock}" min="0" data-stock="${p._id}" style="width:70px;padding:6px;border:1.5px solid var(--border);border-radius:8px;background:var(--bg);color:var(--text)">
          </td>
          <td>
            <button class="btn btn-sm btn-outline" data-edit='${encodeURIComponent(JSON.stringify(p))}'>Edit</button>
            <button class="btn btn-sm btn-accent" data-del="${p._id}">Delete</button>
          </td>
        </tr>`
      )
      .join("");

    tbody.querySelectorAll("[data-stock]").forEach((inp) =>
      inp.addEventListener("change", async () => {
        try {
          await api(`/products/${inp.dataset.stock}/stock`, {
            method: "PATCH",
            body: JSON.stringify({ stock: inp.value }),
          });
          toast("Stock updated");
        } catch (e) {
          toast(e.message);
        }
      })
    );
    tbody.querySelectorAll("[data-edit]").forEach((b) =>
      b.addEventListener("click", () => openProductForm(JSON.parse(decodeURIComponent(b.dataset.edit))))
    );
    tbody.querySelectorAll("[data-del]").forEach((b) =>
      b.addEventListener("click", async () => {
        if (!confirm("Delete this product?")) return;
        try {
          await api(`/products/${b.dataset.del}`, { method: "DELETE" });
          toast("Product deleted");
          refreshProducts();
        } catch (e) {
          toast(e.message);
        }
      })
    );
  } catch (e) {
    tbody.innerHTML = `<tr><td colspan="6">${e.message}</td></tr>`;
  }
}

function openProductForm(p) {
  editingId = p ? p._id : null;
  document.getElementById("formTitle").textContent = p ? "Edit Product" : "Add Product";
  document.getElementById("f_name").value = p?.name || "";
  document.getElementById("f_slug").value = p?.slug || "";
  document.getElementById("catSelect").value = p?.category || CATEGORIES[0];
  document.getElementById("f_brand").value = p?.brand || "";
  document.getElementById("f_price").value = p?.price || "";
  document.getElementById("f_oldPrice").value = p?.oldPrice || "";
  document.getElementById("f_stock").value = p?.stock ?? 10;
  document.getElementById("f_image").value = p?.image || "";
  document.getElementById("f_desc").value = p?.description || "";
  document.getElementById("f_featured").checked = !!p?.featured;
  document.getElementById("productFormWrap").style.display = "block";
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function closeProductForm() {
  document.getElementById("productFormWrap").style.display = "none";
  editingId = null;
}

async function saveProduct(e) {
  e.preventDefault();
  const name = document.getElementById("f_name").value.trim();
  const body = {
    name,
    slug:
      document.getElementById("f_slug").value.trim() ||
      name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "") + "-" + Date.now(),
    category: document.getElementById("catSelect").value,
    brand: document.getElementById("f_brand").value.trim() || "Generic",
    price: parseFloat(document.getElementById("f_price").value) || 0,
    oldPrice: parseFloat(document.getElementById("f_oldPrice").value) || 0,
    stock: parseInt(document.getElementById("f_stock").value, 10) || 0,
    image: document.getElementById("f_image").value.trim(),
    description: document.getElementById("f_desc").value.trim(),
    featured: document.getElementById("f_featured").checked,
  };
  try {
    if (editingId) {
      await api(`/products/${editingId}`, { method: "PUT", body: JSON.stringify(body) });
      toast("Product updated");
    } else {
      await api("/products", { method: "POST", body: JSON.stringify(body) });
      toast("Product added");
    }
    closeProductForm();
    refreshProducts();
  } catch (e) {
    toast(e.message);
  }
}

// ---------- Orders ----------
const STATUSES = ["pending", "processing", "shipped", "delivered", "cancelled"];

function renderOrdersTable(orders, withControls) {
  if (!orders.length) return `<div class="empty">No orders yet.</div>`;
  return `
  <div class="table-wrap"><table>
    <thead><tr><th>Order</th><th>Customer</th><th>Items</th><th>Total</th><th>Payment</th><th>Status</th>${withControls ? "<th>Update</th>" : ""}</tr></thead>
    <tbody>
    ${orders
      .map(
        (o) => `
      <tr>
        <td>#${o._id.slice(-6).toUpperCase()}<br><small class="muted">${new Date(o.createdAt).toLocaleDateString()}</small></td>
        <td>${o.user?.name || "—"}<br><small class="muted">${o.user?.email || ""}</small></td>
        <td>${o.items.length}</td>
        <td>${money(o.totalPrice)}</td>
        <td>${o.paymentMethod === "cod" ? "COD" : "Online"}<br><span class="status ${o.paymentStatus}">${o.paymentStatus}</span></td>
        <td><span class="status ${o.status}">${o.status}</span></td>
        ${
          withControls
            ? `<td><select data-order="${o._id}">${STATUSES.map(
                (s) => `<option value="${s}" ${s === o.status ? "selected" : ""}>${s}</option>`
              ).join("")}</select></td>`
            : ""
        }
      </tr>`
      )
      .join("")}
    </tbody>
  </table></div>`;
}

async function loadAdminOrders() {
  if (!requireAdmin()) return;
  initAdminChrome("orders.html");
  const host = document.getElementById("ordersTable");
  try {
    const orders = await api("/orders/all");
    host.innerHTML = renderOrdersTable(orders, true);
    host.querySelectorAll("[data-order]").forEach((sel) =>
      sel.addEventListener("change", async () => {
        try {
          await api(`/orders/${sel.dataset.order}/status`, {
            method: "PUT",
            body: JSON.stringify({ status: sel.value }),
          });
          toast("Order status updated");
        } catch (e) {
          toast(e.message);
        }
      })
    );
  } catch (e) {
    host.innerHTML = `<div class="empty">${e.message}</div>`;
  }
}

// ---------- Users ----------
async function loadAdminUsers() {
  if (!requireAdmin()) return;
  initAdminChrome("users.html");
  const host = document.getElementById("usersTable");
  const me = getUser();
  try {
    const users = await api("/users");
    host.innerHTML = `
    <div class="table-wrap"><table>
      <thead><tr><th>Name</th><th>Email</th><th>Phone</th><th>Role</th><th>Joined</th><th>Actions</th></tr></thead>
      <tbody>
      ${users
        .map(
          (u) => `
        <tr>
          <td>${u.name}</td>
          <td>${u.email}</td>
          <td>${u.phone || "—"}</td>
          <td>
            <select data-role="${u._id}">
              <option value="user" ${u.role === "user" ? "selected" : ""}>user</option>
              <option value="admin" ${u.role === "admin" ? "selected" : ""}>admin</option>
            </select>
          </td>
          <td>${new Date(u.createdAt).toLocaleDateString()}</td>
          <td>${u._id === me.id ? '<span class="muted">You</span>' : `<button class="btn btn-sm btn-accent" data-deluser="${u._id}">Delete</button>`}</td>
        </tr>`
        )
        .join("")}
      </tbody>
    </table></div>`;

    host.querySelectorAll("[data-role]").forEach((sel) =>
      sel.addEventListener("change", async () => {
        try {
          await api(`/users/${sel.dataset.role}/role`, {
            method: "PUT",
            body: JSON.stringify({ role: sel.value }),
          });
          toast("Role updated");
        } catch (e) {
          toast(e.message);
        }
      })
    );
    host.querySelectorAll("[data-deluser]").forEach((b) =>
      b.addEventListener("click", async () => {
        if (!confirm("Delete this user?")) return;
        try {
          await api(`/users/${b.dataset.deluser}`, { method: "DELETE" });
          toast("User deleted");
          loadAdminUsers();
        } catch (e) {
          toast(e.message);
        }
      })
    );
  } catch (e) {
    host.innerHTML = `<div class="empty">${e.message}</div>`;
  }
}
