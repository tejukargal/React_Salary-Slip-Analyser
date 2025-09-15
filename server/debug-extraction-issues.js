const fs = require('fs');
const pdfParse = require('pdf-parse');

async function debugExtractionIssues() {
  try {
    const pdfPath = "C:/Users/Lekhana/Downloads/8.Pay SlipET_August 2025-1-2.pdf";
    const pdfBuffer = fs.readFileSync(pdfPath);
    const pdfData = await pdfParse(pdfBuffer);

    console.log('=== DEBUGGING EXTRACTION ISSUES ===\n');

    // Check gross salary patterns
    console.log('1. GROSS SALARY PATTERNS:');
    const grossPatterns = [
      /Gross Salary:\s*(\d+)/gi,
      /Gross Salary:\s*Rs\.\s*(\d+)/gi,
      /Gross\s+Salary:\s*(\d+)/gi,
      /(\d+)\s*Rs\.\s*Rs\.\s*\d+/gi
    ];

    grossPatterns.forEach((pattern, i) => {
      const matches = [...pdfData.text.matchAll(pattern)];
      console.log(`Pattern ${i + 1} (${pattern}):`, matches.map(m => `₹${m[1]}`));
      pattern.lastIndex = 0;
    });

    // Check pay scale patterns
    console.log('\n2. PAY SCALE PATTERNS:');
    const payScalePatterns = [
      /([\d\-]+)\s*EMP\s*No/gi,
      /(\d{5}-\d{5,6})/gi,
      /Pay Scale\s*:\s*([\d\-]+)/gi
    ];

    payScalePatterns.forEach((pattern, i) => {
      const matches = [...pdfData.text.matchAll(pattern)];
      console.log(`Pattern ${i + 1} (${pattern}):`, matches.map(m => m[1]));
      pattern.lastIndex = 0;
    });

    // Look for gross salary values in context
    console.log('\n3. GROSS SALARY IN CONTEXT:');
    const grossMatches = [...pdfData.text.matchAll(/Gross\s+Salary[:\s]*Rs\.\s*(\d+)/gi)];
    grossMatches.forEach((match, i) => {
      const start = Math.max(0, match.index - 100);
      const end = Math.min(pdfData.text.length, match.index + 200);
      const context = pdfData.text.substring(start, end);
      console.log(`\n--- Gross ${match[1]} ---`);
      console.log('Context:', context.replace(/\s+/g, ' '));
    });

    // Look for exact gross values from PDF
    console.log('\n4. SEARCHING FOR SPECIFIC GROSS VALUES:');
    const expectedGross = ['97956', '116278', '73757', '77085'];
    expectedGross.forEach(value => {
      const found = pdfData.text.includes(value);
      console.log(`₹${value}: ${found ? 'FOUND' : 'NOT FOUND'}`);
      if (found) {
        const pos = pdfData.text.indexOf(value);
        const context = pdfData.text.substring(pos - 50, pos + 100);
        console.log(`  Context: ${context.replace(/\s+/g, ' ')}`);
      }
    });

  } catch (error) {
    console.error('Error:', error);
  }
}

debugExtractionIssues();