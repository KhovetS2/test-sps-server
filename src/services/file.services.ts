import db from "../database/database";

export interface FileInput {
    filename: string;
    mimetype: string;
    size: number;
    buffer: Buffer;
}

export function saveFile(file: FileInput): number {
    const stmt = db.prepare(`
    INSERT INTO files (filename, mimetype, size, data)
    VALUES (?, ?, ?, ?)
  `);

    const result = stmt.run(
        file.filename,
        file.mimetype,
        file.size,
        file.buffer
    );

    return Number(result.lastInsertRowid);
}


export function getAllFiles() {
    const stmt = db.prepare(`
    SELECT id, filename, mimetype, size, created_at
    FROM files
    ORDER BY created_at DESC
  `);

    return stmt.all();
}

export function getFileById(id: number) {
    const stmt = db.prepare(`
    SELECT id, filename, mimetype, size, data, created_at
    FROM files
    WHERE id = ?
  `);

    return stmt.get(id);
}
