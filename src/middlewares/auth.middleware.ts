import { Request, Response, NextFunction } from "express";
import { verifyAccessToken } from "../services/auth.service";

// Extend Express Request to include user info
declare global {
    namespace Express {
        interface Request {
            user?: {
                id: number;
                email: string;
                type: string;
                scopes: string[];
            };
        }
    }
}

/**
 * Middleware that verifies the JWT access token from the Authorization header.
 * On success, populates req.user with the decoded token payload.
 */
export function authenticate(
    req: Request,
    res: Response,
    next: NextFunction
): void {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        res.status(401).json({ message: "Access token is required" });
        return;
    }

    const token = authHeader.split(" ")[1];

    try {
        const decoded = verifyAccessToken(token);
        req.user = decoded;
        next();
    } catch {
        res.status(401).json({ message: "Invalid or expired access token" });
    }
}

/**
 * Middleware factory that checks if the authenticated user has the required scopes.
 * Must be used after the authenticate middleware.
 *
 * For now, all user types receive all scopes. This function provides a hook
 * for future fine-grained access control.
 */
export function authorize(...requiredScopes: string[]) {
    return (req: Request, res: Response, next: NextFunction): void => {
        if (!req.user) {
            res.status(401).json({ message: "Authentication required" });
            return;
        }

        const userScopes = req.user.scopes || [];
        const hasAllScopes = requiredScopes.every((scope) =>
            userScopes.includes(scope)
        );

        if (!hasAllScopes) {
            res.status(403).json({
                message: "Insufficient permissions",
                required: requiredScopes,
                current: userScopes,
            });
            return;
        }

        next();
    };
}
