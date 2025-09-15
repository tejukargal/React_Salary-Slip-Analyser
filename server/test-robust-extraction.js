const { FixedFieldsPDFParser } = require('./dist/services/fixedFieldsPdfParser.js');

async function testRobustExtraction() {
  const parser = new FixedFieldsPDFParser();
  
  try {
    console.log('=== TESTING ROBUST EXTRACTION FOR NIL FIELDS ===');
    const result = await parser.processMultipleEmployees('C:/Users/Lekhana/Downloads/Pay SlipET_MAY 2025-5-12.pdf');
    
    if (result.success && result.data) {
      console.log(`Successfully extracted ${result.data.totalEmployees} employees`);
      
      // Show first few employees to verify extraction
      console.log('\n=== First 3 employees ===');
      result.data.employees.slice(0, 3).forEach((emp, i) => {
        console.log(`${i+1}. Name: "${emp.name}" | EMP No: "${emp.empNo}" | SNO: ${emp.sno}`);
      });
      
      // Check for placeholder employees (those with generated names/IDs)
      const placeholderEmployees = result.data.employees.filter(emp => 
        emp.name.includes('Employee SNO') || emp.empNo.includes('SNO')
      );
      
      if (placeholderEmployees.length > 0) {
        console.log(`\n=== Found ${placeholderEmployees.length} employees with nil fields (using placeholders) ===`);
        placeholderEmployees.forEach(emp => {
          console.log(`- ${emp.name} | ${emp.empNo} | SNO: ${emp.sno}`);
        });
      } else {
        console.log('\n=== All employees had extractable data ===');
      }
      
    } else {
      console.log('❌ Extraction failed:', result.error);
    }
    
  } catch (err) {
    console.error('❌ Error during testing:', err.message);
  }
}

testRobustExtraction();