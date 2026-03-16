const cloudinary = require("cloudinary").v2;
const fs = require("fs");

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const uploadMediaToCloudinary = async (filePath, { resourceType = "auto" } = {}) => {
  try {
    console.log({
      cloud: process.env.CLOUDINARY_CLOUD_NAME,
      key: !!process.env.CLOUDINARY_API_KEY,
      secret: !!process.env.CLOUDINARY_API_SECRET,
    });

    const stat = fs.statSync(filePath);
    const isVideo = resourceType === "video";

    const uploadOptions = {
      resource_type: resourceType,
    };

    // Cloudinary's regular upload can be flaky for large videos; use chunked upload.
    const result = isVideo && stat.size >= 90 * 1024 * 1024
      ? await cloudinary.uploader.upload_large(filePath, {
          ...uploadOptions,
          chunk_size: 6 * 1024 * 1024,
        })
      : await cloudinary.uploader.upload(filePath, uploadOptions);

    // Prefer the direct secure_url when it is already mp4; it tends to be playable immediately.
    const secureUrl = result?.secure_url;
    const isAlreadyMp4 =
      isVideo &&
      (result?.format === "mp4" || (typeof secureUrl === "string" && secureUrl.toLowerCase().includes(".mp4")));

    const playbackUrl =
      isVideo && result?.public_id
        ? isAlreadyMp4
          ? secureUrl
          : cloudinary.url(result.public_id, {
              secure: true,
              resource_type: "video",
              type: "upload",
              format: "mp4",
            })
        : secureUrl;

    return { ...result, playback_url: playbackUrl };
  } catch (error) {
    console.log("error ", error);
    const message =
      error?.message ||
      (typeof error === "string" ? error : "Error uploading to cloudinary");
    const err = new Error(message);
    err.cause = error;
    throw err;
  }
};

const deleteMediaFromCloudinary = async (publicId, resourceType = "video") => {
  try {
    const result = await cloudinary.uploader.destroy(publicId, {
      resource_type: resourceType,
    });
    return result;
  } catch (error) {
    console.log(error);
    const err = new Error("failed to delete media from cloudinary");
    err.cause = error;
    throw err;
  }
};

module.exports = { uploadMediaToCloudinary, deleteMediaFromCloudinary };
