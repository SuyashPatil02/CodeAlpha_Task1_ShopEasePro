// My Orders page (requires login).
async function loadOrders() {
  const wrap = document.getElementById("ordersList");
  if (!getUser()) {
    wrap.innerHTML = `<div class="empty">Please <a href="login.html" style="color:var(--accent)">log in</a> to view your orders.</div>`;
    return;
  }

  try {
    const orders = await api("/orders");
    if (!orders.length) {
      wrap.innerHTML = `<div class="empty">You have no orders yet. <br/><br/><a href="shop.html" class="btn">Start shopping</a></div>`;
      return;
    }

    wrap.innerHTML = orders
      .map(
        (o) => `
        <div class="order-card">
          <div class="order-head">
            <div>
              <strong>Order #${o._id.slice(-6).toUpperCase()}</strong><br/>
              <span class="muted">${new Date(o.createdAt).toLocaleString()} · ${o.paymentMethod === "cod" ? "Cash on Delivery" : "Online Payment"}</span>
            </div>
            <span class="status ${o.status}">${o.status}</span>
          </div>
          ${o.items
            .map(
              (i) =>
                `<div class="order-line"><span>${i.name} × ${i.quantity}</span><span>${money(
                  i.price * i.quantity
                )}</span></div>`
            )
            .join("")}
          <div class="order-line"><span>Shipping</span><span>${o.shippingPrice === 0 ? "Free" : money(o.shippingPrice)}</span></div>
          <div class="summary-total" style="margin-top:8px"><span>Total</span><span>${money(o.totalPrice)}</span></div>
        </div>`
      )
      .join("");
  } catch (e) {
    wrap.innerHTML = `<div class="empty">${e.message}</div>`;
  }
}

document.addEventListener("DOMContentLoaded", loadOrders);
