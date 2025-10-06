// routes/alert.routes.js
import { Router } from "express";
import asyncHandler from "express-async-handler";
import cloudinary from "../config/cloudinary.config.js";
import { upload } from "../middleware/upload.middleware.js";
import { Alert } from "../models/Alert.model.js";
import { uploadToAzure } from "../config/azureblob.config.js";
import { sendEmergencySMS } from "../config/sns.config.js";
import { sendEmergencyEmail } from "../config/email.config.js";

const router = Router();

router.post(
  "/",
  upload.single("audio"),
  asyncHandler(async (req, res) => {
    const { latitude, longitude, address, accuracy } = req.body;
    const audioFile = req.file;

    console.log("req.body:", req.body);
    console.log("Uploaded file:", req.file);

    // Validation
    if (!audioFile) {
      return res.status(400).json({ message: "Audio file is required" });
    }

    if (!latitude || !longitude) {
      return res.status(400).json({
        message: "Location (latitude and longitude) is required",
      });
    }

    let url, blobName;
    try {
      ({ url, blobName } = await uploadToAzure(
        req.file.buffer,
        req.file.originalname,
        req.file.mimetype
      ));
    } catch (error) {
      console.error("Azure audio upload error:", error);
      return res.status(500).json({ error: "Failed to upload audio" });
    }

    // Create alert in database
    const alert = await Alert.create({
      location: {
        latitude: parseFloat(latitude),
        longitude: parseFloat(longitude),
        address,
        accuracy: accuracy ? parseFloat(accuracy) : null,
      },
      audioUrl: url,
      notifiedContacts: [],
      deliveredToAuthorities: false,
    });

    console.log("Alert created:", alert._id);

    // Send emergency email
    try {
      const emailRecord = await sendEmergencyEmail(
        alert._id,
        latitude,
        longitude,
        address,
        url
      );

      // Update alert with notified contacts
      alert.notifiedContacts.push(emailRecord.to);
      alert.deliveredToAuthorities = true;
      await alert.save();

      console.log("Emergency email sent successfully via Gmail");
    } catch (emailError) {
      console.error(
        "Failed to send email, but alert was saved:",
        emailError.message
      );
      // Don't fail the request if email fails - alert is still saved
    }

    res.status(201).json({
      success: true,
      alert,
      message: "Emergency alert created and notifications sent",
    });
  })
);

// Get all alerts (optional - for viewing history)
router.get(
  "/",
  asyncHandler(async (req, res) => {
    const alerts = await Alert.find().sort({ createdAt: -1 }).limit(50);
    res.json({ alerts });
  })
);

// Get SMS history for an alert (optional)
router.get(
  "/:alertId/sms",
  asyncHandler(async (req, res) => {
    const { SMS } = await import("../models/SMS.model.js");
    const smsRecords = await SMS.find({ alertId: req.params.alertId });
    res.json({ smsRecords });
  })
);

export { router as alertRoutes };
