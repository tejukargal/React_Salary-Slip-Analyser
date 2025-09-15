const { FixedFieldsPDFParser } = require('./dist/services/fixedFieldsPdfParser.js');

async function testBasicSalary() {
  const parser = new FixedFieldsPDFParser();
  
  try {
    console.log('=== TESTING BASIC SALARY EXTRACTION ===');
    const result = await parser.processMultipleEmployees('C:/Users/Lekhana/Downloads/Pay SlipET_MAY 2025-5-12.pdf');
    
    if (result.success && result.data) {
      console.log(`Testing Basic salary for all ${result.data.totalEmployees} employees:\n`);
      
      result.data.employees.forEach((emp, i) => {
        console.log(`${i+1}. ${emp.name} (${emp.empNo})`);
        console.log(`   Basic: ${emp.basic} | Group: ${emp.group} | Designation: ${emp.designation}`);
        
        // Flag potentially incorrect basic values
        if (emp.basic === 0) {
          console.log(`   ⚠️  ISSUE: Basic salary is 0`);
        }
        console.log('');
      });
      
      // Summary of issues
      const zeroBasicEmployees = result.data.employees.filter(emp => emp.basic === 0);
      if (zeroBasicEmployees.length > 0) {
        console.log(`\n❌ Found ${zeroBasicEmployees.length} employees with Basic = 0:`);
        zeroBasicEmployees.forEach(emp => {
          console.log(`- ${emp.name} (${emp.empNo}) - Group: ${emp.group}`);
        });
      } else {
        console.log('\n✅ All employees have non-zero Basic salary values');
      }
      
    } else {
      console.log('❌ Extraction failed:', result.error);
    }
    
  } catch (err) {
    console.error('❌ Error during testing:', err.message);
  }
}

testBasicSalary();