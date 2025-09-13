class ResponseService {
  /**
   * Format Q&A response
   * @param {string} answer - The generated answer
   * @param {Array} relevantChunks - Array of relevant document chunks
   * @param {string} confidence - Confidence level ('high', 'medium', 'low')
   * @param {string} question - Original question
   * @returns {Object} - Formatted response object
   */
  formatQAResponse(answer, relevantChunks, confidence = 'medium', question = '') {
    return {
      answer,
      relevantChunks: this.formatChunksForResponse(relevantChunks),
      confidence,
      question
    };
  }

  /**
   * Format chunks for response (remove sensitive data)
   * @param {Array} chunks - Array of document chunks
   * @returns {Array} - Formatted chunks for response
   */
  formatChunksForResponse(chunks) {
    return chunks.map(chunk => ({
      id: chunk.id,
      content: chunk.content,
      filename: chunk.filename,
      score: chunk.score
    }));
  }

  /**
   * Format search response
   * @param {string} query - Search query
   * @param {Array} chunks - Array of search result chunks
   * @returns {Object} - Formatted search response
   */
  formatSearchResponse(query, chunks) {
    return {
      query,
      chunks: chunks.map(chunk => ({
        id: chunk.id,
        content: chunk.content,
        filename: chunk.filename,
        documentId: chunk.documentId,
        score: chunk.score
      })),
      totalFound: chunks.length
    };
  }

  /**
   * Format document upload response
   * @param {Object} document - Document object
   * @returns {Object} - Formatted upload response
   */
  formatUploadResponse(document) {
    return {
      message: 'Document uploaded successfully',
      document: {
        id: document.id,
        filename: document.filename,
        chunksCount: document.chunks.length,
        createdAt: document.createdAt
      }
    };
  }

  /**
   * Format documents list response
   * @param {Array} documents - Array of document objects
   * @returns {Object} - Formatted documents list
   */
  formatDocumentsListResponse(documents) {
    const documentsWithoutContent = documents.map(doc => ({
      id: doc.id,
      filename: doc.filename,
      chunksCount: doc.chunks.length,
      createdAt: doc.createdAt
    }));

    return { documents: documentsWithoutContent };
  }

  /**
   * Format document chunks response
   * @param {Object} document - Document object
   * @returns {Object} - Formatted chunks response
   */
  formatDocumentChunksResponse(document) {
    return { 
      chunks: document.chunks,
      documentInfo: {
        id: document.id,
        filename: document.filename,
        createdAt: document.createdAt
      }
    };
  }

  /**
   * Format authentication response
   * @param {string} message - Response message
   * @param {Object} user - User object
   * @param {string} token - JWT token
   * @returns {Object} - Formatted auth response
   */
  formatAuthResponse(message, user, token) {
    return {
      message,
      user,
      token
    };
  }

  /**
   * Format error response
   * @param {string} error - Error message
   * @param {number} statusCode - HTTP status code (default: 500)
   * @returns {Object} - Formatted error response
   */
  formatErrorResponse(error, statusCode = 500) {
    return {
      error,
      statusCode,
      timestamp: new Date().toISOString()
    };
  }

  /**
   * Format no results found response for Q&A
   * @returns {Object} - No results response
   */
  formatNoResultsResponse() {
    return {
      answer: "I couldn't find any relevant information in your uploaded documents to answer this question.",
      relevantChunks: [],
      confidence: 'low'
    };
  }

  /**
   * Format success response
   * @param {string} message - Success message
   * @param {Object} data - Optional data to include
   * @returns {Object} - Formatted success response
   */
  formatSuccessResponse(message, data = null) {
    const response = { message };
    if (data) {
      response.data = data;
    }
    return response;
  }

  /**
   * Format user profile response
   * @param {Object} user - User object
   * @returns {Object} - Formatted profile response
   */
  formatProfileResponse(user) {
    return { user };
  }
}

module.exports = new ResponseService();
