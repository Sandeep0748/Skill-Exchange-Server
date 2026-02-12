const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const authRoutes = require("./routes/auth.routes");
const skillRoutes = require("./routes/skill.routes");
const requestRoutes = require("./routes/request.routes");

const errorHandler = require("./middleware/error.middleware");

const app = express();

// Middleware
const allowedOrigins = [
  'http://localhost:3000',
  'http://localhost:5173',
  'https://skill-exchange-frontend-chi.vercel.app',
  process.env.FRONTEND_URL || ''
].filter(url => url && url.length > 0);

app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      console.log('CORS blocked origin:', origin);
      callback(null, true); // Allow for debugging
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  maxAge: 86400
}));

// Preflight requests
app.options('*', cors());

app.use(express.json());
app.use(morgan("dev"));

// Health Check
app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "SkillLoop API is running 🚀",
  });
});

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/skills", skillRoutes);
app.use("/api/requests", requestRoutes);

// 404 Handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "Route not found",
  });
});

// Error Middleware (always last)
app.use(errorHandler);

module.exports = app;
