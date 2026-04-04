import { v2 as cloudinary } from "cloudinary";

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

/**
 * Upload multiple project images to Cloudinary
 * POST /api/v1/upload/project-images
 * Accepts up to 5 images via multipart/form-data (field: "images")
 * Uses memory storage (file.buffer) instead of disk storage
 */
export const uploadProjectImages = async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ success: false, message: "No images provided" });
    }

    const uploadedImages = [];

    for (const file of req.files) {
      try {
        // Upload from buffer (memory storage)
        const b64 = Buffer.from(file.buffer).toString('base64');
        const dataURI = `data:${file.mimetype};base64,${b64}`;
        
        const result = await cloudinary.uploader.upload(dataURI, {
          folder: "brainbazaar/projects",
          resource_type: "image",
          transformation: [
            { width: 1200, height: 800, crop: "limit" },
            { quality: "auto:good" },
            { fetch_format: "auto" },
          ],
        });

        uploadedImages.push({
          public_id: result.public_id,
          secure_url: result.secure_url,
        });
      } catch (uploadErr) {
        console.error(`Failed to upload ${file.originalname}:`, uploadErr.message);
      }
      // No file cleanup needed - using memory storage
    }

    if (uploadedImages.length === 0) {
      return res.status(500).json({ success: false, message: "All image uploads failed" });
    }

    res.json({
      success: true,
      images: uploadedImages,
      thumbnail: uploadedImages[0], // First image is the thumbnail
    });
  } catch (error) {
    console.error("Upload error:", error.message);
    res.status(500).json({ 
      success: false, 
      message: "Failed to upload images",
      error: error.message 
    });
  }
};

/**
 * Delete a project image from Cloudinary
 * DELETE /api/v1/upload/project-images/:publicId
 */
export const deleteProjectImage = async (req, res) => {
  try {
    const { publicId } = req.params;

    if (!publicId) {
      return res.status(400).json({ success: false, message: "Public ID is required" });
    }

    const result = await cloudinary.uploader.destroy(publicId);

    if (result.result === "ok") {
      res.json({ success: true, message: "Image deleted successfully" });
    } else {
      res.status(400).json({ success: false, message: "Failed to delete image" });
    }
  } catch (error) {
    console.error("Delete error:", error.message);
    res.status(500).json({
      success: false,
      message: "Failed to delete image",
      error: error.message
    });
  }
};
