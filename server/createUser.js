const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const MONGODB_URI =
  "mongodb+srv://iamjitendrasuthar24:zawxse11@cluster0.xnejlnk.mongodb.net/BillingPro?retryWrites=true&w=majority";

// Seedha users collection mein insert — koi model dependency nahi
async function createUser() {
  try {
    console.log("Connecting to MongoDB Atlas...");
    await mongoose.connect(MONGODB_URI);
    console.log("✅ Connected!");

    const db = mongoose.connection.db;

    // Pehle check karo user hai ya nahi
    const existing = await db
      .collection("users")
      .findOne({ email: "admin@jsinteriors.com" });

    if (existing) {
      console.log("⚠️  User already exists!");
      console.log("Email:", existing.email);
      console.log("Try logging in with: admin@jsinteriors.com / admin123");
      await mongoose.disconnect();
      return;
    }

    // Password hash karo
    const hashedPassword = await bcrypt.hash("admin123", 10);

    // Insert user
    const result = await db.collection("users").insertOne({
      name: "Admin",
      email: "admin@jsinteriors.com",
      password: hashedPassword,
      role: "admin",
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    console.log("✅ User created! ID:", result.insertedId);
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log("Email   : admin@jsinteriors.com");
    console.log("Password: admin123");
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  } catch (err) {
    console.error("❌ Error:", err.message);
  } finally {
    await mongoose.disconnect();
    console.log("Disconnected.");
  }
}

createUser();
