require("dotenv").config({ path: require("path").join(__dirname, "..", ".env") });
require("dotenv").config();
const mongoose = require("mongoose");
const connectDB = require("./config/db");
const Product = require("./models/Product");
const User = require("./models/User");
const Order = require("./models/Order");
const Review = require("./models/Review");
const productsData = require("./data/products");

const slugify = (s) =>
  s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

async function seed() {
  await connectDB();
  console.log("🌱 Seeding ShopEase Pro database...");

  await Promise.all([
    Product.deleteMany({}),
    User.deleteMany({}),
    Order.deleteMany({}),
    Review.deleteMany({}),
  ]);

  const products = productsData.map((p, index) => ({
    ...p,
    slug: `${slugify(p.name)}-${index + 1}`,
    images: [p.image],
  }));

  await Product.insertMany(products);
  console.log(`✅ Inserted ${products.length} realistic products`);

  await User.create([
    { name: "Admin User", email: "admin@shopeasepro.com", password: "admin123", role: "admin" },
    { name: "Demo Customer", email: "user@shopeasepro.com", password: "user123", role: "user" },
  ]);
  console.log("✅ Demo accounts ready");
  console.log("   Admin: admin@shopeasepro.com / admin123");
  console.log("   User : user@shopeasepro.com / user123");

  await mongoose.disconnect();
  console.log("🎉 Seed completed successfully");
  process.exit(0);
}

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
