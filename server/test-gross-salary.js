const { FixedFieldsPDFParser } = require('./dist/services/fixedFieldsPdfParser');

async function testGrossSalary() {
  try {
    const parser = new FixedFieldsPDFParser();
    const result = await parser.parsePDF("C:/Users/Lekhana/Downloads/8.Pay SlipET_August 2025-1-2.pdf");

    if (result.success) {
      console.log('=== GROSS SALARY TEST ===');
      result.data.employees.forEach((emp, index) => {
        console.log(`${index + 1}. ${emp.name}`);
        console.log(`   Basic: ₹${emp.basic}`);
        console.log(`   Gross: ₹${emp.grossSalary}`);
        console.log(`   Net: ₹${emp.netSalary}`);
        console.log(`   Pay Scale: ${emp.payScale}`);
        console.log(`   P Allowance: ₹${emp.allowances.p || 0}`);
        console.log('');
      });
    } else {
      console.log('Parser error:', result.error);
    }

  } catch (error) {
    console.error('Error:', error);
  }
}

testGrossSalary();