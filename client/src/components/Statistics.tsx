import React from 'react';
import { Employee } from '../types/employee';

interface StatisticsProps {
  employees: Employee[];
}

export const Statistics: React.FC<StatisticsProps> = ({ employees }) => {
  const calculateTotals = () => {
    const totals = employees.reduce(
      (acc, emp) => ({
        basic: acc.basic + (Number(emp.basic) || 0),
        da: acc.da + (Number(emp.allowances.da) || 0),
        hra: acc.hra + (Number(emp.allowances.hra) || 0),
        sfn: acc.sfn + (Number(emp.allowances.sfn) || 0),
        spayTypist: acc.spayTypist + (Number(emp.allowances.spayTypist) || 0),
        p: acc.p + (Number(emp.allowances.p) || 0),
        it: acc.it + (Number(emp.deductions.it) || 0),
        pt: acc.pt + (Number(emp.deductions.pt) || 0),
        lic: acc.lic + (Number(emp.deductions.lic) || 0),
        gslic: acc.gslic + (Number(emp.deductions.gslic) || 0),
        fbf: acc.fbf + (Number(emp.deductions.fbf) || 0)
      }),
      {
        basic: 0, da: 0, hra: 0, sfn: 0, spayTypist: 0, p: 0,
        it: 0, pt: 0, lic: 0, gslic: 0, fbf: 0
      }
    );

    // Calculate totals based on correct formulas
    const totalBasic = totals.basic;
    const totalAllowances = totals.da + totals.hra + totals.sfn + totals.spayTypist + totals.p;
    const totalGross = totalBasic + totalAllowances;
    const totalDeductions = totals.it + totals.pt + totals.lic + totals.gslic + totals.fbf;
    const totalNet = totalGross - totalDeductions;

    return {
      ...totals,
      totalBasic,
      totalAllowances,
      totalGross,
      totalDeductions,
      totalNet
    };
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const totals = calculateTotals();

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Statistics</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-blue-50 p-4 rounded-lg">
          <h3 className="text-sm font-medium text-blue-600 mb-2">Total Employees</h3>
          <p className="text-2xl font-bold text-blue-900">{employees.length}</p>
        </div>
        
        <div className="bg-green-50 p-4 rounded-lg">
          <h3 className="text-sm font-medium text-green-600 mb-2">Total Gross Salary</h3>
          <p className="text-2xl font-bold text-green-900">{formatCurrency(totals.totalGross)}</p>
        </div>

        <div className="bg-purple-50 p-4 rounded-lg">
          <h3 className="text-sm font-medium text-purple-600 mb-2">Total Net Salary</h3>
          <p className="text-2xl font-bold text-purple-900">{formatCurrency(totals.totalNet)}</p>
        </div>

        <div className="bg-red-50 p-4 rounded-lg">
          <h3 className="text-sm font-medium text-red-600 mb-2">Total Deductions</h3>
          <p className="text-2xl font-bold text-red-900">
            {formatCurrency(totals.totalDeductions)}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div>
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Allowances Breakdown</h3>
          <div className="space-y-3">
            {totals.basic > 0 && (
              <div className="flex justify-between py-2 px-4 bg-gray-50 rounded">
                <span className="font-medium">Basic Pay</span>
                <span className="font-bold text-green-600">{formatCurrency(totals.basic)}</span>
              </div>
            )}
            {totals.da > 0 && (
              <div className="flex justify-between py-2 px-4 bg-gray-50 rounded">
                <span className="font-medium">DA (Dearness Allowance)</span>
                <span className="font-bold text-green-600">{formatCurrency(totals.da)}</span>
              </div>
            )}
            {totals.hra > 0 && (
              <div className="flex justify-between py-2 px-4 bg-gray-50 rounded">
                <span className="font-medium">HRA (House Rent Allowance)</span>
                <span className="font-bold text-green-600">{formatCurrency(totals.hra)}</span>
              </div>
            )}
            {totals.sfn > 0 && (
              <div className="flex justify-between py-2 px-4 bg-gray-50 rounded">
                <span className="font-medium">SFN Allowance</span>
                <span className="font-bold text-green-600">{formatCurrency(totals.sfn)}</span>
              </div>
            )}
            {totals.spayTypist > 0 && (
              <div className="flex justify-between py-2 px-4 bg-gray-50 rounded">
                <span className="font-medium">Special Pay - Typist</span>
                <span className="font-bold text-green-600">{formatCurrency(totals.spayTypist)}</span>
              </div>
            )}
            {totals.p > 0 && (
              <div className="flex justify-between py-2 px-4 bg-gray-50 rounded">
                <span className="font-medium">P Allowance</span>
                <span className="font-bold text-green-600">{formatCurrency(totals.p)}</span>
              </div>
            )}
            <div className="flex justify-between py-3 px-4 bg-green-100 rounded border-t-2 border-green-300">
              <span className="font-bold text-green-800">Total Allowances</span>
              <span className="font-bold text-green-800">
                {formatCurrency(totals.totalAllowances)}
              </span>
            </div>
          </div>
        </div>

        <div>
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Deductions Breakdown</h3>
          <div className="space-y-3">
            {totals.it > 0 && (
              <div className="flex justify-between py-2 px-4 bg-gray-50 rounded">
                <span className="font-medium">IT (Income Tax)</span>
                <span className="font-bold text-red-600">{formatCurrency(totals.it)}</span>
              </div>
            )}
            {totals.pt > 0 && (
              <div className="flex justify-between py-2 px-4 bg-gray-50 rounded">
                <span className="font-medium">PT (Professional Tax)</span>
                <span className="font-bold text-red-600">{formatCurrency(totals.pt)}</span>
              </div>
            )}
            {totals.lic > 0 && (
              <div className="flex justify-between py-2 px-4 bg-gray-50 rounded">
                <span className="font-medium">LIC Premium</span>
                <span className="font-bold text-red-600">{formatCurrency(totals.lic)}</span>
              </div>
            )}
            {totals.gslic > 0 && (
              <div className="flex justify-between py-2 px-4 bg-gray-50 rounded">
                <span className="font-medium">GSLIC Premium</span>
                <span className="font-bold text-red-600">{formatCurrency(totals.gslic)}</span>
              </div>
            )}
            {totals.fbf > 0 && (
              <div className="flex justify-between py-2 px-4 bg-gray-50 rounded">
                <span className="font-medium">FBF (Festival Bonus Fund)</span>
                <span className="font-bold text-red-600">{formatCurrency(totals.fbf)}</span>
              </div>
            )}
            <div className="flex justify-between py-3 px-4 bg-red-100 rounded border-t-2 border-red-300">
              <span className="font-bold text-red-800">Total Deductions</span>
              <span className="font-bold text-red-800">
                {formatCurrency(totals.totalDeductions)}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};