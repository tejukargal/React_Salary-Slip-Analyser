import React from 'react';
import { Employee } from '../types/employee';

interface SearchAndFilterProps {
  employees: Employee[];
  searchTerm: string;
  onSearchChange: (term: string) => void;
  groupFilter: string;
  onGroupFilterChange: (group: string) => void;
  designationFilter: string;
  onDesignationFilterChange: (designation: string) => void;
}

export const SearchAndFilter: React.FC<SearchAndFilterProps> = ({
  employees,
  searchTerm,
  onSearchChange,
  groupFilter,
  onGroupFilterChange,
  designationFilter,
  onDesignationFilterChange
}) => {
  // Get unique groups and designations for filter options
  const uniqueGroups = Array.from(new Set(employees.map(emp => emp.group))).filter(Boolean).sort();
  const uniqueDesignations = Array.from(new Set(employees.map(emp => emp.designation))).filter(Boolean).sort();

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm mb-6">
      <h3 className="text-lg font-semibold text-gray-800 mb-4">Search & Filter</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Search Input */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Search by Name or Employee Number
          </label>
          <div className="relative">
            <input
              type="text"
              placeholder="Enter name or employee number..."
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <div className="absolute inset-y-0 right-0 flex items-center pr-3">
              <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          </div>
        </div>

        {/* Group Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Filter by Group
          </label>
          <select
            value={groupFilter}
            onChange={(e) => onGroupFilterChange(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">All Groups</option>
            {uniqueGroups.map(group => (
              <option key={group} value={group}>{group}</option>
            ))}
          </select>
        </div>

        {/* Designation Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Filter by Designation
          </label>
          <select
            value={designationFilter}
            onChange={(e) => onDesignationFilterChange(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">All Designations</option>
            {uniqueDesignations.map(designation => (
              <option key={designation} value={designation}>{designation}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Clear Filters Button */}
      {(searchTerm || groupFilter || designationFilter) && (
        <div className="mt-4">
          <button
            onClick={() => {
              onSearchChange('');
              onGroupFilterChange('');
              onDesignationFilterChange('');
            }}
            className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800 border border-gray-300 hover:border-gray-400 rounded-lg transition-colors"
          >
            Clear All Filters
          </button>
        </div>
      )}
    </div>
  );
};