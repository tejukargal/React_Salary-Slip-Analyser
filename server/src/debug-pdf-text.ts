import * as fs from 'fs';
import pdfParse from 'pdf-parse';

async function debugPdfText() {
  try {
    const filePath = 'C:/Users/Lekhana/Downloads/Pay SlipET_MAY 2025-11.pdf';
    const pdfBuffer = fs.readFileSync(filePath);
    const pdfData = await pdfParse(pdfBuffer);
    
    console.log('=== FULL PDF TEXT (first 3000 chars) ===');
    console.log(pdfData.text.substring(0, 3000));
    
    console.log('\n=== SEARCHING FOR DEDUCTION SECTIONS ===');
    
    // Find sections that contain deductions
    const deductionSections = pdfData.text.split(/(?=SNO:)/);
    
    deductionSections.forEach((section, index) => {
      if (section.includes('IT') || section.includes('PT') || section.includes('LIC') || section.includes('GSLIC') || section.includes('FBF')) {
        console.log(`\n--- SECTION ${index} (with deductions) ---`);
        console.log(section.substring(0, 500));
        console.log('...');
      }
    });
    
  } catch (error) {
    console.error('Error:', error);
  }
}

debugPdfText();