import * as fs from 'fs';
import pdfParse from 'pdf-parse';

async function debugAllowanceSections() {
  try {
    const filePath = 'C:/Users/Lekhana/Downloads/Pay SlipET_MAY 2025-5-12.pdf';
    const pdfBuffer = fs.readFileSync(filePath);
    const pdfData = await pdfParse(pdfBuffer);
    
    const text = pdfData.text;
    
    // Find SNO positions
    const snoMatches = [];
    const snoRegex = /SNO:\s*\n?\s*(\d+)/gi;
    let match;
    while ((match = snoRegex.exec(text)) !== null) {
      snoMatches.push({
        sno: match[1],
        position: match.index,
        fullMatch: match[0]
      });
    }
    
    console.log(`Found ${snoMatches.length} SNO positions`);
    
    // Debug first few employees' allowance sections
    for (let i = 0; i < Math.min(3, snoMatches.length); i++) {
      const snoData = snoMatches[i];
      
      console.log(`\n=== SNO ${snoData.sno} ALLOWANCE ANALYSIS ===`);
      
      // Look 800 chars before SNO
      const allowanceStartPos = Math.max(0, snoData.position - 800);
      const allowanceEndPos = snoData.position;
      const allowanceSection = text.substring(allowanceStartPos, allowanceEndPos);
      
      console.log('Section before SNO (800 chars):');
      console.log(allowanceSection);
      
      console.log('\nAllowances found:');
      console.log('DA:', allowanceSection.match(/DA\s+(\d+)/i)?.[1] || 'NOT FOUND');
      console.log('HRA:', allowanceSection.match(/HRA\s+(\d+)/i)?.[1] || 'NOT FOUND');
      console.log('SFN:', allowanceSection.match(/SFN\s+(\d+)/i)?.[1] || 'NOT FOUND');
      console.log('SPAY-TYPIST:', allowanceSection.match(/SPAY-TYPIST\s+(\d+)/i)?.[1] || 'NOT FOUND');
    }
    
  } catch (error) {
    console.error('Error:', error);
  }
}

debugAllowanceSections();