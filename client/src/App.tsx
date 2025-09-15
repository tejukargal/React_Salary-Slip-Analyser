import React, { useState, useMemo } from 'react';
import { PDFUploader } from './components/PDFUploader';
import { EmployeeTable } from './components/EmployeeTable';
import { Statistics } from './components/Statistics';
import { SearchAndFilter } from './components/SearchAndFilter';
import { Employee } from './types/employee';
import './App.css';

function App() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [summary, setSummary] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<'data' | 'statistics'>('data');
  const [searchTerm, setSearchTerm] = useState('');
  const [groupFilter, setGroupFilter] = useState('');
  const [designationFilter, setDesignationFilter] = useState('');

  const handleDataParsed = (employeeData: Employee[], summaryData: any) => {
    setEmployees(employeeData);
    setSummary(summaryData);
    setActiveTab('data'); // Switch to data tab when new data is loaded
  };

  // Filter employees based on search and filter criteria
  const filteredEmployees = useMemo(() => {
    return employees.filter(emp => {
      const matchesSearch = !searchTerm || 
        emp.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        emp.empNo.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesGroup = !groupFilter || emp.group === groupFilter;
      const matchesDesignation = !designationFilter || emp.designation === designationFilter;
      
      return matchesSearch && matchesGroup && matchesDesignation;
    });
  }, [employees, searchTerm, groupFilter, designationFilter]);

  const exportToCSV = () => {
    if (filteredEmployees.length === 0) return;

    const headers = [
      'Name', 'Employee No', 'Designation', 'Group', 'Pay Scale', 'Basic',
      'DA', 'HRA', 'SFN', 'SPAY-TYPIST', 'IT', 'PT', 'LIC', 'GSLIC', 'FBF',
      'Gross Salary', 'Net Salary', 'Account Number', 'Bank Name', 'Branch Name'
    ];

    const csvContent = [
      headers.join(','),
      ...filteredEmployees.map(emp => [
        `"${emp.name}"`,
        `"${emp.empNo}"`,
        `"${emp.designation}"`,
        `"${emp.group}"`,
        `"${emp.payScale}"`,
        emp.basic,
        emp.allowances.da || 0,
        emp.allowances.hra || 0,
        emp.allowances.sfn || 0,
        emp.allowances.spayTypist || 0,
        emp.deductions.it || 0,
        emp.deductions.pt || 0,
        emp.deductions.lic || 0,
        emp.deductions.gslic || 0,
        emp.deductions.fbf || 0,
        emp.grossSalary,
        emp.netSalary,
        `"${emp.accountNumber}"`,
        `"${emp.bankName}"`,
        `"${emp.branchName}"`
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `salary_data_${summary?.month}_${summary?.year}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const exportToPDF = () => {
    if (filteredEmployees.length === 0) return;

    import('jspdf').then((jsPDFModule) => {
      const jsPDF = jsPDFModule.default || jsPDFModule;
      import('jspdf-autotable').then(() => {
        const doc = new jsPDF('l', 'mm', 'a4'); // landscape mode for better table fit
        
        // Add title
        doc.setFontSize(16);
        doc.text('Employee Salary Report', 14, 15);
        doc.setFontSize(12);
        doc.text(`${summary?.department}`, 14, 25);
        doc.text(`${summary?.month} ${summary?.year}`, 14, 35);
        doc.text(`Total Employees: ${filteredEmployees.length}`, 14, 45);

        // Create table data
        const headers = [['Name', 'Emp No', 'Designation', 'Group', 'Basic', 'Allowances', 'Deductions', 'Gross', 'Net', 'Account']];
        
        const tableData = filteredEmployees.map(emp => {
          const allowancesList = [];
          if (emp.allowances.da && emp.allowances.da > 0) allowancesList.push(`DA: ₹${emp.allowances.da}`);
          if (emp.allowances.hra && emp.allowances.hra > 0) allowancesList.push(`HRA: ₹${emp.allowances.hra}`);
          if (emp.allowances.sfn && emp.allowances.sfn > 0) allowancesList.push(`SFN: ₹${emp.allowances.sfn}`);
          if (emp.allowances.spayTypist && emp.allowances.spayTypist > 0) allowancesList.push(`SPAY: ₹${emp.allowances.spayTypist}`);
          
          const deductionsList = [];
          if (emp.deductions.it && emp.deductions.it > 0) deductionsList.push(`IT: ₹${emp.deductions.it}`);
          if (emp.deductions.pt && emp.deductions.pt > 0) deductionsList.push(`PT: ₹${emp.deductions.pt}`);
          if (emp.deductions.lic && emp.deductions.lic > 0) deductionsList.push(`LIC: ₹${emp.deductions.lic}`);
          if (emp.deductions.gslic && emp.deductions.gslic > 0) deductionsList.push(`GSLIC: ₹${emp.deductions.gslic}`);
          if (emp.deductions.fbf && emp.deductions.fbf > 0) deductionsList.push(`FBF: ₹${emp.deductions.fbf}`);

          return [
            emp.name,
            emp.empNo,
            emp.designation,
            emp.group,
            `₹${emp.basic}`,
            allowancesList.join('\n') || 'None',
            deductionsList.join('\n') || 'None',
            `₹${emp.grossSalary}`,
            `₹${emp.netSalary}`,
            emp.accountNumber
          ];
        });

        // Add table
        (doc as any).autoTable({
          head: headers,
          body: tableData,
          startY: 55,
          styles: { fontSize: 8, cellPadding: 2 },
          headStyles: { fillColor: [66, 139, 202] },
          columnStyles: {
            0: { cellWidth: 25 }, // Name
            1: { cellWidth: 20 }, // Emp No
            2: { cellWidth: 25 }, // Designation
            3: { cellWidth: 10 }, // Group
            4: { cellWidth: 15 }, // Basic
            5: { cellWidth: 35 }, // Allowances
            6: { cellWidth: 35 }, // Deductions
            7: { cellWidth: 18 }, // Gross
            8: { cellWidth: 18 }, // Net
            9: { cellWidth: 25 }  // Account
          }
        });

        doc.save(`salary_data_${summary?.month}_${summary?.year}.pdf`);
      });
    });
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Show full uploader only when no data is loaded */}
      {!summary && (
        <div className="container mx-auto py-8">
          <PDFUploader onDataParsed={handleDataParsed} />
        </div>
      )}

      
      {summary && (
        <div className="container mx-auto py-8">
          {/* Header with Tabs */}
          <div className="bg-white p-6 rounded-lg shadow-sm mb-6">
            <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center mb-6">
              <div>
                <h1 className="text-3xl font-bold text-gray-800 mb-2">
                  Employee Salary Dashboard
                </h1>
                <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                  <span>Month: <strong>{summary.month} {summary.year}</strong></span>
                  <span>Department: <strong>{summary.department}</strong></span>
                  <span>Total Employees: <strong>{employees.length}</strong></span>
                  {filteredEmployees.length !== employees.length && (
                    <span>Filtered: <strong>{filteredEmployees.length}</strong></span>
                  )}
                </div>
              </div>
              
              <div className="flex items-center gap-4 mt-4 lg:mt-0">
                <button
                  onClick={() => {
                    setEmployees([]);
                    setSummary(null);
                    setSearchTerm('');
                    setGroupFilter('');
                    setDesignationFilter('');
                  }}
                  className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors flex items-center gap-2"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                  </svg>
                  Upload New PDF
                </button>
                
                <button
                  onClick={exportToCSV}
                  className="bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded-lg transition-colors flex items-center gap-2"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  Export CSV
                </button>
                
                <button
                  onClick={exportToPDF}
                  className="bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-4 rounded-lg transition-colors flex items-center gap-2"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                  </svg>
                  Export PDF
                </button>
              </div>
            </div>

            {/* Tab Navigation */}
            <div className="flex border-b border-gray-200">
              <button
                onClick={() => setActiveTab('data')}
                className={`px-6 py-3 font-medium text-sm border-b-2 transition-colors ${
                  activeTab === 'data'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                Employee Data ({filteredEmployees.length})
              </button>
              <button
                onClick={() => setActiveTab('statistics')}
                className={`px-6 py-3 font-medium text-sm border-b-2 transition-colors ${
                  activeTab === 'statistics'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                Statistics
              </button>
            </div>
          </div>

          {/* Tab Content */}
          {activeTab === 'data' && (
            <>
              <SearchAndFilter
                employees={employees}
                searchTerm={searchTerm}
                onSearchChange={setSearchTerm}
                groupFilter={groupFilter}
                onGroupFilterChange={setGroupFilter}
                designationFilter={designationFilter}
                onDesignationFilterChange={setDesignationFilter}
              />
              
              <div className="bg-white rounded-lg shadow-sm">
                <EmployeeTable employees={filteredEmployees} />
              </div>
            </>
          )}

          {activeTab === 'statistics' && (
            <Statistics employees={employees} />
          )}
        </div>
      )}
    </div>
  );
}

export default App;