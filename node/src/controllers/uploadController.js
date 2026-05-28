import {upload} from "../middleware/uploadMidlware";

const uploadFile = (req, res) => {
    //multer gère déjà le processus d'upload et de stockage du fichier, donc si on arrive ici, c'est que le fichier a été traité
    if (!req.file) {
        return res.status(400).json({ success: false, message: "No file uploaded" });
    }
    const fileUrl = `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`;
    res.status(200).json({ success: true, message: "File uploaded successfully", fileUrl });
};

export { upload, uploadFile };