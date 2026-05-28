import express from 'express';
import {uploadFile, upload} from '../controllers/uploadController.js';
import {protect} from '../midlewares/protect.js';

const router = express.Router();

// Route pour gérer les uploads de fichiers (ex: images de voitures)
router.post('/upload', protect, upload.single('file'), uploadFile);

export default router;