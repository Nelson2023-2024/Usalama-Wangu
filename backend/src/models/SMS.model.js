// models/SMS.model.js
import mongoose from "mongoose";

const smsSchema = new mongoose.Schema(
  {
    alertId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Alert",
      required: true,
    },
    to: {
      type: String,
      required: true,
    },
    from: {
      type: String,
      required: true,
    },
    messageBody: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ["sent", "failed", "pending"],
      default: "pending",
    },
    snsMessageId: {
      type: String, // AWS SNS message ID for tracking
    },
    errorMessage: {
      type: String,
    },
  },
  { timestamps: true }
);

export const SMS = mongoose.model("SMS", smsSchema);