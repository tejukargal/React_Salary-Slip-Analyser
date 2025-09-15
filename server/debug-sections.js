const fs = require('fs');
const pdfParse = require('pdf-parse');

async function debugSections() {
  try {
    const pdfPath = "C:/Users/Lekhana/Downloads/8.Pay SlipET_August 2025-1-2.pdf";
    const pdfBuffer = fs.readFileSync(pdfPath);
    const pdfData = await pdfParse(pdfBuffer);

    // Find EMP No. positions
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

    console.log(`Found ${empSections.length} EMP No. sections:`);
    empSections.forEach((section, i) => {
      console.log(`${i + 1}. EMP No: ${section.empNo} at position ${section.position}`);
    });

    // Debug each section
    for (let i = 0; i < empSections.length; i++) {
      const currentSection = empSections[i];
      const nextSection = i < empSections.length - 1 ? empSections[i + 1] : null;

      const startPos = currentSection.position;
      const endPos = nextSection ? nextSection.position : pdfData.text.length;
      const employeeSection = pdfData.text.substring(startPos, endPos);

      const prevSectionEnd = i > 0 ? empSections[i - 1].position : 0;
      const preStartPos = Math.max(prevSectionEnd, currentSection.position - 800);
      const precedingSection = pdfData.text.substring(preStartPos, currentSection.position);

      console.log(`\n=== Employee ${i + 1} (${currentSection.empNo}) ===`);
      console.log('Preceding section (800 chars before EMP No):');
      console.log(precedingSection.slice(-200)); // Last 200 chars
      console.log('\nEmployee section (EMP No to next EMP No):');
      console.log(employeeSection.slice(0, 300)); // First 300 chars

      // Check for P in both sections
      const pInPreceding = precedingSection.match(/P\s+(\d+)/g);
      const pInEmployee = employeeSection.match(/P\s+(\d+)/g);
      console.log('P matches in preceding:', pInPreceding);
      console.log('P matches in employee section:', pInEmployee);
    }

  } catch (error) {
    console.error('Error:', error);
  }
}

debugSections();