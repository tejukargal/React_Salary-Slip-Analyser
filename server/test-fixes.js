const { FixedFieldsPDFParser } = require('./dist/services/fixedFieldsPdfParser.js');

async function testFixes() {
  const parser = new FixedFieldsPDFParser();
  
  try {
    const result = await parser.processMultipleEmployees('C:/Users/Lekhana/Downloads/Pay SlipET_MAY 2025-5-12.pdf');
    
    if (result.success && result.data) {
      console.log('=== TESTING FULL NAME AND ZERO VALUE FIXES ===');
      console.log('Total employees:', result.data.totalEmployees);
      
      console.log('\n=== First 5 Employees ===');
      result.data.employees.slice(0, 5).forEach((emp, i) => {
        console.log(`Employee ${i+1}: ${emp.name} (EMP No: ${emp.empNo})`);
        console.log(`  Basic: ${emp.basic}, Net: ${emp.netSalary}`);
        console.log(`  Deductions: IT:${emp.deductions.it}, PT:${emp.deductions.pt}, LIC:${emp.deductions.lic}`);
      });
      
      console.log('\n=== Employees with potential zero values ===');
      const zeroEmployees = result.data.employees.filter(emp => 
        emp.basic === 0 || emp.netSalary === 0 || 
        (emp.deductions.it === 0 && emp.deductions.pt === 0 && emp.deductions.lic === 0)
      );
      console.log(`Found ${zeroEmployees.length} employees with zero values:`);
      zeroEmployees.forEach(emp => {
        console.log(`- ${emp.name} (SNO: ${emp.sno}) - Basic: ${emp.basic}, Net: ${emp.netSalary}`);
      });
      
      console.log(`\n=== Summary ===`);
      console.log(`Total employees in PDF: Should be 24 (from SNO 9-24 + additional)`);
      console.log(`Extracted employees: ${result.data.totalEmployees}`);
      console.log(`Name extraction test: ${result.data.employees[0].name.includes(' ') ? 'PASS (Full name extracted)' : 'FAIL (Only first name)'}`);
      
    } else {
      console.error('Parsing failed:', result.error);
    }
  } catch (err) {
    console.error('Error:', err);
  }
}

testFixes();