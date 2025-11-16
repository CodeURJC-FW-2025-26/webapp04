import multer from 'multer';
import path from 'path';
import fs from 'fs';

// Ensure uploads directory exists
const UPLOADS_FOLDER = 'uploads/';
const PERSONS_FOLDER = 'img/persons/';

// Create directories if they don't exist
if (!fs.existsSync(UPLOADS_FOLDER)) {
    fs.mkdirSync(UPLOADS_FOLDER, { recursive: true });
}
if (!fs.existsSync(PERSONS_FOLDER)) {
    fs.mkdirSync(PERSONS_FOLDER, { recursive: true });
}

export const getImagePath = (filename) => {
    return filename ? `${filename}` : null;
};

// Helper function to sanitize filename
const sanitizeFilename = (text) => {
    return text
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');
};

// Storage for movie posters
const posterStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, UPLOADS_FOLDER);
    },
    filename: (req, file, cb) => {
        const ext = path.extname(file.originalname);
        cb(null, `myfile_${Date.now()}${ext}`);
    }
});

// Storage for actor portraits
const portraitStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, PERSONS_FOLDER);
    },
    filename: (req, file, cb) => {
        const ext = path.extname(file.originalname);
        cb(null, `myfile_${Date.now()}${ext}`);
    }
});

// Multer instances
export const uploadPoster = multer({ storage: posterStorage }).single('poster');
export const uploadPortrait = multer({ storage: portraitStorage }).single('portrait');

// Rename uploaded file properly
export const renameUploadedFile = (oldFilename, title, releaseYear, existingFilename = null, destFolder = UPLOADS_FOLDER) => {
    const oldPath = path.join(destFolder, oldFilename);
    if (!fs.existsSync(oldPath)) return null;

    const ext = path.extname(oldFilename);
    const sanitizedTitle = sanitizeFilename(title);
    const suffix = releaseYear ? `_${releaseYear}` : ''; 
    const newFilename = `${sanitizedTitle}${suffix}${ext}`;
    const newPath = path.join(destFolder, newFilename);

    try {
        fs.renameSync(oldPath, newPath);
        if (existingFilename && existingFilename !== newFilename) {
            const existingPath = path.join(destFolder, existingFilename);
            if (fs.existsSync(existingPath)) {
                fs.unlinkSync(existingPath);
            }
        }

        return newFilename;
    } catch (err) {
        console.error('Error renaming file:', err);
        return oldFilename;
    }
};