// Health check routes

import { Router } from "express";
const router = Router();

router.get("/", (req, res) => {
  res.json({
    success: true,
    message: "Server is healthy",
    timestamp: new Date().toISOString(),
    data: {
      status: "ok",
      uptime: process.uptime(),
      environment: process.env.NODE_ENV || "development",
      version: "1.0.0"
    }
  });
});

export default router;
