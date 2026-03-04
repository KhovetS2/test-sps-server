import { Request, Response, NextFunction } from "express";
import { z } from "zod";

export function validate(schema: z.ZodType<any>) {
    return (req: Request, res: Response, next: NextFunction): void => {
        const result = schema.safeParse(req.body);

        if (!result.success) {
            res.status(400).json({
                message: "Validation error",
                errors: result.error.issues,
            });
            return;
        }

        req.body = result.data;
        next();
    };
}
