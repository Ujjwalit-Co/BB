import multer from "multer";
import path from "path";

// File type validation
const FILE_TYPE_MAP = {
  // Images
  'image/png': 'png',
  'image/jpeg': 'jpg',
  'image/jpg': 'jpg',
  'image/gif': 'gif',
  'image/webp': 'webp',
  
  // Documents
  'application/pdf': 'pdf',
  'application/msword': 'doc',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'docx',
  
  // Code files
  'text/plain': 'txt',
  'text/html': 'html',
  'text/css': 'css',
  'text/javascript': 'js',
  'application/json': 'json',
  'application/x-python-code': 'py',
  'text/x-python': 'py',
};

// Maximum file sizes (in bytes)
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB for general files
const MAX_IMAGE_SIZE = 5 * 1024 * 1024; // 5MB for images
const MAX_CODE_SIZE = 1 * 1024 * 1024; // 1MB for code files

// Allowed MIME types
const ALLOWED_MIME_TYPES = [
  // Images
  'image/png',
  'image/jpeg',
  'image/jpg',
  'image/gif',
  'image/webp',
  
  // Documents
  'application/pdf',
  
  // Code & Text
  'text/plain',
  'text/html',
  'text/css',
  'text/javascript',
  'application/json',
  'application/x-javascript',
  'text/x-python',
  'application/x-python-code',
  'application/javascript',
  'text/x-script.python',
];

// File filter function
const fileFilter = (req, file, cb) => {
  // Check MIME type
  if (!ALLOWED_MIME_TYPES.includes(file.mimetype)) {
    return cb(new Error(`File type ${file.mimetype} is not allowed. Allowed types: images, PDFs, and code files.`), false);
  }
  
  // Additional extension validation
  const ext = path.extname(file.originalname).toLowerCase();
  const allowedExtensions = ['.png', '.jpg', '.jpeg', '.gif', '.webp', '.pdf', '.txt', '.js', '.py', '.html', '.css', '.json', '.md', '.ts', '.tsx', '.jsx'];
  
  if (!allowedExtensions.includes(ext)) {
    return cb(new Error(`File extension ${ext} is not allowed.`), false);
  }
  
  cb(null, true);
};

// Multer configuration
export const upload = multer({
  storage: multer.memoryStorage(), // Store in memory for Cloudinary upload
  limits: {
    fileSize: MAX_FILE_SIZE,
    files: 10, // Maximum 10 files per upload
  },
  fileFilter,
});

// Middleware to validate file size
export const validateFileSize = (maxSize = MAX_FILE_SIZE) => {
  return (req, res, next) => {
    if (!req.files || req.files.length === 0) {
      return next();
    }
    
    const oversizedFiles = req.files.filter(file => file.size > maxSize);
    if (oversizedFiles.length > 0) {
      return res.status(400).json({
        error: `File size exceeds limit. Maximum allowed size is ${maxSize / 1024 / 1024}MB`,
        files: oversizedFiles.map(f => f.originalname),
      });
    }
    
    next();
  };
};

// Middleware to validate file count
export const validateFileCount = (maxCount = 10) => {
  return (req, res, next) => {
    if (!req.files || req.files.length === 0) {
      return next();
    }
    
    if (req.files.length > maxCount) {
      return res.status(400).json({
        error: `Too many files. Maximum allowed is ${maxCount} files.`,
      });
    }
    
    next();
  };
};

// Error handler for multer errors
export const handleMulterError = (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        error: 'File size too large',
        message: `Maximum file size is ${MAX_FILE_SIZE / 1024 / 1024}MB`,
      });
    }
    
    if (err.code === 'LIMIT_FILE_COUNT') {
      return res.status(400).json({
        error: 'Too many files',
        message: `Maximum file count is ${maxCount}`,
      });
    }
    
    return res.status(400).json({
      error: 'Upload error',
      message: err.message,
    });
  }
  
  if (err) {
    return res.status(400).json({
      error: 'File upload failed',
      message: err.message,
    });
  }
  
  next();
};

export default {
  upload,
  validateFileSize,
  validateFileCount,
  handleMulterError,
  FILE_TYPE_MAP,
  MAX_FILE_SIZE,
  MAX_IMAGE_SIZE,
  MAX_CODE_SIZE,
  ALLOWED_MIME_TYPES,
};
