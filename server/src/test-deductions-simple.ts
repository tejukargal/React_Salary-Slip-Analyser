import * as fs from 'fs';
import pdfParse from 'pdf-parse';

async function testDeductionsSimple() {
  try {
    const filePath = 'C:/Users/Lekhana/Downloads/Pay SlipET_MAY 2025-11.pdf';
    const pdfBuffer = fs.readFileSync(filePath);
    const pdfData = await pdfParse(pdfBuffer);
    
    console.log('=== DEDUCTION FIELD ANALYSIS ===');
    
    // Test each deduction field individually
    const itMatches = [];
    const ptMatches = [];
    const licMatches = [];
    const gslicMatches = [];
    const fbfMatches = [];
    
    let match;
    
    // IT values
    const itRegex = /IT\s+(\d+)/gi;
    while ((match = itRegex.exec(pdfData.text)) !== null) {
      itMatches.push(parseInt(match[1]));
    }
    
    // PT values  
    const ptRegex = /PT\s+(\d+)/gi;
    while ((match = ptRegex.exec(pdfData.text)) !== null) {
      ptMatches.push(parseInt(match[1]));
    }
    
    // LIC values
    const licRegex = /LIC\s+(\d+)/gi;
    while ((match = licRegex.exec(pdfData.text)) !== null) {
      licMatches.push(parseInt(match[1]));
    }
    
    // GSLIC values
    const gslicRegex = /GSLIC\s+(\d+)/gi;
    while ((match = gslicRegex.exec(pdfData.text)) !== null) {
      gslicMatches.push(parseInt(match[1]));
    }
    
    // FBF values
    const fbfRegex = /FBF\s+(\d+)/gi;
    while ((match = fbfRegex.exec(pdfData.text)) !== null) {
      fbfMatches.push(parseInt(match[1]));
    }
    
    console.log('\n=== ACTUAL VALUES FOUND ===');
    console.log('IT:', itMatches);
    console.log('PT:', ptMatches);  
    console.log('LIC:', licMatches);
    console.log('GSLIC:', gslicMatches);
    console.log('FBF:', fbfMatches);
    
    console.log('\n=== EXPECTED MAPPING ===');
    console.log('Employee 1 (LAXMANA S K) should have:');
    console.log('- IT: 0 (no IT found in their section)');
    console.log('- PT: 200 (first PT value)');
    console.log('- LIC: 6076 (first LIC value)'); 
    console.log('- GSLIC: 40 (first GSLIC value)');
    console.log('- FBF: 10 (first FBF value)');
    
    console.log('Employee 2 (VIDYADHARA C A) should have:');
    console.log('- IT: 80000 (only IT value)');
    console.log('- PT: 200 (second PT value or same as first)');
    console.log('- LIC: 0 (no second LIC)');
    console.log('- GSLIC: 60 (second GSLIC value)');
    console.log('- FBF: 10 (second FBF value or same as first)');
    
  } catch (error) {
    console.error('Error:', error);
  }
}

testDeductionsSimple();