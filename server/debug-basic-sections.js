const fs = require('fs');
const pdf = require('pdf-parse');

async function debugBasicSections() {
  try {
    const dataBuffer = fs.readFileSync('C:/Users/Lekhana/Downloads/Pay SlipET_MAY 2025-5-12.pdf');
    const pdfData = await pdf(dataBuffer);
    
    console.log('=== DEBUGGING BASIC SALARY SECTIONS FOR SNO 11 & 19 ===');
    
    // Look for SNO 11 (ARUNA L) and SNO 19 (VIJAYA G E)
    const text = pdfData.text;
    
    // Find SNO 11 section
    const sno11Match = text.match(/SNO\s*:\s*11\s([\s\S]*?)(?=SNO\s*:\s*12|$)/i);
    if (sno11Match) {
      console.log('\n=== SNO 11 (ARUNA L) SECTION ===');
      console.log(sno11Match[1].substring(0, 800));
      console.log('...\n');
    }
    
    // Find SNO 19 section
    const sno19Match = text.match(/SNO\s*:\s*19\s([\s\S]*?)(?=SNO\s*:\s*20|$)/i);
    if (sno19Match) {
      console.log('=== SNO 19 (VIJAYA G E) SECTION ===');
      console.log(sno19Match[1].substring(0, 800));
      console.log('...\n');
    }
    
    // Also check if there are any basic salary patterns we missed
    console.log('=== SEARCHING FOR BASIC SALARY PATTERNS IN ENTIRE PDF ===');
    const basicPatterns = [
      /Basic\s*:\s*(\d+)/gi,
      /Internal Recoveries\s*:\s*(\d+)/gi,
      /Pay Scale\s*:\s*([\d\-]+)\s+(\d+)/gi
    ];
    
    basicPatterns.forEach((pattern, i) => {
      const matches = [...text.matchAll(pattern)];
      console.log(`Pattern ${i+1} matches: ${matches.length}`);
      matches.slice(0, 5).forEach(match => {
        console.log(`  ${match[0]} -> ${match[1]}`);
      });
    });
    
  } catch (err) {
    console.error('Error:', err.message);
  }
}

debugBasicSections();