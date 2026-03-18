import { Request, Response } from "express";
import {
    createUser as createUserService,
    getUserById,
    listUsers as listUsersService,
    updateUser as updateUserService,
    deleteUser as deleteUserService,
    updateUserProfileImage as updateUserProfileImageService,
    getUserProfileImageById
} from "../services/user.service";

/**
 * @swagger
 * /users:
 *   post:
 *     tags: [Users]
 *     summary: Create a new user
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateUser'
 *     responses:
 *       201:
 *         description: User created
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       400:
 *         description: Validation error or email already in use
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Insufficient permissions
 */
export function create(req: Request, res: Response): void {
    try {
        const user = createUserService(req.body);
        res.status(201).json(user);
    } catch (error: any) {
        if (error.message === "Email already in use") {
            res.status(400).json({ message: error.message });
        } else {
            res.status(500).json({ message: "Internal server error" });
        }
    }
}

/**
 * @swagger
 * /users:
 *   get:
 *     tags: [Users]
 *     summary: List all users
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of users
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/User'
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Insufficient permissions
 */
export function list(req: Request, res: Response): void {
    const users = listUsersService();
    res.json(users);
}

/**
 * @swagger
 * /users/{id}:
 *   get:
 *     tags: [Users]
 *     summary: Get user by ID
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: User ID
 *     responses:
 *       200:
 *         description: User found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       404:
 *         description: User not found
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Insufficient permissions
 */
export function getById(req: Request, res: Response): void {
    const id = parseInt(String(req.params.id), 10);

    if (isNaN(id)) {
        res.status(400).json({ message: "Invalid user ID" });
        return;
    }

    const user = getUserById(id);

    if (!user) {
        res.status(404).json({ message: "User not found" });
        return;
    }

    res.json(user);
}

/**
 * @swagger
 * /users/{id}:
 *   put:
 *     tags: [Users]
 *     summary: Update a user
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: User ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateUser'
 *     responses:
 *       200:
 *         description: User updated
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       400:
 *         description: Validation error or email already in use
 *       404:
 *         description: User not found
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Insufficient permissions
 */
export function update(req: Request, res: Response): void {
    const id = parseInt(String(req.params.id), 10);

    if (isNaN(id)) {
        res.status(400).json({ message: "Invalid user ID" });
        return;
    }

    try {
        const user = updateUserService(id, req.body);

        if (!user) {
            res.status(404).json({ message: "User not found" });
            return;
        }

        res.json(user);
    } catch (error: any) {
        if (error.message === "Email already in use") {
            res.status(400).json({ message: error.message });
        } else {
            res.status(500).json({ message: "Internal server error" });
        }
    }
}

/**
 * @swagger
 * /users/{id}:
 *   delete:
 *     tags: [Users]
 *     summary: Delete a user
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: User ID
 *     responses:
 *       200:
 *         description: User deleted
 *       404:
 *         description: User not found
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Insufficient permissions
 */
export function remove(req: Request, res: Response): void {
    const id = parseInt(String(req.params.id), 10);

    if (isNaN(id)) {
        res.status(400).json({ message: "Invalid user ID" });
        return;
    }

    const deleted = deleteUserService(id);

    if (!deleted) {
        res.status(404).json({ message: "User not found" });
        return;
    }

    res.json({ message: "User deleted successfully" });
}

/**
 * @swagger
 * /users/{id}/profile-image:
 *   post:
 *     tags: [Users]
 *     summary: Upload or update user profile image
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: User ID
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - profile_image
 *             properties:
 *               profile_image:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: Profile image updated
 *       400:
 *         description: Invalid user ID or no file uploaded
 *       404:
 *         description: User not found
 *       401:
 *         description: Unauthorized
 */
export function uploadProfileImage(req: Request, res: Response): void {
    const id = parseInt(String(req.params.id), 10);

    if (isNaN(id)) {
        res.status(400).json({ message: "Invalid user ID" });
        return;
    }

    const file = req.file;

    if (!file) {
        res.status(400).json({ message: "Nenhuma imagem enviada" });
        return;
    }

    const user = updateUserProfileImageService(id, {
        filename: file.originalname,
        mimetype: file.mimetype,
        buffer: file.buffer,
    });

    if (!user) {
        res.status(404).json({ message: "User not found" });
        return;
    }

    res.json(user);
}

/**
 * @swagger
 * /users/{id}/profile-image:
 *   get:
 *     tags: [Users]
 *     summary: Get user profile image
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: User ID
 *     responses:
 *       200:
 *         description: Profile image returned
 *       404:
 *         description: User or image not found
 *       401:
 *         description: Unauthorized
 */
export function getProfileImage(req: Request, res: Response): void {
    const id = parseInt(String(req.params.id), 10);

    if (isNaN(id)) {
        res.status(400).json({ message: "Invalid user ID" });
        return;
    }

    const image = getUserProfileImageById(id);

    if (!image || !image.data || !image.mimetype) {
        res.status(404).json({ message: "Profile image not found" });
        return;
    }

    res.setHeader("Content-Type", image.mimetype);

    if (image.filename) {
        res.setHeader(
            "Content-Disposition",
            `inline; filename="${encodeURIComponent(image.filename)}"`
        );
    }

    res.send(image.data);
}
