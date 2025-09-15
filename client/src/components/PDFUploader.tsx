import React, { useState, useRef } from 'react';
import { Employee } from '../types/employee';
import { ClientPdfParser } from '../utils/clientPdfParser';

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

    try {
      // Parse PDF on client side
      const pdfText = await ClientPdfParser.parsePDF(file);

      // Extract employee data from the text
      const result = extractEmployeeDataFromText(pdfText);

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
      setError('Failed to process PDF file. Please try again.');
      console.error('PDF processing error:', err);
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

// Helper function to extract employee data from PDF text
function extractEmployeeDataFromText(text: string) {
  const employees = [];

  // Simple employee extraction based on common patterns
  const employeeSections = text.split(/EMP\s*No\s*[\s\n]*(\d+)/i);

  for (let i = 1; i < employeeSections.length; i++) {
    const section = employeeSections[i];
    const empNoMatch = section.match(/(\d+)/);
    if (!empNoMatch) continue;

    const empNo = empNoMatch[1];
    const employee = extractEmployeeData(section, empNo);
    if (employee) {
      employees.push(employee);
    }
  }

  if (employees.length === 0) {
    return {
      success: false,
      error: 'No employee data found in the PDF',
      warning: undefined,
      data: undefined,
      summary: undefined
    };
  }

  const summary = {
    totalEmployees: employees.length,
    month: extractMonth(text),
    year: extractYear(text),
    department: extractDepartment(text),
    processingDate: new Date().toISOString()
  };

  return {
    success: true,
    data: {
      employees,
      ...summary
    },
    summary,
    warning: undefined
  };
}

function extractEmployeeData(section: string, empNo: string) {
  const basic = extractNumber(section, /Basic\s*[:-]?\s*([\d,]+\.?\d*)/i);
  const da = extractNumber(section, /DA\s*[:-]?\s*([\d,]+\.?\d*)/i);
  const hra = extractNumber(section, /HRA\s*[:-]?\s*([\d,]+\.?\d*)/i);
  const sfn = extractNumber(section, /SFN\s*[:-]?\s*([\d,]+\.?\d*)/i);
  const spayTypist = extractNumber(section, /SPAY-TYPIST\s*[:-]?\s*([\d,]+\.?\d*)/i);

  const it = extractNumber(section, /IT\s*[:-]?\s*([\d,]+\.?\d*)/i);
  const pt = extractNumber(section, /PT\s*[:-]?\s*([\d,]+\.?\d*)/i);
  const lic = extractNumber(section, /LIC\s*[:-]?\s*([\d,]+\.?\d*)/i);
  const gslic = extractNumber(section, /GSLIC\s*[:-]?\s*([\d,]+\.?\d*)/i);
  const fbf = extractNumber(section, /FBF\s*[:-]?\s*([\d,]+\.?\d*)/i);

  const grossSalary = basic + da + hra + sfn + spayTypist;
  const totalDeductions = it + pt + lic + gslic + fbf;
  const netSalary = grossSalary - totalDeductions;

  const employee = {
    name: extractField(section, /Name\s*[:-]?\s*([^\n]+)/i),
    empNo: empNo,
    designation: extractField(section, /Designation\s*[:-]?\s*([^\n]+)/i),
    group: extractField(section, /Group\s*[:-]?\s*([^\n]+)/i),
    payScale: extractField(section, /Pay\s*Scale\s*[:-]?\s*([^\n]+)/i),
    basic,
    daysWorked: 30, // Default value
    allowances: {
      da,
      hra,
      sfn,
      spayTypist
    },
    deductions: {
      it,
      pt,
      lic,
      gslic,
      fbf
    },
    grossSalary,
    netSalary,
    accountNumber: extractField(section, /A\/c\s*No\s*[:-]?\s*([^\n]+)/i),
    bankName: extractField(section, /Bank\s*[:-]?\s*([^\n]+)/i),
    branchName: extractField(section, /Branch\s*[:-]?\s*([^\n]+)/i),
    totalLocalRecoveries: 0,
    sumOfDeductionsAndRecoveries: totalDeductions
  };

  return employee;
}

function extractField(text: string, regex: RegExp): string {
  const match = text.match(regex);
  return match ? match[1].trim() : '';
}

function extractNumber(text: string, regex: RegExp): number {
  const match = text.match(regex);
  return match ? parseFloat(match[1].replace(/,/g, '')) : 0;
}

function extractMonth(text: string): string {
  const months = ['January', 'February', 'March', 'April', 'May', 'June',
                  'July', 'August', 'September', 'October', 'November', 'December'];

  for (const month of months) {
    if (text.toLowerCase().includes(month.toLowerCase())) {
      return month;
    }
  }
  return '';
}

function extractYear(text: string): string {
  const yearMatch = text.match(/\b(20\d{2})\b/);
  return yearMatch ? yearMatch[1] : '';
}

function extractDepartment(text: string): string {
  const deptMatch = text.match(/Department\s*[:-]?\s*([^\n]+)/i);
  return deptMatch ? deptMatch[1].trim() : '';
}