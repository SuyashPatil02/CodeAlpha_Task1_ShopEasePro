const express = require("express");
const path = require("path");
const fs = require("fs");
const multer = require("multer");
const Product = require("../models/Product");
const Review = require("../models/Review");
const { protect, adminOnly } = require("../middleware/auth");

const router = express.Router();

// --- Multer storage for product image uploads ---
const uploadDir = path.join(__dirname, "..", "public", "uploads");
fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname) || ".jpg";
    cb(null, `product-${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: (req, file, cb) => {
    if (/^image\//.test(file.mimetype)) cb(null, true);
    else cb(new Error("Only image files are allowed"));
  },
});

// POST /api/products/upload (admin) -> upload product image, returns public URL
router.post("/upload", protect, adminOnly, upload.single("image"), (req, res) => {
  if (!req.file) return res.status(400).json({ message: "No file uploaded" });
  res.status(201).json({ url: `/uploads/${req.file.filename}` });
});

// GET /api/products  -> list + optional search, category, sort
router.get("/", async (req, res, next) => {
  try {
    const { search, category, sort, featured } = req.query;
    const filter = {};
    if (search) filter.name = { $regex: search, $options: "i" };
    if (category && category !== "all") filter.category = category;
    if (featured === "true") filter.featured = true;

    let sortOption = { createdAt: -1 };
    if (sort === "price-asc") sortOption = { price: 1 };
    else if (sort === "price-desc") sortOption = { price: -1 };
    else if (sort === "rating") sortOption = { rating: -1 };
    else if (sort === "name") sortOption = { name: 1 };

    const products = await Product.find(filter).sort(sortOption);
    res.json(products);
  } catch (err) {
    next(err);
  }
});

// GET /api/products/categories -> distinct category list
router.get("/categories", async (req, res, next) => {
  try {
    const categories = await Product.distinct("category");
    res.json(categories);
  } catch (err) {
    next(err);
  }
});

// GET /api/products/:slug -> single product details
router.get("/:slug", async (req, res, next) => {
  try {
    const product = await Product.findOne({ slug: req.params.slug });
    if (!product) return res.status(404).json({ message: "Product not found" });
    const reviews = await Review.find({ product: product._id }).sort({ createdAt: -1 });
    res.json({ product, reviews });
  } catch (err) {
    next(err);
  }
});

// ---- Admin product management ----

// POST /api/products  (admin) -> create product
router.post("/", protect, adminOnly, async (req, res, next) => {
  try {
    const product = await Product.create(req.body);
    res.status(201).json(product);
  } catch (err) {
    next(err);
  }
});

// PUT /api/products/:id  (admin) -> update product
router.put("/:id", protect, adminOnly, async (req, res, next) => {
  try {
    const product = await Product.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!product) return res.status(404).json({ message: "Product not found" });
    res.json(product);
  } catch (err) {
    next(err);
  }
});

// PATCH /api/products/:id/stock  (admin) -> quick stock update
router.patch("/:id/stock", protect, adminOnly, async (req, res, next) => {
  try {
    const { stock } = req.body;
    const product = await Product.findByIdAndUpdate(
      req.params.id,
      { stock: Math.max(0, parseInt(stock, 10) || 0) },
      { new: true }
    );
    if (!product) return res.status(404).json({ message: "Product not found" });
    res.json(product);
  } catch (err) {
    next(err);
  }
});

// DELETE /api/products/:id  (admin) -> delete product
router.delete("/:id", protect, adminOnly, async (req, res, next) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);
    if (!product) return res.status(404).json({ message: "Product not found" });
    await Review.deleteMany({ product: product._id });
    res.json({ message: "Product deleted" });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
