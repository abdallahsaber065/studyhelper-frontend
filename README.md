# Study Helper Frontend

A modern Next.js frontend for the Study Helper AI-powered learning platform.

## 🚀 Getting Started

### Prerequisites

- Node.js 18.18 or later
- npm or yarn package manager

### Installation

1. Clone the repository and navigate to the frontend directory:

    ```bash
    cd frontend
    ```

2. Install dependencies:

    ```bash
    npm install
    ```

3. Set up environment variables:

    ```bash
    cp .env.local.example .env.local
    ```

    Edit `.env.local` with your configuration:

    ```env
    NEXT_PUBLIC_API_BASE_URL=http://localhost:8000
    NEXT_PUBLIC_APP_NAME="Study Helper"
    NEXT_PUBLIC_APP_VERSION="1.0.0"
    ```

4. Run the development server:

    ```bash
    npm run dev
    ```

5. Open [http://localhost:3000](http://localhost:3000) in your browser.

## 📁 Project Structure

```plaintext
frontend/
├── app/                 # Next.js App Router pages
│   ├── auth/           # Authentication pages (login, register)
│   ├── dashboard/      # Dashboard page
│   ├── demo/           # Development demo page
│   ├── layout.tsx      # Root layout
│   ├── page.tsx        # Landing page
│   └── globals.css     # Global styles
├── components/         # React components
│   └── ui/            # Reusable UI components (Button, etc.)
├── lib/               # Utility functions
│   ├── api-client.ts  # Axios API client
│   ├── health-check.ts # API health check utility
│   └── utils.ts       # General utilities
├── hooks/             # Custom React hooks (for Phase 1+)
├── services/          # API service functions (for Phase 1+)
├── store/             # State management (for Phase 1+)
├── types/             # TypeScript type definitions (for Phase 1+)
└── utils/             # Additional utility functions (for Phase 1+)
```

## 🛠 Technology Stack

- **Framework**: [Next.js 15](https://nextjs.org/) with App Router
- **Language**: TypeScript
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **UI Components**: [Radix UI](https://www.radix-ui.com/) primitives
- **Component Library**: Custom components built with class-variance-authority
- **State Management**: [Zustand](https://zustand-demo.pmnd.rs/) (ready for Phase 1)
- **HTTP Client**: [Axios](https://axios-http.com/)
- **Icons**: [Lucide React](https://lucide.dev/)

## 🎨 UI Design Features

### Landing Page

- **Modern Hero Section**: Gradient background with compelling messaging
- **Feature Showcase**: Six feature cards with gradient backgrounds and icons
- **Professional Layout**: Clean typography, proper spacing, and visual hierarchy
- **Responsive Design**: Optimized for all screen sizes
- **Call-to-Action**: Clear navigation to registration and demo pages

### Authentication Pages

- **Split Layout**: Side-by-side branding and form sections
- **Visual Branding**: Gradient backgrounds with feature highlights
- **Phase Indicators**: Clear communication about upcoming functionality
- **Benefits Preview**: Detailed feature lists and value propositions
- **Smooth Navigation**: Easy movement between login, register, and main pages

### Dashboard

- **Professional Header**: Clean navigation with action buttons
- **Welcome Section**: Gradient hero with quick actions
- **Statistics Cards**: Visual stats display (ready for real data)
- **Feature Grid**: Organized sections for each development phase
- **Phase Tracking**: Visual indicators showing development progress
- **Sidebar Actions**: Quick access to important functionality

### Demo Page

- **Development Tracking**: Visual progress tracker for all phases
- **API Health Check**: Real-time backend connectivity monitoring
- **Interactive Cards**: Hover effects and status indicators
- **Phase Management**: Clear completion status and navigation
- **Modern Interface**: Professional design suitable for development use

## 📋 Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run prettier-fix` - Format code with Prettier

## 🚧 Development Phases

This project is being developed in phases as outlined in the implementation guide:

- ✅ **Phase 0**: Project Setup & Initial Configuration (COMPLETED)
  - ✅ Next.js project initialization with TypeScript
  - ✅ Tailwind CSS configuration and custom design system
  - ✅ UI component library setup (Button, utilities)
  - ✅ API client configuration with interceptors
  - ✅ Modern landing page with feature showcase
  - ✅ Professional authentication page designs
  - ✅ Comprehensive dashboard layout
  - ✅ Development demo page with phase tracking
  - ✅ Environment configuration and build optimization

- 🔄 **Phase 1**: Authentication & User Management (NEXT)
- ⏳ **Phase 2**: File Management
- ⏳ **Phase 3**: AI-Powered Content Generation
- ⏳ **Phase 4**: MCQs, Quizzes, and Sessions
- ⏳ **Phase 5**: Communities & Collaboration
- ⏳ **Phase 6**: Content Interactions
- ⏳ **Phase 7**: User Preferences & Notifications
- ⏳ **Phase 8**: Content Versioning & Analytics
- ⏳ **Phase 9**: Admin Panel
- ⏳ **Phase 10**: Finalization & Deployment

## 🔗 API Integration

The frontend connects to the FastAPI backend running on `http://localhost:8000` by default. The API client is configured with:

- **Automatic JWT token handling**: Request interceptors add authentication headers
- **Error handling**: Response interceptors manage 401 redirects
- **Health checking**: Real-time API connectivity monitoring
- **Environment configuration**: Flexible backend URL configuration

## 📱 Responsive Design

The application is fully responsive with:

- **Mobile-first approach**: Designed for mobile and scaled up
- **Breakpoint optimization**: Tailored layouts for different screen sizes
- **Touch-friendly**: Appropriate button sizes and spacing
- **Performance**: Optimized images and lazy loading

## 🎯 Key Features Implemented

### Modern UI Components

- Custom Button component with variants and sizes
- Gradient backgrounds and hover effects
- Icon integration with Lucide React
- Dark mode support (CSS custom properties ready)

### Professional Layout

- Consistent spacing and typography
- Visual hierarchy with proper contrast
- Loading states and interactive feedback
- Status indicators and progress tracking

### Developer Experience

- TypeScript strict mode enabled
- ESLint and Prettier configuration
- Hot reload and fast refresh
- Path aliases for clean imports

## 📝 Code Style

- **ESLint**: Configured with Next.js recommended rules
- **Prettier**: Consistent code formatting
- **TypeScript**: Strict mode with comprehensive type checking
- **Conventions**: Clear naming patterns and component structure

## 🔧 Configuration

### Tailwind CSS

- Custom color palette with CSS custom properties
- Extended theme with consistent spacing
- Component-friendly utility classes
- Dark mode support built-in

### TypeScript

- Strict compilation settings
- Path aliases for clean imports
- Comprehensive type checking
- Next.js specific configurations

## 🤝 Contributing

1. Follow the phase-by-phase development approach
2. Run `npm run lint` before committing
3. Use `npm run prettier-fix` to format code
4. Ensure TypeScript types are properly defined
5. Test on multiple screen sizes for responsiveness
6. Maintain consistent design patterns

## 📚 Documentation

- [Next.js Documentation](https://nextjs.org/docs)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [Radix UI Documentation](https://www.radix-ui.com/primitives)
- [Lucide React Icons](https://lucide.dev/)

## 🏁 Phase 0 Completion Summary

Phase 0 has been successfully completed with the following achievements:

### ✅ Technical Setup

- Next.js 15 with App Router
- TypeScript with strict configuration
- Tailwind CSS with custom design system
- ESLint and Prettier integration
- Environment variable configuration

### ✅ UI Implementation

- Professional landing page with hero section and feature showcase
- Modern authentication pages with split layouts
- Comprehensive dashboard with feature preview
- Development demo page with phase tracking and API monitoring
- Responsive design across all breakpoints

### ✅ Component Architecture

- Reusable Button component with variants
- Utility functions for class name merging
- API client with interceptors and error handling
- Health check utilities for backend monitoring

### ✅ Developer Experience

- Hot reload and fast refresh
- TypeScript auto-completion and error checking
- Linting and formatting automation
- Clear project structure and documentation

The frontend is now ready for Phase 1 implementation, with a solid foundation for authentication, state management, and feature development.
