import mongoose from "mongoose";

const alertSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: false,
    },
    alertType: {
      type: String,
      default: "emergency_panic_button",
    },
    location: {
      latitude: { type: Number, required: true },
      longitude: { type: Number, required: true },
      address: { type: String },
      accuracy: { type: Number },
    },
    audioUrl: {
      type: String,
      required: true,
    }, // cloud link to recording
    notifiedContacts: [{ type: String }], // phone numbers or IDs
    deliveredToAuthorities: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

export const Alert = mongoose.model("Alert", alertSchema);
