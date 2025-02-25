const multer = require("multer");

// Multer configuration
const upload = multer({
    storage: multer.memoryStorage(), // Keep files in memory before uploading to Cloudinary
    limits: { fileSize: 500 * 1024 * 1024 }, // 500MB limit
    fileFilter: (req, file, cb) => {
        // Allowed file types
        const allowedTypes = [
            // Image formats
            "image/jpeg", "image/png", "image/gif", "image/webp", "image/bmp", "image/tiff",

            // Video formats
            "video/mp4", "video/mpeg", "video/x-msvideo", "video/x-matroska", // AVI & MKV
            "video/webm", "video/quicktime", // WebM & MOV
            "video/x-flv", "video/3gpp", "video/3gpp2", // FLV & 3GP
            "video/x-ms-wmv", // WMV,
            "application/pdf"
        ];

        if (!allowedTypes.includes(file.mimetype)) {
            return cb(new Error("Invalid file type. Only images, videos, and PDFs are allowed."));
        }
        cb(null, true);
    }
});

module.exports = { upload };
