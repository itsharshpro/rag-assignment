const express = require('express');
const Document = require('../models/Document');
const { authenticateToken } = require('../middleware/auth');
const fileUploadService = require('../services/upload/fileUploadService');
const responseService = require('../services/response/responseService');
const validationService = require('../services/auth/validationService');

const router = express.Router();
const documentModel = new Document();

// Upload document endpoint
router.post('/upload', authenticateToken, fileUploadService.getSingleFileUpload('document'), (req, res) => {
  try {
    // Validate and process uploaded file
    const fileValidation = validationService.validateFileUpload(req.file);
    if (!fileValidation.isValid) {
      return res.status(400).json({ error: fileValidation.errors[0] });
    }

    const processedFile = fileUploadService.processUploadedFile(req.file);

    // Create document record
    const document = documentModel.create(req.user.userId, processedFile.originalName, processedFile.content);

    res.status(201).json(responseService.formatUploadResponse(document));
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json(responseService.formatErrorResponse('Failed to upload document'));
  }
});

// Get user's documents
router.get('/', authenticateToken, (req, res) => {
  try {
    const documents = documentModel.getUserDocuments(req.user.userId);
    res.json(responseService.formatDocumentsListResponse(documents));
  } catch (error) {
    console.error('Get documents error:', error);
    res.status(500).json(responseService.formatErrorResponse('Failed to get documents'));
  }
});

// Get specific document with chunks
router.get('/:documentId', authenticateToken, (req, res) => {
  try {
    const document = documentModel.getDocumentById(req.params.documentId);
    
    if (!document) {
      return res.status(404).json(responseService.formatErrorResponse('Document not found', 404));
    }

    if (document.userId !== req.user.userId) {
      return res.status(403).json(responseService.formatErrorResponse('Access denied', 403));
    }

    res.json({ document });
  } catch (error) {
    console.error('Get document error:', error);
    res.status(500).json(responseService.formatErrorResponse('Failed to get document'));
  }
});

// Get document chunks for debugging
router.get('/:documentId/chunks', authenticateToken, (req, res) => {
  try {
    const document = documentModel.getDocumentById(req.params.documentId);
    
    if (!document) {
      return res.status(404).json(responseService.formatErrorResponse('Document not found', 404));
    }

    if (document.userId !== req.user.userId) {
      return res.status(403).json(responseService.formatErrorResponse('Access denied', 403));
    }

    res.json(responseService.formatDocumentChunksResponse(document));
  } catch (error) {
    console.error('Get chunks error:', error);
    res.status(500).json(responseService.formatErrorResponse('Failed to get document chunks'));
  }
});

// Delete document
router.delete('/:documentId', authenticateToken, (req, res) => {
  try {
    documentModel.deleteDocument(req.params.documentId, req.user.userId);
    res.json(responseService.formatSuccessResponse('Document deleted successfully'));
  } catch (error) {
    console.error('Delete document error:', error);
    res.status(500).json(responseService.formatErrorResponse(error.message));
  }
});

module.exports = router;
