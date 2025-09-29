// services/sms.service.js
import twilio from "twilio";
import { ENV } from "../config/env.config.js";
import { SMS } from "../models/SMS.model.js";

const client = twilio(ENV.TWILIO_ACCOUNT_SID, ENV.TWILIO_AUTH_TOKEN);

export const sendEmergencySMS = async (
  alertId,
  latitude,
  longitude,
  address,
  audioUrl,
  userName = null
) => {
  // Create SMS message body
  const messageBody = `🚨 EMERGENCY ALERT 🚨

${userName || "A registered user"} is in immediate danger!

📍 Location: ${address || "Unknown address"}
🌍 Coordinates: Latitude: ${latitude}, Longitude: ${longitude}
🗺️ Google Maps: https://maps.google.com/?q=${latitude},${longitude}

🎤 Audio Recording: ${audioUrl}

⚠️ Please take immediate action — contact them and notify emergency services. 
This alert was triggered from Usalama Wangu.`;

  try {
    // Send SMS via Twilio
    const message = await client.messages.create({
      body: messageBody,
      from: ENV.TWILIO_FROM_NUMBER,
      to: ENV.TWILIO_TO_PHONE_NUMBER,
    });

    console.log("SMS sent successfully:", message.sid);

    // Save SMS record to database
    const smsRecord = await SMS.create({
      alertId,
      to: ENV.TWILIO_TO_PHONE_NUMBER,
      from: ENV.TWILIO_FROM_NUMBER,
      messageBody,
      status: "sent",
      twilioSid: message.sid,
    });

    return smsRecord;
  } catch (error) {
    console.error("Error sending SMS:", error.message);

    // Save failed SMS record
    await SMS.create({
      alertId,
      to: ENV.TWILIO_TO_PHONE_NUMBER,
      from: ENV.TWILIO_FROM_NUMBER,
      messageBody,
      status: "failed",
      errorMessage: error.message,
    });

    throw error;
  }
};
