// config/gmail.config.js
import nodemailer from "nodemailer";
import { ENV } from "./env.config.js";
import { SMS } from "../models/SMS.model.js";

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: ENV.EMAIL_USER,
    pass: ENV.EMAIL_PASSWORD,
  },
});

export const sendEmergencyEmail = async (
  alertId,
  latitude,
  longitude,
  address,
  audioUrl
) => {
  const googleMapsLink = `https://www.google.com/maps?q=${latitude},${longitude}`;

  const mailOptions = {
    from: ENV.EMAIL_USER,
    to: ENV.EMAIL_USER, // You can add multiple emails: "email1@gmail.com, email2@gmail.com"
    subject: "🚨 EMERGENCY ALERT - Immediate Attention Required",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #d32f2f; border-bottom: 3px solid #d32f2f; padding-bottom: 10px;">
          🚨 EMERGENCY ALERT
        </h1>
        
        <div style="background-color: #ffebee; padding: 15px; border-left: 4px solid #d32f2f; margin: 20px 0;">
          <h2 style="margin-top: 0; color: #d32f2f;">Emergency Panic Button Activated</h2>
          <p style="font-size: 16px; margin: 5px 0;">
            <strong>Alert ID:</strong> ${alertId}
          </p>
        </div>

        <div style="background-color: #f5f5f5; padding: 15px; border-radius: 5px; margin: 20px 0;">
          <h3 style="margin-top: 0;">📍 Location Details</h3>
          <p style="margin: 5px 0;"><strong>Address:</strong> ${address || "Not available"}</p>
          <p style="margin: 5px 0;"><strong>Coordinates:</strong> ${latitude}, ${longitude}</p>
          <p style="margin: 10px 0;">
            <a href="${googleMapsLink}" 
               style="display: inline-block; background-color: #1976d2; color: white; padding: 10px 20px; 
                      text-decoration: none; border-radius: 5px; font-weight: bold;">
              View on Google Maps
            </a>
          </p>
        </div>

        <div style="background-color: #e3f2fd; padding: 15px; border-radius: 5px; margin: 20px 0;">
          <h3 style="margin-top: 0;">🎤 Audio Recording</h3>
          <p style="margin: 5px 0;">An audio recording was captured during the emergency:</p>
          <p style="margin: 10px 0;">
            <a href="${audioUrl}" 
               style="display: inline-block; background-color: #388e3c; color: white; padding: 10px 20px; 
                      text-decoration: none; border-radius: 5px; font-weight: bold;">
              Listen to Audio Recording
            </a>
          </p>
        </div>

        <div style="background-color: #fff3e0; padding: 15px; border-left: 4px solid #ff9800; margin: 20px 0;">
          <p style="margin: 0; font-weight: bold; color: #e65100;">
            ⚠️ This is an automated emergency alert. Please take immediate action.
          </p>
        </div>

        <div style="margin-top: 30px; padding-top: 15px; border-top: 1px solid #ddd; color: #666; font-size: 12px;">
          <p>Timestamp: ${new Date().toLocaleString()}</p>
          <p>This email was sent automatically by the Emergency Alert System.</p>
        </div>
      </div>
    `,
    text: `
🚨 EMERGENCY ALERT

Emergency Panic Button Activated

Alert ID: ${alertId}

LOCATION DETAILS:
Address: ${address || "Not available"}
Coordinates: ${latitude}, ${longitude}
Google Maps: ${googleMapsLink}

AUDIO RECORDING:
${audioUrl}

⚠️ This is an automated emergency alert. Please take immediate action.

Timestamp: ${new Date().toLocaleString()}
    `,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log("Emergency email sent successfully:", info.response);

    // Save email record to database
    const emailRecord = await SMS.create({
      alertId,
      to: ENV.EMAIL_USER,
      from: ENV.EMAIL_USER,
      messageBody: mailOptions.text,
      status: "sent",
      snsMessageId: info.messageId, // Using messageId from nodemailer
    });

    return emailRecord;
  } catch (error) {
    console.error("Error sending emergency email:", error);

    // Save failed email record
    await SMS.create({
      alertId,
      to: ENV.EMAIL_USER,
      from: ENV.EMAIL_USER,
      messageBody: mailOptions.text,
      status: "failed",
      errorMessage: error.message,
    });

    throw error;
  }
};