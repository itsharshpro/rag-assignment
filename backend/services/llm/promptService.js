class PromptService {
  /**
   * Generate a RAG prompt for question answering
   * @param {string} context - The document context
   * @param {string} question - The user's question
   * @returns {string} - The formatted prompt
   */
  generateQAPrompt(context, question) {
    return `You are a helpful assistant that answers questions based on provided document context. Always be accurate and cite your sources when possible.

Context from user's documents:
${context}

Question: ${question}

Please provide a comprehensive answer based on the context provided. If the context doesn't contain enough information to answer the question, say so clearly. Keep your response focused and cite which document sections you're referencing.`;
  }

  /**
   * Generate context string from relevant chunks
   * @param {Array} relevantChunks - Array of document chunks
   * @returns {string} - Formatted context string
   */
  formatContext(relevantChunks) {
    return relevantChunks
      .map((chunk, index) => `[${index + 1}] From "${chunk.filename}": ${chunk.content}`)
      .join('\n\n');
  }

  /**
   * Generate fallback response when AI is not available
   * @param {string} context - The document context
   * @param {string} reason - Reason for fallback (no API key, error, etc.)
   * @returns {string} - Fallback response
   */
  generateFallbackResponse(context, reason = 'AI-powered answering is not configured') {
    return `Based on your documents, here are the most relevant excerpts:

${context}

Please note: ${reason}. ${reason.includes('API') ? 'Set your GEMINI_API_KEY to enable intelligent responses.' : ''}`;
  }
}

module.exports = new PromptService();
