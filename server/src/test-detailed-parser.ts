import * as fs from 'fs';
import pdfParse from 'pdf-parse';

async function testDetailedParser() {
  try {
    const filePath = 'C:/Users/Lekhana/Downloads/Pay SlipET_MAY 2025-11.pdf';
    const pdfBuffer = fs.readFileSync(filePath);
    const pdfData = await pdfParse(pdfBuffer);
    
    // Look for all employee names using the specific pattern from the PDF
    const namePattern = /Sri\s*\/\s*Smt:\s*\n?\s*([A-Z\s]+?)(?:\n|41300|131400)/gi;
    const names = [];
    let match;
    while ((match = namePattern.exec(pdfData.text)) !== null) {
      names.push(match[1].trim());
    }
    console.log('Found names:', names);
    
    // Look for employee numbers
    const empNoPattern = /EMP\s*No\s*\n?\s*(\d+)/gi;
    const empNos = [];
    while ((match = empNoPattern.exec(pdfData.text)) !== null) {
      empNos.push(match[1]);
    }
    console.log('Found employee numbers:', empNos);
    
    // Look for designations using AG Code pattern
    const designationPattern = /AG Code\s*:\s*\n?\s*([A-Z\s]+?)(?:\s*Rs\.|$)/gi;
    const designations = [];
    while ((match = designationPattern.exec(pdfData.text)) !== null) {
      designations.push(match[1].trim());
    }
    console.log('Found designations:', designations);
    
    // Look for account numbers using Cheque pattern
    const accountPattern = /Cheque(\d+)/gi;
    const accounts = [];
    while ((match = accountPattern.exec(pdfData.text)) !== null) {
      accounts.push(match[1]);
    }
    console.log('Found accounts:', accounts);
    
    // Look for salary data
    const netSalaryPattern = /Net Salary\s*:\s*\n?\s*(\d+)\s*Rs\./gi;
    const netSalaries = [];
    while ((match = netSalaryPattern.exec(pdfData.text)) !== null) {
      netSalaries.push(match[1]);
    }
    console.log('Found net salaries:', netSalaries);
    
  } catch (error) {
    console.error('Error:', error);
  }
}

testDetailedParser();