import React, { useState } from 'react';
import { documentService } from '../services/api';
import DocumentList from './DocumentList';

const DocumentUpload = ({ onUploadSuccess, onAskQuestion }) => {
  const [file, setFile] = useState(null);
  const [plainText, setPlainText] = useState('');
  const [uploadMode, setUploadMode] = useState('file'); // 'file' or 'text'
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleFileChange = (e) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      // Validate file type - check both MIME type and extension
      const isTextFile = selectedFile.type === 'text/plain' || 
                        selectedFile.type === '' || // Some systems don't set MIME type
                        selectedFile.name.toLowerCase().endsWith('.txt');
      
      if (isTextFile) {
        setFile(selectedFile);
        setError('');
        console.log('File selected:', selectedFile.name, 'Type:', selectedFile.type);
      } else {
        setError('Please select a text (.txt) file');
        setFile(null);
      }
    }
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    
    if (uploadMode === 'file' && !file) {
      setError('Please select a file');
      return;
    }
    
    if (uploadMode === 'text' && !plainText.trim()) {
      setError('Please enter some text');
      return;
    }

    setUploading(true);
    setError('');
    setMessage('');

    try {
      let result;
      if (uploadMode === 'file') {
        result = await documentService.upload(file);
      } else {
        // Create a blob from the plain text and upload it
        const blob = new Blob([plainText], { type: 'text/plain' });
        const textFile = new File([blob], 'pasted-text.txt', { type: 'text/plain' });
        result = await documentService.upload(textFile);
      }
      
      setMessage(`Document uploaded successfully! Created ${result.document.chunksCount} chunks.`);
      setFile(null);
      setPlainText('');
      
      // Reset file input
      const fileInput = document.getElementById('file-upload');
      if (fileInput) fileInput.value = '';
      
      if (onUploadSuccess) {
        onUploadSuccess();
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="h-[calc(100vh-240px)] flex flex-col lg:flex-row gap-6 p-6">
      {/* Upload Section - Left Column */}
      <div className="lg:w-1/2 flex flex-col">
        <h2 className="text-lg font-medium text-black mb-4">Upload Document</h2>
        
        {/* Mode Switcher */}
        <div className="mb-6">
          <div className="flex space-x-4 border-b border-gray-300">
            <button
              type="button"
              onClick={() => setUploadMode('file')}
              className={`pb-2 px-1 text-sm font-medium border-b-2 transition-colors ${
                uploadMode === 'file'
                  ? 'border-black text-black'
                  : 'border-transparent text-gray-600 hover:text-black'
              }`}
            >
              Upload File
            </button>
            <button
              type="button"
              onClick={() => setUploadMode('text')}
              className={`pb-2 px-1 text-sm font-medium border-b-2 transition-colors ${
                uploadMode === 'text'
                  ? 'border-black text-black'
                  : 'border-transparent text-gray-600 hover:text-black'
              }`}
            >
              Paste Text
            </button>
          </div>
        </div>
        
        <form onSubmit={handleUpload} className="flex flex-col flex-1">
          <div className="flex-1 mb-6">
            {uploadMode === 'file' ? (
              /* File Upload Area */
              <div className="border-2 border-dashed border-black rounded-lg p-6 h-full flex flex-col justify-center">
                <div className="text-center">
                  <svg
                    className="mx-auto h-12 w-12 text-black"
                    stroke="currentColor"
                    fill="none"
                    viewBox="0 0 48 48"
                  >
                    <path
                      d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                      strokeWidth={2}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                  <div className="mt-4">
                    <label htmlFor="file-upload" className="cursor-pointer">
                      <span className="mt-2 block text-sm font-medium text-black">
                        Upload a document
                      </span>
                      <input
                        id="file-upload"
                        name="file-upload"
                        type="file"
                        className="sr-only"
                        accept=".txt,text/plain"
                        onChange={handleFileChange}
                      />
                      <span className="mt-1 block text-sm text-gray-600">
                        Text files (.txt) up to 10MB
                      </span>
                    </label>
                  </div>
                </div>
              </div>
            ) : (
              /* Text Input Area */
              <div className="border-2 border-dashed border-black rounded-lg p-4 h-full flex flex-col">
                <label htmlFor="plain-text" className="block text-sm font-medium text-black mb-3">
                  Paste your text content
                </label>
                <textarea
                  id="plain-text"
                  name="plain-text"
                  className="flex-1 w-full px-3 py-2 border border-black rounded-md focus:outline-none focus:ring-1 focus:ring-black focus:border-black resize-none"
                  placeholder="Paste your text content here..."
                  value={plainText}
                  onChange={(e) => setPlainText(e.target.value)}
                />
              </div>
            )}
          </div>

          {uploadMode === 'file' && file && (
            <div className="bg-gray-50 border border-black p-4 rounded-md mb-4">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <svg
                    className="h-5 w-5 text-black"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                <div className="ml-4 flex-1">
                  <p className="text-sm font-medium text-black">{file.name}</p>
                  <p className="text-sm text-gray-600">
                    {(file.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                </div>
              </div>
            </div>
          )}

          {error && (
            <div className="bg-white border border-red-600 text-red-600 px-4 py-3 rounded mb-4">
              {error}
            </div>
          )}

          {message && (
            <div className="bg-white border border-green-600 text-green-600 px-4 py-3 rounded mb-4">
              {message}
            </div>
          )}

          <button
            type="submit"
            disabled={(uploadMode === 'file' && !file) || (uploadMode === 'text' && !plainText.trim()) || uploading}
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-black hover:bg-gray-800 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            onClick={() => console.log('Button clicked - Mode:', uploadMode, 'File:', file, 'Text:', plainText, 'Uploading:', uploading)}
          >
            {uploading ? 'Processing...' : uploadMode === 'file' ? 'Upload Document' : 'Process Text'}
          </button>
        </form>
      </div>

      {/* Documents List Section - Right Column */}
      <div className="lg:w-1/2 flex flex-col border-l border-gray-300 lg:pl-6">
        <DocumentList onAskQuestion={onAskQuestion} />
      </div>
    </div>
  );
};

export default DocumentUpload;
