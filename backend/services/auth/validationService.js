class ValidationService {
  /**
   * Validate user registration data
   * @param {Object} userData - User registration data
   * @returns {Object} - Validation result
   */
  validateRegistration(userData) {
    const { username, email, password } = userData;
    const errors = [];

    if (!username) {
      errors.push('Username is required');
    } else if (username.length < 3) {
      errors.push('Username must be at least 3 characters long');
    } else if (!/^[a-zA-Z0-9_]+$/.test(username)) {
      errors.push('Username can only contain letters, numbers, and underscores');
    }

    if (!email) {
      errors.push('Email is required');
    } else if (!this.isValidEmail(email)) {
      errors.push('Please provide a valid email address');
    }

    if (!password) {
      errors.push('Password is required');
    } else if (password.length < 6) {
      errors.push('Password must be at least 6 characters long');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Validate user login data
   * @param {Object} loginData - User login data
   * @returns {Object} - Validation result
   */
  validateLogin(loginData) {
    const { email, password } = loginData;
    const errors = [];

    if (!email) {
      errors.push('Email is required');
    } else if (!this.isValidEmail(email)) {
      errors.push('Please provide a valid email address');
    }

    if (!password) {
      errors.push('Password is required');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Validate email format
   * @param {string} email - Email to validate
   * @returns {boolean} - True if email is valid
   */
  isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  /**
   * Validate question/query input
   * @param {string} question - Question to validate
   * @returns {Object} - Validation result
   */
  validateQuestion(question) {
    const errors = [];

    if (!question) {
      errors.push('Question is required');
    } else if (typeof question !== 'string') {
      errors.push('Question must be a string');
    } else if (question.trim().length === 0) {
      errors.push('Question cannot be empty');
    } else if (question.length > 1000) {
      errors.push('Question is too long (maximum 1000 characters)');
    }

    return {
      isValid: errors.length === 0,
      errors,
      cleanQuestion: question ? question.trim() : ''
    };
  }

  /**
   * Validate document IDs
   * @param {Array|string} documentIds - Document IDs to validate
   * @returns {Object} - Validation result
   */
  validateDocumentIds(documentIds) {
    const errors = [];

    if (documentIds !== null && documentIds !== undefined) {
      if (Array.isArray(documentIds)) {
        if (documentIds.length === 0) {
          errors.push('Document IDs array cannot be empty');
        } else if (documentIds.some(id => typeof id !== 'string' || id.trim().length === 0)) {
          errors.push('All document IDs must be non-empty strings');
        }
      } else if (typeof documentIds === 'string') {
        if (documentIds.trim().length === 0) {
          errors.push('Document ID cannot be empty');
        }
      } else {
        errors.push('Document IDs must be a string or array of strings');
      }
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Sanitize input string
   * @param {string} input - Input to sanitize
   * @returns {string} - Sanitized input
   */
  sanitizeInput(input) {
    if (typeof input !== 'string') {
      return '';
    }
    
    return input.trim().replace(/\s+/g, ' ');
  }

  /**
   * Validate file upload requirements
   * @param {Object} file - File object to validate
   * @returns {Object} - Validation result
   */
  validateFileUpload(file) {
    const errors = [];

    if (!file) {
      errors.push('No file provided');
      return { isValid: false, errors };
    }

    if (file.mimetype !== 'text/plain') {
      errors.push('Only text files (.txt) are allowed');
    }

    if (file.size > 10 * 1024 * 1024) { // 10MB
      errors.push('File size must be less than 10MB');
    }

    if (!file.originalname || file.originalname.trim().length === 0) {
      errors.push('File must have a valid name');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }
}

module.exports = new ValidationService();
