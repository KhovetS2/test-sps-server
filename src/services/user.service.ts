import bcrypt from "bcryptjs";
import db from "../database/database";
import { CreateUserInput, UpdateUserInput } from "../schemas/user";

export interface User {
    id: number;
    name: string;
    email: string;
    type: string;
    password: string;
    created_at: string;
    updated_at: string;
}

export type UserWithoutPassword = Omit<User, "password">;

/**
 * Strip password from user object before returning.
 */
function sanitizeUser(user: User): UserWithoutPassword {
    const { password, ...rest } = user;
    return rest;
}

/**
 * Creates a new user with hashed password.
 */
export function createUser(data: CreateUserInput): UserWithoutPassword {
    const existing = db
        .prepare("SELECT id FROM users WHERE email = ?")
        .get(data.email);

    if (existing) {
        throw new Error("Email already in use");
    }

    const hashedPassword = bcrypt.hashSync(data.password, 10);

    const result = db
        .prepare(
            "INSERT INTO users (name, email, type, password) VALUES (?, ?, ?, ?)"
        )
        .run(data.name, data.email, data.type, hashedPassword);

    const user = db
        .prepare("SELECT * FROM users WHERE id = ?")
        .get(result.lastInsertRowid) as User;

    return sanitizeUser(user);
}

/**
 * Returns a user by id (without password).
 */
export function getUserById(id: number): UserWithoutPassword | null {
    const user = db.prepare("SELECT * FROM users WHERE id = ?").get(id) as
        | User
        | undefined;
    return user ? sanitizeUser(user) : null;
}

/**
 * Returns a user by email (with password, for auth purposes).
 */
export function getUserByEmail(email: string): User | null {
    const user = db
        .prepare("SELECT * FROM users WHERE email = ?")
        .get(email) as User | undefined;
    return user || null;
}

/**
 * Returns all users (without passwords).
 */
export function listUsers(): UserWithoutPassword[] {
    const users = db.prepare("SELECT * FROM users").all() as User[];
    return users.map(sanitizeUser);
}

/**
 * Updates a user. Hashes password if provided.
 */
export function updateUser(
    id: number,
    data: UpdateUserInput
): UserWithoutPassword | null {
    const user = db.prepare("SELECT * FROM users WHERE id = ?").get(id) as
        | User
        | undefined;

    if (!user) return null;

    // Check email uniqueness if email is being changed
    if (data.email && data.email !== user.email) {
        const existing = db
            .prepare("SELECT id FROM users WHERE email = ? AND id != ?")
            .get(data.email, id);
        if (existing) {
            throw new Error("Email already in use");
        }
    }

    const updatedName = data.name ?? user.name;
    const updatedEmail = data.email ?? user.email;
    const updatedType = data.type ?? user.type;
    const updatedPassword = data.password
        ? bcrypt.hashSync(data.password, 10)
        : user.password;

    db.prepare(
        "UPDATE users SET name = ?, email = ?, type = ?, password = ?, updated_at = datetime('now') WHERE id = ?"
    ).run(updatedName, updatedEmail, updatedType, updatedPassword, id);

    const updated = db
        .prepare("SELECT * FROM users WHERE id = ?")
        .get(id) as User;

    return sanitizeUser(updated);
}

/**
 * Deletes a user by id.
 */
export function deleteUser(id: number): boolean {
    const result = db.prepare("DELETE FROM users WHERE id = ?").run(id);
    return result.changes > 0;
}
