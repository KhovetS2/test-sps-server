import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import { getUserByEmail, getUserProfileImageDataUri } from "../services/user.service";
import {
    generateAccessToken,
    generateRefreshToken,
    verifyRefreshToken,
    revokeRefreshToken,
} from "../services/auth.service";

/**
 * @swagger
 * /auth/login:
 *   post:
 *     tags: [Auth]
 *     summary: Authenticate user and get tokens
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, password]
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: email@email.com
 *               password:
 *                 type: string
 *                 example: "senha"
 *     responses:
 *       200:
 *         description: Login successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 access_token:
 *                   type: string
 *                 refresh_token:
 *                   type: string
 *                 token_type:
 *                   type: string
 *                   example: Bearer
 *                 user:
 *                   $ref: '#/components/schemas/User'
 *       401:
 *         description: Invalid credentials
 */
export function login(req: Request, res: Response): void {
    const { email, password } = req.body;

    const user = getUserByEmail(email);

    if (!user) {
        res.status(401).json({ message: "Invalid credentials" });
        return;
    }

    const passwordMatch = bcrypt.compareSync(password, user.password);

    if (!passwordMatch) {
        res.status(401).json({ message: "Invalid credentials" });
        return;
    }

    const access_token = generateAccessToken(user);
    const refresh_token = generateRefreshToken(user);

    const profileImage = getUserProfileImageDataUri(user.id);

    res.json({
        access_token,
        refresh_token,
        token_type: "Bearer",
        user: {
            id: user.id,
            name: user.name,
            email: user.email,
            type: user.type,
            has_profile_image: !!user.profile_image_data,
            profile_image_url: user.profile_image_data
                ? `/users/${user.id}/profile-image`
                : null,
            profile_image: profileImage, // data URI para usar direto no frontend
        },
    });
}
/**
 * @swagger
 * /auth/refresh:
 *   post:
 *     tags: [Auth]
 *     summary: Refresh access token using refresh token
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [refresh_token]
 *             properties:
 *               refresh_token:
 *                 type: string
 *     responses:
 *       200:
 *         description: Tokens refreshed
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 access_token:
 *                   type: string
 *                 refresh_token:
 *                   type: string
 *                 token_type:
 *                   type: string
 *       401:
 *         description: Invalid or expired refresh token
 */
export function refresh(req: Request, res: Response): void {
    const { refresh_token } = req.body;

    if (!refresh_token) {
        res.status(400).json({ message: "Refresh token is required" });
        return;
    }

    const user = verifyRefreshToken(refresh_token);

    if (!user) {
        res.status(401).json({
            message: "Invalid or expired refresh token",
        });
        return;
    }

    // Revoke old refresh token
    revokeRefreshToken(refresh_token);

    // Generate new pair
    const newAccessToken = generateAccessToken(user);
    const newRefreshToken = generateRefreshToken(user);

    res.json({
        access_token: newAccessToken,
        refresh_token: newRefreshToken,
        token_type: "Bearer",
    });
}

/**
 * @swagger
 * /auth/logout:
 *   post:
 *     tags: [Auth]
 *     summary: Logout and revoke refresh token
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [refresh_token]
 *             properties:
 *               refresh_token:
 *                 type: string
 *     responses:
 *       200:
 *         description: Logged out successfully
 *       400:
 *         description: Refresh token is required
 */
export function logout(req: Request, res: Response): void {
    const { refresh_token } = req.body;

    if (!refresh_token) {
        res.status(400).json({ message: "Refresh token is required" });
        return;
    }

    revokeRefreshToken(refresh_token);

    res.json({ message: "Logged out successfully" });
}
