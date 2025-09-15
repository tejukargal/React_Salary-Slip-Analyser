import React, { useState, useRef } from 'react';
import { Employee, APIResponse } from '../types/employee';

interface MinimizedUploaderProps {
  onDataParsed: (employees: Employee[], summary: any) => void;
}

export const MinimizedUploader: React.FC<MinimizedUploaderProps> = ({ onDataParsed }) => {
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = async (file: File) => {
    if (!file) return;

    if (file.type !== 'application/pdf') {
      setError('Please select a PDF file');
      setTimeout(() => setError(''), 3000);
      return;
    }

    setIsUploading(true);
    setError('');

    const formData = new FormData();
    formData.append('pdfFile', file);

    try {
      const response = await fetch('/api/upload/pdf', {
        method: 'POST',
        body: formData,
      });

      const result: APIResponse = await response.json();

      if (!result.success) {
        setError(result.error || 'Failed to process PDF');
        setTimeout(() => setError(''), 5000);
        return;
      }

      if (result.data) {
        onDataParsed(result.data.employees, result.summary);
      }

    } catch (err) {
      setError('Network error: Failed to upload PDF');
      setTimeout(() => setError(''), 5000);
      console.error('Upload error:', err);
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileUpload(file);
    }
  };

  return (
    <div className="fixed top-4 right-4 z-50">
      <div className="flex flex-col items-end space-y-2">
        {/* Upload Button */}
        <button
          onClick={() => fileInputRef.current?.click()}
          disabled={isUploading}
          className={`
            ${isUploading 
              ? 'bg-blue-500 cursor-not-allowed' 
              : 'bg-blue-600 hover:bg-blue-700'
            } 
            text-white font-medium py-3 px-4 rounded-lg shadow-lg transition-colors flex items-center gap-2
          `}
          title="Upload new PDF"
        >
          {isUploading ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              <span className="text-sm">Processing...</span>
            </>
          ) : (
            <>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
              <span className="text-sm">Upload PDF</span>
            </>
          )}
        </button>

        {/* Error Message */}
        {error && (
          <div className="bg-red-500 text-white text-xs px-3 py-2 rounded-lg shadow-lg max-w-xs">
            {error}
          </div>
        )}
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept=".pdf,application/pdf"
        onChange={handleFileInputChange}
        className="hidden"
      />
    </div>
  );
};