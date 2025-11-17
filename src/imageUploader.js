import multer from 'multer';
import path from 'path';
import fs from 'fs';

// BASE UPLOAD FOLDERS
const UPLOADS_BASE = 'uploads/';
const POSTER_FOLDER = path.join(UPLOADS_BASE, 'posters/');
const PERSON_FOLDER = path.join(UPLOADS_BASE, 'persons/');

// Ensure directories exist
[UPLOADS_BASE, POSTER_FOLDER, PERSON_FOLDER].forEach(dir => {
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
});

// Normalize the final stored filename path
export const getImagePath = (filename) => {
    return filename ? `${filename}` : null;
};

// Sanitize title/actor names for filenames
const sanitizeFilename = (text) => {
    return text
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');
};

// Multer storage factory
const createStorage = (folder) =>
    multer.diskStorage({
        destination: (req, file, cb) => cb(null, folder),
        filename: (req, file, cb) => {
            const ext = path.extname(file.originalname);
            cb(null, `tmp_${Date.now()}${ext}`);
        }
    });

// Upload handlers
export const uploadPoster = multer({ storage: createStorage(POSTER_FOLDER) }).single('poster');
export const uploadPortrait = multer({ storage: createStorage(PERSON_FOLDER) }).single('portrait');

// Rename uploaded files consistently
export const renameUploadedFile = (folder, oldFilename, label, year = null, existingFile = null) => {
    const oldPath = path.join(folder, oldFilename);
    if (!fs.existsSync(oldPath)) return null;

    const ext = path.extname(oldFilename);
    const sanitized = sanitizeFilename(label);
    const suffix = year ? `_${year}` : '';
    const newFilename = `${sanitized}${suffix}${ext}`;
    const newPath = path.join(folder, newFilename);

    try {
        fs.renameSync(oldPath, newPath);

        // Delete previously existing file
        if (existingFile && existingFile !== newFilename) {
            const existingPath = path.join(folder, existingFile);
            if (fs.existsSync(existingPath)) fs.unlinkSync(existingPath);
        }

        return newFilename;
    } catch (err) {
        console.error('File rename error:', err);
        return oldFilename;
    }
};
