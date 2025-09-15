import * as fs from 'fs';
import pdfParse from 'pdf-parse';

async function analyzeDeductions() {
  try {
    const filePath = 'C:/Users/Lekhana/Downloads/Pay SlipET_MAY 2025-11.pdf';
    const pdfBuffer = fs.readFileSync(filePath);
    const pdfData = await pdfParse(pdfBuffer);
    
    console.log('=== ANALYZING ALL DEDUCTION VALUES ===');
    
    const text = pdfData.text;
    
    // Extract all IT values
    const itMatches = [];
    let itRegex = /IT\s+(\d+)/gi;
    let match;
    while ((match = itRegex.exec(text)) !== null) {
      itMatches.push(parseInt(match[1]));
    }
    
    // Extract all PT values
    const ptMatches = [];
    let ptRegex = /PT\s+(\d+)/gi;
    while ((match = ptRegex.exec(text)) !== null) {
      ptMatches.push(parseInt(match[1]));
    }
    
    // Extract all LIC values
    const licMatches = [];
    let licRegex = /LIC\s+(\d+)/gi;
    while ((match = licRegex.exec(text)) !== null) {
      licMatches.push(parseInt(match[1]));
    }
    
    // Extract all GSLIC values
    const gslicMatches = [];
    let gslicRegex = /GSLIC\s+(\d+)/gi;
    while ((match = gslicRegex.exec(text)) !== null) {
      gslicMatches.push(parseInt(match[1]));
    }
    
    // Extract all FBF values
    const fbfMatches = [];
    let fbfRegex = /FBF\s+(\d+)/gi;
    while ((match = fbfRegex.exec(text)) !== null) {
      fbfMatches.push(parseInt(match[1]));
    }
    
    console.log('\n=== DEDUCTION VALUES FOUND ===');
    console.log('IT values:', itMatches);
    console.log('PT values:', ptMatches);
    console.log('LIC values:', licMatches);
    console.log('GSLIC values:', gslicMatches);
    console.log('FBF values:', fbfMatches);
    
    // Show employee names for context
    const names = [];
    let nameRegex = /Sri\s*\/\s*Smt:\s*\n?\s*([A-Z\s]+?)(?:\n|Days|\d{5}-\d{5})/gi;
    while ((match = nameRegex.exec(text)) !== null) {
      names.push(match[1].trim());
    }
    
    console.log('\nEmployee Names:', names);
    
    console.log('\n=== MAPPING DEDUCTIONS TO EMPLOYEES ===');
    for (let i = 0; i < names.length; i++) {
      console.log(`\nEmployee ${i + 1}: ${names[i]}`);
      console.log(`  IT: ${itMatches[i] || 0}`);
      console.log(`  PT: ${ptMatches[i] || 0}`);
      console.log(`  LIC: ${licMatches[i] || 0}`);
      console.log(`  GSLIC: ${gslicMatches[i] || 0}`);
      console.log(`  FBF: ${fbfMatches[i] || 0}`);
    }
    
  } catch (error) {
    console.error('Error:', error);
  }
}

analyzeDeductions();