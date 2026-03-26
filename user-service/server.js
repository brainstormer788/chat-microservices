require("dotenv").config()
const express=require("express")
const cors = require("cors");
const connectDB = require("./config/db");
const userRoutes = require("./routes/userRoutes");
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

app.use("/api/users",userRoutes)
app.get("/",(req,res)=>{
    res.send("service running")
})
const PORT = process.env.PORT || 5002;

connectDB()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`User Service running on port ${PORT}`);
    });
  })
  .catch((error) => {
    console.error("User Service failed to start:", error.message);
    process.exit(1);
  });
