import * as fs from 'fs';
import pdfParse from 'pdf-parse';

async function testParser() {
  try {
    const filePath = 'C:/Users/Lekhana/Downloads/Pay SlipET_MAY 2025-11.pdf';
    console.log('Reading PDF from:', filePath);
    
    const pdfBuffer = fs.readFileSync(filePath);
    const pdfData = await pdfParse(pdfBuffer);
    
    console.log('=== RAW PDF TEXT ===');
    console.log(pdfData.text);
    console.log('=== END RAW TEXT ===');
    
    // Test SNO pattern
    const snoMatches = pdfData.text.match(/SNO:\s*\d+/g);
    console.log('\nSNO matches:', snoMatches);
    
    // Test employee name pattern
    const nameMatches = pdfData.text.match(/Sri\s*\/\s*Smt:\s*([A-Z\s]+?)(?:Days|EMP)/gi);
    console.log('Name matches:', nameMatches);
    
    // Split by SNO sections
    const sections = pdfData.text.split(/SNO:\s*\d+/).filter(s => s.trim());
    console.log('\nNumber of sections:', sections.length);
    
    sections.forEach((section, index) => {
      console.log(`\n=== SECTION ${index + 1} ===`);
      console.log(section.substring(0, 500) + '...');
    });
    
  } catch (error) {
    console.error('Error:', error);
  }
}

testParser();