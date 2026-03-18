import { Router } from "express";
import multer from "multer";
import { downloadFile, listFiles, uploadFile } from "../controllers/file.controller";
import { authorize } from "../middlewares/auth.middleware";
import { saveFile } from "../services/file.services";
const router = Router();

const upload = multer({
    storage: multer.memoryStorage(),
    limits: {
        fileSize: 10 * 1024 * 1024, // 10MB por arquivo
        files: 10, // máximo 10 arquivos
    },
});

router.post("/upload",
    upload.single("file"), uploadFile);
router.get(
    "/",
    listFiles
);
router.get(
    "/:id",
    downloadFile
);

export default router;
