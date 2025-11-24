# Eagle - Construction Drawing Review Application

A React + TypeScript application for reviewing construction drawings with issue tracking capabilities.

## Prerequisites

- **Node.js** (v18 or higher recommended)
- **npm** or **yarn** or **pnpm** package manager

## Installation Steps

1. **Install dependencies:**
   ```bash
   npm install
   ```
   or
   ```bash
   yarn install
   ```
   or
   ```bash
   pnpm install
   ```

2. **Start the development server:**
   ```bash
   npm run dev
   ```
   or
   ```bash
   yarn dev
   ```
   or
   ```bash
   pnpm dev
   ```

4. **Open your browser:**
   
   The application will be available at `http://localhost:5173` (or the port shown in the terminal).

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## Project Structure

- `App.tsx` - Main application component with routing logic
- `components/` - React components
  - `HomePage.tsx` - Landing page
  - `LoginPage.tsx` - Login page
  - `Dashboard.tsx` - Project dashboard
  - `ProjectView.tsx` - Project detail view with PDF viewer
  - `PDFViewer.tsx` - PDF rendering component
  - `IssueSidebar.tsx` - Issue management sidebar
  - `CommentModal.tsx` - Comment/issue modal
  - `ui/` - shadcn/ui components
- `styles/globals.css` - Global styles and Tailwind CSS configuration

## Technologies Used

- **React 18** - UI framework
- **TypeScript** - Type safety
- **Vite** - Build tool and dev server
- **Tailwind CSS** - Styling
- **Radix UI** - Accessible component primitives
- **shadcn/ui** - UI component library
- **Lucide React** - Icons
- **PDF.js** - PDF rendering
- **React Hook Form** - Form management

## Notes

- The application uses mock authentication - any email/password will work
- Use an email containing "senior" to login as a senior engineer
- PDF.js is loaded via CDN in the PDFViewer component, but pdfjs-dist is also included in dependencies for potential future use

