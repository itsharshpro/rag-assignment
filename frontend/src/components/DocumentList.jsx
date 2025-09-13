import React, { useState, useEffect } from 'react';
import { documentService } from '../services/api';

const DocumentList = ({ onAskQuestion }) => {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchDocuments();
  }, []);

  const fetchDocuments = async () => {
    try {
      const result = await documentService.getDocuments();
      setDocuments(result.documents);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to fetch documents');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (documentId) => {
    if (window.confirm('Are you sure you want to delete this document?')) {
      try {
        await documentService.deleteDocument(documentId);
        setDocuments(documents.filter(doc => doc.id !== documentId));
      } catch (err) {
        setError(err.response?.data?.error || 'Failed to delete document');
      }
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="flex justify-center items-center h-32">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-black"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex-shrink-0 pb-4">
        <h2 className="text-lg font-medium text-black mb-4">My Documents</h2>
        
        {error && (
          <div className="bg-white border border-red-600 text-red-600 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}
      </div>

      <div className="flex-1 overflow-hidden">
        {documents.length === 0 ? (
          <div className="text-center py-8 h-full flex flex-col justify-center">
            <svg
              className="mx-auto h-10 w-10 text-black"
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
            <h3 className="mt-2 text-sm font-medium text-black">No documents</h3>
            <p className="text-xs text-gray-500 mt-1">Upload a document to get started</p>
          </div>
        ) : (
          <div className="overflow-hidden border border-black rounded-lg h-full flex flex-col">
            <div className="flex-shrink-0">
              <table className="min-w-full">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-black uppercase tracking-wider">
                      Document
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-black uppercase tracking-wider">
                      Chunks
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-black uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
              </table>
            </div>
            <div className="flex-1 overflow-y-auto">
              <table className="min-w-full">
                <tbody className="bg-white divide-y divide-gray-200">
                  {documents.map((document) => (
                    <tr key={document.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-8 w-8">
                            <div className="h-8 w-8 rounded-full bg-gray-100 border border-black flex items-center justify-center">
                              <svg
                                className="h-4 w-4 text-black"
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
                            </div>
                          </div>
                          <div className="ml-3 min-w-0 flex-1">
                            <div className="text-sm font-medium text-black truncate" title={document.filename}>
                              {document.filename}
                            </div>
                            <div className="text-xs text-gray-600">
                              {formatDate(document.createdAt)}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-black border border-black">
                          {document.chunksCount}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex flex-col space-y-1">
                          <button
                            onClick={() => onAskQuestion && onAskQuestion(document.id)}
                            className="text-xs text-blue-600 hover:text-blue-800 transition-colors text-left"
                          >
                            Ask Questions
                          </button>
                          <button
                            onClick={() => handleDelete(document.id)}
                            className="text-xs text-red-600 hover:text-red-800 transition-colors text-left"
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DocumentList;
