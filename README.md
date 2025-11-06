# SlotSwapper - Task/Shift Swapping System

## 🚀 Tech Stack

### Frontend

- **Next.js 16** - React framework with App Router and Turbopack
- **React 19.2.0** - Modern React with latest features
- **TypeScript** - Type-safe JavaScript
- **Tailwind CSS** - Utility-first CSS framework
- **shadcn/ui** - Modern component library
- **Radix UI** - Accessible, unstyled components
- **Lucide React** - Beautiful icon library

### Backend

- **Next.js API Routes** - Serverless API with App Router
- **MongoDB** - NoSQL document database
- **MongoDB Node.js Driver** - Official database client
- **JWT (jsonwebtoken)** - Authentication tokens
- **bcryptjs** - Password hashing

### Development Tools

- **npm** - Package manager
- **ESLint** - Code linting and formatting
- **TypeScript** - Static type checking

## 🛠️ Installation & Setup

### Prerequisites

- Node.js 18+ installed
- MongoDB database (local or cloud)
- Git for version control

### 1. Clone the Repository

```bash
git clone https://github.com/pranaytiwariii/SlotSwapper.git
cd SlotSwapper
```

### 2. Install Dependencies

```bash
npm install --legacy-peer-deps
```

_Note: Using --legacy-peer-deps for React 19 compatibility_

### 3. Environment Configuration

Create a `.env.local` file in the root directory:

```env
MONGODB_URI=mongodb://localhost:27017/slotswapper
# OR for MongoDB Atlas:
# MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/slotswapper

JWT_SECRET=your-super-secret-jwt-key-here
NODE_ENV=development
```

### 4. Start Development Server

```bash
npm run dev
```

The application will be available at `http://localhost:3000`

## 🧪 API Testing Guide

### Authentication Endpoints

#### 1. User Registration

```bash
POST /api/auth/register
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "securepassword"
}
```

#### 2. User Login

```bash
POST /api/auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "securepassword"
}
```

### Core API Endpoints

#### 3. Seed Test Data (Development Only)

```bash
POST /api/dev/seed
```

_Creates Alice and Bob with sample tasks for testing_

#### 4. Get User's Tasks

```bash
GET /api/tasks
Authorization: Bearer YOUR_JWT_TOKEN
```

#### 5. Create New Task

```bash
POST /api/tasks
Authorization: Bearer YOUR_JWT_TOKEN
Content-Type: application/json

{
  "title": "Team Meeting",
  "date": "2025-11-10",
  "start": "09:00",
  "end": "10:00",
  "description": "Weekly team sync"
}
```

### Advanced Swap System APIs

#### 6. Get Swappable Slots

```bash
GET /api/swappable-slots
Authorization: Bearer YOUR_JWT_TOKEN
```

_Returns all SWAPPABLE slots from other users_

#### 7. Create Swap Request

```bash
POST /api/swap-request
Authorization: Bearer YOUR_JWT_TOKEN
Content-Type: application/json

{
  "mySlotId": "YOUR_TASK_ID",
  "theirSlotId": "TARGET_TASK_ID"
}
```

#### 8. Get Pending Requests

```bash
GET /api/pending-requests
Authorization: Bearer YOUR_JWT_TOKEN
```

#### 9. Respond to Swap Request

```bash
POST /api/swap-response
Authorization: Bearer YOUR_JWT_TOKEN
Content-Type: application/json

{
  "requestId": "SWAP_REQUEST_ID",
  "accepted": true
}
```

## 🧪 PowerShell Testing Examples

### Complete API Test Flow

```powershell
# 1. Seed test data
Invoke-RestMethod -Uri "http://localhost:3000/api/dev/seed" -Method POST

# 2. Login as Alice
$aliceLogin = Invoke-RestMethod -Uri "http://localhost:3000/api/auth/login" -Method POST -Body '{"email":"alice@example.com","password":"secret123"}' -ContentType "application/json"
$aliceHeaders = @{ Authorization = "Bearer $($aliceLogin.token)" }

# 3. Login as Bob
$bobLogin = Invoke-RestMethod -Uri "http://localhost:3000/api/auth/login" -Method POST -Body '{"email":"bob@example.com","password":"secret456"}' -ContentType "application/json"
$bobHeaders = @{ Authorization = "Bearer $($bobLogin.token)" }

# 4. Get Alice's tasks
Invoke-RestMethod -Uri "http://localhost:3000/api/tasks" -Headers $aliceHeaders

# 5. Get swappable slots (Alice sees Bob's slots)
Invoke-RestMethod -Uri "http://localhost:3000/api/swappable-slots" -Headers $aliceHeaders

# 6. Create swap request
$swapRequest = @{ mySlotId = "ALICE_TASK_ID"; theirSlotId = "BOB_TASK_ID" } | ConvertTo-Json
Invoke-RestMethod -Uri "http://localhost:3000/api/swap-request" -Method POST -Body $swapRequest -ContentType "application/json" -Headers $aliceHeaders

# 7. Check pending requests
Invoke-RestMethod -Uri "http://localhost:3000/api/pending-requests" -Headers $bobHeaders

# 8. Accept swap request
$acceptSwap = @{ requestId = "REQUEST_ID"; accepted = $true } | ConvertTo-Json
Invoke-RestMethod -Uri "http://localhost:3000/api/swap-response" -Method POST -Body $acceptSwap -ContentType "application/json" -Headers $bobHeaders
```

## 📋 Database Schema

### Users Collection

```typescript
{
  _id: ObjectId,
  name: string,
  email: string,
  password: string, // bcrypt hashed
  taskIds: ObjectId[], // Array of task references
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
  date: string, // YYYY-MM-DD format
  start: string, // HH:MM format
  end: string, // HH:MM format
  status: "SWAPPABLE" | "BUSY" | "SWAP_PENDING",
  createdAt: Date
}
```

### SwapRequests Collection

```typescript
{
  _id: ObjectId,
  requesterId: ObjectId, // User requesting the swap
  recipientId: ObjectId, // User receiving the request
  mySlotId: ObjectId, // Requester's task
  theirSlotId: ObjectId, // Recipient's task
  status: "pending" | "accepted" | "rejected",
  createdAt: Date,
  respondedAt?: Date
}
```

## 🔄 Swap System Logic

### Slot Status Management

- **SWAPPABLE**: Available for swap requests
- **BUSY**: Not available for swapping
- **SWAP_PENDING**: Currently involved in pending swap request

### Swap Request Flow

1. **Request Creation**: User creates swap request between two SWAPPABLE slots
2. **Status Update**: Both slots become SWAP_PENDING
3. **Response Handling**:
   - **Accept**: Atomic ownership exchange via MongoDB transactions
   - **Reject**: Both slots revert to SWAPPABLE status

### Atomic Swap Transaction

When a swap is accepted, the system performs:

1. Exchange task ownership (userId fields)
2. Update both users' taskIds arrays
3. Mark swap request as accepted
4. Revert slot status to SWAPPABLE

## 🧪 Testing the Swap System

### 1. Setup Test Data

```powershell
# Seed database with Alice and Bob
Invoke-RestMethod -Uri "http://localhost:3000/api/dev/seed" -Method POST
```

### 2. Login Users

```powershell
# Login Alice
$aliceLogin = Invoke-RestMethod -Uri "http://localhost:3000/api/auth/login" -Method POST -Body '{"email":"alice@example.com","password":"secret123"}' -ContentType "application/json"
$aliceHeaders = @{ Authorization = "Bearer $($aliceLogin.token)" }

# Login Bob
$bobLogin = Invoke-RestMethod -Uri "http://localhost:3000/api/auth/login" -Method POST -Body '{"email":"bob@example.com","password":"secret456"}' -ContentType "application/json"
$bobHeaders = @{ Authorization = "Bearer $($bobLogin.token)" }
```

### 3. View Available Slots

```powershell
# Alice views Bob's swappable slots
Invoke-RestMethod -Uri "http://localhost:3000/api/swappable-slots" -Headers $aliceHeaders
```

### 4. Create Swap Request

```powershell
# Alice requests to swap with Bob (replace with actual task IDs)
$swapRequest = @{
  mySlotId = "ALICE_TASK_ID"
  theirSlotId = "BOB_TASK_ID"
} | ConvertTo-Json
Invoke-RestMethod -Uri "http://localhost:3000/api/swap-request" -Method POST -Body $swapRequest -ContentType "application/json" -Headers $aliceHeaders
```

### 5. Check Pending Requests

```powershell
# Bob checks his pending requests
Invoke-RestMethod -Uri "http://localhost:3000/api/pending-requests" -Headers $bobHeaders
```

### 6. Accept/Reject Swap

```powershell
# Bob accepts the swap (replace with actual request ID)
$acceptSwap = @{
  requestId = "SWAP_REQUEST_ID"
  accepted = $true
} | ConvertTo-Json
Invoke-RestMethod -Uri "http://localhost:3000/api/swap-response" -Method POST -Body $acceptSwap -ContentType "application/json" -Headers $bobHeaders
```

## 🚀 Quick Start Commands

```bash
# Install dependencies
npm install --legacy-peer-deps

# Start development server
npm run dev

# Test database connection
curl http://localhost:3000/api/db

# Seed test data
curl -X POST http://localhost:3000/api/dev/seed
```

## 📁 Project Structure

```
slotswapper/
├── app/
│   ├── api/              # API routes
│   │   ├── auth/         # Authentication endpoints
│   │   ├── tasks/        # Task management
│   │   ├── swappable-slots/    # Available slots
│   │   ├── swap-request/       # Create swap requests
│   │   ├── swap-response/      # Accept/reject swaps
│   │   ├── pending-requests/   # View pending requests
│   │   └── dev/seed/     # Test data seeding
│   ├── layout.tsx        # Root layout
│   └── page.tsx          # Home page
├── components/           # React components
├── lib/                  # Utilities
│   ├── mongodb.ts       # Database connection
│   └── auth.ts          # JWT utilities
└── README.md            # This file
```

## 🧪 API Testing Guide

### Authentication Endpoints

#### 1. User Registration

```bash
POST /api/auth/register
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "securepassword"
}
```

#### 2. User Login

```bash
POST /api/auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "securepassword"
}
```

### Core API Endpoints

#### 3. Seed Test Data (Development Only)

```bash
POST /api/dev/seed
```

_Creates Alice and Bob with sample tasks for testing_

#### 4. Get User's Tasks

```bash
GET /api/tasks
Authorization: Bearer YOUR_JWT_TOKEN
```

#### 5. Create New Task

```bash
POST /api/tasks
Authorization: Bearer YOUR_JWT_TOKEN
Content-Type: application/json

{
  "title": "Team Meeting",
  "date": "2025-11-10",
  "start": "09:00",
  "end": "10:00",
  "description": "Weekly team sync"
}
```

### Advanced Swap System APIs

#### 6. Get Swappable Slots

```bash
GET /api/swappable-slots
Authorization: Bearer YOUR_JWT_TOKEN
```

_Returns all SWAPPABLE slots from other users_

#### 7. Create Swap Request

```bash
POST /api/swap-request
Authorization: Bearer YOUR_JWT_TOKEN
Content-Type: application/json

{
  "mySlotId": "YOUR_TASK_ID",
  "theirSlotId": "TARGET_TASK_ID"
}
```

#### 8. Get Pending Requests

```bash
GET /api/pending-requests
Authorization: Bearer YOUR_JWT_TOKEN
```

#### 9. Respond to Swap Request

```bash
POST /api/swap-response
Authorization: Bearer YOUR_JWT_TOKEN
Content-Type: application/json

{
  "requestId": "SWAP_REQUEST_ID",
  "accepted": true
}
```

## 🧪 PowerShell Testing Examples

### Complete API Test Flow

```powershell
# 1. Seed test data
Invoke-RestMethod -Uri "http://localhost:3000/api/dev/seed" -Method POST

# 2. Login as Alice
$aliceLogin = Invoke-RestMethod -Uri "http://localhost:3000/api/auth/login" -Method POST -Body '{"email":"alice@example.com","password":"secret123"}' -ContentType "application/json"
$aliceHeaders = @{ Authorization = "Bearer $($aliceLogin.token)" }

# 3. Login as Bob
$bobLogin = Invoke-RestMethod -Uri "http://localhost:3000/api/auth/login" -Method POST -Body '{"email":"bob@example.com","password":"secret456"}' -ContentType "application/json"
$bobHeaders = @{ Authorization = "Bearer $($bobLogin.token)" }

# 4. Get Alice's tasks
Invoke-RestMethod -Uri "http://localhost:3000/api/tasks" -Headers $aliceHeaders

# 5. Get swappable slots (Alice sees Bob's slots)
Invoke-RestMethod -Uri "http://localhost:3000/api/swappable-slots" -Headers $aliceHeaders

# 6. Create swap request
$swapRequest = @{ mySlotId = "ALICE_TASK_ID"; theirSlotId = "BOB_TASK_ID" } | ConvertTo-Json
Invoke-RestMethod -Uri "http://localhost:3000/api/swap-request" -Method POST -Body $swapRequest -ContentType "application/json" -Headers $aliceHeaders

# 7. Check pending requests
Invoke-RestMethod -Uri "http://localhost:3000/api/pending-requests" -Headers $bobHeaders

# 8. Accept swap request
$acceptSwap = @{ requestId = "REQUEST_ID"; accepted = $true } | ConvertTo-Json
Invoke-RestMethod -Uri "http://localhost:3000/api/swap-response" -Method POST -Body $acceptSwap -ContentType "application/json" -Headers $bobHeaders
```

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
