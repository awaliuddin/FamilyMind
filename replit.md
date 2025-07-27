# FamilyMind AI Assistant

## Overview

FamilyMind is an AI-powered family assistant application designed to proactively manage household operations, anticipate family needs, and streamline coordination through natural conversation. The system transforms family organization from reactive task management to intelligent, automated assistance.

## Recent Changes (January 27, 2025)

✓ **Edit Functionality Added**: Users can now edit existing calendar events, grocery items, vision board items, and wishlist items
✓ **Comprehensive Edit Dialog**: Modal interface with form fields specific to each item type
✓ **Update API Routes**: PATCH endpoints for updating all major content types
✓ **User Interface Enhancements**: Edit buttons added to all item cards with intuitive icons
✓ **Sample Data Integration**: New users automatically receive realistic family data upon first login

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Full-Stack TypeScript Application
- **Frontend**: React with TypeScript, using Vite as the build tool
- **Backend**: Express.js server with TypeScript
- **Database**: PostgreSQL with Drizzle ORM
- **Authentication**: Replit OAuth integration
- **AI Integration**: OpenAI GPT-4o for intelligent family assistance
- **UI Framework**: shadcn/ui components with Tailwind CSS

### Monorepo Structure
The application follows a monorepo pattern with clearly separated concerns:
- `client/` - React frontend application
- `server/` - Express.js backend server
- `shared/` - Common TypeScript schemas and types

## Key Components

### Frontend Architecture
- **React SPA**: Single-page application with client-side routing using Wouter
- **Component Library**: shadcn/ui components for consistent design system
- **State Management**: TanStack Query (React Query) for server state management
- **Styling**: Tailwind CSS with custom CSS variables for theming
- **Build System**: Vite with hot module replacement for development

### Backend Architecture
- **Express Server**: RESTful API with middleware for authentication and logging
- **Database Layer**: Drizzle ORM with connection pooling via Neon serverless
- **Session Management**: PostgreSQL-backed sessions with connect-pg-simple
- **Authentication**: Replit OAuth with OpenID Connect

### Database Schema
Core entities include:
- **Users**: Basic user profile and authentication data
- **Family Members**: Individual family member profiles with roles and colors
- **Grocery Lists**: Store-specific shopping lists with items
- **Calendar Events**: Family scheduling with conflict detection
- **Family Ideas**: Collaborative idea sharing with voting
- **Vision Items**: Family goal setting and vision board
- **Wish List Items**: Gift and purchase tracking
- **Chat Messages**: AI conversation history

### AI Integration
- **OpenAI GPT-4o**: Primary AI model for family assistance
- **Contextual Responses**: AI has access to family data for personalized suggestions
- **Proactive Features**: Schedule conflict detection, grocery predictions
- **Natural Language Interface**: Chat-based interaction with structured JSON responses

## Data Flow

### Authentication Flow
1. User initiates login via `/api/login`
2. Replit OAuth handles authentication
3. User session stored in PostgreSQL
4. Frontend receives authenticated user data

### AI Interaction Flow
1. User sends message through chat interface
2. Frontend sends request to `/api/chat` with message
3. Backend gathers family context (members, events, lists)
4. OpenAI processes request with context
5. AI response includes suggestions and actionable items
6. Frontend displays response and executes any actions

### Data Synchronization
- TanStack Query manages client-side caching and synchronization
- Real-time updates through query invalidation
- Optimistic updates for immediate user feedback

## External Dependencies

### Core Dependencies
- **@neondatabase/serverless**: PostgreSQL database connection
- **drizzle-orm**: Type-safe database ORM
- **openai**: Official OpenAI API client
- **@tanstack/react-query**: Server state management
- **@radix-ui/***: Accessible UI component primitives

### Development Tools
- **TypeScript**: Type safety across the stack
- **Vite**: Fast development and build tooling
- **esbuild**: Server-side bundling for production
- **Tailwind CSS**: Utility-first styling

### Authentication & Security
- **openid-client**: OpenID Connect implementation
- **passport**: Authentication middleware
- **express-session**: Session management

## Deployment Strategy

### Build Process
1. Frontend: Vite builds React app to `dist/public/`
2. Backend: esbuild bundles server code to `dist/`
3. Database: Drizzle handles schema migrations

### Environment Requirements
- `DATABASE_URL`: PostgreSQL connection string
- `OPENAI_API_KEY`: OpenAI API access
- `SESSION_SECRET`: Session encryption key
- `REPL_ID`: Replit environment identifier
- `ISSUER_URL`: OAuth issuer URL

### Production Configuration
- Node.js server serves both API and static files
- PostgreSQL database with session storage
- Middleware handles authentication, logging, and error handling
- Static file serving for production builds

The architecture emphasizes type safety, developer experience, and maintainable code organization while providing a robust foundation for AI-powered family assistance features.