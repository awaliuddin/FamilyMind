# FamilyMind AI Assistant - Context Primer

## Project Overview

FamilyMind is a fully functional AI-powered family coordination platform that transforms household management through intelligent, interconnected digital tools. The system is **production-ready** with complete CRUD operations, family sharing, and AI integration.

## Current State (January 27, 2025)

### ✅ **FULLY IMPLEMENTED FEATURES**
- **Complete Dashboard**: Interactive stats cards with drill-down functionality
- **Family Sharing System**: Multi-user collaboration with invite codes
- **Full CRUD Operations**: Add, edit, delete for all content types
- **AI Chat Integration**: OpenAI GPT-4o powered family assistant
- **Database Layer**: PostgreSQL with Drizzle ORM, all migrations complete
- **Authentication**: Replit OAuth (needs local modification)
- **Content Management**: Calendar events, grocery lists, family ideas, vision board, wishlist
- **Family Management**: Member profiles, roles, invite system
- **Real-time Updates**: TanStack Query for state synchronization

### 🎯 **CURRENT STATUS**
The application is **100% functional** on Replit. User wants to export for local development and modify authentication system.

## Technical Architecture

### **Frontend Stack**
- **React 18** with TypeScript
- **Vite** as build tool with HMR
- **shadcn/ui** components + Tailwind CSS
- **TanStack Query** for server state management
- **Wouter** for client-side routing
- **Framer Motion** for animations

### **Backend Stack**
- **Express.js** with TypeScript
- **PostgreSQL** database with connection pooling
- **Drizzle ORM** for type-safe database operations
- **OpenAI API** integration (GPT-4o)
- **Session-based authentication** with PostgreSQL storage

### **Key Files Structure**
```
├── client/src/
│   ├── components/
│   │   ├── family-command-center.tsx  # Main dashboard component
│   │   ├── family-management.tsx      # Family member management
│   │   └── family-invitation.tsx      # Invite system
│   ├── pages/
│   │   ├── home.tsx                   # Authenticated home page
│   │   └── landing.tsx                # Public landing page
│   ├── hooks/
│   │   ├── useAuth.ts                 # Authentication hook
│   │   └── use-toast.ts               # Toast notifications
│   └── lib/
│       ├── queryClient.ts             # API client setup
│       └── authUtils.ts               # Auth utilities
├── server/
│   ├── routes.ts                      # All API endpoints
│   ├── storage.ts                     # Database operations
│   ├── auth.ts                        # Authentication (Clerk)
│   ├── openai.ts                      # AI integration
│   └── db.ts                          # Database connection
├── shared/
│   └── schema.ts                      # Database schema & types
└── replit.md                          # Project documentation
```

## Database Schema (PostgreSQL)

### **Core Tables**
- **users**: Basic user profiles (links to families)
- **families**: Family groups with invite codes
- **family_members**: Member profiles with roles and colors
- **sessions**: Authentication sessions
- **grocery_lists**: Store-specific shopping lists (family-scoped)
- **grocery_items**: Individual grocery items
- **calendar_events**: Family scheduling (family-scoped)
- **family_ideas**: Collaborative ideas with voting (family-scoped)
- **vision_items**: Family goals and vision board (family-scoped)
- **wishlist_items**: Gift and purchase tracking (family-scoped)
- **chat_messages**: AI conversation history (user-scoped)

### **Data Flow**
- All family content is shared across family members
- Users join families via 6-character invite codes
- AI assistant has access to complete family context
- Real-time updates via TanStack Query invalidation

## Authentication System (Clerk)

### **Current: Clerk Auth**
```typescript
// server/auth.ts - Dual-mode Clerk authentication
- Production: @clerk/express middleware + requireAuth()
- Local dev: auto-authenticated dev user (no Clerk key needed)
- User sync via syncUser() on first access
- New users get sample data seeded automatically
```

### **Local Development**
When `CLERK_SECRET_KEY` is absent, every request is auto-authenticated as a hardcoded dev user (configurable via `DEV_USER_ID`, `DEV_USER_EMAIL` env vars). No OAuth setup needed locally.
   - Use bcrypt for password hashing

## Environment Variables Needed

### **Current (Replit)**
```env
DATABASE_URL=postgresql://...
OPENAI_API_KEY=sk-...
SESSION_SECRET=random_secret
REPL_ID=replit_app_id
ISSUER_URL=https://replit.com/oidc
REPLIT_DOMAINS=domain1.com,domain2.com
```

### **For Local Development**
```env
DATABASE_URL=postgresql://localhost:5432/familymind
OPENAI_API_KEY=sk-your_openai_key
SESSION_SECRET=your_random_secret
NODE_ENV=development
# Add new auth provider variables as needed
```

## API Endpoints (All Functional)

### **Authentication**
- `GET /api/auth/user` - Get current user
- `GET /api/login` - Start OAuth flow
- `GET /api/logout` - End session

### **Family Management**
- `GET /api/family` - Get user's family
- `POST /api/family` - Create new family
- `POST /api/family/join` - Join family with invite code
- `GET /api/family-members` - Get family members
- `POST /api/family-members` - Add family member

### **Content Management (All CRUD Complete)**
- **Calendar**: `/api/calendar-events` (GET, POST, PATCH, DELETE)
- **Grocery**: `/api/grocery-lists`, `/api/grocery-items` (Full CRUD)
- **Ideas**: `/api/family-ideas` (GET, POST, PATCH for likes)
- **Vision**: `/api/vision-items` (GET, POST, PATCH, DELETE)
- **Wishlist**: `/api/wishlist-items` (GET, POST, PATCH, DELETE)
- **Chat**: `/api/chat` (POST for AI conversations)

## AI Integration (OpenAI)

### **Current Implementation**
- **Model**: GPT-4o (latest)
- **Context**: Full family data access
- **Features**: Proactive suggestions, conflict detection
- **Response Format**: Structured JSON with actions

### **AI Capabilities**
- Schedule conflict detection
- Grocery list predictions
- Family activity suggestions
- Natural language interface
- Contextual family assistance

## Local Development Steps

### **1. Setup**
```bash
npm install
npm run db:push  # Apply database schema
npm run dev      # Start development server
```

### **2. Authentication**
Auth works automatically in local dev — no Clerk key needed. Set `DEV_USER_ID` and `DEV_USER_EMAIL` in `.env` to customize the dev user.

### **3. Database Setup**
- Install PostgreSQL locally OR use cloud service (Neon, Supabase)
- Update `DATABASE_URL` in `.env`
- Run `npm run db:push` to create tables

## Recent Achievements

### **January 27, 2025 - Complete CRUD & Drill-Down**
- ✅ Fixed all grocery list editing bugs
- ✅ Implemented dashboard drill-down with "Add New" functionality
- ✅ Added beautiful empty states for all content types
- ✅ Full edit/delete operations across all content
- ✅ Color-coded empty state messages with proper navigation

### **Previous Milestones**
- ✅ Family sharing system with invite codes
- ✅ Database migration from individual to family-based data
- ✅ AI integration with family context
- ✅ Comprehensive dashboard with statistics
- ✅ Real-time data synchronization

## Next Steps for Handoff

1. **Choose Authentication Strategy** (see options above)
2. **Set up Local Database** (PostgreSQL required)
3. **Configure Environment Variables**
4. **Test Local Functionality**
5. **Optional: Deploy to Production** (already deployment-ready)

## Important Notes

- **No Breaking Changes Needed**: The codebase is production-ready
- **Authentication Only Blocker**: Everything else works locally
- **Database Schema Complete**: All migrations applied
- **AI Integration Ready**: Just need OpenAI API key
- **Type Safety**: Full TypeScript coverage with Drizzle schemas
- **Error Handling**: Comprehensive error states and user feedback

## User Preferences

- **Communication Style**: Simple, everyday language (non-technical)
- **Focus**: Practical family coordination over complex features
- **Priority**: Reliability and ease of use

---

**Status**: Ready for authentication system modification and local deployment. All core functionality is complete and tested.