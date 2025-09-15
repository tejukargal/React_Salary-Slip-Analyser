import * as fs from 'fs';
import pdfParse from 'pdf-parse';

async function testSections() {
  try {
    const filePath = 'C:/Users/Lekhana/Downloads/Pay SlipET_MAY 2025-11.pdf';
    const pdfBuffer = fs.readFileSync(filePath);
    const pdfData = await pdfParse(pdfBuffer);
    
    console.log('=== TESTING SECTIONS ===');
    
    // Find SNO patterns
    const snoMatches = pdfData.text.match(/SNO:\s*\d+/g);
    console.log('SNO matches found:', snoMatches);
    
    // Split by SNO
    const sections = pdfData.text.split(/SNO:\s*\d+/);
    console.log(`Number of sections: ${sections.length}`);
    
    sections.forEach((section, index) => {
      if (index === 0) {
        console.log(`\n=== SECTION ${index} (HEADER) ===`);
        console.log(section.substring(0, 200) + '...');
        return;
      }
      
      console.log(`\n=== SECTION ${index} ===`);
      
      // Try to extract name from this section
      const nameMatch = section.match(/Sri\s*\/\s*Smt:\s*\n?\s*([A-Z\s]+?)(?:\n|41300|131400)/i);
      console.log('Name match:', nameMatch?.[1]);
      
      // Try to extract emp no
      const empNoMatch = section.match(/EMP\s*No\s*\n?\s*(\d+)/i);
      console.log('Emp No match:', empNoMatch?.[1]);
      
      // Show first 500 chars of section
      console.log('Section preview:', section.substring(0, 500) + '...');
    });
    
  } catch (error) {
    console.error('Error:', error);
  }
}

testSections();