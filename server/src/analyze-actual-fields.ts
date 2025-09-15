import * as fs from 'fs';
import pdfParse from 'pdf-parse';

async function analyzeActualFields() {
  try {
    const filePath = 'C:/Users/Lekhana/Downloads/Pay SlipET_MAY 2025-11.pdf';
    const pdfBuffer = fs.readFileSync(filePath);
    const pdfData = await pdfParse(pdfBuffer);
    
    console.log('=== ANALYZING ACTUAL FIELDS IN PDF ===');
    
    // Split by employees to see what each employee actually has
    const text = pdfData.text;
    
    // Find the two employee sections
    const laxmanaSection = text.substring(0, text.indexOf('SNO:\n21'));
    const vidyadharaSection = text.substring(text.indexOf('SNO:\n21'), text.indexOf('SNO:\n22'));
    
    console.log('\n=== EMPLOYEE 1: LAXMANA S K SECTION ANALYSIS ===');
    console.log('Section text preview:', laxmanaSection.substring(0, 500));
    
    // Check which allowances are actually present for Employee 1
    console.log('\nAllowances present for LAXMANA S K:');
    if (laxmanaSection.includes('DA 7509')) console.log('✓ DA: 7509');
    if (laxmanaSection.includes('HRA 4598')) console.log('✓ HRA: 4598');
    if (laxmanaSection.includes('SFN 150')) console.log('✓ SFN: 150');
    if (laxmanaSection.includes('SPAY-TYPIST 135')) console.log('✓ SPAY-TYPIST: 135');
    
    // Check which deductions are actually present for Employee 1
    console.log('\nDeductions present for LAXMANA S K:');
    if (laxmanaSection.includes('PT 200')) console.log('✓ PT: 200');
    if (laxmanaSection.includes('GSLIC 40')) console.log('✓ GSLIC: 40');
    if (laxmanaSection.includes('LIC 6076')) console.log('✓ LIC: 6076');
    if (laxmanaSection.includes('FBF 10')) console.log('✓ FBF: 10');
    if (laxmanaSection.includes('IT ')) console.log('✓ IT found');
    else console.log('✗ IT: NOT PRESENT');
    
    console.log('\n=== EMPLOYEE 2: VIDYADHARA C A SECTION ANALYSIS ===');
    console.log('Section text preview:', vidyadharaSection.substring(0, 500));
    
    // Check which allowances are actually present for Employee 2
    console.log('\nAllowances present for VIDYADHARA C A:');
    if (vidyadharaSection.includes('DA 99990')) console.log('✓ DA: 99990');
    if (vidyadharaSection.includes('HRA 14544')) console.log('✓ HRA: 14544');
    if (vidyadharaSection.includes('SFN ')) console.log('✓ SFN found');
    else console.log('✗ SFN: NOT PRESENT');
    if (vidyadharaSection.includes('SPAY-TYPIST ')) console.log('✓ SPAY-TYPIST found');
    else console.log('✗ SPAY-TYPIST: NOT PRESENT');
    
    // Check which deductions are actually present for Employee 2
    console.log('\nDeductions present for VIDYADHARA C A:');
    if (vidyadharaSection.includes('IT 80000')) console.log('✓ IT: 80000');
    if (vidyadharaSection.includes('PT 200')) console.log('✓ PT: 200');
    if (vidyadharaSection.includes('GSLIC 60')) console.log('✓ GSLIC: 60');
    if (vidyadharaSection.includes('FBF 10')) console.log('✓ FBF: 10');
    if (vidyadharaSection.includes('LIC ')) console.log('✓ LIC found');
    else console.log('✗ LIC: NOT PRESENT');
    
    console.log('\n=== FINAL FIELD MAPPING ===');
    console.log('Employee 1 (LAXMANA S K) - ONLY show these fields:');
    console.log('Allowances: DA, HRA, SFN, SPAY-TYPIST');
    console.log('Deductions: PT, GSLIC, LIC, FBF');
    
    console.log('\nEmployee 2 (VIDYADHARA C A) - ONLY show these fields:');
    console.log('Allowances: DA, HRA');
    console.log('Deductions: IT, PT, GSLIC, FBF');
    
  } catch (error) {
    console.error('Error:', error);
  }
}

analyzeActualFields();