require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");

const BookDemo = require("./models/BookDemo");
const Contact = require("./models/Contact");
const Subscriber = require("./models/Subscriber");

const app = express();
const PORT = process.env.PORT || 8787;
const DB_RECONNECT_DELAY_MS = 10000;
const configuredOrigins = (process.env.CORS_ORIGIN || "")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);
const allowedOrigins = configuredOrigins.length ? configuredOrigins : ["https://carboncrunch.in", "https://www.carboncrunch.in", "http://localhost:5173", "http://127.0.0.1:5173"];

const corsOptions = {
  origin(origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      return callback(null, true);
    }

    return callback(new Error("Origin not allowed by CORS"));
  },
  methods: ["GET", "POST", "OPTIONS"],
  allowedHeaders: ["Content-Type", "X-Admin-Key"],
};

// ── Middleware ──
app.disable("x-powered-by");
app.set("trust proxy", 1);
app.use(
  helmet({
    contentSecurityPolicy: false,
    crossOriginEmbedderPolicy: false,
  }),
);
app.use(cors(corsOptions));
app.use(express.json({ limit: "100kb" }));

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200,
  standardHeaders: true,
  legacyHeaders: false,
});

const formLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 30,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Too many requests. Please try again in a few minutes." },
});

app.use("/api", apiLimiter);
app.use("/api/book-demo", formLimiter);
app.use("/api/contact-us", formLimiter);
app.use("/api/subscribe", formLimiter);

// ── MongoDB Connection ──
const dbStateLabels = {
  0: "disconnected",
  1: "connected",
  2: "connecting",
  3: "disconnecting",
};

function isDatabaseConnected() {
  return mongoose.connection.readyState === 1;
}

async function connectToDatabase() {
  if (!process.env.MONGODB_URI) {
    console.error("❌  Missing MONGODB_URI environment variable");
    return;
  }

  if (mongoose.connection.readyState === 1 || mongoose.connection.readyState === 2) {
    return;
  }

  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      dbName: "Website",
      serverSelectionTimeoutMS: 5000,
    });
    console.log("✅  Connected to MongoDB — database: Website");
  } catch (err) {
    console.error("❌  MongoDB connection error:", err.message);
    setTimeout(connectToDatabase, DB_RECONNECT_DELAY_MS);
  }
}

mongoose.connection.on("disconnected", () => {
  console.warn("⚠️  MongoDB disconnected. Retrying...");
  setTimeout(connectToDatabase, DB_RECONNECT_DELAY_MS);
});

mongoose.connection.on("error", (err) => {
  console.error("❌  MongoDB runtime error:", err.message);
});

connectToDatabase();

app.get("/api/health", (_req, res) => {
  const connected = isDatabaseConnected();
  const status = connected ? "ok" : "degraded";

  res.status(connected ? 200 : 503).json({
    status,
    timestamp: new Date().toISOString(),
  });
});

function requireDatabaseConnection(_req, res, next) {
  if (isDatabaseConnected()) {
    return next();
  }

  return res.status(503).json({
    error: "Service temporarily unavailable. Database is reconnecting, please try again shortly.",
  });
}

app.use("/api", (req, res, next) => {
  if (req.path === "/health") {
    return next();
  }

  return requireDatabaseConnection(req, res, next);
});

function requireAdminKey(req, res, next) {
  const configuredAdminKey = process.env.ADMIN_API_KEY;
  if (!configuredAdminKey) {
    return res.status(403).json({ error: "Read access is disabled." });
  }

  const providedAdminKey = req.header("x-admin-key");
  if (providedAdminKey !== configuredAdminKey) {
    return res.status(401).json({ error: "Unauthorized." });
  }

  return next();
}

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

// ════════════════════════════════════════════════════════════════════
//  POST ROUTES — form submissions
// ════════════════════════════════════════════════════════════════════

// Book Demo
app.post("/api/book-demo", async (req, res) => {
  try {
    const { name, phone, email, company, date, time, message } = req.body;
    if (!name || !phone || !email || !company || !date || !time) {
      return res.status(400).json({ error: "All required fields must be filled." });
    }
    const entry = await BookDemo.create({ name, phone, email, company, date, time, message });
    res.status(201).json({ success: true, id: entry._id });
  } catch (err) {
    console.error("Book Demo error:", err.message);
    res.status(500).json({ error: "Server error. Please try again." });
  }
});

// Contact Us
app.post("/api/contact-us", async (req, res) => {
  try {
    const { name, phone, email, company, message } = req.body;
    if (!name || !phone || !email || !message) {
      return res.status(400).json({ error: "All required fields must be filled." });
    }
    const entry = await Contact.create({ name, phone, email, company, message });
    res.status(201).json({ success: true, id: entry._id });
  } catch (err) {
    console.error("Contact Us error:", err.message);
    res.status(500).json({ error: "Server error. Please try again." });
  }
});

// Newsletter Subscribe
app.post("/api/subscribe", async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ error: "Email is required." });
    }
    const normalizedEmail = email.toLowerCase().trim();
    if (!isValidEmail(normalizedEmail)) {
      return res.status(400).json({ error: "Invalid email format." });
    }
    // Upsert to avoid duplicate-key errors for repeat subscribers
    const entry = await Subscriber.findOneAndUpdate({ email: normalizedEmail }, { email: normalizedEmail }, { upsert: true, returnDocument: "after", setDefaultsOnInsert: true });
    res.status(201).json({ success: true, id: entry._id });
  } catch (err) {
    console.error("Subscribe error:", err.message);
    res.status(500).json({ error: "Server error. Please try again." });
  }
});

// ════════════════════════════════════════════════════════════════════
//  GET ROUTES — boilerplate for future access portal
// ════════════════════════════════════════════════════════════════════

// Get all demo bookings
app.get("/api/book-demo", requireAdminKey, async (req, res) => {
  try {
    const entries = await BookDemo.find().sort({ createdAt: -1 });
    res.json(entries);
  } catch (err) {
    console.error("GET book-demo error:", err.message);
    res.status(500).json({ error: "Server error." });
  }
});

// Get all contact submissions
app.get("/api/contact-us", requireAdminKey, async (req, res) => {
  try {
    const entries = await Contact.find().sort({ createdAt: -1 });
    res.json(entries);
  } catch (err) {
    console.error("GET contact-us error:", err.message);
    res.status(500).json({ error: "Server error." });
  }
});

// Get all subscribers
app.get("/api/subscribe", requireAdminKey, async (req, res) => {
  try {
    const entries = await Subscriber.find().sort({ createdAt: -1 });
    res.json(entries);
  } catch (err) {
    console.error("GET subscribe error:", err.message);
    res.status(500).json({ error: "Server error." });
  }
});

app.use((err, _req, res, _next) => {
  if (err && err.message === "Origin not allowed by CORS") {
    return res.status(403).json({ error: "Origin not allowed." });
  }

  console.error("Unhandled server error:", err?.message || err);
  return res.status(500).json({ error: "Server error." });
});

// ── Start ──
app.listen(PORT, "127.0.0.1", () => {
  console.log(`🚀  Backend running on http://127.0.0.1:${PORT}`);
});
