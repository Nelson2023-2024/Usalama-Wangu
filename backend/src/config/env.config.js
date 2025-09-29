import { configDotenv } from "dotenv";
configDotenv();
export const ENV = {
  PORT: process.env.PORT,
  CLOUDINARY_CLOUD_NAME: process.env.CLOUDINARY_CLOUD_NAME,
  CLOUDINARY_API_KEY: process.env.CLOUDINARY_API_KEY,
  CLOUDINARY_API_SECRET: process.env.CLOUDINARY_API_SECRET,
  MONGO_URI: process.env.MONGO_URI,
  TWILIO_ACCOUNT_SID: process.env.TWILIO_ACCOUNT_SID,
  TWILIO_AUTH_TOKEN: process.env.TWILIO_AUTH_TOKEN,
  TWILIO_FROM_NUMBER:process.env.TWILIO_FROM_NUMBER,
  TWILIO_TO_NUMBER: process.env.TWILIO_TO_NUMBER
  
  
};

