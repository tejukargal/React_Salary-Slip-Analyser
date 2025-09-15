const fs = require('fs');
const pdfParse = require('pdf-parse');

async function debugExtraction() {
  const pdfBuffer = fs.readFileSync('C:/Users/Lekhana/Downloads/Pay SlipET_MAY 2025-5-12.pdf');
  const pdfData = await pdfParse(pdfBuffer);
  
  // Find first employee section 
  const snoSections = [];
  const snoRegex = /SNO:\s*\n?\s*(\d+)/gi;
  let match;
  while ((match = snoRegex.exec(pdfData.text)) !== null) {
    snoSections.push({
      sno: match[1],
      position: match.index
    });
  }
  
  console.log('Found SNO sections:', snoSections.slice(0, 3).map(s => s.sno));
  
  // Get first employee section
  const firstSection = snoSections[0];
  const secondSection = snoSections[1];
  
  const startPos = Math.max(0, firstSection.position - 1200);
  const endPos = secondSection ? secondSection.position : firstSection.position + 1000;
  const employeeSection = pdfData.text.substring(startPos, endPos);
  
  console.log('\n=== FIRST EMPLOYEE SECTION ===');
  console.log(employeeSection.substring(0, 800));
  
  // Test name extraction patterns
  console.log('\n=== TESTING NAME PATTERNS ===');
  const namePattern1 = employeeSection.match(/Sri\s*\/\s*Smt:\s*([A-Z\s]+?)[\s\n]/i);
  console.log('Name pattern 1:', namePattern1);
  
  const namePattern2 = employeeSection.match(/Sri\s*\/\s*Smt:\s*([A-Z\s]+?)(?:\n|Days Worked|\d{5}-\d{5})/i);
  console.log('Name pattern 2:', namePattern2);
  
  const namePattern3 = employeeSection.match(/Sri\s*\/\s*Smt:\s*\n?\s*([A-Z\s]+?)\n/i);
  console.log('Name pattern 3:', namePattern3);
  
  // Test deduction patterns
  console.log('\n=== TESTING DEDUCTION PATTERNS ===');
  const deductionSection = employeeSection.match(/Deductions:\s*([\s\S]*?)(?=Recoveries:|Local Recoveries:|$)/i);
  console.log('Deductions section found:', !!deductionSection);
  if (deductionSection) {
    console.log('Deductions text:', deductionSection[1]);
    
    // Test individual deduction patterns
    console.log('\nTesting individual patterns:');
    console.log('IT:', deductionSection[1].match(/IT\s+(\d+)/i));
    console.log('PT:', deductionSection[1].match(/PT\s+(\d+)/i));
    console.log('LIC:', deductionSection[1].match(/LIC\s+(\d+)/i));
  }
  
  // Also look for deductions in the original section after the table layout
  console.log('\n=== LOOKING FOR DEDUCTIONS IN STRUCTURED FORMAT ===');
  // Find the section after "Government Of Karnataka" which contains the structured data
  const structuredSection = employeeSection.split('Government Of Karnataka')[1] || '';
  console.log('Structured section (first 500 chars):', structuredSection.substring(0, 500));
  
  // Test patterns in structured section
  console.log('\nTesting in structured section:');
  console.log('IT pattern:', structuredSection.match(/IT\s+(\d+)/i));
  console.log('PT pattern:', structuredSection.match(/PT\s+(\d+)/i));
  console.log('LIC pattern:', structuredSection.match(/LIC\s+(\d+)/i));
}

debugExtraction().catch(console.error);