import * as fs from 'fs';
import pdfParse from 'pdf-parse';

async function testFirstEmployee() {
  try {
    const filePath = 'C:/Users/Lekhana/Downloads/Pay SlipET_MAY 2025-11.pdf';
    const pdfBuffer = fs.readFileSync(filePath);
    const pdfData = await pdfParse(pdfBuffer);
    
    console.log('=== LOOKING FOR FIRST EMPLOYEE DATA ===');
    
    // Find where LAXMANA S K's data is
    const laxmanaSection = pdfData.text.match(/[\s\S]*?Sri\s*\/\s*Smt:\s*\n?\s*LAXMANA S K[\s\S]*?(?=SNO:\s*21)/i);
    
    if (laxmanaSection) {
      console.log('\n=== LAXMANA S K SECTION ===');
      console.log(laxmanaSection[0]);
      
      // Try to extract allowances
      const da = laxmanaSection[0].match(/DA\s+(\d+)/i);
      const hra = laxmanaSection[0].match(/HRA\s+(\d+)/i);
      const sfn = laxmanaSection[0].match(/SFN\s+(\d+)/i);
      const spay = laxmanaSection[0].match(/SPAY-TYPIST\s+(\d+)/i);
      
      console.log('\nAllowances found:');
      console.log('DA:', da?.[1]);
      console.log('HRA:', hra?.[1]);
      console.log('SFN:', sfn?.[1]);
      console.log('SPAY-TYPIST:', spay?.[1]);
      
      // Try to extract deductions
      const it = laxmanaSection[0].match(/IT\s+(\d+)/i);
      const pt = laxmanaSection[0].match(/PT\s+(\d+)/i);
      const lic = laxmanaSection[0].match(/LIC\s+(\d+)/i);
      const gslic = laxmanaSection[0].match(/GSLIC\s+(\d+)/i);
      const fbf = laxmanaSection[0].match(/FBF\s+(\d+)/i);
      
      console.log('\nDeductions found:');
      console.log('IT:', it?.[1]);
      console.log('PT:', pt?.[1]);
      console.log('LIC:', lic?.[1]);
      console.log('GSLIC:', gslic?.[1]);
      console.log('FBF:', fbf?.[1]);
    }
    
    // Now look for VIDYADHARA data after SNO: 21
    const vidyadharaSection = pdfData.text.match(/SNO:\s*21[\s\S]*?Sri\s*\/\s*Smt:\s*\n?\s*VIDYADHARA C A[\s\S]*?(?=SNO:\s*22|$)/i);
    
    if (vidyadharaSection) {
      console.log('\n\n=== VIDYADHARA C A SECTION ===');
      console.log(vidyadharaSection[0]);
    }
    
  } catch (error) {
    console.error('Error:', error);
  }
}

testFirstEmployee();