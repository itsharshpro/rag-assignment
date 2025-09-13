class ChunkingService {
  /**
   * Split content into chunks based on sentences
   * @param {string} content - The text content to chunk
   * @param {number} chunkSize - Maximum size of each chunk (default: 500)
   * @returns {Array<string>} - Array of text chunks
   */
  splitIntoChunks(content, chunkSize = 500) {
    const sentences = content.split(/[.!?]+/).filter(s => s.trim().length > 0);
    const chunks = [];
    let currentChunk = '';

    for (const sentence of sentences) {
      if (currentChunk.length + sentence.length > chunkSize && currentChunk.length > 0) {
        chunks.push(currentChunk.trim());
        currentChunk = sentence;
      } else {
        currentChunk += (currentChunk ? '. ' : '') + sentence;
      }
    }

    if (currentChunk.trim()) {
      chunks.push(currentChunk.trim());
    }

    return chunks.length > 0 ? chunks : [content];
  }

  /**
   * Create chunk objects with metadata
   * @param {Array<string>} chunks - Array of text chunks
   * @returns {Array<Object>} - Array of chunk objects with IDs and timestamps
   */
  createChunkObjects(chunks) {
    const { v4: uuidv4 } = require('uuid');
    
    return chunks.map(chunk => ({
      id: uuidv4(),
      content: chunk.trim(),
      createdAt: new Date().toISOString()
    }));
  }

  /**
   * Process content into chunks with metadata
   * @param {string} content - The text content to process
   * @param {number} chunkSize - Maximum size of each chunk
   * @returns {Array<Object>} - Array of processed chunk objects
   */
  processContent(content, chunkSize = 500) {
    const chunks = this.splitIntoChunks(content, chunkSize);
    return this.createChunkObjects(chunks);
  }
}

module.exports = new ChunkingService();
