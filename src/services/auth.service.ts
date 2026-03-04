import jwt, { SignOptions } from "jsonwebtoken";
import crypto from "crypto";
import db from "../database/database";

const JWT_SECRET = process.env.JWT_SECRET || "default-jwt-secret";
const JWT_REFRESH_SECRET =
    process.env.JWT_REFRESH_SECRET || "default-refresh-secret";
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "15m";
const JWT_REFRESH_EXPIRES_IN = process.env.JWT_REFRESH_EXPIRES_IN || "7d";

/**
 * All available scopes in the system.
 * For now, every user type gets all scopes.
 * In the future, map scopes based on user.type here.
 */
const ALL_SCOPES = [
    "users:create",
    "users:read",
    "users:update",
    "users:delete",
    "users:list",
];

export interface TokenPayload {
    id: number;
    email: string;
    type: string;
    scopes: string[];
}

/**
 * Returns the scopes for a given user.
 * Currently all users receive all scopes.
 * Modify this function to restrict scopes by user type in the future.
 */
export function getScopesForUser(_user: {
    id: number;
    type: string;
}): string[] {
    // Future: filter scopes based on _user.type
    // e.g. if (_user.type === 'viewer') return ['users:read', 'users:list'];
    return [...ALL_SCOPES];
}

/**
 * Generates a short-lived access token (JWT).
 */
export function generateAccessToken(user: {
    id: number;
    email: string;
    type: string;
}): string {
    const scopes = getScopesForUser(user);

    const options: SignOptions = { expiresIn: JWT_EXPIRES_IN as SignOptions["expiresIn"] };

    return jwt.sign(
        { id: user.id, email: user.email, type: user.type, scopes },
        JWT_SECRET,
        options
    );
}

/**
 * Generates a long-lived refresh token and stores it in the database.
 */
export function generateRefreshToken(user: {
    id: number;
    email: string;
    type: string;
}): string {
    const token = crypto.randomBytes(64).toString("hex");

    // Calculate expiration date
    const expiresAt = new Date();
    const daysMatch = JWT_REFRESH_EXPIRES_IN.match(/^(\d+)d$/);
    if (daysMatch) {
        expiresAt.setDate(expiresAt.getDate() + parseInt(daysMatch[1]));
    } else {
        expiresAt.setDate(expiresAt.getDate() + 7); // fallback 7 days
    }

    db.prepare(
        "INSERT INTO refresh_tokens (user_id, token, expires_at) VALUES (?, ?, ?)"
    ).run(user.id, token, expiresAt.toISOString());

    return token;
}

/**
 * Verifies and decodes an access token.
 */
export function verifyAccessToken(token: string): TokenPayload {
    return jwt.verify(token, JWT_SECRET) as TokenPayload;
}

/**
 * Verifies a refresh token against the database and returns the associated user info.
 * Returns null if the token is invalid or expired.
 */
export function verifyRefreshToken(
    token: string
): { id: number; email: string; type: string } | null {
    const row = db
        .prepare(
            "SELECT rt.user_id, rt.expires_at, u.email, u.type FROM refresh_tokens rt JOIN users u ON u.id = rt.user_id WHERE rt.token = ?"
        )
        .get(token) as
        | {
            user_id: number;
            expires_at: string;
            email: string;
            type: string;
        }
        | undefined;

    if (!row) return null;

    // Check expiration
    if (new Date(row.expires_at) < new Date()) {
        // Token expired, clean it up
        db.prepare("DELETE FROM refresh_tokens WHERE token = ?").run(token);
        return null;
    }

    return { id: row.user_id, email: row.email, type: row.type };
}

/**
 * Revokes (deletes) a refresh token from the database.
 */
export function revokeRefreshToken(token: string): boolean {
    const result = db
        .prepare("DELETE FROM refresh_tokens WHERE token = ?")
        .run(token);
    return result.changes > 0;
}

/**
 * Revokes all refresh tokens for a specific user.
 */
export function revokeAllUserRefreshTokens(userId: number): void {
    db.prepare("DELETE FROM refresh_tokens WHERE user_id = ?").run(userId);
}
