import { Handler } from '@netlify/functions';
import pdfParse from 'pdf-parse';
import fs from 'fs';
import path from 'path';

export const handler: Handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method not allowed' }),
    };
  }

  try {
    if (!event.headers['content-type']?.includes('multipart/form-data')) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Content-Type must be multipart/form-data' }),
      };
    }

    const contentType = event.headers['content-type'] || '';
    const boundary = contentType.split('boundary=')[1];

    if (!boundary) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Boundary not found in content-type' }),
      };
    }

    // Parse multipart form data manually
    const fileData = parseMultipartFormData(event.body, boundary);

    if (!fileData) {
      return {
        statusCode: 400,
        body: JSON.stringify({ success: false, error: 'No PDF file uploaded' }),
      };
    }

    if (!fileData.filename?.endsWith('.pdf')) {
      return {
        statusCode: 400,
        body: JSON.stringify({ success: false, error: 'Only PDF files are allowed' }),
      };
    }

    // Check file size (Netlify functions have a 6MB limit for request body)
    if (fileData.size && fileData.size > 6 * 1024 * 1024) {
      return {
        statusCode: 400,
        body: JSON.stringify({ success: false, error: 'File size exceeds 6MB limit' }),
      };
    }

    // Create a temporary file path
    const tempDir = path.join('/tmp', 'uploads');
    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir, { recursive: true });
    }

    const tempFilePath = path.join(tempDir, `upload-${Date.now()}.pdf`);
    fs.writeFileSync(tempFilePath, fileData.content);

    console.log('Processing PDF file at:', tempFilePath);

    // Parse the PDF using pdf-parse
    const pdfData = await pdfParse(fs.readFileSync(tempFilePath));
    const employees = extractEmployeesFromPDF(pdfData.text);

    if (employees.length === 0) {
      return {
        statusCode: 400,
        body: JSON.stringify({
          success: false,
          error: 'No employee data found in the PDF'
        }),
      };
    }

    const result = {
      success: true,
      data: {
        employees,
        totalEmployees: employees.length,
        month: extractMonth(pdfData.text),
        year: extractYear(pdfData.text),
        department: extractDepartment(pdfData.text),
        processingDate: new Date().toISOString()
      }
    };

    // Clean up the temporary file
    fs.unlinkSync(tempFilePath);

    if (!result.success) {
      return {
        statusCode: 400,
        body: JSON.stringify(result),
      };
    }

    // Return parsed data with summary
    return {
      statusCode: 200,
      body: JSON.stringify({
        success: true,
        data: result.data,
        warning: result.warning,
        summary: {
          totalEmployees: result.data?.totalEmployees || 0,
          month: result.data?.month,
          year: result.data?.year,
          department: result.data?.department,
          processingDate: result.data?.processingDate
        }
      }),
    };

  } catch (error) {
    console.error('Error processing PDF:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({
        success: false,
        error: 'Internal server error while processing PDF'
      }),
    };
  }
};

// Helper function to parse multipart form data
function parseMultipartFormData(body: string, boundary: string) {
  try {
    // Split the body by the boundary
    const parts = body.split(`--${boundary}`);

    // Remove empty parts and the closing boundary
    const validParts = parts.filter(part =>
      part.trim() !== '' &&
      part.trim() !== '--' &&
      part.includes('filename=') &&
      part.includes('application/pdf')
    );

    if (validParts.length === 0) {
      return null;
    }

    // Extract the first file part
    const filePart = validParts[0];

    // Extract filename from Content-Disposition header
    const filenameMatch = filePart.match(/filename="([^"]+)"/);
    const filename = filenameMatch ? filenameMatch[1] : 'unknown.pdf';

    // Extract the content (everything after the headers)
    const contentMatch = filePart.match(/\r\n\r\n(.*)/s);
    const content = contentMatch ? contentMatch[1] : '';

    // Convert base64 to buffer if needed
    const buffer = Buffer.from(content, 'base64');

    return {
      filename,
      size: buffer.length,
      content: buffer
    };
  } catch (error) {
    console.error('Error parsing multipart form data:', error);
    return null;
  }
}

// Helper functions for data extraction
function extractEmployeesFromPDF(text: string) {
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

  return employees;
}

function extractEmployeeData(section: string, empNo: string) {
  const employee = {
    empNo: empNo,
    name: extractField(section, /Name\s*[:\-]?\s*([^\n]+)/i),
    designation: extractField(section, /Designation\s*[:\-]?\s*([^\n]+)/i),
    group: extractField(section, /Group\s*[:\-]?\s*([^\n]+)/i),
    bankDetails: {
      accountNo: extractField(section, /A\/c\s*No\s*[:\-]?\s*([^\n]+)/i),
      bankName: extractField(section, /Bank\s*[:\-]?\s*([^\n]+)/i),
      branch: extractField(section, /Branch\s*[:\-]?\s*([^\n]+)/i)
    },
    salary: {
      basic: extractNumber(section, /Basic\s*[:\-]?\s*([\d,]+\.?\d*)/i),
      da: extractNumber(section, /DA\s*[:\-]?\s*([\d,]+\.?\d*)/i),
      hra: extractNumber(section, /HRA\s*[:\-]?\s*([\d,]+\.?\d*)/i),
      sfn: extractNumber(section, /SFN\s*[:\-]?\s*([\d,]+\.?\d*)/i),
      spayTypist: extractNumber(section, /SPAY-TYPIST\s*[:\-]?\s*([\d,]+\.?\d*)/i),
      gross: 0,
      deductions: {
        it: extractNumber(section, /IT\s*[:\-]?\s*([\d,]+\.?\d*)/i),
        pt: extractNumber(section, /PT\s*[:\-]?\s*([\d,]+\.?\d*)/i),
        lic: extractNumber(section, /LIC\s*[:\-]?\s*([\d,]+\.?\d*)/i),
        gslic: extractNumber(section, /GSLIC\s*[:\-]?\s*([\d,]+\.?\d*)/i),
        fbf: extractNumber(section, /FBF\s*[:\-]?\s*([\d,]+\.?\d*)/i),
        totalDeductions: 0
      },
      net: 0
    }
  };

  // Calculate totals
  employee.salary.gross = employee.salary.basic + employee.salary.da + employee.salary.hra +
                          employee.salary.sfn + employee.salary.spayTypist;

  employee.salary.deductions.totalDeductions = employee.salary.deductions.it + employee.salary.deductions.pt +
                                                 employee.salary.deductions.lic + employee.salary.deductions.gslic +
                                                 employee.salary.deductions.fbf;

  employee.salary.net = employee.salary.gross - employee.salary.deductions.totalDeductions;

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