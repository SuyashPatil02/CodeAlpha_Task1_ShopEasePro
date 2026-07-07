// Cart page rendering + quantity controls.
function renderCart() {
  const cart = getCart();
  const itemsEl = document.getElementById("cartItems");
  const summaryEl = document.getElementById("cartSummary");

  if (!cart.length) {
    itemsEl.innerHTML = `<div class="empty">Your cart is empty.<br/><br/><a href="shop.html" class="btn">Start Shopping</a></div>`;
    summaryEl.innerHTML = "";
    return;
  }

  itemsEl.innerHTML = cart
    .map(
      (i) => `
      <div class="cart-item">
        <img src="${i.image}" alt="${i.name}" />
        <div>
          <a href="product.html?slug=${i.slug || ""}" class="it-name">${i.name}</a>
          <div class="muted">${money(i.price)} each</div>
          <button class="link-remove" data-remove="${i.productId}">Remove</button>
        </div>
        <div style="text-align:right">
          <div class="qty-control">
            <button data-dec="${i.productId}">−</button>
            <span>${i.quantity}</span>
            <button data-inc="${i.productId}">+</button>
          </div>
          <div style="font-weight:700;margin-top:6px">${money(i.price * i.quantity)}</div>
        </div>
      </div>`
    )
    .join("");

  const subtotal = cartTotal();
  const shipping = subtotal > 999 ? 0 : 99;
  summaryEl.innerHTML = `
    <h3 style="margin-bottom:16px">Order Summary</h3>
    <div class="summary-row"><span>Subtotal</span><span>${money(subtotal)}</span></div>
    <div class="summary-row"><span>Shipping</span><span>${shipping === 0 ? "Free" : money(shipping)}</span></div>
    <div class="summary-total"><span>Total</span><span>${money(subtotal + shipping)}</span></div>
    <a href="checkout.html" class="btn btn-block" style="margin-top:16px">Proceed to Checkout</a>
    ${subtotal <= 999 ? `<p class="muted" style="font-size:.82rem;margin-top:10px">Add ${money(999 - subtotal)} more for free shipping!</p>` : ""}`;

  itemsEl.querySelectorAll("[data-inc]").forEach((b) =>
    b.addEventListener("click", () => {
      const item = cart.find((x) => x.productId === b.dataset.inc);
      updateQuantity(b.dataset.inc, item.quantity + 1);
      renderCart();
    })
  );
  itemsEl.querySelectorAll("[data-dec]").forEach((b) =>
    b.addEventListener("click", () => {
      const item = cart.find((x) => x.productId === b.dataset.dec);
      updateQuantity(b.dataset.dec, item.quantity - 1);
      renderCart();
    })
  );
  itemsEl.querySelectorAll("[data-remove]").forEach((b) =>
    b.addEventListener("click", () => {
      removeFromCart(b.dataset.remove);
      renderCart();
    })
  );
}

document.addEventListener("DOMContentLoaded", renderCart);
