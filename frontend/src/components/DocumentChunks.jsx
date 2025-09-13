import React, { useState, useEffect } from 'react';
import { documentService, qaService } from '../services/api';

const DocumentChunks = () => {
  const [documents, setDocuments] = useState([]);
  const [selectedDocument, setSelectedDocument] = useState('');
  const [chunks, setChunks] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('chunks'); // 'chunks' or 'search'

  useEffect(() => {
    fetchDocuments();
  }, []);

  const fetchDocuments = async () => {
    try {
      const result = await documentService.getDocuments();
      setDocuments(result.documents);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to fetch documents');
    }
  };

  const handleDocumentSelect = async (documentId) => {
    if (!documentId) {
      setChunks([]);
      setSelectedDocument('');
      return;
    }

    setLoading(true);
    setError('');
    try {
      const result = await documentService.getDocumentChunks(documentId);
      setChunks(result.chunks);
      setSelectedDocument(documentId);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to fetch document chunks');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) {
      setError('Please enter a search query');
      return;
    }

    setLoading(true);
    setError('');
    try {
      const result = await qaService.searchChunks(searchQuery.trim());
      setSearchResults(result.chunks);
      setActiveTab('search'); // Automatically switch to search results tab
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to search chunks');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-[calc(100vh-240px)] flex flex-col lg:flex-row gap-6 p-6">
      {/* Controls Section - Left Column */}
      <div className="lg:w-1/2 flex flex-col">
        <h2 className="text-lg font-medium text-black mb-4">Debug Document Chunks</h2>
        
        {error && (
          <div className="bg-white border border-red-600 text-red-600 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        <div className="flex flex-col flex-1 space-y-6">
          {/* Document Selection */}
          <div className="space-y-4">
            <div>
              <label htmlFor="document-select" className="block text-sm font-medium text-black mb-2">
                Select Document
              </label>
              <select
                id="document-select"
                value={selectedDocument}
                onChange={(e) => handleDocumentSelect(e.target.value)}
                className="w-full px-3 py-2 border border-black rounded-md shadow-sm focus:outline-none focus:ring-black focus:border-black"
              >
                <option value="">Choose a document...</option>
                {documents.map((doc) => (
                  <option key={doc.id} value={doc.id}>
                    {doc.filename} ({doc.chunksCount} chunks)
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Search Functionality */}
          <div className="space-y-4">
            <form onSubmit={handleSearch} className="space-y-4">
              <div>
                <label htmlFor="search-query" className="block text-sm font-medium text-black mb-2">
                  Search All Chunks
                </label>
                <div className="relative">
                  <input
                    id="search-query"
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Enter keywords to search..."
                    className="w-full px-3 py-2 pr-12 border border-black rounded-md shadow-sm focus:outline-none focus:ring-black focus:border-black"
                  />
                  <button
                    type="submit"
                    disabled={loading}
                    className="absolute right-1 top-1 bottom-1 px-3 bg-black hover:bg-gray-800 disabled:opacity-50 rounded-md transition-colors"
                  >
                    {loading ? (
                      <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
                    ) : (
                      <svg
                        className="h-4 w-4 text-white"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                        />
                      </svg>
                    )}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>

      {/* Results Section - Right Column */}
      <div className="lg:w-1/2 flex flex-col border-l border-gray-300 lg:pl-6">
        {/* Tab Navigation */}
        <div className="flex space-x-4 border-b border-gray-300 mb-4">
          <button
            type="button"
            onClick={() => setActiveTab('chunks')}
            className={`pb-2 px-1 text-sm font-medium border-b-2 transition-colors ${
              activeTab === 'chunks'
                ? 'border-black text-black'
                : 'border-transparent text-gray-600 hover:text-black'
            }`}
          >
            All Chunks
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('search')}
            className={`pb-2 px-1 text-sm font-medium border-b-2 transition-colors ${
              activeTab === 'search'
                ? 'border-black text-black'
                : 'border-transparent text-gray-600 hover:text-black'
            }`}
          >
            Search Results
            {searchResults.length > 0 && (
              <span className="ml-1 bg-blue-100 text-blue-800 text-xs px-2 py-0.5 rounded-full">
                {searchResults.length}
              </span>
            )}
          </button>
        </div>
        
        <div className="flex-1 overflow-hidden">
          {activeTab === 'chunks' ? (
            // All Chunks Tab
            chunks.length === 0 ? (
              <div className="h-full flex flex-col justify-center items-center text-gray-500">
                <svg
                  className="h-12 w-12 text-gray-400 mb-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
                <p className="text-sm">Select a document to view its chunks here</p>
              </div>
            ) : (
              <div className="h-full overflow-hidden bg-white border border-black rounded-lg flex flex-col">
                <div className="flex-shrink-0 p-4 border-b border-gray-200">
                  <h3 className="text-md font-medium text-black">
                    Document Chunks ({chunks.length})
                  </h3>
                </div>
                <div className="flex-1 overflow-y-auto p-4">
                  <div className="space-y-3">
                    {chunks.map((chunk, index) => (
                      <div key={chunk.id} className="bg-white p-3 rounded border border-black">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-xs font-medium text-black">
                            Chunk #{index + 1}
                          </span>
                          <span className="text-xs text-gray-600">
                            ID: {chunk.id.substring(0, 8)}...
                          </span>
                        </div>
                        <p className="text-xs text-black leading-relaxed">{chunk.content}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )
          ) : (
            // Search Results Tab
            searchResults.length === 0 ? (
              <div className="h-full flex flex-col justify-center items-center text-gray-500">
                <svg
                  className="h-12 w-12 text-gray-400 mb-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
                <p className="text-sm">Perform a search to view results here</p>
              </div>
            ) : (
              <div className="h-full overflow-hidden bg-white border border-black rounded-lg flex flex-col">
                <div className="flex-shrink-0 p-4 border-b border-gray-200">
                  <h3 className="text-md font-medium text-black">
                    Search Results ({searchResults.length})
                  </h3>
                </div>
                <div className="flex-1 overflow-y-auto p-4">
                  <div className="space-y-3">
                    {searchResults.map((chunk) => (
                      <div key={`search-${chunk.id}`} className="bg-white p-3 rounded border border-black">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-xs font-medium text-black">{chunk.filename}</span>
                          <span className="text-xs text-gray-600">Score: {chunk.score}</span>
                        </div>
                        <p className="text-xs text-black leading-relaxed">{chunk.content}</p>
                        <div className="mt-2 text-xs text-gray-600 flex flex-wrap gap-2">
                          <span>Doc ID: {chunk.documentId.substring(0, 8)}...</span>
                          <span>Chunk ID: {chunk.id.substring(0, 8)}...</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )
          )}
        </div>
      </div>
    </div>
  );
};

export default DocumentChunks;
