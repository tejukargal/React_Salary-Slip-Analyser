import { Handler } from '@netlify/functions';
import { FixedFieldsPDFParser } from '../../server/src/services/fixedFieldsPdfParser';
import fs from 'fs';
import path from 'path';

const pdfParser = new FixedFieldsPDFParser();

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

    // Parse the PDF
    const result = await pdfParser.parsePDF(tempFilePath);

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