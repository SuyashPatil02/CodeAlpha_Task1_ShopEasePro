// Product details page with reviews & ratings.
let currentProduct = null;
let selectedRating = 0;

function getSlug() {
  return new URLSearchParams(window.location.search).get("slug");
}

async function loadProduct() {
  await syncWishlist();
  const wrap = document.getElementById("productDetail");
  const slug = getSlug();
  if (!slug) {
    wrap.innerHTML = `<div class="empty">No product specified.</div>`;
    return;
  }

  try {
    const { product: p, reviews } = await api(`/products/${slug}`);
    currentProduct = p;
    document.title = `${p.name} — ShopEase Pro`;
    const discount = p.oldPrice && p.oldPrice > p.price;
    const wished = isWished(p._id) ? "active" : "";

    wrap.innerHTML = `
      <div class="detail">
        <div class="gallery"><img src="${p.image}" alt="${p.name}" /></div>
        <div>
          <span class="cat muted">${p.category} · ${p.brand}</span>
          <h1 class="page-title">${p.name}</h1>
          <div class="stars">${starString(p.rating)} <span class="muted">${p.rating} (${p.numReviews} reviews)</span></div>
          <div class="price">${money(p.price)} ${discount ? `<span class="old-price" style="font-size:1rem">${money(p.oldPrice)}</span>` : ""}</div>
          <div class="meta">
            <span>${p.stock > 0 ? `✅ ${p.stock} in stock` : "❌ Out of stock"}</span>
          </div>
          <p class="desc">${p.description}</p>
          <div class="qty">
            <label for="qty">Qty</label>
            <input type="number" id="qty" value="1" min="1" max="${p.stock}" />
          </div>
          <div class="detail-actions">
            <button id="addBtn" class="btn" ${p.stock === 0 ? "disabled" : ""}>Add to Cart</button>
            <button id="wishBtn" class="btn btn-outline ${wished}">♥ Wishlist</button>
          </div>
        </div>
      </div>`;

    document.getElementById("addBtn").addEventListener("click", () => {
      const qty = Math.max(1, parseInt(document.getElementById("qty").value, 10) || 1);
      addToCart(p, qty);
    });
    document.getElementById("wishBtn").addEventListener("click", async () => {
      const added = await toggleWishlist(p._id);
      document.getElementById("wishBtn").classList.toggle("active", added);
    });

    renderReviews(reviews);
  } catch (e) {
    wrap.innerHTML = `<div class="empty">${e.message}</div>`;
  }
}

function renderReviews(reviews) {
  const host = document.getElementById("reviews");
  const user = getUser();
  const list = reviews.length
    ? reviews
        .map(
          (r) => `
        <div class="review">
          <div class="review-head">
            <strong>${r.name}</strong>
            <span class="stars">${starString(r.rating)}</span>
          </div>
          <p class="muted">${r.comment || ""}</p>
          <small class="muted">${new Date(r.createdAt).toLocaleDateString()}</small>
        </div>`
        )
        .join("")
    : `<p class="muted">No reviews yet. Be the first to review!</p>`;

  const form = user
    ? `
    <div class="review-form">
      <h3>Write a review</h3>
      <div class="rating-input" id="ratingInput">
        ${[1, 2, 3, 4, 5].map((n) => `<span data-star="${n}">★</span>`).join("")}
      </div>
      <div class="form-group"><textarea id="reviewComment" rows="3" placeholder="Share your thoughts..."></textarea></div>
      <button class="btn" id="submitReview">Submit Review</button>
    </div>`
    : `<p class="muted"><a href="login.html" style="color:var(--accent);font-weight:600">Log in</a> to write a review.</p>`;

  host.innerHTML = `<h2 class="page-title" style="font-size:1.4rem">Reviews & Ratings</h2>${list}${form}`;

  if (user) {
    const stars = host.querySelectorAll("[data-star]");
    stars.forEach((s) =>
      s.addEventListener("click", () => {
        selectedRating = parseInt(s.dataset.star, 10);
        stars.forEach((x) => x.classList.toggle("on", parseInt(x.dataset.star, 10) <= selectedRating));
      })
    );
    document.getElementById("submitReview").addEventListener("click", submitReview);
  }
}

async function submitReview() {
  if (!selectedRating) return toast("Please select a star rating");
  const comment = document.getElementById("reviewComment").value.trim();
  try {
    await api(`/reviews/${currentProduct._id}`, {
      method: "POST",
      body: JSON.stringify({ rating: selectedRating, comment }),
    });
    toast("Thanks for your review!");
    setTimeout(loadProduct, 600);
  } catch (e) {
    toast(e.message);
  }
}

document.addEventListener("DOMContentLoaded", loadProduct);
