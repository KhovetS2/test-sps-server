import bcrypt from "bcryptjs";
import db from "./database";

export function seedDefaultAdmin(): void {
    const existingAdmin = db
        .prepare("SELECT id FROM users WHERE email = ?")
        .get("admin@spsgroup.com.br");

    if (!existingAdmin) {
        const hashedPassword = bcrypt.hashSync("1234", 10);

        db.prepare(
            "INSERT INTO users (name, email, type, password) VALUES (?, ?, ?, ?)"
        ).run("admin", "admin@spsgroup.com.br", "admin", hashedPassword);

        console.log("✅ Default admin user created (admin@spsgroup.com.br)");
    } else {
        console.log("ℹ️  Default admin user already exists.");
    }
}
