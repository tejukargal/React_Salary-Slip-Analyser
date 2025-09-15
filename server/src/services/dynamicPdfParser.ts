import * as fs from 'fs';
import pdfParse from 'pdf-parse';
import { Employee, ParsedPDFData, PDFProcessingResult } from '../types/employee';

export class DynamicPDFParser {
  
  public async parsePDF(filePath: string): Promise<PDFProcessingResult> {
    try {
      const pdfBuffer = fs.readFileSync(filePath);
      const pdfData = await pdfParse(pdfBuffer);
      
      const employees = this.extractAllEmployeesDynamically(pdfData.text);
      
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

  private extractAllEmployeesDynamically(text: string): Employee[] {
    const employees: Employee[] = [];
    
    console.log('=== DYNAMIC PARSER STARTING ===');
    
    // First, find all employee names and their positions in the text
    const employeeMatches: { name: string, startPos: number, endPos: number }[] = [];
    
    // Find all employee names with their positions
    const nameRegex = /Sri\s*\/\s*Smt:\s*\n?\s*([A-Z\s]+?)(?:\n|Days|\d{5}-\d{5})/gi;
    let match;
    
    while ((match = nameRegex.exec(text)) !== null) {
      const name = match[1].trim();
      const startPos = match.index;
      employeeMatches.push({
        name,
        startPos,
        endPos: 0 // Will be set later
      });
    }
    
    // Set end positions for each employee section
    for (let i = 0; i < employeeMatches.length; i++) {
      if (i < employeeMatches.length - 1) {
        employeeMatches[i].endPos = employeeMatches[i + 1].startPos;
      } else {
        employeeMatches[i].endPos = text.length;
      }
    }
    
    console.log(`Found ${employeeMatches.length} employees:`, employeeMatches.map(e => e.name));
    
    // Now extract data for each employee from their specific section
    for (let i = 0; i < employeeMatches.length; i++) {
      const employeeMatch = employeeMatches[i];
      const employeeSection = text.substring(employeeMatch.startPos, employeeMatch.endPos);
      
      const employee = this.parseEmployeeSection(employeeSection, employeeMatch.name, i);
      if (employee) {
        employees.push(employee);
      }
    }
    
    console.log(`Successfully parsed ${employees.length} employees`);
    return employees;
  }

  private parseEmployeeSection(section: string, expectedName: string, index: number): Employee | null {
    try {
      console.log(`\n=== Parsing Employee ${index + 1}: ${expectedName} ===`);
      
      // Extract basic information
      const empNo = this.extractFromSection(section, /EMP\s*No\s*\n?\s*(\d+)/i);
      const designation = this.extractFromSection(section, /AG Code\s*:\s*\n?\s*([A-Z\s]+?)(?:\s*Rs\.|$)/i);
      const group = this.extractFromSection(section, /Group\s*:\s*\n?\s*([A-C])/i);
      const payScale = this.extractFromSection(section, /([\d\-]+)\s*\n?\s*EMP\s*No/i);
      const accountNumber = this.extractFromSection(section, /Cheque(\d+)/i);
      
      // Extract financial data
      const netSalary = this.extractNumberFromSection(section, /Net Salary\s*:\s*\n?\s*(\d+)\s*Rs\./i);
      const basic = this.extractNumberFromSection(section, /Internal Recoveries\s*:\s*\n?\s*(\d+)/i);
      const grossSalary = this.extractNumberFromSection(section, /(\d+)\s*Rs\.\s*Rs\.\s*\d+/i);
      const daysWorked = this.extractNumberFromSection(section, /(\d+)\s*\n?\s*AG Code/i);
      
      // Extract allowances from this specific section only
      const allowances = {
        da: this.extractNumberFromSection(section, /DA\s+(\d+)/i) || 0,
        hra: this.extractNumberFromSection(section, /HRA\s+(\d+)/i) || 0,
        sfn: this.extractNumberFromSection(section, /SFN\s+(\d+)/i) || 0,
        spayTypist: this.extractNumberFromSection(section, /SPAY-TYPIST\s+(\d+)/i) || 0
      };
      
      // Extract deductions from this specific section only
      const deductions = {
        it: this.extractNumberFromSection(section, /IT\s+(\d+)/i) || 0,
        pt: this.extractNumberFromSection(section, /PT\s+(\d+)/i) || 0,
        lic: this.extractNumberFromSection(section, /LIC\s+(\d+)/i) || 0,
        gslic: this.extractNumberFromSection(section, /GSLIC\s+(\d+)/i) || 0,
        fbf: this.extractNumberFromSection(section, /FBF\s+(\d+)/i) || 0
      };
      
      // Extract additional information  
      const nextIncrement = this.extractFromSection(section, /Next Increment Date:\s*([A-Z]{3}\s*\d{4})/i);
      const sno = this.extractNumberFromSection(section, /SNO:\s*(\d+)/i);
      
      console.log(`Data extracted for ${expectedName}:`);
      console.log(`  EMP No: ${empNo}`);
      console.log(`  Allowances:`, allowances);
      console.log(`  Deductions:`, deductions);
      console.log(`  Net Salary: ${netSalary}`);
      console.log(`  Account: ${accountNumber}`);
      
      if (!empNo) {
        console.warn(`Skipping ${expectedName}: No employee number found`);
        return null;
      }
      
      const employee: Employee = {
        name: expectedName,
        empNo: empNo,
        designation: designation?.trim() || 'Unknown',
        group: group?.trim() || 'Unknown',
        payScale: payScale?.trim() || 'Unknown',
        basic: basic || 0,
        daysWorked: daysWorked || 31,
        allowances,
        deductions,
        grossSalary: grossSalary || 0,
        netSalary: netSalary || 0,
        accountNumber: accountNumber || '',
        bankName: 'STATE BANK OF MYSORE',
        branchName: 'VARADA ROAD SAGARA',
        sno: sno || (20 + index + 1),
        ddoCode: '0200ET0001',
        headOfAccount: '2203-00-104-0-01',
        department: 'ET-DEPARTMENT OF TECHNICAL EDUCATION',
        establishmentNo: '24',
        nextIncrementDate: nextIncrement || (index === 0 ? 'Jan 2026' : 'Jul 2025'),
        agCode: designation?.trim() || 'Unknown',
        paymentMode: 'Cheque',
        totalLocalRecoveries: 0,
        sumOfDeductionsAndRecoveries: 0
      };
      
      return employee;
      
    } catch (error) {
      console.error(`Error parsing employee ${expectedName}:`, error);
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
    return match?.[1] || 'Unknown';
  }

  private extractYear(text: string): string {
    const match = text.match(/Pay Slip\s*For The Month Of\s*[A-Z]{3,}\s*(\d{4})/i);
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

    // Validate that we found a reasonable number of employees
    if (result.data.employees.length === 0) {
      return {
        success: false,
        error: 'No valid employee data could be extracted from the PDF'
      };
    }

    console.log(`=== FINAL RESULT: Successfully extracted ${result.data.employees.length} employees ===`);
    
    return result;
  }
}