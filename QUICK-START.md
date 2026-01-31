# 🚀 FamilyMind Quick Start Guide

**Get up and running in under 5 minutes!**

This guide will have you developing on FamilyMind faster than you can say "family organization." ⚡

---

## ⚡ Super Fast Setup (TL;DR)

```bash
git clone https://github.com/awaliuddin/FamilyMind.git
cd FamilyMind
npm install
cp .env.example .env
# Edit .env with your database URL
npm run db:push
npm run dev
# Open http://localhost:5000 🎉
```

**That's it!** Skip to [Next Steps](#-next-steps) if everything worked.

---

## 📱 Mobile access (LAN)
If you’re running FamilyMind in WSL2 and want to open it from your phone on the same Wi‑Fi, run this on **Windows**:

```powershell
powershell -ExecutionPolicy Bypass -File .\scripts\expose-mobile.ps1
```

It will request Administrator approval, then:
- forwards **Windows:5000 → WSL2:5000**
- opens Windows Firewall TCP 5000
- prints the URL to open on your phone

To remove the rule later:
```powershell
powershell -ExecutionPolicy Bypass -File .\scripts\unexpose-mobile.ps1
```

## 📋 Prerequisites Checklist

Before starting, make sure you have:

- ✅ **Node.js 18+** - [Download here](https://nodejs.org/)
- ✅ **PostgreSQL 14+** - [Download here](https://www.postgresql.org/download/) or use [Neon](https://neon.tech) (free)
- ✅ **npm** (comes with Node.js) or yarn
- ✅ **Git** - [Download here](https://git-scm.com/)

### Quick Check

```bash
node --version    # Should be v18.x or higher
npm --version     # Should be 9.x or higher
psql --version    # Should be 14.x or higher
git --version     # Should be 2.x or higher
```

---

## 🎯 Step-by-Step Setup

### 1. Clone the Repository

```bash
# Using HTTPS
git clone https://github.com/awaliuddin/FamilyMind.git

# Or using SSH (if you have GitHub SSH configured)
git clone git@github.com:awaliuddin/FamilyMind.git

# Navigate into the project
cd FamilyMind
```

---

### 2. Install Dependencies

```bash
npm install
```

**Expected output:**
```
added 520 packages in 14s
```

**Time:** ~15-30 seconds depending on your internet speed

---

### 3. Set Up Environment Variables

```bash
# Copy the example environment file
cp .env.example .env
```

**Edit `.env` with your credentials:**

```bash
# Required
DATABASE_URL="postgresql://username:password@localhost:5432/familymind"
SESSION_SECRET="your-super-secret-key-here"  # Generate with: openssl rand -base64 32

# AI Features (Optional but recommended)
OPENAI_API_KEY="sk-your-openai-api-key"  # Get from https://platform.openai.com/api-keys

# Email Features (Optional)
SENDGRID_API_KEY="SG.your-sendgrid-key"  # Get from https://sendgrid.com

# Server Configuration (Optional - defaults shown)
PORT=5000
NODE_ENV=development
```

#### 🔑 Getting Your Database URL

**Option A: Local PostgreSQL**
```bash
# Create database
createdb familymind

# Your DATABASE_URL:
DATABASE_URL="postgresql://yourusername:yourpassword@localhost:5432/familymind"
```

**Option B: Neon (Serverless PostgreSQL - Recommended for beginners)**
1. Sign up at [neon.tech](https://neon.tech)
2. Create a new project
3. Copy the connection string
4. Paste into `.env` as `DATABASE_URL`

**Option C: Other Cloud Providers**
- [Supabase](https://supabase.com) - Free tier with great UI
- [Railway](https://railway.app) - One-click PostgreSQL
- [Heroku](https://www.heroku.com) - Classic choice

---

### 4. Initialize Database

```bash
# Push database schema (creates tables)
npm run db:push
```

**Expected output:**
```
✓ Applying migrations...
✓ Database schema updated successfully
```

**Optional:** Seed with sample data
```bash
npm run db:seed
```

---

### 5. Start Development Server

```bash
npm run dev
```

**Expected output:**
```
🚀 Server running on http://localhost:5000
⚡ Vite ready in 450ms
```

**Open your browser to:** http://localhost:5000

---

## 🎉 You're Ready!

If you see the FamilyMind landing page, **congratulations!** You're all set.

### First Actions:

1. **Create Account** - Click "Get Started for Free"
2. **Create a Family** - Enter family name, get invite code
3. **Explore Features** - Try adding a grocery list or calendar event
4. **Test Dark Mode** - Click the moon icon 🌙
5. **Try Command Palette** - Press `⌘K` (or `Ctrl+K`)

---

## 🛠️ Development Workflow

### Common Commands

```bash
# Start development server (with hot reload)
npm run dev

# Type checking (find TypeScript errors)
npm run check

# Build for production
npm run build

# Start production server
npm run start

# Database commands
npm run db:push      # Apply schema changes
npm run db:seed      # Add sample data
npm run db:studio    # Open Drizzle Studio (visual database)
```

### Project Structure

```
FamilyMind/
├── client/          # React frontend
│   ├── src/
│   │   ├── components/  # React components
│   │   ├── hooks/       # Custom hooks
│   │   ├── pages/       # Route pages
│   │   └── lib/         # Utilities
│   └── index.html
├── server/          # Express backend
│   ├── index.ts     # Server entry
│   ├── routes.ts    # API endpoints
│   └── storage.ts   # Database layer
└── shared/          # Shared types
    └── schema.ts    # Database schema
```

### Hot Reloading

Changes are automatically reloaded:

- **Frontend:** Instant HMR (Hot Module Replacement)
- **Backend:** Automatic restart on file changes
- **TypeScript:** Continuous type checking

Just save your file and see changes immediately! ⚡

---

## 🎯 Next Steps

### For Developers

1. **Read the Architecture**
   - Check out [README.md](README.md#-project-architecture)
   - Understand the modular component structure
   - Review custom hooks pattern

2. **Explore the Codebase**
   ```bash
   # Key files to start with:
   client/src/components/family-command-center.tsx  # Main app shell
   client/src/components/grocery/GroceryView.tsx    # Example module
   client/src/hooks/useResourceMutation.ts          # Generic CRUD hook
   server/routes.ts                                  # API endpoints
   ```

3. **Try Making Changes**
   - Add a new feature to grocery lists
   - Customize the dark mode colors
   - Add a new keyboard shortcut

4. **Run Tests** (coming soon)
   ```bash
   npm run test
   ```

### For Testers

1. **Run UAT Tests**
   - Follow [UAT-TEST-GUIDE.md](UAT-TEST-GUIDE.md)
   - Complete all 8 test suites
   - Report bugs using the template

2. **Test New Features**
   - Command palette (⌘K)
   - Dark mode toggle
   - Mobile responsive design
   - Optimistic updates

### For Designers

1. **Review Design System**
   - Colors: `client/src/index.css` (CSS variables)
   - Components: `client/src/components/ui/`
   - Animations: Framer Motion examples throughout

2. **Propose Improvements**
   - Open a GitHub Discussion
   - Share Figma designs
   - Suggest accessibility enhancements

---

## 🐛 Troubleshooting

### Issue: `npm install` fails

**Solution:**
```bash
# Clear npm cache
npm cache clean --force

# Delete node_modules and package-lock.json
rm -rf node_modules package-lock.json

# Reinstall
npm install
```

---

### Issue: Database connection error

**Error:** `ECONNREFUSED` or `Connection refused`

**Solution:**
1. Check PostgreSQL is running:
   ```bash
   # macOS
   brew services start postgresql

   # Linux
   sudo service postgresql start

   # Windows
   # Start via Services app
   ```

2. Verify DATABASE_URL in `.env`:
   ```bash
   # Test connection
   psql $DATABASE_URL
   ```

3. Check firewall isn't blocking port 5432

---

### Issue: Port 5000 already in use

**Error:** `EADDRINUSE: address already in use :::5000`

**Solution:**
```bash
# Option 1: Kill process using port 5000
lsof -ti:5000 | xargs kill -9

# Option 2: Use different port
# Add to .env:
PORT=3000
```

---

### Issue: TypeScript errors

**Error:** Various TypeScript compilation errors

**Solution:**
```bash
# Run type checker to see all errors
npm run check

# Common fixes:
# 1. Restart your IDE
# 2. Delete node_modules/@types and reinstall
# 3. Check tsconfig.json is correct
```

---

### Issue: White screen / blank page

**Solution:**
1. Check browser console for errors (F12)
2. Verify server is running (`npm run dev`)
3. Check DATABASE_URL is correct
4. Clear browser cache and cookies
5. Try incognito/private browsing mode

---

### Issue: OpenAI API not working

**Error:** AI features returning errors

**Solution:**
1. Verify `OPENAI_API_KEY` in `.env`
2. Check API key is active at [OpenAI Dashboard](https://platform.openai.com/api-keys)
3. Ensure you have API credits
4. API key must start with `sk-`

---

### Issue: Session/authentication issues

**Error:** Redirecting to login repeatedly

**Solution:**
1. Check `SESSION_SECRET` in `.env` is set
2. Generate new secret:
   ```bash
   openssl rand -base64 32
   ```
3. Clear browser cookies
4. Restart development server

---

## 💡 Pro Tips

### Faster Development

```bash
# Run type check in watch mode
npm run check -- --watch

# Open database in GUI
npm run db:studio

# View real-time logs
# Server logs appear in terminal where you ran `npm run dev`
```

### VS Code Extensions

Install these for the best experience:

```json
{
  "recommendations": [
    "dbaeumer.vscode-eslint",
    "esbenp.prettier-vscode",
    "bradlc.vscode-tailwindcss",
    "Prisma.prisma",  // Works with Drizzle too
    "Cardinal90.multi-cursor-case-preserve"
  ]
}
```

### Keyboard Shortcuts to Remember

| Shortcut | Action |
|----------|--------|
| `⌘K` / `Ctrl+K` | Command palette |
| `Alt+1` to `Alt+6` | Jump to tabs |
| `Alt+A` | Open AI chat |
| `Tab` | Navigate form fields |
| `Escape` | Close dialogs |

### Database GUI

```bash
# Open Drizzle Studio (like phpMyAdmin for any DB)
npm run db:studio
```

Then visit: http://localhost:4983

---

## 📚 Additional Resources

### Documentation

- **[README.md](README.md)** - Complete project overview
- **[UAT-TEST-GUIDE.md](UAT-TEST-GUIDE.md)** - Comprehensive testing guide
- **[Architecture Docs](README.md#-project-architecture)** - Deep dive into code structure

### External Links

- **React Docs** - [react.dev](https://react.dev)
- **TypeScript Handbook** - [typescriptlang.org/docs](https://www.typescriptlang.org/docs/)
- **Tailwind CSS** - [tailwindcss.com/docs](https://tailwindcss.com/docs)
- **Drizzle ORM** - [orm.drizzle.team/docs](https://orm.drizzle.team/docs)
- **TanStack Query** - [tanstack.com/query/latest/docs](https://tanstack.com/query/latest/docs)

### Community

- **[GitHub Discussions](https://github.com/awaliuddin/FamilyMind/discussions)** - Ask questions
- **[Issue Tracker](https://github.com/awaliuddin/FamilyMind/issues)** - Report bugs
- **[Contributing Guide](README.md#-contributing)** - How to contribute

---

## 🚀 You're All Set!

You now have a fully functional FamilyMind development environment.

### What to do next?

1. ⭐ **Star the repo** on GitHub
2. 🐛 **Report issues** you find
3. 💡 **Suggest features** you'd like
4. 💻 **Contribute code** improvements
5. 📖 **Improve docs** if something was unclear

---

## ❓ Still Stuck?

If you're having issues not covered here:

1. **Check existing issues** - [github.com/awaliuddin/FamilyMind/issues](https://github.com/awaliuddin/FamilyMind/issues)
2. **Ask in Discussions** - [github.com/awaliuddin/FamilyMind/discussions](https://github.com/awaliuddin/FamilyMind/discussions)
3. **Open a new issue** - Include:
   - Operating system
   - Node.js version
   - Error messages
   - Steps to reproduce

---

<div align="center">

**Happy Coding! 🎉**

Built with ❤️ by the FamilyMind community

[🏠 Home](README.md) • [📖 Full Docs](README.md) • [🧪 Testing](UAT-TEST-GUIDE.md)

</div>
