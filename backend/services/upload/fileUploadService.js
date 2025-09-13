const multer = require('multer');
const path = require('path');
const fs = require('fs');

class FileUploadService {
  constructor() {
    this.upload = this.configureUpload();
  }

  /**
   * Configure multer for file uploads
   * @returns {multer.Multer} - Configured multer instance
   */
  configureUpload() {
    const storage = multer.diskStorage({
      destination: (req, file, cb) => {
        const uploadDir = path.join(__dirname, '../../uploads');
        if (!fs.existsSync(uploadDir)) {
          fs.mkdirSync(uploadDir, { recursive: true });
        }
        cb(null, uploadDir);
      },
      filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
      }
    });

    const fileFilter = (req, file, cb) => {
      // Accept only text files
      if (file.mimetype === 'text/plain') {
        cb(null, true);
      } else {
        cb(new Error('Only text files (.txt) are allowed'), false);
      }
    };

    return multer({ 
      storage,
      fileFilter,
      limits: {
        fileSize: 10 * 1024 * 1024 // 10MB limit
      }
    });
  }

  /**
   * Get multer middleware for single file upload
   * @param {string} fieldName - Name of the form field (default: 'document')
   * @returns {Function} - Multer middleware
   */
  getSingleFileUpload(fieldName = 'document') {
    return this.upload.single(fieldName);
  }

  /**
   * Read uploaded file content
   * @param {string} filePath - Path to the uploaded file
   * @returns {string} - File content as text
   * @throws {Error} - If file cannot be read
   */
  readFileContent(filePath) {
    try {
      return fs.readFileSync(filePath, 'utf8');
    } catch (error) {
      throw new Error(`Failed to read file: ${error.message}`);
    }
  }

  /**
   * Validate uploaded file
   * @param {Object} file - Multer file object
   * @returns {boolean} - True if file is valid
   * @throws {Error} - If file is invalid
   */
  validateUploadedFile(file) {
    if (!file) {
      throw new Error('No file uploaded');
    }

    if (file.mimetype !== 'text/plain') {
      throw new Error('Only text files (.txt) are allowed');
    }

    return true;
  }

  /**
   * Process uploaded file
   * @param {Object} file - Multer file object
   * @returns {Object} - Processed file information
   */
  processUploadedFile(file) {
    this.validateUploadedFile(file);
    
    const content = this.readFileContent(file.path);
    
    return {
      originalName: file.originalname,
      filePath: file.path,
      content: content,
      size: file.size,
      mimetype: file.mimetype
    };
  }

  /**
   * Get upload configuration details
   * @returns {Object} - Upload configuration
   */
  getUploadConfig() {
    return {
      maxFileSize: '10MB',
      allowedTypes: ['.txt'],
      allowedMimeTypes: ['text/plain']
    };
  }
}

module.exports = new FileUploadService();
