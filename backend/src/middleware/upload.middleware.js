import multer from "multer";

// 1. Stotage configuration
//Memory storage keeps files in RAM for easy upload to Cloudinary/S3
const storage = multer.memoryStorage();

//2. File filter (allow images + audio)
const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith("image/")) {
    cb(null, true);
  } else if (file.mimetype.startsWith("audio/")) {
    cb(null, true);
  } else {
    cb(new Error("Only image and audio files are allowed"), false);
  }
};

export const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 100 * 1024 * 1024, // 15 MB max (enough for ~40s high-quality audio)
  },
});
