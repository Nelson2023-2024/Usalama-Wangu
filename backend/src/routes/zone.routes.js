import express from "express";
import { SAFETY_ZONES } from "../data/zones.js";

const router = express.Router();

// Get all zones
router.get("/", (req, res) => {
  res.json(SAFETY_ZONES);
});

// Get a single zone by ID
router.get("/:id", (req, res) => {
  const zone = SAFETY_ZONES.find((z) => z.id === parseInt(req.params.id));
  if (!zone) return res.status(404).json({ message: "Zone not found" });
  res.json(zone);
});

export {router as zoneRoutes};
