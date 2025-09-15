import * as fs from 'fs';
import pdfParse from 'pdf-parse';

async function analyzeAllowances() {
  try {
    const filePath = 'C:/Users/Lekhana/Downloads/Pay SlipET_MAY 2025-11.pdf';
    const pdfBuffer = fs.readFileSync(filePath);
    const pdfData = await pdfParse(pdfBuffer);
    
    console.log('=== ANALYZING ALLOWANCE DISTRIBUTION ===');
    
    const text = pdfData.text;
    
    // Split by employee sections based on employee names
    const employeeNameRegex = /Sri\s*\/\s*Smt:\s*\n?\s*([A-Z\s]+?)(?:\n|Days|\d{5}-\d{5})/gi;
    const nameMatches = [];
    let match;
    while ((match = employeeNameRegex.exec(text)) !== null) {
      nameMatches.push({
        name: match[1].trim(),
        position: match.index
      });
    }
    
    console.log('Found employees:', nameMatches);
    
    // Create sections based on employee positions
    for (let i = 0; i < nameMatches.length; i++) {
      const startPos = nameMatches[i].position;
      const endPos = i < nameMatches.length - 1 ? nameMatches[i + 1].position : text.length;
      const section = text.substring(startPos, endPos);
      
      console.log(`\n=== ${nameMatches[i].name} SECTION ANALYSIS ===`);
      
      // Look for allowances in this specific employee's section
      console.log('DA found:', section.match(/DA\s+(\d+)/i)?.[1] || 'NOT FOUND');
      console.log('HRA found:', section.match(/HRA\s+(\d+)/i)?.[1] || 'NOT FOUND');
      console.log('SFN found:', section.match(/SFN\s+(\d+)/i)?.[1] || 'NOT FOUND');
      console.log('SPAY-TYPIST found:', section.match(/SPAY-TYPIST\s+(\d+)/i)?.[1] || 'NOT FOUND');
      
      // Show a snippet around allowances area
      const allowanceStart = section.indexOf('DA ');
      if (allowanceStart !== -1) {
        const allowanceSection = section.substring(allowanceStart, allowanceStart + 200);
        console.log('Allowance section snippet:', allowanceSection);
      }
    }
    
    // Also check the new PDF file
    console.log('\n=== CHECKING NEW PDF FILE ===');
    try {
      const newFilePath = 'C:/Users/Lekhana/Downloads/Pay SlipET_MAY 2025-5-12.pdf';
      const newPdfBuffer = fs.readFileSync(newFilePath);
      const newPdfData = await pdfParse(newPdfBuffer);
      
      console.log('New PDF text (first 1000 chars):');
      console.log(newPdfData.text.substring(0, 1000));
      
      // Count employees in new PDF
      const newNameRegex = /Sri\s*\/\s*Smt:\s*\n?\s*([A-Z\s]+?)(?:\n|Days|\d{5}-\d{5})/gi;
      const newNames = [];
      while ((match = newNameRegex.exec(newPdfData.text)) !== null) {
        newNames.push(match[1].trim());
      }
      
      console.log(`\nNew PDF contains ${newNames.length} employees:`);
      newNames.forEach((name, index) => {
        console.log(`${index + 1}. ${name}`);
      });
      
    } catch (error) {
      console.log('Could not read new PDF file:', (error as Error).message);
    }
    
  } catch (error) {
    console.error('Error:', error);
  }
}

analyzeAllowances();