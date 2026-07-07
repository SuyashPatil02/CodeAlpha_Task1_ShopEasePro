// User dashboard: profile + recent orders + wishlist count.
async function loadDashboard() {
  const user = getUser();
  if (!user) {
    window.location.href = "login.html";
    return;
  }
  if (user.role === "admin") {
    window.location.href = "admin/index.html";
    return;
  }

  document.getElementById("greeting").textContent = `Hi, ${user.name} 👋`;
  document.getElementById("profName").value = user.name;
  document.getElementById("profEmail").value = user.email;
  document.getElementById("profPhone").value = user.phone || "";

  // Orders
  try {
    const orders = await api("/orders");
    document.getElementById("statOrders").textContent = orders.length;
    const spent = orders.reduce((s, o) => s + o.totalPrice, 0);
    document.getElementById("statSpent").textContent = money(spent);

    const recent = document.getElementById("recentOrders");
    recent.innerHTML = orders.length
      ? orders
          .slice(0, 5)
          .map(
            (o) => `
        <div class="order-card">
          <div class="order-head">
            <div><strong>Order #${o._id.slice(-6).toUpperCase()}</strong><br/>
            <span class="muted">${new Date(o.createdAt).toLocaleString()}</span></div>
            <span class="status ${o.status}">${o.status}</span>
          </div>
          <div class="order-line"><span>${o.items.length} item(s)</span><span style="font-weight:700;color:var(--text)">${money(o.totalPrice)}</span></div>
        </div>`
          )
          .join("") + `<a href="orders.html" class="btn btn-outline btn-sm">View all orders</a>`
      : `<p class="muted">No orders yet. <a href="shop.html" style="color:var(--accent)">Start shopping</a></p>`;
  } catch (e) {
    /* ignore */
  }

  // Wishlist count
  try {
    const items = await api("/users/wishlist");
    document.getElementById("statWishlist").textContent = items.length;
  } catch (e) {
    /* ignore */
  }

  document.getElementById("profileForm").addEventListener("submit", async (e) => {
    e.preventDefault();
    const name = document.getElementById("profName").value.trim();
    const phone = document.getElementById("profPhone").value.trim();
    const password = document.getElementById("profPassword").value;
    try {
      const data = await api("/auth/profile", {
        method: "PUT",
        body: JSON.stringify({ name, phone, ...(password ? { password } : {}) }),
      });
      setAuth(getToken(), data.user);
      toast("Profile updated");
      document.getElementById("profPassword").value = "";
      renderHeader();
    } catch (err) {
      toast(err.message);
    }
  });

  document.getElementById("logoutBtn").addEventListener("click", logout);
}

document.addEventListener("DOMContentLoaded", loadDashboard);
