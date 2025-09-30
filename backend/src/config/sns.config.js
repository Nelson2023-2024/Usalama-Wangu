import { SNSClient, PublishCommand } from "@aws-sdk/client-sns";
import { ENV } from "./env.config.js";

const sns = new SNSClient({
  region: ENV.AWS_REGION,
  credentials: {
    accessKeyId: ENV.AWS_ACCESS_KEY,
    secretAccessKey: ENV.AWS_SECRET_KEY,
  },
});

export async function sendEmergencySMS(phoneNumber, message) {
  const command = new PublishCommand({
    Message: message,
    PhoneNumber: phoneNumber,
    MessageAttributes: {
      "AWS.SNS.SMS.SenderID": {
        DataType: "String",
        StringValue: "UsalamaApp", // Customize sender ID
      },
    },
  });

  return await sns.send(command)
}
