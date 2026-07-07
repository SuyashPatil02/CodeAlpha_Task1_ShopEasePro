const express = require("express");
const Product = require("../models/Product");
const Review = require("../models/Review");
const { protect } = require("../middleware/auth");

const router = express.Router();

// Recalculate a product's average rating and review count
async function recalcRating(productId) {
  const reviews = await Review.find({ product: productId });
  const numReviews = reviews.length;
  const rating =
    numReviews === 0
      ? 0
      : Math.round((reviews.reduce((s, r) => s + r.rating, 0) / numReviews) * 10) / 10;
  await Product.findByIdAndUpdate(productId, { rating, numReviews });
}

// GET /api/reviews/:productId -> list reviews for a product
router.get("/:productId", async (req, res, next) => {
  try {
    const reviews = await Review.find({ product: req.params.productId }).sort({ createdAt: -1 });
    res.json(reviews);
  } catch (err) {
    next(err);
  }
});

// POST /api/reviews/:productId -> add or update a review (requires auth)
router.post("/:productId", protect, async (req, res, next) => {
  try {
    const { rating, comment } = req.body;
    const r = Math.max(1, Math.min(5, parseInt(rating, 10) || 0));
    if (!r) return res.status(400).json({ message: "Rating is required (1-5)" });

    const product = await Product.findById(req.params.productId);
    if (!product) return res.status(404).json({ message: "Product not found" });

    const existing = await Review.findOne({ product: product._id, user: req.user._id });
    if (existing) {
      existing.rating = r;
      existing.comment = comment || "";
      await existing.save();
    } else {
      await Review.create({
        product: product._id,
        user: req.user._id,
        name: req.user.name,
        rating: r,
        comment: comment || "",
      });
    }

    await recalcRating(product._id);
    res.status(201).json({ message: "Review saved" });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
