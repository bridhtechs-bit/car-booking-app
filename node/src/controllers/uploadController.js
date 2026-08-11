import { upload } from "../middleware/uploadMidlware.js";
import cloudinary from "../utils/cloudinary.js"; // Importe la config qu'on a créée à l'étape précédente
import fs from "fs"; // Module natif de Node.js pour gérer les fichiers

const removeLocalFile = async (filePath) => {
  try {
    await fs.promises.unlink(filePath);
  } catch (err) {
    console.warn(`Unable to remove local file: ${filePath}`, err.message);
  }
};

const uploadFile = async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ success: false, message: "No file uploaded" });
  }

  const folder = process.env.CLOUDINARY_FOLDER || "drivio_uploads";

  try {
    const uploadResult = await cloudinary.uploader.upload(req.file.path, {
      folder,
      resource_type: "auto",
      use_filename: true,
      unique_filename: true,
    });

    await removeLocalFile(req.file.path);

    res.status(200).json({
      success: true,
      message: "File uploaded successfully to Cloudinary",
      data: {
        url: uploadResult.secure_url,
        public_id: uploadResult.public_id,
        resource_type: uploadResult.resource_type,
      },
    });
  } catch (error) {
    console.error("Cloudinary Upload Error:", error);

    if (req.file && req.file.path) {
      await removeLocalFile(req.file.path);
    }

    res.status(500).json({
      success: false,
      message: "Failed to upload file to Cloudinary",
      error: error.message,
    });
  }
};

export { upload, uploadFile };