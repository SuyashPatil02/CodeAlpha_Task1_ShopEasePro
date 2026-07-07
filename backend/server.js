require("dotenv").config({ path: require("path").join(__dirname, "..", ".env") });
require("dotenv").config();
const express = require("express");
const path = require("path");
const cors = require("cors");
const cookieParser = require("cookie-parser");

const connectDB = require("./config/db");
const authRoutes = require("./routes/auth");
const productRoutes = require("./routes/products");
const orderRoutes = require("./routes/orders");
const userRoutes = require("./routes/users");
const reviewRoutes = require("./routes/reviews");

const app = express();
const FRONTEND_DIR = path.join(__dirname, "..", "frontend");

app.use(cors({ origin: true, credentials: true }));
app.use(express.json());
app.use(cookieParser());

app.use("/api/auth", authRoutes);
app.use("/api/products", productRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/users", userRoutes);
app.use("/api/reviews", reviewRoutes);

app.use("/api", (req, res) => res.status(404).json({ message: "API route not found" }));
app.use("/uploads", express.static(path.join(__dirname, "public", "uploads")));
app.use(express.static(FRONTEND_DIR));

app.get("/", (req, res) => res.sendFile(path.join(FRONTEND_DIR, "index.html")));
app.get(/^\/(?!api|uploads).*/, (req, res) => res.sendFile(path.join(FRONTEND_DIR, "index.html")));

app.use((err, req, res, next) => {
  console.error(err);
  res.status(err.status || 500).json({ message: err.message || "Server error" });
});

const PORT = process.env.PORT || 5000;
connectDB().then(() => {
  app.listen(PORT, () => console.log(`🚀 ShopEase Pro running at http://localhost:${PORT}`));
});
