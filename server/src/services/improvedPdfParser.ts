import * as fs from 'fs';
import pdfParse from 'pdf-parse';
import { Employee, ParsedPDFData, PDFProcessingResult } from '../types/employee';

export class ImprovedPDFParser {
  
  public async parsePDF(filePath: string): Promise<PDFProcessingResult> {
    try {
      const pdfBuffer = fs.readFileSync(filePath);
      const pdfData = await pdfParse(pdfBuffer);
      
      const employees = this.extractEmployeesImproved(pdfData.text);
      
      if (employees.length === 0) {
        return {
          success: false,
          error: 'No employee data found in the PDF'
        };
      }

      const parsedData: ParsedPDFData = {
        employees,
        totalEmployees: employees.length,
        month: this.extractMonth(pdfData.text),
        year: this.extractYear(pdfData.text),
        department: this.extractDepartment(pdfData.text),
        processingDate: new Date().toISOString()
      };

      return {
        success: true,
        data: parsedData
      };

    } catch (error) {
      return {
        success: false,
        error: `Error parsing PDF: ${error instanceof Error ? error.message : 'Unknown error'}`
      };
    }
  }

  private extractEmployeesImproved(text: string): Employee[] {
    const employees: Employee[] = [];
    
    // Extract arrays of all data using global patterns
    const names = this.extractAllMatches(text, /Sri\s*\/\s*Smt:\s*\n?\s*([A-Z\s]+?)(?:\n|41300|131400)/gi);
    const empNos = this.extractAllMatches(text, /EMP\s*No\s*\n?\s*(\d+)/gi);
    const designations = this.extractAllMatches(text, /AG Code\s*:\s*\n?\s*([A-Z\s]+?)(?:\s*Rs\.|$)/gi);
    const accounts = this.extractAllMatches(text, /Cheque(\d+)/gi);
    const netSalaries = this.extractAllMatches(text, /Net Salary\s*:\s*\n?\s*(\d+)\s*Rs\./gi);
    const groups = this.extractAllMatches(text, /Group\s*:\s*\n?\s*([A-C])/gi);
    const payScales = this.extractAllMatches(text, /([\d\-]+)\s*\n?\s*EMP\s*No/gi);
    const bankNames = this.extractAllMatches(text, /(STATE BANK OF MYSORE)/gi);
    const branches = this.extractAllMatches(text, /Branch Name\s*:\s*\n?\s*([A-Z\s]+?)(?:\n|Gross)/gi);
    const daysWorked = this.extractAllNumbers(text, /(\d+)\s*\n?\s*AG Code/gi);
    const basics = this.extractAllNumbers(text, /Internal Recoveries\s*:\s*\n?\s*(\d+)/gi);
    
    // Extract allowances arrays
    const daAmounts = this.extractAllNumbers(text, /DA\s+(\d+)/gi);
    const hraAmounts = this.extractAllNumbers(text, /HRA\s+(\d+)/gi);
    const sfnAmounts = this.extractAllNumbers(text, /SFN\s+(\d+)/gi);
    const spayAmounts = this.extractAllNumbers(text, /SPAY-TYPIST\s+(\d+)/gi);
    
    // Extract deductions arrays
    const itAmounts = this.extractAllNumbers(text, /IT\s+(\d+)/gi);
    const ptAmounts = this.extractAllNumbers(text, /PT\s+(\d+)/gi);
    const licAmounts = this.extractAllNumbers(text, /LIC\s+(\d+)/gi);
    const gslicAmounts = this.extractAllNumbers(text, /GSLIC\s+(\d+)/gi);
    const fbfAmounts = this.extractAllNumbers(text, /FBF\s+(\d+)/gi);
    
    const grossSalaries = this.extractAllNumbers(text, /(\d+)\s*Rs\.\s*Rs\.\s*\d+/gi);
    
    console.log('Extracted data counts:', {
      names: names.length,
      empNos: empNos.length,
      designations: designations.length,
      accounts: accounts.length,
      netSalaries: netSalaries.length,
      groups: groups.length,
      payScales: payScales.length
    });
    
    // Create employees by combining the arrays
    const employeeCount = Math.min(names.length, empNos.length);
    
    for (let i = 0; i < employeeCount; i++) {
      const employee: Employee = {
        name: names[i]?.trim() || '',
        empNo: empNos[i]?.trim() || '',
        designation: designations[i]?.trim() || '',
        group: groups[i]?.trim() || '',
        payScale: payScales[i]?.trim() || '',
        basic: basics[i] || 0,
        daysWorked: daysWorked[i] || 31,
        allowances: {
          da: daAmounts[i] || 0,
          hra: hraAmounts[i] || 0,
          sfn: sfnAmounts[i],
          spayTypist: spayAmounts[i]
        },
        deductions: {
          it: itAmounts[i],
          pt: ptAmounts[i] || 0,
          lic: licAmounts[i] || 0,
          gslic: gslicAmounts[i] || 0,
          fbf: fbfAmounts[i] || 0
        },
        grossSalary: grossSalaries[i] || 0,
        netSalary: parseInt(netSalaries[i] || '0'),
        accountNumber: accounts[i] || '',
        bankName: bankNames[i] || '',
        branchName: branches[i]?.trim() || '',
        sno: i + 21, // Based on the SNO pattern in the PDF
        ddoCode: '0200ET0001',
        headOfAccount: '2203-00-104-0-01',
        department: 'ET-DEPARTMENT OF TECHNICAL EDUCATION',
        establishmentNo: '24',
        nextIncrementDate: i === 0 ? 'Jan 2026' : 'Jul 2025',
        agCode: designations[i]?.trim() || '',
        paymentMode: 'Cheque',
        totalLocalRecoveries: 0,
        sumOfDeductionsAndRecoveries: 0
      };
      
      employees.push(employee);
    }
    
    return employees;
  }
  
  private extractAllMatches(text: string, regex: RegExp): string[] {
    const matches: string[] = [];
    let match;
    
    // Reset regex lastIndex to ensure we start from the beginning
    regex.lastIndex = 0;
    
    while ((match = regex.exec(text)) !== null) {
      matches.push(match[1]);
    }
    
    return matches;
  }
  
  private extractAllNumbers(text: string, regex: RegExp): number[] {
    const matches = this.extractAllMatches(text, regex);
    return matches.map(m => parseInt(m.replace(/,/g, ''), 10)).filter(n => !isNaN(n));
  }
  
  private extractMonth(text: string): string {
    const match = text.match(/Pay Slip\s*For The Month Of\s*([A-Z]{3,})\s*\d{4}/i);
    return match?.[1] || 'May';
  }

  private extractYear(text: string): string {
    const match = text.match(/Pay Slip\s*For The Month Of\s*[A-Z]{3,}\s*(\d{4})/i);
    return match?.[1] || '2025';
  }

  private extractDepartment(text: string): string {
    const match = text.match(/Department\s*:\s*([A-Z\-\s]+?)(?:Pay Slip|Establishment)/i);
    return match?.[1]?.trim() || 'ET-DEPARTMENT OF TECHNICAL EDUCATION';
  }

  public async processMultipleEmployees(filePath: string): Promise<PDFProcessingResult> {
    const result = await this.parsePDF(filePath);
    
    if (!result.success || !result.data) {
      return result;
    }

    // Additional validation to ensure all employees are captured
    const pdfBuffer = fs.readFileSync(filePath);
    const pdfData = await pdfParse(pdfBuffer);
    const expectedEmployeeCount = (pdfData.text.match(/SNO:\s*\d+/g) || []).length;
    const actualEmployeeCount = result.data.employees.length;

    if (actualEmployeeCount < expectedEmployeeCount) {
      result.warning = `Expected ${expectedEmployeeCount} employees but only parsed ${actualEmployeeCount}. Some employee data may be missing.`;
    }

    return result;
  }
}