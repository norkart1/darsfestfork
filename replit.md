# Jamia Dars Fest 2023-'24

## Overview
This is a Next.js web application for managing and displaying information about Jamia Dars Fest 2023-'24, an arts festival by Jami'a Nooriyya Arabic College. The application provides comprehensive search and filtering capabilities for candidates, programs, and dars (courses).

## Current State
✅ **Successfully configured for Replit environment**
- Next.js 14.0.0 application
- Running on port 5000 with proper host configuration (0.0.0.0)
- All dependencies installed and working
- Deployment configuration set up for production

## Project Architecture

### Tech Stack
- **Frontend**: Next.js 14.0.0 with React 18
- **Styling**: Tailwind CSS with custom theme
- **Data**: Static JSON files (FullData.json, sample.json)
- **Build System**: npm with Next.js toolchain

### Key Features
1. **Candidate Search** (`/`) - Search and filter candidates by various criteria
2. **Program Search** (`/program`) - Browse programs with candidate counts
3. **Dars Listings** (`/dars`) - Dars-wise program organization with Junior/Senior categories
4. **Zone Filtering** - Filter all data by geographic zones using localStorage
5. **Responsive Design** - Mobile-friendly interface with Tailwind CSS

### File Structure
```
app/
├── dars/           # Dars listings and detail pages
├── program/        # Program search and details
├── page.jsx        # Main candidate search page
├── layout.jsx      # Root layout with metadata
└── globals.css     # Global styles and Tailwind imports

components/
└── Headear.jsx     # Navigation header with zone selector

data/
├── FullData.json   # Complete dataset
└── sample.json     # Sample data subset
```

### Configuration
- **Next.js Config**: Configured for Replit environment with proper headers
- **Tailwind**: Custom color scheme (primary: #186F65, secondary: #d5e5e3)
- **Package Scripts**: Modified to bind to 0.0.0.0:5000 for Replit compatibility

## Recent Changes
- **2024-09-18**: Initial Replit setup
  - Fixed Next.js configuration for Replit environment
  - Updated package.json scripts for proper host binding
  - Fixed React warning for null select values
  - Configured deployment settings for production
  - Set up workflow for development server

## User Preferences
- No specific user preferences documented yet

## Development
- **Dev Server**: `npm run dev` (runs on 0.0.0.0:5000)
- **Build**: `npm run build`
- **Production**: `npm start`
- **Linting**: `npm run lint`

## Data Structure
The application uses a JSON dataset with the following key fields:
- `code`: Candidate identifier
- `name`: Candidate name
- `darsname`: Associated dars/course name
- `zone`: Geographic zone
- `category`: JUNIOR or SENIOR
- Various stage and offstage program fields