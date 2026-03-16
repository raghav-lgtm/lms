const express = require("express");
const multer = require("multer");
const router = express.Router();
const path = require("path");
const {
  uploadMediaToCloudinary,
  deleteMediaFromCloudinary,
} = require("../../helper/cloudinary");

const fs = require("fs");

const uploadDir = path.join(__dirname, "../../uploads");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(
      null,
      file.fieldname + "-" + uniqueSuffix + path.extname(file.originalname),
    );
  },
});

const upload = multer({
  storage,
  limits: {
    fileSize: 550 * 1024 * 1024, // ~550MB; client enforces 500MB
  },
  fileFilter: (req, file, cb) => {
    const mime = file.mimetype || "";
    const ext = path.extname(file.originalname || "").toLowerCase();
    const isVideo =
      mime.startsWith("video/") ||
      [".mp4", ".mov", ".mkv", ".webm", ".avi", ".m4v"].includes(ext);
    const isImage =
      mime.startsWith("image/") || [".jpg", ".jpeg", ".png", ".webp"].includes(ext);

    if (isVideo || isImage) return cb(null, true);
    return cb(new Error("Only video and image files are allowed"));
  },
});

router.post("/upload", (req, res) => {
  upload.single("file")(req, res, async (err) => {
    if (err) {
      const message =
        err?.message === "File too large"
          ? "File is too large. Please upload a smaller file."
          : err?.message || "Upload failed";
      return res.status(400).json({ success: false, message });
    }

    console.log("req.file:", req.file);
    console.log("req.body:", req.body);

    try {
      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: "No file provided",
        });
      }

      const filePath = req.file.path;
      const mime = req.file.mimetype || "";
      const ext = path.extname(req.file.originalname || "").toLowerCase();

      const isVideo =
        mime.startsWith("video/") ||
        [".mp4", ".mov", ".mkv", ".webm", ".avi", ".m4v"].includes(ext);

      const response = await uploadMediaToCloudinary(filePath, {
        resourceType: isVideo ? "video" : "image",
      });

      if (!response) {
        return res.status(500).json({
          success: false,
          message: "Upload to Cloudinary failed",
        });
      }

      console.log("cloudinary.upload:", {
        resource_type: isVideo ? "video" : "image",
        public_id: response.public_id,
        secure_url: response.secure_url,
        playback_url: response.playback_url,
        format: response.format,
      });

      if (fs.existsSync(filePath)) fs.unlinkSync(filePath);

      return res.status(200).json({
        success: true,
        message: "Media uploaded successfully",
        data: {
          url: isVideo ? response.playback_url : response.secure_url,
          original_url: response.secure_url,
          public_id: response.public_id,
          resource_type: isVideo ? "video" : "image",
        },
      });
    } catch (error) {
      console.error("Cloudinary upload error:", error);

      if (req.file?.path && fs.existsSync(req.file.path)) {
        fs.unlinkSync(req.file.path);
      }

      return res.status(500).json({
        success: false,
        message: error?.message || "Internal server error",
      });
    }
  });
});

router.delete("/delete/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const resourceType = req.query.resourceType || "video";

    if (!id) {
      return res.status(400).json({
        success: false,
        message: "Public ID is required",
      });
    }

    const result = await deleteMediaFromCloudinary(id, resourceType);

    if (!result || result.result !== "ok") {
      return res.status(500).json({
        success: false,
        message: "Delete from Cloudinary failed",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Media deleted successfully",
      data: {
        public_id: id,
      },
    });
  } catch (error) {
    console.error("Cloudinary delete error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
});

module.exports = router;
