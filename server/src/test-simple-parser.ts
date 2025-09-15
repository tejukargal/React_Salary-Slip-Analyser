import * as fs from 'fs';
import pdfParse from 'pdf-parse';

async function testSimpleParser() {
  try {
    const filePath = 'C:/Users/Lekhana/Downloads/Pay SlipET_MAY 2025-11.pdf';
    const pdfBuffer = fs.readFileSync(filePath);
    const pdfData = await pdfParse(pdfBuffer);
    
    // Split by SNO sections
    const sections = pdfData.text.split(/(?=SNO:\s*\n?\s*\d+)/);
    const validSections = sections.filter(section => section.includes('Sri / Smt:'));
    
    console.log(`Found ${validSections.length} employee sections`);
    
    validSections.forEach((section, index) => {
      console.log(`\n=== Employee ${index + 1} Section ===`);
      
      // Extract name
      const nameMatch = section.match(/Sri\s*\/\s*Smt:\s*\n?\s*([A-Z\s]+?)(?:\n|\d{5}-\d{5})/i);
      console.log('Name:', nameMatch?.[1]?.trim());
      
      // Show section around deductions
      const deductionStart = section.indexOf('Group');
      const deductionSection = section.substring(deductionStart, deductionStart + 300);
      console.log('Deduction section:', deductionSection);
      
      // Test different patterns for IT
      console.log('Testing IT patterns:');
      console.log('Pattern 1 (\\d+ IT):', section.match(/(\d+)\s+IT/i)?.[1]);
      console.log('Pattern 2 (IT \\d+):', section.match(/IT\s+(\d+)/i)?.[1]);
      console.log('Pattern 3 (IT:? \\d+):', section.match(/IT:?\s*(\d+)/i)?.[1]);
      
    });
    
  } catch (error) {
    console.error('Error:', error);
  }
}

testSimpleParser();