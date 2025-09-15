import * as fs from 'fs';
import pdfParse from 'pdf-parse';

async function debugDesignations() {
  try {
    const pdfBuffer = fs.readFileSync('c:/Users/Lekhana/Downloads/Pay SlipET_MAY 2025-5-12.pdf');
    const pdfData = await pdfParse(pdfBuffer);
    
    console.log('=== DEBUGGING DESIGNATION EXTRACTION ===');
    
    // Find all occurrences of "Designation:" in the text
    const designationMatches = [];
    const designationRegex = /Designation[^\n]*\n[^\n]*/gi;
    let match;
    
    while ((match = designationRegex.exec(pdfData.text)) !== null) {
      designationMatches.push({
        match: match[0],
        position: match.index
      });
    }
    
    console.log(`Found ${designationMatches.length} Designation patterns:`);
    designationMatches.forEach((match, i) => {
      console.log(`${i + 1}. "${match.match}"`);
    });
    
    // Also check for different patterns around designation text
    console.log('\n=== LOOKING FOR LECTURER, INSTRUCTOR, etc. ===');
    const knownDesignations = ['LECTURER', 'INSTRUCTOR', 'SECOND DIVISON ASSISTANT', 'ASSISTANT INSTRUCTOR', 'GROUP D', 'MECHANIC', 'SELECTION GRADE LECTURER', 'TYPIST', 'HELPER'];
    
    knownDesignations.forEach(designation => {
      const regex = new RegExp(designation, 'gi');
      const matches = pdfData.text.match(regex);
      if (matches) {
        console.log(`Found "${designation}" ${matches.length} times`);
      }
    });
    
    // Let's also see the context around the first few employee entries
    console.log('\n=== SAMPLE TEXT SECTIONS ===');
    const snoRegex = /SNO:\s*\n?\s*(\d+)[\s\S]{0,500}/gi;
    let snoMatch;
    let count = 0;
    while ((snoMatch = snoRegex.exec(pdfData.text)) !== null && count < 3) {
      console.log(`\nSNO ${snoMatch[1]} section:`);
      console.log(snoMatch[0]);
      count++;
    }
    
  } catch (error) {
    console.error('Error:', error);
  }
}

debugDesignations();