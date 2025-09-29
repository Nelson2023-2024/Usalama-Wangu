import express from "express";
import cors from "cors";
import { ENV } from "./config/env.config.js";
import { zoneRoutes } from "./routes/zone.routes.js";
import { alertRoutes } from "./routes/alert.routes.js";
import { connectToMongoDB } from "./config/db.config.js";

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use("/api/zones", zoneRoutes);
app.use("/api/alert", alertRoutes);

app.get("/", (req, res) => {
  res.send("Safety Zones API is running...");
});

// Start server
app.listen(ENV.PORT, "192.168.0.101", () => {
  console.log(`\n🚀 Server running on http://192.168.0.101:${ENV.PORT}\n`);

  // Connect to MongoDB
  connectToMongoDB();
});
