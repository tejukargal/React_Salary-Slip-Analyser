const fs = require('fs');
const pdf = require('pdf-parse');

async function debugEmpSections() {
  try {
    const dataBuffer = fs.readFileSync('C:/Users/Lekhana/Downloads/Pay SlipET_MAY 2025-5-12.pdf');
    const pdfData = await pdf(dataBuffer);
    
    console.log('=== DEBUGGING EMP NO. BASED SECTIONS ===');
    
    const text = pdfData.text;
    
    // Find all EMP No. patterns
    const empMatches = [...text.matchAll(/EMP No\s*[\s\n]*([0-9]+)/gi)];
    console.log(`Found ${empMatches.length} EMP No. entries:`);
    
    empMatches.forEach((match, i) => {
      console.log(`${i+1}. EMP No: ${match[1]}`);
    });
    
    // Split by EMP No. and analyze each section
    const empSections = text.split(/EMP No\s*[\s\n]*[0-9]+/gi);
    
    console.log('\n=== ANALYZING EACH EMPLOYEE SECTION FOR BASIC SALARY ===');
    
    empMatches.forEach((empMatch, i) => {
      const empNo = empMatch[1];
      const section = empSections[i + 1] || '';
      
      console.log(`\n--- EMP No: ${empNo} ---`);
      
      // Look for Internal Recoveries patterns in this section
      const internalRecoveries = [...section.matchAll(/Internal Recoveries\s*:\s*[\s\n]*(\d+)/gi)];
      console.log(`Internal Recoveries matches: ${internalRecoveries.length}`);
      internalRecoveries.forEach(match => {
        console.log(`  Value: ${match[1]}`);
      });
      
      // Look for Basic patterns
      const basicMatches = [...section.matchAll(/Basic\s*[:\s]*[\s\n]*(\d+)/gi)];
      console.log(`Basic matches: ${basicMatches.length}`);
      basicMatches.forEach(match => {
        console.log(`  Value: ${match[1]}`);
      });
      
      // Show first 300 chars of section for context
      console.log(`Section preview: ${section.substring(0, 300)}...`);
    });
    
  } catch (err) {
    console.error('Error:', err.message);
  }
}

debugEmpSections();