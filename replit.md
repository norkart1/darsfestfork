# Jamia Dars Fest 2023-'24

## Overview
This is a Next.js festival management application for Jamia Dars Fest 2023-'24. It provides candidate search, program listings, and dars-wise organization for an Arabic college arts festival. The app allows filtering by zones and categories (Junior/Senior).

## Current State
- **Status**: Fully configured and running in Replit environment
- **Port**: 5000 (development server)
- **Framework**: Next.js 14.0.0 with React 18, Tailwind CSS
- **Deployment**: Configured for autoscale deployment

## Project Architecture
- **Frontend**: Next.js App Router structure
- **Styling**: Tailwind CSS with custom color scheme (primary: #186F65, secondary: #d5e5e3)
- **Data**: JSON-based data storage in `/data/FullData.json`
- **Components**: Reusable header component with zone filtering

### Key Features
1. **Candidate Search**: Search by code, name, dars name, category, and programs
2. **Program Search**: Browse programs by category with candidate counts
3. **Dars Listings**: View programs organized by dars (courses) 
4. **Zone Filtering**: Filter content by different geographic zones
5. **Responsive Design**: Mobile-friendly interface

### File Structure
```
/app
  /dars - Dars-wise program listings
    /jr/[slug] - Junior category pages
    /sr/[slug] - Senior category pages
  /program - Program search and details
    /[slug] - Individual program pages
  layout.jsx - Root layout
  page.jsx - Main candidate search
  globals.css - Global styles

/components
  Headear.jsx - Navigation header with zone selector

/data
  FullData.json - Complete dataset
  sample.json - Sample data
```

## Recent Changes (2024-09-18)
- Successfully imported GitHub repository and configured for Replit environment
- Installed all dependencies and Node.js types
- Set up Next.js development server on 0.0.0.0:5000 with proper host configuration
- Configured PostgreSQL database with Drizzle ORM schema sync
- Implemented robust fallback system using local JSON data when database unavailable
- Fixed database connection issues and WebSocket compatibility
- Configured autoscale deployment with proper build settings
- Application running successfully with graceful error handling

## Dependencies
- Next.js 14.0.0
- React 18
- Tailwind CSS 3
- ESLint + Next.js config

## User Preferences
- Clean, functional setup without unnecessary additions
- Maintain existing project structure and conventions
- Focus on getting the application running properly in Replit