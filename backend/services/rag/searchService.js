class SearchService {
  /**
   * Search and rank chunks based on query relevance
   * @param {Array} allChunks - Array of all available chunks
   * @param {string} query - Search query
   * @param {number} maxResults - Maximum number of results to return (default: 5)
   * @returns {Array} - Array of ranked chunks with scores
   */
  searchAndRankChunks(allChunks, query, maxResults = 5) {
    // Simple keyword-based search
    const queryWords = query.toLowerCase().split(/\s+/).filter(word => word.length > 2);
    
    const scoredChunks = allChunks.map(chunk => {
      const chunkText = chunk.content.toLowerCase();
      let score = 0;

      queryWords.forEach(word => {
        const wordCount = (chunkText.match(new RegExp(word, 'g')) || []).length;
        score += wordCount;
      });

      return { ...chunk, score };
    });

    // Return chunks sorted by relevance score
    return scoredChunks
      .filter(chunk => chunk.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, maxResults);
  }

  /**
   * Prepare chunks from documents for searching
   * @param {Array} documents - Array of document objects
   * @returns {Array} - Flattened array of chunks with document metadata
   */
  prepareChunksForSearch(documents) {
    const allChunks = [];

    documents.forEach(doc => {
      doc.chunks.forEach(chunk => {
        allChunks.push({
          ...chunk,
          documentId: doc.id,
          filename: doc.filename
        });
      });
    });

    return allChunks;
  }

  /**
   * Filter documents by IDs if specified
   * @param {Array} documents - Array of document objects
   * @param {Array|string|null} documentIds - Document IDs to filter by
   * @returns {Array} - Filtered array of documents
   */
  filterDocumentsByIds(documents, documentIds) {
    if (!documentIds) {
      return documents;
    }

    const ids = Array.isArray(documentIds) ? documentIds : [documentIds];
    return documents.filter(doc => ids.includes(doc.id));
  }

  /**
   * Complete search pipeline
   * @param {Array} userDocuments - User's documents
   * @param {string} query - Search query
   * @param {Array|string|null} documentIds - Optional document IDs to filter by
   * @param {number} maxResults - Maximum results to return
   * @returns {Array} - Ranked and filtered search results
   */
  searchDocuments(userDocuments, query, documentIds = null, maxResults = 5) {
    // Filter documents if specific IDs are provided
    const filteredDocuments = this.filterDocumentsByIds(userDocuments, documentIds);
    
    // Prepare chunks for searching
    const allChunks = this.prepareChunksForSearch(filteredDocuments);
    
    // Search and rank chunks
    return this.searchAndRankChunks(allChunks, query, maxResults);
  }
}

module.exports = new SearchService();
