import React, { useState, useRef } from 'react';
import { Employee } from '../types/employee';
import { ClientPdfParser } from '../utils/clientPdfParser';

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

    try {
      // Parse PDF on client side
      const pdfText = await ClientPdfParser.parsePDF(file);

      // Extract employee data from the text (reusing function from PDFUploader)
      const result = extractEmployeeDataFromText(pdfText);

      if (!result.success) {
        setError(result.error || 'Failed to process PDF');
        setTimeout(() => setError(''), 5000);
        return;
      }

      if (result.data) {
        onDataParsed(result.data.employees, result.summary);
      }

    } catch (err) {
      setError('Failed to process PDF file');
      setTimeout(() => setError(''), 5000);
      console.error('PDF processing error:', err);
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

// Copy helper functions from PDFUploader
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
  const basic = extractNumber(section, /Basic\s*[:\-]?\s*([\d,]+\.?\d*)/i);
  const da = extractNumber(section, /DA\s*[:\-]?\s*([\d,]+\.?\d*)/i);
  const hra = extractNumber(section, /HRA\s*[:\-]?\s*([\d,]+\.?\d*)/i);
  const sfn = extractNumber(section, /SFN\s*[:\-]?\s*([\d,]+\.?\d*)/i);
  const spayTypist = extractNumber(section, /SPAY-TYPIST\s*[:\-]?\s*([\d,]+\.?\d*)/i);

  const it = extractNumber(section, /IT\s*[:\-]?\s*([\d,]+\.?\d*)/i);
  const pt = extractNumber(section, /PT\s*[:\-]?\s*([\d,]+\.?\d*)/i);
  const lic = extractNumber(section, /LIC\s*[:\-]?\s*([\d,]+\.?\d*)/i);
  const gslic = extractNumber(section, /GSLIC\s*[:\-]?\s*([\d,]+\.?\d*)/i);
  const fbf = extractNumber(section, /FBF\s*[:\-]?\s*([\d,]+\.?\d*)/i);

  const grossSalary = basic + da + hra + sfn + spayTypist;
  const totalDeductions = it + pt + lic + gslic + fbf;
  const netSalary = grossSalary - totalDeductions;

  const employee = {
    name: extractField(section, /Name\s*[:\-]?\s*([^\n]+)/i),
    empNo: empNo,
    designation: extractField(section, /Designation\s*[:\-]?\s*([^\n]+)/i),
    group: extractField(section, /Group\s*[:\-]?\s*([^\n]+)/i),
    payScale: extractField(section, /Pay\s*Scale\s*[:\-]?\s*([^\n]+)/i),
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
    accountNumber: extractField(section, /A\/c\s*No\s*[:\-]?\s*([^\n]+)/i),
    bankName: extractField(section, /Bank\s*[:\-]?\s*([^\n]+)/i),
    branchName: extractField(section, /Branch\s*[:\-]?\s*([^\n]+)/i),
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
  const deptMatch = text.match(/Department\s*[:\-]?\s*([^\n]+)/i);
  return deptMatch ? deptMatch[1].trim() : '';
}