const fs = require('fs');
const pdfParse = require('pdf-parse');

async function debugPreciseSections() {
  try {
    const pdfPath = "C:/Users/Lekhana/Downloads/8.Pay SlipET_August 2025-1-2.pdf";
    const pdfBuffer = fs.readFileSync(pdfPath);
    const pdfData = await pdfParse(pdfBuffer);

    // Find employee names and their positions
    const nameMatches = [...pdfData.text.matchAll(/Sri \/ Smt:\s*([A-Z\s]+)/gi)];
    console.log('Employee Names Found:');
    nameMatches.forEach((match, i) => {
      console.log(`${i + 1}. ${match[1].trim()} at position ${match.index}`);
    });

    // Find allowance sections and their positions
    console.log('\n=== ALLOWANCE SECTIONS ===');

    // Look for DA values and their context
    const daMatches = [...pdfData.text.matchAll(/DA\s+(\d+)/gi)];
    console.log('\nDA matches:');
    daMatches.forEach((match, i) => {
      const start = Math.max(0, match.index - 200);
      const end = Math.min(pdfData.text.length, match.index + 400);
      const context = pdfData.text.substring(start, end);
      console.log(`\n--- DA ${match[1]} (position ${match.index}) ---`);
      console.log('Context:', context.replace(/\s+/g, ' '));
    });

    // Look specifically for P allowances and their immediate context
    console.log('\n=== P ALLOWANCES ===');
    const pMatches = [...pdfData.text.matchAll(/P\s+(\d+)/gi)];
    pMatches.forEach((match, i) => {
      const start = Math.max(0, match.index - 300);
      const end = Math.min(pdfData.text.length, match.index + 100);
      const context = pdfData.text.substring(start, end);
      console.log(`\n--- P ${match[1]} (position ${match.index}) ---`);
      console.log('Before P:', context.substring(0, 300).replace(/\s+/g, ' '));
      console.log('After P:', context.substring(300).replace(/\s+/g, ' '));
    });

  } catch (error) {
    console.error('Error:', error);
  }
}

debugPreciseSections();