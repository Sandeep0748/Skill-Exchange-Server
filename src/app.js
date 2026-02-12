const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const authRoutes = require("./routes/auth.routes");
const skillRoutes = require("./routes/skill.routes");
const requestRoutes = require("./routes/request.routes");

const errorHandler = require("./middleware/error.middleware");

const app = express();

// CORS configuration - must be first middleware
const corsOptions = {
  origin: ['https://skill-exchange-frontend-chi.vercel.app', 'http://localhost:3000', 'http://localhost:5173'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  optionsSuccessStatus: 200,
  maxAge: 3600
};

app.use(cors(corsOptions));
app.options('*', cors(corsOptions));

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
