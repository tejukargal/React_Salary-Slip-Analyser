const fs = require('fs');
const pdfParse = require('pdf-parse');

async function debugPayScale() {
  try {
    const pdfPath = "C:/Users/Lekhana/Downloads/8.Pay SlipET_August 2025-1-2.pdf";
    const pdfBuffer = fs.readFileSync(pdfPath);
    const pdfData = await pdfParse(pdfBuffer);

    // Find EMP No. positions and test pay scale extraction for each
    const empSections = [];
    const empRegex = /EMP\s*No\s*[\s\n]*(\d+)/gi;
    let match;
    while ((match = empRegex.exec(pdfData.text)) !== null) {
      empSections.push({
        empNo: match[1],
        position: match.index,
        fullMatch: match[0]
      });
    }

    console.log('=== PAY SCALE EXTRACTION DEBUG ===\n');

    for (let i = 0; i < empSections.length; i++) {
      const currentSection = empSections[i];
      const nextSection = i < empSections.length - 1 ? empSections[i + 1] : null;

      const startPos = currentSection.position;
      const endPos = nextSection ? nextSection.position : pdfData.text.length;

      const prevSectionEnd = i > 0 ? empSections[i - 1].position : 0;
      const preStartPos = Math.max(prevSectionEnd, currentSection.position - 800);
      const precedingSection = pdfData.text.substring(preStartPos, currentSection.position);

      console.log(`Employee ${i + 1} (${currentSection.empNo}):`);

      // Test the current pattern
      const currentPattern = precedingSection.match(/([\d\-]+)\s*EMP\s*No/i);
      console.log('  Current pattern result:', currentPattern ? currentPattern[1] : 'No match');

      // Show context around EMP No
      const contextStart = Math.max(0, currentSection.position - 150);
      const contextEnd = Math.min(pdfData.text.length, currentSection.position + 50);
      const context = pdfData.text.substring(contextStart, contextEnd);
      console.log('  Context around EMP No:', context.replace(/\s+/g, ' '));
      console.log('');
    }

  } catch (error) {
    console.error('Error:', error);
  }
}

debugPayScale();