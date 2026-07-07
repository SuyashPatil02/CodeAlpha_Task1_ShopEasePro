// Checkout page: address, payment method (COD / demo online), place order.
function renderSummary() {
  const cart = getCart();
  const subtotal = cartTotal();
  const shipping = subtotal > 999 ? 0 : 99;
  document.getElementById("checkoutSummary").innerHTML = `
    <h3 style="margin-bottom:16px">Your Order</h3>
    ${cart
      .map(
        (i) =>
          `<div class="summary-row"><span>${i.name} × ${i.quantity}</span><span>${money(i.price * i.quantity)}</span></div>`
      )
      .join("")}
    <div class="summary-row"><span>Shipping</span><span>${shipping === 0 ? "Free" : money(shipping)}</span></div>
    <div class="summary-total"><span>Total</span><span>${money(subtotal + shipping)}</span></div>`;
}

let payMethod = "cod";

function selectPayment(method) {
  payMethod = method;
  document.querySelectorAll("[data-pay]").forEach((el) =>
    el.classList.toggle("active", el.dataset.pay === method)
  );
  document.getElementById("demoCard").style.display = method === "online" ? "block" : "none";
}

async function placeOrder(e) {
  e.preventDefault();
  const cart = getCart();
  if (!cart.length) return toast("Your cart is empty");

  const shippingAddress = {
    fullName: document.getElementById("fullName").value.trim(),
    address: document.getElementById("address").value.trim(),
    city: document.getElementById("city").value.trim(),
    postalCode: document.getElementById("postalCode").value.trim(),
    country: document.getElementById("country").value.trim(),
    phone: document.getElementById("phone").value.trim(),
  };

  const btn = document.getElementById("placeOrderBtn");
  btn.disabled = true;
  btn.textContent = payMethod === "online" ? "Processing payment..." : "Placing order...";

  try {
    // Simulate online payment delay for demo
    if (payMethod === "online") await new Promise((r) => setTimeout(r, 1200));

    const order = await api("/orders", {
      method: "POST",
      body: JSON.stringify({
        items: cart.map((i) => ({ productId: i.productId, quantity: i.quantity })),
        shippingAddress,
        paymentMethod: payMethod,
      }),
    });
    clearCart();
    toast("Order placed successfully!");
    setTimeout(() => (window.location.href = "orders.html"), 800);
  } catch (err) {
    toast(err.message);
    btn.disabled = false;
    btn.textContent = "Place Order";
  }
}

document.addEventListener("DOMContentLoaded", () => {
  const user = getUser();
  if (!user) {
    window.location.href = "login.html";
    return;
  }
  if (!getCart().length) {
    window.location.href = "cart.html";
    return;
  }
  document.getElementById("fullName").value = user.name;
  renderSummary();
  document.querySelectorAll("[data-pay]").forEach((el) =>
    el.addEventListener("click", () => selectPayment(el.dataset.pay))
  );
  selectPayment("cod");
  document.getElementById("checkoutForm").addEventListener("submit", placeOrder);
});
