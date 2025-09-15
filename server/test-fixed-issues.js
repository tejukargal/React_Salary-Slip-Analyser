const { FixedFieldsPDFParser } = require('./dist/services/fixedFieldsPdfParser.js');

async function testFixedIssues() {
  const parser = new FixedFieldsPDFParser();
  
  try {
    console.log('=== TESTING FIXED ISSUES ===');
    const result = await parser.processMultipleEmployees('C:/Users/Lekhana/Downloads/Pay SlipET_MAY 2025-5-12.pdf');
    
    if (result.success && result.data) {
      console.log(`✅ SUCCESS: Extracted ${result.data.totalEmployees} employees`);
      
      console.log('\n=== Testing Allowances Accuracy ===');
      result.data.employees.slice(0, 5).forEach((emp, i) => {
        console.log(`Employee ${i+1}: ${emp.name}`);
        console.log(`  Allowances: DA:${emp.allowances.da}, HRA:${emp.allowances.hra}, SFN:${emp.allowances.sfn}, SPAY:${emp.allowances.spayTypist}`);
        
        // Check if allowances look reasonable
        const totalAllowances = emp.allowances.da + emp.allowances.hra + emp.allowances.sfn + emp.allowances.spayTypist;
        console.log(`  Total Allowances: ${totalAllowances}`);
      });
      
      console.log('\n=== Testing Nil Values Handling ===');
      // Check for any placeholder employees
      const placeholderEmployees = result.data.employees.filter(emp => 
        emp.name.includes('Employee SNO') || emp.empNo.includes('SNO')
      );
      
      if (placeholderEmployees.length > 0) {
        console.log(`Found ${placeholderEmployees.length} employees with placeholder data:`);
        placeholderEmployees.forEach(emp => {
          console.log(`- ${emp.name} | ${emp.empNo}`);
        });
      } else {
        console.log('✅ All employees have valid extracted data');
      }
      
    } else {
      console.log('❌ FAILURE:', result.error);
    }
    
  } catch (err) {
    console.error('❌ ERROR:', err.message);
  }
}

testFixedIssues();