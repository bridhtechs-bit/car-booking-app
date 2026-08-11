import dotenv from 'dotenv';
import fs from 'fs';
import multer from 'multer';
import path from 'path';

dotenv.config();

const uploadPath = process.env.FILE_UPLOAD_PATH || 'uploads';
const safeUploadPath = uploadPath.replace(/^[/\\]+/, '');
const uploadDir = path.resolve(process.cwd(), safeUploadPath);
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// définir où et comment stocker les fichiers
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir); // dossier de destination
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    cb(null, `${uniqueSuffix}${path.extname(file.originalname)}`); // nom du fichier
  }
});

// filtrer les fichiers acceptés
const fileFilter = (req, file, cb) => {
  const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true); // accepter le fichier
  } else {
    cb(new Error('Only image files are allowed (jpeg, png, gif, webp)'), false); // refuser le fichier
  }
};

const maxFileSize = Number(process.env.MAX_FILE_SIZE) || 2 * 1024 * 1024;

// configurer multer
const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: maxFileSize }
});

export { upload };