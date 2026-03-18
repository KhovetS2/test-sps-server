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
    profile_image_filename: string | null;
    profile_image_mimetype: string | null;
    profile_image_data: Buffer | null;
}

export interface UserWithoutPassword {
    id: number;
    name: string;
    email: string;
    type: string;
    created_at: string;
    updated_at: string;
    has_profile_image: boolean;
    profile_image_url: string | null;
}

function sanitizeUser(user: User): UserWithoutPassword {
    return {
        id: user.id,
        name: user.name,
        email: user.email,
        type: user.type,
        created_at: user.created_at,
        updated_at: user.updated_at,
        has_profile_image: !!user.profile_image_data,
        profile_image_url: user.profile_image_data
            ? `/users/${user.id}/profile-image`
            : null,
    };
}

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
            `
            INSERT INTO users (name, email, type, password)
            VALUES (?, ?, ?, ?)
            `
        )
        .run(data.name, data.email, data.type, hashedPassword);

    const user = db
        .prepare("SELECT * FROM users WHERE id = ?")
        .get(result.lastInsertRowid) as User;

    return sanitizeUser(user);
}

export function getUserById(id: number): UserWithoutPassword | null {
    const user = db.prepare("SELECT * FROM users WHERE id = ?").get(id) as
        | User
        | undefined;

    return user ? sanitizeUser(user) : null;
}

export function getUserByEmail(email: string): User | null {
    const user = db
        .prepare("SELECT * FROM users WHERE email = ?")
        .get(email) as User | undefined;

    return user || null;
}

export function listUsers(): UserWithoutPassword[] {
    const users = db.prepare("SELECT * FROM users").all() as User[];
    return users.map(sanitizeUser);
}

export function updateUser(
    id: number,
    data: UpdateUserInput
): UserWithoutPassword | null {
    const user = db.prepare("SELECT * FROM users WHERE id = ?").get(id) as
        | User
        | undefined;

    if (!user) return null;

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
        `
        UPDATE users
        SET name = ?, email = ?, type = ?, password = ?, updated_at = datetime('now')
        WHERE id = ?
        `
    ).run(updatedName, updatedEmail, updatedType, updatedPassword, id);

    const updated = db
        .prepare("SELECT * FROM users WHERE id = ?")
        .get(id) as User;

    return sanitizeUser(updated);
}

export function deleteUser(id: number): boolean {
    const result = db.prepare("DELETE FROM users WHERE id = ?").run(id);
    return result.changes > 0;
}

export function updateUserProfileImage(
    id: number,
    file: {
        filename: string;
        mimetype: string;
        buffer: Buffer;
    }
): UserWithoutPassword | null {
    const user = db.prepare("SELECT * FROM users WHERE id = ?").get(id) as
        | User
        | undefined;

    if (!user) return null;

    db.prepare(
        `
        UPDATE users
        SET
            profile_image_filename = ?,
            profile_image_mimetype = ?,
            profile_image_data = ?,
            updated_at = datetime('now')
        WHERE id = ?
        `
    ).run(file.filename, file.mimetype, file.buffer, id);

    const updated = db
        .prepare("SELECT * FROM users WHERE id = ?")
        .get(id) as User;

    return sanitizeUser(updated);
}

export function getUserProfileImageById(id: number): {
    filename: string | null;
    mimetype: string | null;
    data: Buffer | null;
} | null {
    const user = db
        .prepare(
            `
            SELECT profile_image_filename, profile_image_mimetype, profile_image_data
            FROM users
            WHERE id = ?
            `
        )
        .get(id) as
        | {
            profile_image_filename: string | null;
            profile_image_mimetype: string | null;
            profile_image_data: Buffer | null;
        }
        | undefined;

    if (!user) return null;

    return {
        filename: user.profile_image_filename,
        mimetype: user.profile_image_mimetype,
        data: user.profile_image_data,
    };
}

export function getUserProfileImageDataUri(id: number): string | null {
    const image = getUserProfileImageById(id);

    if (!image || !image.data || !image.mimetype) {
        return null;
    }

    return `data:${image.mimetype};base64,${image.data.toString("base64")}`;
}
