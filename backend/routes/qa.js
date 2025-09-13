const express = require('express');
const Document = require('../models/Document');
const { authenticateToken } = require('../middleware/auth');
const promptService = require('../services/llm/promptService');
const geminiService = require('../services/llm/geminiService');
const responseService = require('../services/response/responseService');
const validationService = require('../services/auth/validationService');

const router = express.Router();
const documentModel = new Document();

// Q&A endpoint using RAG
router.post('/ask', authenticateToken, async (req, res) => {
  try {
    const { question, documentIds, documentId } = req.body;

    // Validate question input
    const questionValidation = validationService.validateQuestion(question);
    if (!questionValidation.isValid) {
      return res.status(400).json({ error: questionValidation.errors[0] });
    }

    // Validate document IDs
    const docIds = documentIds || (documentId ? [documentId] : null);
    const docIdsValidation = validationService.validateDocumentIds(docIds);
    if (!docIdsValidation.isValid) {
      return res.status(400).json({ error: docIdsValidation.errors[0] });
    }

    // Step 1: Retrieve relevant chunks from user's documents
    const relevantChunks = documentModel.searchChunks(req.user.userId, questionValidation.cleanQuestion, docIds);

    if (relevantChunks.length === 0) {
      return res.json(responseService.formatNoResultsResponse());
    }

    // Step 2: Generate context from relevant chunks
    const context = promptService.formatContext(relevantChunks);

    // Step 3: Generate answer using AI service
    let answer;
    let confidence = 'medium';

    try {
      if (!geminiService.isAvailable()) {
        // Fallback to simple context-based response if no API key
        answer = promptService.generateFallbackResponse(context, 'AI-powered answering is not configured');
        confidence = 'low';
      } else {
        const prompt = promptService.generateQAPrompt(context, questionValidation.cleanQuestion);
        answer = await geminiService.generateContent(prompt);
        confidence = 'high';
      }
    } catch (aiError) {
      console.error('AI API error:', aiError.message);
      answer = promptService.generateFallbackResponse(context, 'AI processing failed, showing raw context instead');
      confidence = 'low';
    }

    res.json(responseService.formatQAResponse(answer, relevantChunks, confidence, questionValidation.cleanQuestion));

  } catch (error) {
    console.error('Q&A error:', error);
    res.status(500).json(responseService.formatErrorResponse('Failed to process question'));
  }
});

// Get Q&A history (for future implementation)
router.get('/history', authenticateToken, (req, res) => {
  // This would store and retrieve Q&A history
  // For now, return empty array
  res.json({ history: [] });
});

// Search chunks endpoint for testing/debugging
router.post('/search', authenticateToken, (req, res) => {
  try {
    const { query } = req.body;

    // Validate search query
    const queryValidation = validationService.validateQuestion(query);
    if (!queryValidation.isValid) {
      return res.status(400).json({ error: 'Search query is required' });
    }

    const relevantChunks = documentModel.searchChunks(req.user.userId, queryValidation.cleanQuestion);

    res.json(responseService.formatSearchResponse(queryValidation.cleanQuestion, relevantChunks));

  } catch (error) {
    console.error('Search error:', error);
    res.status(500).json(responseService.formatErrorResponse('Failed to search chunks'));
  }
});

module.exports = router;
