import React, { useState, useRef } from 'react';
import { Employee, APIResponse } from '../types/employee';

interface PDFUploaderProps {
  onDataParsed: (employees: Employee[], summary: any) => void;
}

export const PDFUploader: React.FC<PDFUploaderProps> = ({ onDataParsed }) => {
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string>('');
  const [warning, setWarning] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = async (file: File) => {
    if (!file) return;

    if (file.type !== 'application/pdf') {
      setError('Please select a PDF file');
      return;
    }

    setIsUploading(true);
    setError('');
    setWarning('');

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
        return;
      }

      if (result.warning) {
        setWarning(result.warning);
      }

      if (result.data) {
        onDataParsed(result.data.employees, result.summary);
      }

    } catch (err) {
      setError('Network error: Failed to upload and process PDF');
      console.error('Upload error:', err);
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const files = Array.from(e.dataTransfer.files);
    const pdfFile = files.find(file => file.type === 'application/pdf');
    
    if (pdfFile) {
      handleFileUpload(pdfFile);
    } else {
      setError('Please drop a PDF file');
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileUpload(file);
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">
          Employee Salary PDF Parser
        </h1>
        <p className="text-gray-600">
          Upload a PDF file containing employee salary slips to extract and analyze the data
        </p>
      </div>

      <div
        className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
          isUploading
            ? 'border-blue-300 bg-blue-50'
            : 'border-gray-300 hover:border-gray-400 hover:bg-gray-50'
        }`}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
      >
        {isUploading ? (
          <div className="flex flex-col items-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
            <p className="text-blue-600 font-medium">Processing PDF...</p>
            <p className="text-sm text-gray-500 mt-2">
              Extracting employee salary data
            </p>
          </div>
        ) : (
          <div>
            <svg
              className="mx-auto h-12 w-12 text-gray-400 mb-4"
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
            <p className="text-lg font-medium text-gray-700 mb-2">
              Drop your PDF file here
            </p>
            <p className="text-sm text-gray-500 mb-4">
              or click to browse files
            </p>
            <button
              onClick={() => fileInputRef.current?.click()}
              className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
            >
              Select PDF File
            </button>
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

      {error && (
        <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-700 font-medium">Error:</p>
          <p className="text-red-600">{error}</p>
        </div>
      )}

      {warning && (
        <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <p className="text-yellow-700 font-medium">Warning:</p>
          <p className="text-yellow-600">{warning}</p>
        </div>
      )}

      <div className="mt-6 text-sm text-gray-500">
        <p className="font-medium mb-2">Expected PDF format:</p>
        <ul className="list-disc list-inside space-y-1">
          <li>Employee pay slips with Name, Employee Number, Designation</li>
          <li>Allowances: DA, HRA, SFN, SPAY-TYPIST</li>
          <li>Deductions: IT, PT, LIC, GSLIC, FBF</li>
          <li>Financial data: Basic, Gross Salary, Net Salary</li>
          <li>Bank details: Account Number, Bank Name, Branch</li>
        </ul>
      </div>
    </div>
  );
};