const {
  uploadMediaToCloudinary,
  deleteMediaFromCloudinary,
} = require("../../helper/cloudinary");

const fs = require("fs");

const uploadMedia = async (req, res) => {
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

    const response = await uploadMediaToCloudinary(filePath);

    if (!response) {
      return res.status(500).json({
        success: false,
        message: "Upload to Cloudinary failed",
      });
    }

    fs.unlinkSync(filePath);

    return res.status(200).json({
      success: true,
      message: "Media uploaded successfully",
      data: {
        url: response.secure_url,
        public_id: response.public_id,
      },
    });
  } catch (error) {
    console.error("Cloudinary upload error:", error);

    // optional cleanup
    if (req.file?.path && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

const deleteMedia = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({
        success: false,
        message: "Public ID is required",
      });
    }

    const result = await deleteMediaFromCloudinary(id);

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
};

module.exports = {
  uploadMedia,
  deleteMedia,
};
