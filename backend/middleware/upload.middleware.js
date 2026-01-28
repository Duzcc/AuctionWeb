import multer from 'multer';

// Configure multer for memory storage (store files as Buffer)
const storage = multer.memoryStorage();

// File filter - only accept images
const fileFilter = (req, file, cb) => {
    // Allowed image types
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];

    if (allowedTypes.includes(file.mimetype)) {
        cb(null, true); // Accept file
    } else {
        cb(new Error('Invalid file type. Only JPEG, PNG, GIF, and WEBP images are allowed.'), false);
    }
};

// Create multer upload instance
const upload = multer({
    storage: storage,
    fileFilter: fileFilter,
    limits: {
        fileSize: parseInt(process.env.MAX_FILE_SIZE) || 5 * 1024 * 1024, // 5MB default
    },
});

/**
 * Middleware for single avatar upload
 */
export const uploadAvatar = upload.single('avatar');

/**
 * Middleware for multiple image uploads (for future use)
 */
export const uploadMultiple = upload.array('images', 10); // Max 10 images

/**
 * Error handler for multer errors
 */
export const handleUploadError = (err, req, res, next) => {
    if (err instanceof multer.MulterError) {
        if (err.code === 'LIMIT_FILE_SIZE') {
            return res.status(400).json({
                success: false,
                message: 'File size too large. Maximum size is 5MB.',
            });
        }
        if (err.code === 'LIMIT_FILE_COUNT') {
            return res.status(400).json({
                success: false,
                message: 'Too many files uploaded.',
            });
        }
        return res.status(400).json({
            success: false,
            message: 'File upload error',
            error: err.message,
        });
    }

    if (err) {
        return res.status(400).json({
            success: false,
            message: err.message || 'File upload failed',
        });
    }

    next();
};

export default {
    uploadAvatar,
    uploadMultiple,
    handleUploadError,
};
