import { z } from "zod";

export const createUserSchema = z.object({
    name: z.string(),
    email: z.email(),
    type: z.string(),
    password: z.string(),
});

export const UserSchema = z.object({
    name: z.string(),
    email: z.email(),
    type: z.string(),
});

export const updateUserSchema = z.object({
    name: z.string().optional(),
    email: z.email().optional(),
    type: z.string().optional(),
    password: z.string().optional(),
});

export const loginSchema = z.object({
    email: z.email(),
    password: z.string(),
});

export const refreshTokenSchema = z.object({
    refresh_token: z.string(),
});

export type CreateUserInput = z.infer<typeof createUserSchema>;
export type UpdateUserInput = z.infer<typeof updateUserSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
