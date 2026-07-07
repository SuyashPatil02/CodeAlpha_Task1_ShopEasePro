const express = require("express");
const Order = require("../models/Order");
const Product = require("../models/Product");
const { protect, adminOnly } = require("../middleware/auth");

const router = express.Router();

// POST /api/orders  -> create an order from cart items (requires auth)
router.post("/", protect, async (req, res, next) => {
  try {
    const { items, shippingAddress, paymentMethod } = req.body;
    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ message: "Cart is empty" });
    }

    const method = paymentMethod === "online" ? "online" : "cod";

    // Re-fetch prices from DB so totals can't be tampered with on the client
    const orderItems = [];
    let itemsPrice = 0;

    for (const item of items) {
      const product = await Product.findById(item.productId || item.product);
      if (!product) {
        return res.status(404).json({ message: `Product not found: ${item.productId}` });
      }
      const quantity = Math.max(1, parseInt(item.quantity, 10) || 1);
      if (product.stock < quantity) {
        return res.status(400).json({ message: `${product.name} is out of stock` });
      }
      itemsPrice += product.price * quantity;
      orderItems.push({
        product: product._id,
        name: product.name,
        price: product.price,
        quantity,
        image: product.image,
      });
    }

    const shippingPrice = itemsPrice > 999 ? 0 : 99;
    const totalPrice = Math.round((itemsPrice + shippingPrice) * 100) / 100;

    const order = await Order.create({
      user: req.user._id,
      items: orderItems,
      shippingAddress: shippingAddress || {},
      paymentMethod: method,
      paymentStatus: method === "online" ? "paid" : "pending",
      itemsPrice: Math.round(itemsPrice * 100) / 100,
      shippingPrice,
      totalPrice,
      status: "pending",
    });

    // Decrement stock
    for (const item of orderItems) {
      await Product.findByIdAndUpdate(item.product, { $inc: { stock: -item.quantity } });
    }

    res.status(201).json(order);
  } catch (err) {
    next(err);
  }
});

// GET /api/orders  -> current user's orders
router.get("/", protect, async (req, res, next) => {
  try {
    const orders = await Order.find({ user: req.user._id }).sort({ createdAt: -1 });
    res.json(orders);
  } catch (err) {
    next(err);
  }
});

// GET /api/orders/all  -> all orders (admin)
router.get("/all", protect, adminOnly, async (req, res, next) => {
  try {
    const orders = await Order.find()
      .populate("user", "name email")
      .sort({ createdAt: -1 });
    res.json(orders);
  } catch (err) {
    next(err);
  }
});

// GET /api/orders/:id  -> single order (owner or admin)
router.get("/:id", protect, async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id).populate("user", "name email");
    if (!order) return res.status(404).json({ message: "Order not found" });
    const ownerId = order.user._id ? order.user._id.toString() : order.user.toString();
    if (ownerId !== req.user._id.toString() && req.user.role !== "admin") {
      return res.status(403).json({ message: "Not authorized to view this order" });
    }
    res.json(order);
  } catch (err) {
    next(err);
  }
});

// PUT /api/orders/:id/status  -> update order status (admin)
router.put("/:id/status", protect, adminOnly, async (req, res, next) => {
  try {
    const { status } = req.body;
    const allowed = ["pending", "processing", "shipped", "delivered", "cancelled"];
    if (!allowed.includes(status)) {
      return res.status(400).json({ message: "Invalid status" });
    }
    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { status, ...(status === "delivered" ? { paymentStatus: "paid" } : {}) },
      { new: true }
    );
    if (!order) return res.status(404).json({ message: "Order not found" });
    res.json(order);
  } catch (err) {
    next(err);
  }
});

module.exports = router;
