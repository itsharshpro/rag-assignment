const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const chunkingService = require('../services/rag/chunkingService');
const searchService = require('../services/rag/searchService');

const DOCUMENTS_FILE = path.join(__dirname, '../data/documents.json');

class Document {
  constructor() {
    this.ensureDataFile();
  }

  ensureDataFile() {
    const dataDir = path.dirname(DOCUMENTS_FILE);
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }
    if (!fs.existsSync(DOCUMENTS_FILE)) {
      fs.writeFileSync(DOCUMENTS_FILE, JSON.stringify([]));
    }
  }

  getDocuments() {
    try {
      const data = fs.readFileSync(DOCUMENTS_FILE, 'utf8');
      return JSON.parse(data);
    } catch (error) {
      return [];
    }
  }

  saveDocuments(documents) {
    fs.writeFileSync(DOCUMENTS_FILE, JSON.stringify(documents, null, 2));
  }

  create(userId, filename, content) {
    const documents = this.getDocuments();
    
    // Use chunking service to process content
    const chunks = chunkingService.processContent(content);

    const newDocument = {
      id: uuidv4(),
      userId,
      filename,
      content,
      chunks,
      createdAt: new Date().toISOString()
    };

    documents.push(newDocument);
    this.saveDocuments(documents);
    return newDocument;
  }


  getUserDocuments(userId) {
    const documents = this.getDocuments();
    return documents.filter(doc => doc.userId === userId);
  }

  getDocumentById(documentId) {
    const documents = this.getDocuments();
    return documents.find(doc => doc.id === documentId);
  }

  searchChunks(userId, query, documentIds = null) {
    const userDocuments = this.getUserDocuments(userId);
    return searchService.searchDocuments(userDocuments, query, documentIds);
  }

  deleteDocument(documentId, userId) {
    const documents = this.getDocuments();
    const documentIndex = documents.findIndex(doc => doc.id === documentId && doc.userId === userId);
    
    if (documentIndex === -1) {
      throw new Error('Document not found or access denied');
    }

    documents.splice(documentIndex, 1);
    this.saveDocuments(documents);
    return true;
  }
}

module.exports = Document;
