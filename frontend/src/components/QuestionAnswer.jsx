import React, { useState, useEffect, useRef } from 'react';
import { qaService, documentService } from '../services/api';

const QuestionAnswer = ({ selectedDocumentId = null }) => {
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [documents, setDocuments] = useState([]);
  const [selectedDocuments, setSelectedDocuments] = useState([]);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    fetchDocuments();
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  useEffect(() => {
    if (selectedDocumentId) {
      // If coming from document list, select only that document
      setSelectedDocuments([selectedDocumentId]);
    } else {
      // By default, select all documents
      setSelectedDocuments(documents.map(doc => doc.id));
    }
  }, [selectedDocumentId, documents]);

  const fetchDocuments = async () => {
    try {
      const result = await documentService.getDocuments();
      setDocuments(result.documents);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to fetch documents');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!question.trim()) {
      setError('Please enter a question');
      return;
    }

    setLoading(true);
    setError('');
    setAnswer(null);

    try {
      // Pass array of document IDs if any are selected, otherwise undefined for all
      const docIds = selectedDocuments.length > 0 ? selectedDocuments : undefined;
      const result = await qaService.askQuestion(question.trim(), docIds);
      setAnswer(result);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to get answer');
    } finally {
      setLoading(false);
    }
  };

  const getConfidenceColor = (confidence) => {
    switch (confidence) {
      case 'high':
        return 'bg-white border border-green-600 text-green-600';
      case 'medium':
        return 'bg-white border border-yellow-600 text-yellow-600';
      case 'low':
        return 'bg-white border border-red-600 text-red-600';
      default:
        return 'bg-gray-100 border border-black text-black';
    }
  };

  return (
    <div className="h-[calc(100vh-240px)] flex flex-col lg:flex-row gap-6 p-6">
      {/* Question Input Section - Left Column */}
      <div className="lg:w-1/2 flex flex-col">
        <h2 className="text-lg font-medium text-black mb-4">Ask Questions</h2>
        
        <form onSubmit={handleSubmit} className="flex flex-col flex-1">
          {/* Document Selection */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-black mb-2">
              Select Documents
            </label>
            <div className="relative" ref={dropdownRef}>
              <button
                type="button"
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="w-full px-3 py-2 border border-black rounded-md shadow-sm focus:outline-none focus:ring-black focus:border-black text-left bg-white flex justify-between items-center"
              >
                <span className="text-sm">
                  {selectedDocuments.length === 0
                    ? 'No documents selected'
                    : selectedDocuments.length === documents.length
                    ? 'All documents'
                    : `${selectedDocuments.length} document${selectedDocuments.length > 1 ? 's' : ''} selected`}
                </span>
                <svg
                  className={`h-4 w-4 text-black transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`}
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              
              {isDropdownOpen && (
                <div className="absolute z-10 w-full mt-1 bg-white border border-black rounded-md shadow-lg max-h-60 overflow-y-auto">
                  <div className="p-2">
                    <label className="flex items-center px-2 py-1 hover:bg-gray-50 cursor-pointer rounded">
                      <input
                        type="checkbox"
                        checked={selectedDocuments.length === documents.length}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedDocuments(documents.map(doc => doc.id));
                          } else {
                            setSelectedDocuments([]);
                          }
                        }}
                        className="mr-2 h-4 w-4 text-black border-black rounded focus:ring-black"
                      />
                      <span className="text-sm font-medium">Select All</span>
                    </label>
                  </div>
                  <div className="border-t border-gray-200">
                    {documents.map((doc) => (
                      <label key={doc.id} className="flex items-center px-4 py-2 hover:bg-gray-50 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={selectedDocuments.includes(doc.id)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedDocuments([...selectedDocuments, doc.id]);
                            } else {
                              setSelectedDocuments(selectedDocuments.filter(id => id !== doc.id));
                            }
                          }}
                          className="mr-3 h-4 w-4 text-black border-black rounded focus:ring-black"
                        />
                        <div className="flex-1">
                          <div className="text-sm font-medium text-black">{doc.filename}</div>
                          <div className="text-xs text-gray-600">{doc.chunksCount} chunks</div>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="flex-1 mb-4">
            <label htmlFor="question" className="block text-sm font-medium text-black mb-2">
              Your Question
            </label>
            <textarea
              id="question"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder="Ask a question about your uploaded documents..."
              className="w-full h-full px-3 py-2 border border-black rounded-md shadow-sm focus:outline-none focus:ring-black focus:border-black resize-none"
            />
          </div>

          {error && (
            <div className="bg-white border border-red-600 text-red-600 px-4 py-3 rounded mb-4">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-black hover:bg-gray-800 focus:outline-none disabled:text-white transition-colors"
          >
            {loading ? 'Searching...' : 'Ask Question'}
          </button>
        </form>
      </div>

      {/* Answer and Sources Section - Right Column */}
      <div className="lg:w-1/2 flex flex-col border-l border-gray-300 lg:pl-6">
        <h2 className="text-lg font-medium text-black mb-4">Answer & Sources</h2>
        
        <div className="flex-1 overflow-hidden">
          {!answer ? (
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
                  d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <p className="text-sm">Ask a question to see the answer and relevant sources here</p>
            </div>
          ) : (
            <div className="h-full overflow-y-auto space-y-4">
              {/* Answer Section */}
              <div className="bg-white border border-black rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-md font-medium text-black">Answer</h3>
                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getConfidenceColor(answer.confidence)}`}>
                    {answer.confidence} confidence
                  </span>
                </div>
                <div className="prose prose-sm max-w-none">
                  <p className="text-black whitespace-pre-wrap text-sm">{answer.answer}</p>
                </div>
              </div>

              {/* Relevant Chunks Section */}
              {answer.relevantChunks && answer.relevantChunks.length > 0 && (
                <div className="bg-white border border-black rounded-lg p-4">
                  <h3 className="text-md font-medium text-black mb-3">
                    Relevant Sources ({answer.relevantChunks.length})
                  </h3>
                  <div className="space-y-3">
                    {answer.relevantChunks.map((chunk) => (
                      <div key={chunk.id} className="bg-white p-3 rounded-md border border-black">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-xs font-medium text-black">
                            {chunk.filename}
                          </span>
                          <span className="text-xs text-gray-600">
                            Score: {chunk.score}
                          </span>
                        </div>
                        <p className="text-xs text-black leading-relaxed">
                          {chunk.content}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default QuestionAnswer;
