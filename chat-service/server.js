require("dotenv").config();

const express = require("express");
const cors = require("cors");
const http = require("http");

const { initSocket } = require("./config/socketServer");
const handleSockets = require("./socket/socketHandler");

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
app.use(cors(corsOptions));
app.use(express.json());

app.get("/", (req, res) => {
  res.send("Chat Socket Service Running");
});

const server = http.createServer(app);

const io = initSocket(server);

handleSockets();

const PORT = process.env.PORT || 5004;

server.listen(PORT, () => {
  console.log(`Chat Service running on port ${PORT}`);
});
