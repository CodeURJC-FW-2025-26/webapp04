import multer from 'multer';
import path from 'path';
import fs from 'fs';

// Ensure uploads directory exists
//TODO actually change to 'uploads/'
const uploadsDir = './public/img/moviePosters';
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
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
//storage object for multer defines  name with preserved ending and destiation
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadsDir); // MUST specify destination
    },
    //rename file once to preserve suffix
    filename: (req, file, cb) => {
        const ext = path.extname(file.originalname);
        cb(null, `myfile_${Date.now()}${ext}`);
    }
});
//rename uploades file properly
export const renameUploadedFile = (oldFilename, title, releaseYear) => {
    const oldPath = path.join(uploadsDir, oldFilename);
    if (!fs.existsSync(oldPath)) return null;

    const ext = path.extname(oldFilename);
    const sanitizedTitle = sanitizeFilename(title);
    const newFilename = `${sanitizedTitle}_${releaseYear}${ext}`;
    const newPath = path.join(uploadsDir, newFilename);

    try {
        fs.renameSync(oldPath, newPath);
        return newFilename;
    } catch (err) {
        console.error('Error renaming file:', err);
        return oldFilename;
    }
};

const upload = multer({ storage: storage });

export const uploadPoster = upload.single('poster');