import React from 'react';
import { Employee } from '../types/employee';

interface EmployeeTableProps {
  employees: Employee[];
}

export const EmployeeTable: React.FC<EmployeeTableProps> = ({ employees }) => {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0
    }).format(amount);
  };

  if (employees.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        No employee data available
      </div>
    );
  }

  return (
    <div className="w-full overflow-x-auto">
      <table className="min-w-full bg-white border border-gray-200 rounded-lg shadow-sm">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b">
              Employee Details
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b">
              Allowances
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b">
              Deductions
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b">
              Financial Summary
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b">
              Bank Details
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {employees.map((employee, index) => (
            <tr key={employee.empNo} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
              <td className="px-4 py-4 text-sm">
                <div className="space-y-1">
                  <div className="font-semibold text-gray-900">{employee.name}</div>
                  <div className="text-gray-600">Emp No: {employee.empNo}</div>
                  <div className="text-gray-600">{employee.designation}</div>
                  <div className="text-gray-600">Group: {employee.group}</div>
                  <div className="text-gray-600">Pay Scale: {employee.payScale}</div>
                  <div className="text-gray-600">Basic: {formatCurrency(employee.basic)}</div>
                </div>
              </td>
              <td className="px-4 py-4 text-sm">
                <div className="space-y-1">
                  {employee.allowances.da > 0 && (
                    <div>DA: {formatCurrency(employee.allowances.da)}</div>
                  )}
                  {employee.allowances.hra > 0 && (
                    <div>HRA: {formatCurrency(employee.allowances.hra)}</div>
                  )}
                  {employee.allowances.sfn && employee.allowances.sfn > 0 && (
                    <div>SFN: {formatCurrency(employee.allowances.sfn)}</div>
                  )}
                  {employee.allowances.spayTypist && employee.allowances.spayTypist > 0 && (
                    <div>SPAY-TYPIST: {formatCurrency(employee.allowances.spayTypist)}</div>
                  )}
                  {employee.allowances.p && employee.allowances.p > 0 && (
                    <div>P: {formatCurrency(employee.allowances.p)}</div>
                  )}
                  {(!employee.allowances.da && !employee.allowances.hra && !employee.allowances.sfn && !employee.allowances.spayTypist && !employee.allowances.p) && (
                    <div className="text-gray-500 italic">No allowances</div>
                  )}
                </div>
              </td>
              <td className="px-4 py-4 text-sm">
                <div className="space-y-1">
                  {(employee.deductions.it || 0) > 0 && (
                    <div>IT: {formatCurrency(employee.deductions.it || 0)}</div>
                  )}
                  {(employee.deductions.pt || 0) > 0 && (
                    <div>PT: {formatCurrency(employee.deductions.pt || 0)}</div>
                  )}
                  {(employee.deductions.lic || 0) > 0 && (
                    <div>LIC: {formatCurrency(employee.deductions.lic || 0)}</div>
                  )}
                  {(employee.deductions.gslic || 0) > 0 && (
                    <div>GSLIC: {formatCurrency(employee.deductions.gslic || 0)}</div>
                  )}
                  {(employee.deductions.fbf || 0) > 0 && (
                    <div>FBF: {formatCurrency(employee.deductions.fbf || 0)}</div>
                  )}
                  {(!(employee.deductions.it || 0) && !(employee.deductions.pt || 0) && !(employee.deductions.lic || 0) && !(employee.deductions.gslic || 0) && !(employee.deductions.fbf || 0)) && (
                    <div className="text-gray-500 italic">No deductions</div>
                  )}
                </div>
              </td>
              <td className="px-4 py-4 text-sm">
                <div className="space-y-1">
                  <div className="font-semibold">Gross: {formatCurrency(employee.grossSalary)}</div>
                  <div className="font-semibold text-green-600">
                    Net: {formatCurrency(employee.netSalary)}
                  </div>
                  <div className="text-gray-600">Days: {employee.daysWorked}</div>
                </div>
              </td>
              <td className="px-4 py-4 text-sm">
                <div className="space-y-1">
                  <div className="font-mono text-xs">{employee.accountNumber}</div>
                  <div>{employee.bankName}</div>
                  <div className="text-gray-600">{employee.branchName}</div>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};