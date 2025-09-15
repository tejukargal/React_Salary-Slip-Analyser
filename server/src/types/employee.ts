export interface Employee {
  name: string;
  empNo: string;
  designation: string;
  group: string;
  payScale: string;
  basic: number;
  daysWorked: number;
  panNumber?: string;
  allowances: {
    da: number;
    hra: number;
    sfn?: number;
    spayTypist?: number;
    [key: string]: number | undefined;
  };
  deductions: {
    it?: number;
    pt?: number;
    lic?: number;
    gslic?: number;
    fbf?: number;
    [key: string]: number | undefined;
  };
  grossSalary: number;
  netSalary: number;
  accountNumber: string;
  bankName: string;
  branchName: string;
  sno?: number;
  ddoCode?: string;
  headOfAccount?: string;
  department?: string;
  establishmentNo?: string;
  nextIncrementDate?: string;
  gpfAccountNumber?: string;
  agCode?: string;
  paymentMode?: string;
  totalLocalRecoveries: number;
  sumOfDeductionsAndRecoveries: number;
}

export interface ParsedPDFData {
  employees: Employee[];
  totalEmployees: number;
  month: string;
  year: string;
  department: string;
  processingDate: string;
}

export interface PDFProcessingResult {
  success: boolean;
  data?: ParsedPDFData;
  error?: string;
  warning?: string;
}