import * as fs from 'fs';
import pdfParse from 'pdf-parse';

async function testCorrectValues() {
  try {
    const filePath = 'C:/Users/Lekhana/Downloads/Pay SlipET_MAY 2025-11.pdf';
    const pdfBuffer = fs.readFileSync(filePath);
    const pdfData = await pdfParse(pdfBuffer);
    
    console.log('=== CORRECT VALUES ANALYSIS ===');
    
    // Based on the original PDF document, the CORRECT values should be:
    
    console.log('\n=== EMPLOYEE 1: LAXMANA S K ===');
    console.log('Allowances:');
    console.log('- DA: 7509');
    console.log('- HRA: 4598'); 
    console.log('- SFN: 150');
    console.log('- SPAY-TYPIST: 135');
    
    console.log('Deductions:');
    console.log('- PT: 200');
    console.log('- GSLIC: 40');
    console.log('- LIC: 6076');
    console.log('- FBF: 10');
    console.log('Net Salary: 67366');
    
    console.log('\n=== EMPLOYEE 2: VIDYADHARA C A ===');
    console.log('Allowances:');
    console.log('- DA: 99990');
    console.log('- HRA: 14544');
    console.log('- SFN: 0 (not present)');
    console.log('- SPAY-TYPIST: 0 (not present)');
    
    console.log('Deductions:');
    console.log('- IT: 80000');
    console.log('- PT: 200'); 
    console.log('- GSLIC: 60');
    console.log('- FBF: 10');
    console.log('Net Salary: 216064');
    
    // Now let's see what the current parser extracts
    console.log('\n=== WHAT CURRENT PARSER FINDS ===');
    
    // Extract all values globally
    const allDA = [];
    const allHRA = [];
    const allSFN = [];
    const allSPAY = [];
    const allIT = [];
    const allPT = [];
    const allLIC = [];
    const allGSLIC = [];
    const allFBF = [];
    
    let match;
    
    // DA values
    const daRegex = /DA\s+(\d+)/gi;
    while ((match = daRegex.exec(pdfData.text)) !== null) {
      allDA.push(parseInt(match[1]));
    }
    
    // HRA values
    const hraRegex = /HRA\s+(\d+)/gi;
    while ((match = hraRegex.exec(pdfData.text)) !== null) {
      allHRA.push(parseInt(match[1]));
    }
    
    // SFN values
    const sfnRegex = /SFN\s+(\d+)/gi;
    while ((match = sfnRegex.exec(pdfData.text)) !== null) {
      allSFN.push(parseInt(match[1]));
    }
    
    // SPAY values
    const spayRegex = /SPAY-TYPIST\s+(\d+)/gi;
    while ((match = spayRegex.exec(pdfData.text)) !== null) {
      allSPAY.push(parseInt(match[1]));
    }
    
    // IT values
    const itRegex = /IT\s+(\d+)/gi;
    while ((match = itRegex.exec(pdfData.text)) !== null) {
      allIT.push(parseInt(match[1]));
    }
    
    // PT values
    const ptRegex = /PT\s+(\d+)/gi;
    while ((match = ptRegex.exec(pdfData.text)) !== null) {
      allPT.push(parseInt(match[1]));
    }
    
    // LIC values
    const licRegex = /LIC\s+(\d+)/gi;
    while ((match = licRegex.exec(pdfData.text)) !== null) {
      allLIC.push(parseInt(match[1]));
    }
    
    // GSLIC values
    const gslicRegex = /GSLIC\s+(\d+)/gi;
    while ((match = gslicRegex.exec(pdfData.text)) !== null) {
      allGSLIC.push(parseInt(match[1]));
    }
    
    // FBF values
    const fbfRegex = /FBF\s+(\d+)/gi;
    while ((match = fbfRegex.exec(pdfData.text)) !== null) {
      allFBF.push(parseInt(match[1]));
    }
    
    console.log('Found values:');
    console.log('DA:', allDA);
    console.log('HRA:', allHRA);
    console.log('SFN:', allSFN);
    console.log('SPAY-TYPIST:', allSPAY);
    console.log('IT:', allIT);
    console.log('PT:', allPT);
    console.log('LIC:', allLIC);
    console.log('GSLIC:', allGSLIC);
    console.log('FBF:', allFBF);
    
  } catch (error) {
    console.error('Error:', error);
  }
}

testCorrectValues();