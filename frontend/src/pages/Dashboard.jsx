import React, { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import DocumentUpload from '../components/DocumentUpload';
import QuestionAnswer from '../components/QuestionAnswer';
import DocumentChunks from '../components/DocumentChunks';

const Dashboard = () => {
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState('upload');
  const [refreshDocuments, setRefreshDocuments] = useState(0);
  const [selectedDocumentForQA, setSelectedDocumentForQA] = useState(null);

  const tabs = [
    { id: 'upload', label: 'Upload Documents' },
    { id: 'qa', label: 'Ask Questions' },
    { id: 'debug', label: 'Debug Chunks' },
  ];

  const handleDocumentUploaded = () => {
    setRefreshDocuments(prev => prev + 1);
    // Stay on upload tab since documents are now shown there
  };

  const handleAskQuestion = (documentId) => {
    setSelectedDocumentForQA(documentId);
    setActiveTab('qa');
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'upload':
        return <DocumentUpload onUploadSuccess={handleDocumentUploaded} onAskQuestion={handleAskQuestion} key={refreshDocuments} />;
      case 'qa':
        return <QuestionAnswer selectedDocumentId={selectedDocumentForQA} />;
      case 'debug':
        return <DocumentChunks />;
      default:
        return <DocumentUpload onUploadSuccess={handleDocumentUploaded} onAskQuestion={handleAskQuestion} key={refreshDocuments} />;
    }
  };

  return (
    <div className="h-screen bg-white flex flex-col overflow-hidden">
      {/* Header */}
      <nav className="flex-shrink-0 bg-white border-b border-black">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-semibold text-black">
                RAG
              </h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-black">
                Welcome, {user?.username}
              </span>
              <button
                onClick={logout}
                className="bg-black hover:bg-gray-800 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>

      <div className="flex-1 max-w-7xl mx-auto w-full flex flex-col overflow-hidden sm:px-6 lg:px-8">
        <div className="flex-1 flex flex-col px-4 py-6 sm:px-0 overflow-hidden">
          {/* Tab Navigation */}
          <div className="flex-shrink-0 border-b border-black mb-6">
            <nav className="-mb-px flex space-x-8">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`${
                    activeTab === tab.id
                      ? 'border-black text-black font-semibold'
                      : 'border-transparent text-gray-600 hover:text-black hover:border-gray-300'
                  } whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm transition-colors`}
                >
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>

          {/* Tab Content */}
          <div className="flex-1 bg-white border border-black rounded-lg shadow-sm overflow-hidden">
            {renderContent()}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
