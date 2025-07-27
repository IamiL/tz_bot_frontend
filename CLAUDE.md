# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a React frontend application for a document analysis tool that processes technical specifications (TZ - техническое задание). The application allows users to upload Word documents (.doc/.docx), sends them to a backend API for analysis, and displays the results with synchronized error highlighting.

## Commands

### Development
- `npm run dev` - Start development server on port 3006
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint for code quality checks

### Testing
No specific test framework is configured. Check if tests are needed before adding new functionality.

## Architecture

### Application Flow
1. **Upload Phase** (`UploadPage`): Users upload .doc/.docx files via drag-and-drop or file picker
2. **Processing**: Files are sent to backend API at `http://localhost:8001/api/v1/tz` 
3. **Results Phase** (`DocPage2`): Displays processed document with error highlighting and synchronized scrolling

### Key Components

- **App.jsx**: Main component managing application state and phase transitions
- **UploadPage**: Handles file upload with validation and API communication
- **DocPage2**: Complex document viewer with error synchronization and interactive highlighting
- **mockDoc/**: Contains mock data for development and testing

### State Management
Uses React hooks for state management:
- `scanComplete`: Controls phase transition between upload and results
- `docText`: Stores processed document HTML content
- `docErrors`: Array of error objects with highlighting information

### Error Highlighting System
Documents contain `<span error-id="X">` elements that correspond to error objects. The system provides:
- Synchronized scrolling between document and error list
- Interactive hover effects
- Click-to-navigate functionality
- Mobile-responsive layout (hides error panel on mobile)

### Backend Integration
- API endpoint: `http://localhost:8001/api/v1/tz`
- Expects multipart/form-data with 'file' field
- Returns: `{text: string, errors: Array<{id, title, description}>}`

### File Validation
- Accepts only .doc and .docx files
- Validates both file extension and MIME type
- Error handling with user feedback

## Important Notes

- Uses Russian language UI
- Document content is rendered using `dangerouslySetInnerHTML`
- Error synchronization uses refs and scroll event listeners
- Mobile-first responsive design
- No authentication or session management