import * as fs from 'fs';
import pdfParse from 'pdf-parse';

async function testSectionSplit() {
  try {
    const filePath = 'C:/Users/Lekhana/Downloads/Pay SlipET_MAY 2025-11.pdf';
    const pdfBuffer = fs.readFileSync(filePath);
    const pdfData = await pdfParse(pdfBuffer);
    
    const text = pdfData.text;
    
    // Find all SNO positions
    const snoMatches = [];
    let snoRegex = /SNO:\s*\n?\s*(\d+)/gi;
    let match;
    while ((match = snoRegex.exec(text)) !== null) {
      snoMatches.push({
        sno: match[1],
        position: match.index,
        fullMatch: match[0]
      });
    }
    
    console.log('Found SNO positions:', snoMatches);
    
    // Create sections based on SNO positions
    const sections = [];
    for (let i = 0; i < snoMatches.length; i++) {
      const startPos = snoMatches[i].position;
      const endPos = i < snoMatches.length - 1 ? snoMatches[i + 1].position : text.length;
      const section = text.substring(startPos, endPos);
      
      console.log(`\n=== Section for SNO ${snoMatches[i].sno} ===`);
      console.log('First 500 chars:', section.substring(0, 500));
      console.log('Looking for IT in this section...');
      
      // Look for IT deduction
      const itMatch = section.match(/(\d+)\s+IT/i);
      console.log('IT found:', itMatch?.[1]);
      
      // Look for other deductions
      console.log('PT:', section.match(/(\d+)\s+PT/i)?.[1]);
      console.log('LIC:', section.match(/(\d+)\s+LIC/i)?.[1]);
      console.log('GSLIC:', section.match(/(\d+)\s+GSLIC/i)?.[1]);
      console.log('FBF:', section.match(/(\d+)\s+FBF/i)?.[1]);
      
      sections.push(section);
    }
    
  } catch (error) {
    console.error('Error:', error);
  }
}

testSectionSplit();