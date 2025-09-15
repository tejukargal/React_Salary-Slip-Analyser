import * as fs from 'fs';
import pdfParse from 'pdf-parse';
import { Employee, ParsedPDFData, PDFProcessingResult } from '../types/employee';

export class PDFParser {
  
  public async parsePDF(filePath: string): Promise<PDFProcessingResult> {
    try {
      const pdfBuffer = fs.readFileSync(filePath);
      const pdfData = await pdfParse(pdfBuffer);
      
      const employees = this.extractEmployees(pdfData.text);
      
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

  private extractEmployees(text: string): Employee[] {
    const employees: Employee[] = [];
    
    // Split the text by employee entries (using SNO: pattern)
    const employeeSections = text.split(/SNO:\s*\d+/).filter(section => section.trim());
    
    // Skip the first section as it's usually before any employee data
    for (let i = 1; i < employeeSections.length; i++) {
      const employee = this.parseEmployeeSection(employeeSections[i], i);
      if (employee) {
        employees.push(employee);
      }
    }

    return employees;
  }

  private parseEmployeeSection(section: string, sectionIndex: number): Employee | null {
    try {
      // Extract basic employee information - need to account for newlines in the text
      const name = this.extractValue(section, /Sri\s*\/\s*Smt:\s*\n?\s*([A-Z\s]+?)(?:\n|41300|131400)/i);
      const empNo = this.extractValue(section, /EMP\s*No\s*\n?\s*(\d+)/i);
      const designation = this.extractValue(section, /AG Code\s*:\s*\n?\s*([A-Z\s]+?)(?:\s*Rs\.|$)/i);
      const group = this.extractValue(section, /Group\s*:\s*\n?\s*([A-C])/i);
      const payScale = this.extractValue(section, /([\d\-]+)\s*\n?\s*EMP\s*No/i);
      
      if (!name || !empNo) {
        return null; // Skip if essential data is missing
      }

      // Extract financial data - patterns adjusted for the actual PDF structure
      const basic = this.extractNumber(section, /Internal Recoveries\s*:\s*\n?\s*(\d+)/i) || 0;
      
      const grossSalary = this.extractNumber(section, /(\d+)\s*Rs\.\s*Rs\.\s*\d+/i) || 0;
      const netSalary = this.extractNumber(section, /Net Salary\s*:\s*\n?\s*(\d+)\s*Rs\./i) || 0;
      
      // Extract allowances
      const allowances = {
        da: this.extractNumber(section, /DA\s+(\d+)/i) || 0,
        hra: this.extractNumber(section, /HRA\s+(\d+)/i) || 0,
        sfn: this.extractNumber(section, /SFN\s+(\d+)/i),
        spayTypist: this.extractNumber(section, /SPAY-TYPIST\s+(\d+)/i)
      };

      // Extract deductions
      const deductions = {
        it: this.extractNumber(section, /IT\s+(\d+)/i),
        pt: this.extractNumber(section, /PT\s+(\d+)/i),
        lic: this.extractNumber(section, /LIC\s+(\d+)/i),
        gslic: this.extractNumber(section, /GSLIC\s+(\d+)/i),
        fbf: this.extractNumber(section, /FBF\s+(\d+)/i)
      };

      // Extract additional information
      const accountNumber = this.extractValue(section, /Cheque(\d+)/i) || '';
      const bankName = this.extractValue(section, /(STATE BANK OF MYSORE)/i) || '';
      const branchName = this.extractValue(section, /Branch Name\s*:\s*\n?\s*([A-Z\s]+?)(?:\n|Gross)/i) || '';
      const daysWorked = this.extractNumber(section, /(\d+)\s*\n?\s*AG Code/i) || 31;
      const panNumber = this.extractValue(section, /PAN Number\s*:\s*([A-Z0-9]*)/i);

      const employee: Employee = {
        name: name.trim(),
        empNo: empNo.trim(),
        designation: designation?.trim() || '',
        group: group?.trim() || '',
        payScale: payScale?.trim() || '',
        basic,
        daysWorked,
        panNumber,
        allowances,
        deductions,
        grossSalary,
        netSalary,
        accountNumber,
        bankName: bankName.trim(),
        branchName: branchName.trim(),
        sno: this.extractNumber(section, /SNO:\s*(\d+)/i),
        ddoCode: this.extractValue(section, /DDO Code\s*:\s*([A-Z0-9]+)/i),
        headOfAccount: this.extractValue(section, /Head Of Account:\s*([\d\-]+)/i),
        department: this.extractValue(section, /Department\s*:\s*([A-Z\-\s]+?)(?:Pay Slip|Establishment)/i),
        establishmentNo: this.extractValue(section, /Establishment No\/Name\s*:\s*([^\/\n]+)/i),
        nextIncrementDate: this.extractValue(section, /Next Increment Date:\s*([A-Z]{3}\s*\d{4})/i),
        gpfAccountNumber: this.extractValue(section, /GPF Account Number:\s*(\d+)/i),
        agCode: this.extractValue(section, /AG Code\s*:\s*([A-Z0-9]*)/i),
        paymentMode: this.extractValue(section, /Payment Mode:\s*([A-Z]+)/i),
        totalLocalRecoveries: this.extractNumber(section, /Total Local Recoveries:\s*Rs\.\s*(\d+)/i) || 0,
        sumOfDeductionsAndRecoveries: this.extractNumber(section, /sum of deductions &Recoveries\s*:\s*Rs\.\s*(\d+)/i) || 0
      };

      return employee;

    } catch (error) {
      console.error('Error parsing employee section:', error);
      return null;
    }
  }

  private extractValue(text: string, regex: RegExp): string | undefined {
    const match = text.match(regex);
    return match?.[1]?.trim();
  }

  private extractNumber(text: string, regex: RegExp): number | undefined {
    const match = text.match(regex);
    const value = match?.[1]?.replace(/,/g, '').trim();
    return value ? parseInt(value, 10) : undefined;
  }

  private extractMonth(text: string): string {
    const match = text.match(/Pay Slip For The Month Of\s+([A-Z]{3,})\s+\d{4}/i);
    return match?.[1] || 'Unknown';
  }

  private extractYear(text: string): string {
    const match = text.match(/Pay Slip For The Month Of\s+[A-Z]{3,}\s+(\d{4})/i);
    return match?.[1] || 'Unknown';
  }

  private extractDepartment(text: string): string {
    const match = text.match(/Department\s*:\s*([A-Z\-\s]+?)(?:Pay Slip|Establishment)/i);
    return match?.[1]?.trim() || 'Unknown';
  }

  public async processMultipleEmployees(filePath: string): Promise<PDFProcessingResult> {
    const result = await this.parsePDF(filePath);
    
    if (!result.success || !result.data) {
      return result;
    }

    // Additional validation to ensure all employees are captured
    const text = fs.readFileSync(filePath).toString();
    const expectedEmployeeCount = (text.match(/SNO:\s*\d+/g) || []).length;
    const actualEmployeeCount = result.data.employees.length;

    if (actualEmployeeCount < expectedEmployeeCount) {
      result.warning = `Expected ${expectedEmployeeCount} employees but only parsed ${actualEmployeeCount}. Some employee data may be missing.`;
    }

    return result;
  }
}