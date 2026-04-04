require("dotenv").config();

const express = require("express");
const cors = require("cors");

const { createProxyMiddleware } = require("http-proxy-middleware");

const app = express();

const allowedOrigins = (process.env.ALLOWED_ORIGINS || "http://localhost:5173,http://127.0.0.1:5173")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

const corsOptions = {
  origin(origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      return callback(null, true);
    }

    return callback(new Error("Origin not allowed by CORS"));
  },
  credentials: true
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

const AUTH_SERVICE_URL = process.env.AUTH_SERVICE_URL || "http://localhost:5001";
const USER_SERVICE_URL = process.env.USER_SERVICE_URL || "http://localhost:5002";
const MESSAGE_SERVICE_URL = process.env.MESSAGE_SERVICE_URL || "http://localhost:5003";
const CHAT_SERVICE_URL = process.env.CHAT_SERVICE_URL || "http://localhost:5004";

const buildServiceProxy = (serviceBasePath, target) =>
  createProxyMiddleware({
    target,
    changeOrigin: true,
    xfwd: true,
    pathRewrite: (path) => {
      const suffix = path === "/" ? "" : path;
      return `${serviceBasePath}${suffix}`;
    },
    timeout: 10000,
    proxyTimeout: 10000,
    onError: (err, req, res) => {
      if (!res.headersSent) {
        res.status(502).json({
          message: "Upstream service unavailable",
          error: err.message
        });
      }
    }
  });

// CHAT SOCKET SERVICE (WebSocket)
app.use(
  "/socket.io",
  createProxyMiddleware({
    target: CHAT_SERVICE_URL,
    changeOrigin: true,
    xfwd: true,
    ws: true,
    timeout: 10000,
    proxyTimeout: 10000
  })
);


// AUTH SERVICE
app.use(
  "/api/auth",
  buildServiceProxy("/api/auth", AUTH_SERVICE_URL)
);


// USER SERVICE
app.use(
  "/api/users",
  buildServiceProxy("/api/users", USER_SERVICE_URL)
);


// MESSAGE SERVICE
app.use(
  "/api/messages",
  buildServiceProxy("/api/messages", MESSAGE_SERVICE_URL)
);


app.get("/health", (req, res) => {
  res.json({ status: "ok", service: "api-gateway" });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`API Gateway running on port ${PORT}`);
});
