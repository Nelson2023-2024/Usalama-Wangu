import { SNSClient, PublishCommand } from "@aws-sdk/client-sns";
import { ENV } from "./env.config.js";
import { SMS } from "../models/SMS.model.js";

const sns = new SNSClient({
  region: ENV.AWS_REGION,
  credentials: {
    accessKeyId: ENV.AWS_ACCESS_KEY,
    secretAccessKey: ENV.AWS_SECRET_KEY,
  },
});

export async function sendEmergencySMS(
  alertId,
  latitude,
  longitude,
  address,
  audioUrl,
  userName = null
) {
  // Create SMS message body
  const messageBody = `🚨 EMERGENCY ALERT 🚨

${userName || "A registered user"} is in immediate danger!

📍 Location: ${address || "Unknown address"}
🌍 Coordinates: Latitude: ${latitude}, Longitude: ${longitude}
🗺️ Google Maps: https://maps.google.com/?q=${latitude},${longitude}

🎤 Audio Recording: ${audioUrl}

⚠️ Please take immediate action — contact them and notify emergency services. 
This alert was triggered from Usalama Wangu.`;

  const toPhoneNumber = ENV.AWS_SNS_TO_PHONE_NUMBER;

  try {
    //send SMS via AWS SNS
    const command = new PublishCommand({
      Message: messageBody,
      PhoneNumber: ENV.AWS_SNS_TO_PHONE_NUMBER
    });

    const response = await sns.send(command);
    console.log("SNS SMS sent successfully:", response.MessageId);

    //save SMS record to DB

    const smsRecord = await SMS.create({
      alertId,
      to: toPhoneNumber,
      from: "UsalamaApp",
      messageBody,
      status: "sent",
      snsMessageId: response.MessageId,
    });

    return smsRecord;
  } catch (error) {
    console.error("Error sending SNS SMS:", error.message);

    // Save failed SMS record
    await SMS.create({
      alertId,
      to: toPhoneNumber,
      from: "UsalamaApp",
      messageBody,
      status: "failed",
      errorMessage: error.message,
    });

    throw error;
  }
}
