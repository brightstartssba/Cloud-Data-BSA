# AnimalDrive - Cloud File Storage Platform

## Overview

AnimalDrive is a modern cloud file storage platform built with a React frontend and Express.js backend. The application provides file upload, organization, sharing, and management capabilities with a playful animal-themed interface. It uses PostgreSQL for data persistence and includes comprehensive authentication through Replit Auth.

## User Preferences

Preferred communication style: Simple, everyday language.
Database Storage: User wants unlimited PostgreSQL storage capacity.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite for fast development and optimized builds
- **Styling**: Tailwind CSS with shadcn/ui component library
- **State Management**: TanStack Query (React Query) for server state management
- **Routing**: Wouter for lightweight client-side routing
- **File Handling**: React Dropzone for drag-and-drop file uploads

### Backend Architecture
- **Runtime**: Node.js with Express.js framework
- **Language**: TypeScript with ES modules
- **Authentication**: Replit Auth with OpenID Connect
- **Session Management**: Express sessions with PostgreSQL store
- **File Upload**: Multer middleware for handling multipart/form-data
- **API Design**: RESTful endpoints with consistent error handling

### Data Storage Solutions
- **Primary Database**: PostgreSQL with Neon serverless hosting
- **ORM**: Drizzle ORM for type-safe database operations
- **File Storage**: Local filesystem storage in uploads directory
- **Schema Management**: Drizzle Kit for migrations and schema management

## Key Components

### Database Schema
- **users**: User profiles and authentication data (required for Replit Auth)
- **sessions**: Session storage for authentication (required for Replit Auth)
- **folders**: Hierarchical folder organization with parent-child relationships
- **files**: File metadata including name, size, mime type, and storage path
- **sharedFiles**: File sharing with access control and time-based tokens

### Authentication System
- **Provider**: Replit Auth with OIDC discovery
- **Session Storage**: PostgreSQL-backed sessions with configurable TTL
- **Access Control**: Route-level authentication middleware
- **User Management**: Automatic user creation and profile management

### File Management
- **Upload**: Multi-file upload with progress tracking and size limits (100MB)
- **Organization**: Folder-based hierarchy with unlimited nesting
- **Search**: Full-text search across file names and metadata
- **Preview**: Modal-based file preview for images, videos, and documents
- **Sharing**: Token-based file sharing with access level controls

### User Interface
- **Design System**: shadcn/ui components with custom animal theme
- **Responsive**: Mobile-first design with progressive enhancement
- **Accessibility**: ARIA-compliant components and keyboard navigation
- **Performance**: Optimized with React Query caching and lazy loading

## Data Flow

### File Upload Process
1. User drags files to upload zone or clicks to select
2. Frontend validates file types and sizes
3. Files sent via FormData to `/api/files/upload` endpoint
4. Backend processes files with Multer middleware
5. File metadata stored in database with generated unique filenames
6. Success response triggers UI refresh via React Query cache invalidation

### Authentication Flow
1. Unauthenticated users redirected to `/api/login`
2. Replit Auth handles OIDC flow with external provider
3. Successful authentication creates/updates user record
4. Session established with PostgreSQL-backed store
5. Frontend receives user data via `/api/auth/user` endpoint

### File Organization
1. Users can create nested folder structures
2. Files can be moved between folders via drag-and-drop
3. Breadcrumb navigation shows current folder hierarchy
4. Search functionality queries across all user files regardless of folder

## External Dependencies

### Core Dependencies
- **@neondatabase/serverless**: PostgreSQL connection with serverless WebSocket support
- **@tanstack/react-query**: Server state management and caching
- **drizzle-orm**: Type-safe database operations and migrations
- **@radix-ui/react-***: Accessible UI primitives for complex components
- **multer**: File upload handling and storage configuration

### Development Tools
- **Vite**: Fast development server with hot module replacement
- **TypeScript**: Static type checking and enhanced developer experience
- **Tailwind CSS**: Utility-first CSS framework with design tokens
- **PostCSS**: CSS processing with autoprefixer support

### Authentication
- **openid-client**: OIDC client implementation for Replit Auth
- **passport**: Authentication middleware with session management
- **express-session**: Session handling with configurable storage
- **connect-pg-simple**: PostgreSQL session store adapter

## Deployment Strategy

### Development Environment
- **Local Development**: Vite dev server with Express API proxy
- **Hot Reload**: Full-stack hot reloading with Vite middleware
- **Database**: Neon PostgreSQL with connection pooling
- **Environment Variables**: DATABASE_URL, SESSION_SECRET, REPLIT_DOMAINS

### Production Build
- **Frontend**: Vite builds optimized static assets to `dist/public`
- **Backend**: esbuild bundles server code to `dist/index.js`
- **Deployment**: Single Node.js process serving both static files and API
- **Process Management**: PM2 or similar for production process supervision

### Database Management
- **Schema Migrations**: Drizzle Kit handles schema changes automatically
- **Connection Pooling**: Neon serverless with WebSocket connections
- **Session Cleanup**: Automatic session expiration and cleanup
- **Backup Strategy**: Neon provides automated backups and point-in-time recovery

The application follows a clean separation of concerns with the frontend handling user interactions and the backend managing data persistence, file storage, and authentication. The architecture supports horizontal scaling through stateless API design and external session storage.