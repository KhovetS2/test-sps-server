import { Request, Response } from "express";
import { getAllFiles, getFileById, saveFile } from "../services/file.services";

/**
 * @swagger
 * /files/upload:
 *   post:
 *     tags: [Files]
 *     summary: Upload a single file
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - file
 *             properties:
 *               file:
 *                 type: string
 *                 format: binary
 *     responses:
 *       201:
 *         description: File uploaded successfully
 *       400:
 *         description: No file uploaded
 *       401:
 *         description: Unauthorized
 */
export function uploadFile(req: Request, res: Response): void {
    try {
        const file = req.file;

        if (!file) {
            res.status(400).json({ message: "Nenhum arquivo enviado" });
            return;
        }

        const id = saveFile({
            filename: file.originalname,
            mimetype: file.mimetype || "application/octet-stream",
            size: file.size,
            buffer: file.buffer,
        });

        res.status(201).json({
            message: "Arquivo enviado com sucesso",
            id,
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Erro ao salvar arquivo" });
    }
}

/**
 * @swagger
 * /files:
 *   get:
 *     tags: [Files]
 *     summary: List all uploaded files
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Files list
 */
export function listFiles(req: Request, res: Response): void {
    try {
        const files = getAllFiles();
        res.json(files);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Erro ao listar arquivos" });
    }
}

/**
 * @swagger
 * /files/{id}:
 *   get:
 *     tags: [Files]
 *     summary: Download file by id
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: File downloaded successfully
 *       404:
 *         description: File not found
 */
export function downloadFile(req: Request, res: Response): void {
    try {
        const id = Number(req.params.id);

        if (Number.isNaN(id)) {
            res.status(400).json({ message: "ID inválido" });
            return;
        }

        const file: any = getFileById(id);

        if (!file) {
            res.status(404).json({ message: "Arquivo não encontrado" });
            return;
        }

        res.setHeader("Content-Type", file.mimetype);
        res.setHeader(
            "Content-Disposition",
            `attachment; filename="${encodeURIComponent(file.filename)}"`
        );

        res.send(file.data);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Erro ao baixar arquivo" });
    }
}
