# SlotSwapper - Task/Shift Management System

## ðŸŽ¯ Project Overview

SlotSwapper is a full-stack web application for managing tasks and shift swaps between users. Built with Next.js, TypeScript, and MongoDB, it provides an intuitive interface for users to manage their schedules, request task swaps, and collaborate with team members.

## ðŸš€ Tech Stack

### Frontend

- **Next.js 16** (with Turbopack)
- **React 19.2.0**
- **TypeScript**
- **Tailwind CSS** - Styling
- **shadcn/ui** - UI Component Library
- **Radix UI** - Accessible components
- **vaul** - Drawer component

### Backend

- **Next.js API Routes** (App Router)
- **MongoDB** - Database
- **MongoDB Node.js Driver** - Database client

### Tools & Development

- **npm** - Package manager (with legacy-peer-deps for React 19 compatibility)
- **ESLint** - Code linting
- **Vercel Analytics** - Analytics (optional)

## ðŸ“‹ Features

### Core Functionality

1. **Task Management**

   - Create, read, update, delete tasks
   - Assign tasks to specific users
   - Set task dates and times
   - View tasks by day/month

2. **Calendar View**

   - Interactive calendar with clickable days
   - Per-user month views
   - Task visualization by date

3. **Task Swap Requests**

   - Request to swap tasks with other users
   - Sticky requests tab for quick access
   - Detailed request view with times
   - Accept/reject swap requests

4. **User Management**
   - Multiple users support
   - User-specific dashboards
   - Per-user task filtering

## ðŸ—‚ï¸ Project Structure

```
slotswapper/
â”œâ”€â”€ app/
â”‚   â”œâ”€â”€ api/              # API routes
â”‚   â”‚   â””â”€â”€ db/           # Database connection test
â”‚   â”œâ”€â”€ layout.tsx        # Root layout
â”‚   â””â”€â”€ page.tsx          # Home page
â”œâ”€â”€ components/
â”‚   â””â”€â”€ ui/               # shadcn/ui components
â”œâ”€â”€ lib/
â”‚   â””â”€â”€ mongodb.ts        # MongoDB connection utility
â”œâ”€â”€ .env.local            # Environment variables (not committed)
â”œâ”€â”€ .npmrc                # npm configuration
â”œâ”€â”€ next.config.js        # Next.js configuration
â”œâ”€â”€ package.json          # Dependencies
â”œâ”€â”€ tailwind.config.ts    # Tailwind configuration
â””â”€â”€ tsconfig.json         # TypeScript configuration
```

## ðŸ”§ Setup Instructions

### Prerequisites

- Node.js 18+ (recommended: Node.js 20)
- MongoDB Atlas account OR local MongoDB installation
- npm (comes with Node.js)

### Installation Steps

1. **Clone the repository**

```bash
cd "C:\Users\user\Desktop\play ground\slotswapper"
```

2. **Install dependencies**

```bash
npm install --legacy-peer-deps
```

> Note: Using `--legacy-peer-deps` due to React 19 peer dependency with vaul package

3. **Configure environment variables**

Create `.env.local` file in the project root:

```env
# MongoDB Connection String
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/slotswapper?retryWrites=true&w=majority

# Database Name
DB_NAME=slotswapper
```

**For MongoDB Atlas:**

- Replace `username` with your MongoDB username
- Replace `password` with your MongoDB password (URL-encode special characters)
- Replace `cluster` with your cluster name

**For Local MongoDB:**

```env
MONGODB_URI=mongodb://localhost:27017/slotswapper
```

4. **Test MongoDB connection**

```bash
npm run dev
```

Visit: `http://localhost:3000/api/db` - Should return `{ "ok": true }`

5. **Install shadcn/ui components** (if needed)

```bash
npx shadcn@latest add button
npx shadcn@latest add calendar
npx shadcn@latest add card
# Add other components as needed
```

## ðŸ› ï¸ Development

### Run development server

```bash
npm run dev
```

### Run without Turbopack (if issues)

```bash
npm run dev -- --no-turbo
```

### Build for production

```bash
npm run build
```

### Start production server

```bash
npm start
```

## ðŸ› Common Issues & Solutions

### Issue 1: MongoDB SSL/TLS Error

**Error:** `SSL routines:ssl3_read_bytes:tlsv1 alert internal error`

**Solution:**
Update `lib/mongodb.ts` with relaxed TLS settings (development only):

```typescript
const options = {
  ssl: true,
  sslValidate: false,
  tlsAllowInvalidCertificates: true,
  tlsAllowInvalidHostnames: true,
};
```

### Issue 2: React 19 Peer Dependency Conflicts

**Error:** `ERESOLVE unable to resolve dependency tree`

**Solution:**
Create `.npmrc` file with:

```
legacy-peer-deps=true
```

### Issue 3: Next.js Multiple Lockfiles Warning

**Solution:**
Delete unnecessary lockfiles or set `turbopack.root` in `next.config.js`

### Issue 4: Font Loading Errors (Geist Mono)

**Solution:**
Use `--no-turbo` flag or switch to a different font in `app/layout.tsx`

## ðŸ“¦ Key Dependencies

```json
{
  "dependencies": {
    "next": "16.0.0",
    "react": "19.2.0",
    "react-dom": "19.2.0",
    "mongodb": "^6.x.x",
    "tailwindcss": "^3.x.x",
    "@radix-ui/react-*": "latest",
    "vaul": "^0.9.9"
  }
}
```

## ðŸŽ¨ UI Components

Using **shadcn/ui** for consistent, accessible components:

- Buttons
- Cards
- Calendar
- Drawers (vaul)
- Forms
- Dialogs
- Tabs

## ðŸ” Security Notes

### Development

- Using `tlsAllowInvalidCertificates: true` for MongoDB (acceptable for local dev)
- Environment variables in `.env.local` (not committed to git)

### Production TODO

- [ ] Remove `tlsAllowInvalidCertificates` flag
- [ ] Use proper SSL certificates
- [ ] Implement authentication (NextAuth.js recommended)
- [ ] Add rate limiting
- [ ] Sanitize user inputs
- [ ] Set up proper CORS policies

## ðŸ“ Database Schema (Planned)

### Users Collection

```typescript
{
  _id: ObjectId,
  name: string,
  email: string,
  createdAt: Date
}
```

### Tasks Collection

```typescript
{
  _id: ObjectId,
  userId: ObjectId,
  title: string,
  description: string,
  date: Date,
  startTime: string,
  endTime: string,
  status: "pending" | "completed",
  createdAt: Date
}
```

### SwapRequests Collection

```typescript
{
  _id: ObjectId,
  requesterId: ObjectId,
  targetUserId: ObjectId,
  requesterTaskId: ObjectId,
  targetTaskId: ObjectId,
  status: "pending" | "accepted" | "rejected",
  message: string,
  createdAt: Date,
  respondedAt?: Date
}
```

## ðŸš§ TODO / Roadmap

### Phase 1 - Core Features

- [ ] User authentication system
- [ ] Task CRUD operations
- [ ] Calendar view implementation
- [ ] Basic UI components

### Phase 2 - Swap Functionality

- [ ] Create swap request
- [ ] View pending requests
- [ ] Accept/reject requests
- [ ] Notification system

### Phase 3 - Enhanced Features

- [ ] Real-time updates (WebSocket)
- [ ] Email notifications
- [ ] Task filters and search
- [ ] Export calendar data
- [ ] Mobile responsive design

### Phase 4 - Production Ready

- [ ] Comprehensive testing
- [ ] Performance optimization
- [ ] Security hardening
- [ ] Documentation
- [ ] Deployment setup

## ðŸ¤ Contributing

This is a personal project. If you want to contribute:

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## ðŸ“„ License

Private project - All rights reserved

## ðŸ‘¨â€ðŸ’» Developer Notes

**For GitHub Copilot Context:**

- This is a **shift/task swapping application** for team coordination
- Users can **view their tasks on a calendar**
- Users can **request to swap tasks** with others
- Built with **Next.js App Router** (not Pages Router)
- Using **TypeScript** for type safety
- **MongoDB** for data persistence
- Focus on **clean, maintainable code** with proper TypeScript types
- UI should be **accessible** and **responsive**
- Follow **React best practices** (hooks, composition, etc.)

## ðŸ”— Useful Links

- [Next.js Documentation](https://nextjs.org/docs)
- [MongoDB Node.js Driver](https://www.mongodb.com/docs/drivers/node/)
- [shadcn/ui Components](https://ui.shadcn.com/)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)

---

**Last Updated:** November 5, 2025  
**Project Status:** ðŸš§ In Development  
**Assignment:** ServiceHive SDE Assignment
