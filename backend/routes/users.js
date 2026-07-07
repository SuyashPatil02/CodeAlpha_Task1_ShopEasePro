const express = require("express");
const User = require("../models/User");
const Product = require("../models/Product");
const Order = require("../models/Order");
const { protect, adminOnly } = require("../middleware/auth");

const router = express.Router();

// ---- Wishlist (current user) ----

// GET /api/users/wishlist -> populated wishlist products
router.get("/wishlist", protect, async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id).populate("wishlist");
    res.json(user.wishlist || []);
  } catch (err) {
    next(err);
  }
});

// POST /api/users/wishlist/:productId -> toggle product in wishlist
router.post("/wishlist/:productId", protect, async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.productId);
    if (!product) return res.status(404).json({ message: "Product not found" });

    const user = await User.findById(req.user._id);
    const idx = user.wishlist.findIndex((p) => p.toString() === product._id.toString());
    let added;
    if (idx >= 0) {
      user.wishlist.splice(idx, 1);
      added = false;
    } else {
      user.wishlist.push(product._id);
      added = true;
    }
    await user.save();
    res.json({ added, wishlist: user.wishlist });
  } catch (err) {
    next(err);
  }
});

// ---- Admin user & dashboard management ----

// GET /api/users -> list all users (admin)
router.get("/", protect, adminOnly, async (req, res, next) => {
  try {
    const users = await User.find().select("-password -wishlist").sort({ createdAt: -1 });
    res.json(users);
  } catch (err) {
    next(err);
  }
});

// GET /api/users/stats -> admin dashboard stats
router.get("/stats", protect, adminOnly, async (req, res, next) => {
  try {
    const [users, products, orders, revenueAgg, lowStock] = await Promise.all([
      User.countDocuments(),
      Product.countDocuments(),
      Order.countDocuments(),
      Order.aggregate([{ $group: { _id: null, total: { $sum: "$totalPrice" } } }]),
      Product.countDocuments({ stock: { $lt: 10 } }),
    ]);
    res.json({
      users,
      products,
      orders,
      revenue: revenueAgg[0]?.total || 0,
      lowStock,
    });
  } catch (err) {
    next(err);
  }
});

// PUT /api/users/:id/role -> change a user's role (admin)
router.put("/:id/role", protect, adminOnly, async (req, res, next) => {
  try {
    const { role } = req.body;
    if (!["user", "admin"].includes(role)) {
      return res.status(400).json({ message: "Invalid role" });
    }
    const user = await User.findByIdAndUpdate(req.params.id, { role }, { new: true }).select(
      "-password -wishlist"
    );
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json(user);
  } catch (err) {
    next(err);
  }
});

// DELETE /api/users/:id -> delete a user (admin)
router.delete("/:id", protect, adminOnly, async (req, res, next) => {
  try {
    if (req.params.id === req.user._id.toString()) {
      return res.status(400).json({ message: "You cannot delete your own account" });
    }
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json({ message: "User deleted" });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
