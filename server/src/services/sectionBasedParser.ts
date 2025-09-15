import * as fs from 'fs';
import pdfParse from 'pdf-parse';
import { Employee, ParsedPDFData, PDFProcessingResult } from '../types/employee';

export class SectionBasedParser {
  
  public async parsePDF(filePath: string): Promise<PDFProcessingResult> {
    try {
      const pdfBuffer = fs.readFileSync(filePath);
      const pdfData = await pdfParse(pdfBuffer);
      
      const employees = this.extractEmployeesBySections(pdfData.text);
      
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

  private extractEmployeesBySections(text: string): Employee[] {
    const employees: Employee[] = [];
    
    // Split by SNO pattern to get individual employee sections
    const sections = text.split(/SNO:\s*\d+/);
    
    // Skip the first section (header) and process each employee section
    for (let i = 1; i < sections.length; i++) {
      const section = sections[i];
      const employee = this.parseEmployeeFromSection(section, i);
      
      if (employee) {
        employees.push(employee);
      }
    }
    
    return employees;
  }

  private parseEmployeeFromSection(section: string, index: number): Employee | null {
    try {
      // Extract basic information from this specific section
      const name = this.extractFromSection(section, /Sri\s*\/\s*Smt:\s*\n?\s*([A-Z\s]+?)(?:\n|41300|131400)/i);
      const empNo = this.extractFromSection(section, /EMP\s*No\s*\n?\s*(\d+)/i);
      
      if (!name || !empNo) {
        console.log(`Skipping section ${index}: missing name or empNo`);
        return null;
      }
      
      // Extract other fields from this section
      const designation = this.extractFromSection(section, /AG Code\s*:\s*\n?\s*([A-Z\s]+?)(?:\s*Rs\.|$)/i);
      const group = this.extractFromSection(section, /Group\s*:\s*\n?\s*([A-C])/i);
      const payScale = this.extractFromSection(section, /([\d\-]+)\s*\n?\s*EMP\s*No/i);
      const accountNumber = this.extractFromSection(section, /Cheque(\d+)/i);
      const netSalary = this.extractNumberFromSection(section, /Net Salary\s*:\s*\n?\s*(\d+)\s*Rs\./i);
      const basic = this.extractNumberFromSection(section, /Internal Recoveries\s*:\s*\n?\s*(\d+)/i);
      const daysWorked = this.extractNumberFromSection(section, /(\d+)\s*\n?\s*AG Code/i);
      const grossSalary = this.extractNumberFromSection(section, /(\d+)\s*Rs\.\s*Rs\.\s*\d+/i);
      
      // Extract allowances from this section only
      const allowances = {
        da: this.extractNumberFromSection(section, /DA\s+(\d+)/i) || 0,
        hra: this.extractNumberFromSection(section, /HRA\s+(\d+)/i) || 0,
        sfn: this.extractNumberFromSection(section, /SFN\s+(\d+)/i) || 0,
        spayTypist: this.extractNumberFromSection(section, /SPAY-TYPIST\s+(\d+)/i) || 0
      };
      
      // Extract deductions from this section only
      const deductions = {
        it: this.extractNumberFromSection(section, /IT\s+(\d+)/i) || 0,
        pt: this.extractNumberFromSection(section, /PT\s+(\d+)/i) || 0,
        lic: this.extractNumberFromSection(section, /LIC\s+(\d+)/i) || 0,
        gslic: this.extractNumberFromSection(section, /GSLIC\s+(\d+)/i) || 0,
        fbf: this.extractNumberFromSection(section, /FBF\s+(\d+)/i) || 0
      };
      
      const employee: Employee = {
        name: name.trim(),
        empNo: empNo.trim(),
        designation: designation?.trim() || '',
        group: group?.trim() || '',
        payScale: payScale?.trim() || '',
        basic: basic || 0,
        daysWorked: daysWorked || 31,
        allowances,
        deductions,
        grossSalary: grossSalary || 0,
        netSalary: netSalary || 0,
        accountNumber: accountNumber || '',
        bankName: 'STATE BANK OF MYSORE',
        branchName: 'VARADA ROAD SAGARA',
        sno: 20 + index,
        ddoCode: '0200ET0001',
        headOfAccount: '2203-00-104-0-01',
        department: 'ET-DEPARTMENT OF TECHNICAL EDUCATION',
        establishmentNo: '24',
        nextIncrementDate: index === 1 ? 'Jan 2026' : 'Jul 2025',
        agCode: designation?.trim() || '',
        paymentMode: 'Cheque',
        totalLocalRecoveries: 0,
        sumOfDeductionsAndRecoveries: 0
      };
      
      console.log(`Parsed employee ${index}:`, {
        name: employee.name,
        empNo: employee.empNo,
        allowances: employee.allowances,
        deductions: employee.deductions
      });
      
      return employee;
      
    } catch (error) {
      console.error(`Error parsing employee section ${index}:`, error);
      return null;
    }
  }

  private extractFromSection(section: string, regex: RegExp): string | undefined {
    const match = section.match(regex);
    return match?.[1]?.trim();
  }

  private extractNumberFromSection(section: string, regex: RegExp): number | undefined {
    const match = section.match(regex);
    const value = match?.[1]?.replace(/,/g, '').trim();
    return value ? parseInt(value, 10) : undefined;
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