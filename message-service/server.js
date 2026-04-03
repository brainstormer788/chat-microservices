require("dotenv").config();
const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db");
const messageRoutes = require("./routes/messageRoutes");
const app = express();
const allowedOrigins = (process.env.ALLOWED_ORIGINS || "http://localhost:5173,http://127.0.0.1:5173")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);
const allowedOriginSet = new Set(allowedOrigins);

const corsOptions = {
  origin(origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      return callback(null, true);
    }

    return callback(new Error("Origin not allowed by CORS"));
  },
  credentials: true
};

const normalizeRequestOrigin = (value) => {
  if (!value) {
    return null;
  }

  try {
    return new URL(value).origin;
  } catch {
    return null;
  }
};

const enforceTrustedBrowserOrigin = (req, res, next) => {
  if (!["POST", "PUT", "PATCH", "DELETE"].includes(req.method)) {
    return next();
  }

  const requestOrigin =
    normalizeRequestOrigin(req.headers.origin) ||
    normalizeRequestOrigin(req.headers.referer);

  if (!requestOrigin || !allowedOriginSet.has(requestOrigin)) {
    return res.status(403).json({ message: "Untrusted request origin" });
  }

  return next();
};

app.set("trust proxy", 1);
app.disable("x-powered-by");
app.use((req, res, next) => {
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("X-Frame-Options", "DENY");
  res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
  next();
});
app.use(cors(corsOptions));
app.use(express.json({ limit: "10kb" }));
app.use(enforceTrustedBrowserOrigin);
app.use("/api/messages",messageRoutes)
app.get("/",(req,res)=>{
  res.send("Message Service Running")
})
const PORT = process.env.PORT || 5003;
connectDB()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Message Service running on port ${PORT}`);
    });
  })
  .catch((error) => {
    console.error("Message Service failed to start:", error.message);
    process.exit(1);
  });
