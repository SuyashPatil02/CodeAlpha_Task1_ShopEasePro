const mongoose = require("mongoose");

async function connectDB() {
  const uri = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/shopeasepro";
  try {
    await mongoose.connect(uri);
    console.log("✅ MongoDB connected");
  } catch (err) {
    console.error("❌ MongoDB connection error:", err.message);
    console.error("   Make sure MongoDB is running, or set MONGO_URI in your .env file.");
    process.exit(1);
  }
}

module.exports = connectDB;
