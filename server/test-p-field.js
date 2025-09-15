const fs = require('fs');
const pdfParse = require('pdf-parse');
const { FixedFieldsPDFParser } = require('./dist/services/fixedFieldsPdfParser');

async function testPExtraction() {
  try {
    const pdfPath = "C:/Users/Lekhana/Downloads/8.Pay SlipET_August 2025-1-2.pdf";

    // Read PDF text
    const pdfBuffer = fs.readFileSync(pdfPath);
    const pdfData = await pdfParse(pdfBuffer);

    console.log('=== FULL PDF TEXT ===');
    console.log(pdfData.text);
    console.log('\n=== SEARCHING FOR P FIELD ===');

    // Test different patterns for P field
    const patterns = [
      /P\s+(\d+)/gi,
      /P\s*(\d+)/gi,
      /\bP\s+(\d+)/gi,
      /\nP\s+(\d+)/gi,
      /P\s+(\d+)/g,
      /P[\s\n]+(\d+)/gi
    ];

    patterns.forEach((pattern, index) => {
      const matches = [...pdfData.text.matchAll(pattern)];
      console.log(`Pattern ${index + 1} (${pattern}):`, matches.map(m => `P ${m[1]}`));
      pattern.lastIndex = 0; // Reset regex
    });

    // Also test the parser
    console.log('\n=== TESTING PARSER ===');
    const parser = new FixedFieldsPDFParser();
    const result = await parser.parsePDF(pdfPath);

    if (result.success) {
      console.log('Parsed employees:', result.data.employees.length);
      result.data.employees.forEach((emp, index) => {
        console.log(`Employee ${index + 1}: ${emp.name}`);
        console.log('  Allowances:', emp.allowances);
      });
    } else {
      console.log('Parser error:', result.error);
    }

  } catch (error) {
    console.error('Error:', error);
  }
}

testPExtraction();