const { FixedFieldsPDFParser } = require('./dist/services/fixedFieldsPdfParser.js');

async function debugEmptyResult() {
  const parser = new FixedFieldsPDFParser();
  
  try {
    console.log('=== DEBUGGING EMPTY RESULT ===');
    const result = await parser.processMultipleEmployees('C:/Users/Lekhana/Downloads/Pay SlipET_MAY 2025-5-12.pdf');
    
    console.log('Result success:', result.success);
    if (!result.success) {
      console.log('Error:', result.error);
    } else {
      console.log('Employee count:', result.data.totalEmployees);
      if (result.data.totalEmployees > 0) {
        console.log('First employee name:', result.data.employees[0].name);
      }
    }
    
  } catch (err) {
    console.error('Caught error:', err);
  }
}

debugEmptyResult();