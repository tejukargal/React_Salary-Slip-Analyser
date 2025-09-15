import * as fs from 'fs';
import pdfParse from 'pdf-parse';

async function findAllEmployees() {
  try {
    const filePath = 'C:/Users/Lekhana/Downloads/Pay SlipET_MAY 2025-11.pdf';
    const pdfBuffer = fs.readFileSync(filePath);
    const pdfData = await pdfParse(pdfBuffer);
    
    console.log('=== FINDING ALL EMPLOYEES IN PDF ===');
    
    // Find all employee names using Sri/Smt pattern
    const namePattern = /Sri\s*\/\s*Smt:\s*\n?\s*([A-Z\s]+?)(?:\n|Days|\d{5}-\d{5})/gi;
    const allNames = [];
    let match;
    
    while ((match = namePattern.exec(pdfData.text)) !== null) {
      allNames.push(match[1].trim());
    }
    
    console.log(`Found ${allNames.length} employee names:`, allNames);
    
    // Find all employee numbers
    const empNoPattern = /EMP\s*No\s*\n?\s*(\d+)/gi;
    const allEmpNos = [];
    
    while ((match = empNoPattern.exec(pdfData.text)) !== null) {
      allEmpNos.push(match[1]);
    }
    
    console.log(`Found ${allEmpNos.length} employee numbers:`, allEmpNos);
    
    // Find all SNO entries
    const snoPattern = /SNO:\s*\n?\s*(\d+)/gi;
    const allSNOs = [];
    
    while ((match = snoPattern.exec(pdfData.text)) !== null) {
      allSNOs.push(match[1]);
    }
    
    console.log(`Found ${allSNOs.length} SNO entries:`, allSNOs);
    
    // Find all account numbers
    const accountPattern = /Cheque(\d+)/gi;
    const allAccounts = [];
    
    while ((match = accountPattern.exec(pdfData.text)) !== null) {
      allAccounts.push(match[1]);
    }
    
    console.log(`Found ${allAccounts.length} account numbers:`, allAccounts);
    
    // Find all net salaries
    const netSalaryPattern = /Net Salary\s*:\s*\n?\s*(\d+)\s*Rs\./gi;
    const allNetSalaries = [];
    
    while ((match = netSalaryPattern.exec(pdfData.text)) !== null) {
      allNetSalaries.push(match[1]);
    }
    
    console.log(`Found ${allNetSalaries.length} net salaries:`, allNetSalaries);
    
    // Show total counts
    const expectedCount = Math.max(allNames.length, allEmpNos.length, allSNOs.length);
    console.log(`\n=== SUMMARY ===`);
    console.log(`Expected total employees: ${expectedCount}`);
    console.log(`Currently parsing: 2 (hardcoded)`);
    console.log(`Missing: ${expectedCount - 2} employees`);
    
  } catch (error) {
    console.error('Error:', error);
  }
}

findAllEmployees();