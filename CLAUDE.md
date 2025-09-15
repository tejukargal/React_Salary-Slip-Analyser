# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a full-stack PDF salary extraction application with a React frontend and Node.js/Express backend. The application allows users to upload PDF files containing employee salary data, extracts structured information, and provides data visualization, filtering, and export capabilities.

## Development Commands

### Main Development
- `npm run dev` - Start both client and server in development mode
- `npm run build` - Build both client and server for production
- `npm run start` - Start production server
- `npm run install:all` - Install dependencies for root, server, and client

### Server Development (cd server)
- `npm run dev` - Start server with hot reload (ts-node-dev)
- `npm run build` - Compile TypeScript to dist/
- `npm run start` - Start compiled server
- `npm run lint` - Run ESLint on server code
- `npm run typecheck` - Run TypeScript type checking

### Client Development (cd client)
- `npm start` - Start React development server
- `npm run build` - Build React app for production
- `npm run test` - Run React tests
- `npm run lint` - Run ESLint on client code
- `npm run typecheck` - Run TypeScript type checking

## Architecture

### Frontend (React)
- Uses Create React App with TypeScript
- Tailwind CSS for styling
- Component-based architecture with:
  - `PDFUploader` - Handles file upload and parsing
  - `EmployeeTable` - Displays extracted employee data
  - `Statistics` - Shows data analytics and visualizations
  - `SearchAndFilter` - Provides filtering capabilities
  - `MinimizedUploader` - Compact upload component for re-upload
- Export functionality to CSV and PDF using jsPDF

### Backend (Node.js/Express)
- TypeScript server with Express framework
- PDF processing using `pdf-parse` and `pdfjs-dist`
- File upload handling with multer
- CORS enabled for development
- Structured PDF parsing with complex data extraction logic

### Data Flow
1. User uploads PDF via frontend
2. Backend processes PDF using custom parsing logic
3. Extracted data includes:
   - Employee information (name, ID, designation, group)
   - Salary details (basic, allowances, deductions)
   - Bank information (account, bank, branch)
   - Summary statistics (month, year, department)
4. Frontend displays data in tabular format with filtering and search
5. Data can be exported to CSV or PDF formats

## Key File Locations

### Server
- `server/src/index.ts` - Main Express server setup
- `server/src/routes/upload.ts` - PDF upload and processing endpoint
- `server/src/services/pdfExtractor.ts` - PDF parsing and data extraction logic
- `server/src/types/employee.ts` - TypeScript interfaces for employee data

### Client
- `client/src/App.tsx` - Main application component
- `client/src/components/` - React components directory
- `client/src/types/employee.ts` - TypeScript interfaces
- `client/src/utils/` - Utility functions for data processing

## PDF Processing

The application uses custom PDF parsing logic that:
- Handles various PDF formats and layouts
- Extracts employee salary information with high accuracy
- Processes allowances (DA, HRA, SFN, SPAY-TYPIST)
- Processes deductions (IT, PT, LIC, GSLIC, FBF)
- Calculates gross and net salary
- Extracts bank details and other employee information

## Development Notes

- Server runs on port 5000, client proxy is configured accordingly
- Static files are served from `client/build` in production
- TypeScript is used throughout the codebase
- Use `npm run install:all` when setting up the project initially
- PDF parsing logic is complex and handles edge cases for various salary slip formats