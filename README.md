# NoteFlow AI — Smart Notes & Action Items Automation

NoteFlow AI is a production-grade, full-stack AI web application built to convert messy, unstructured meeting transcripts, rough ideas, and email threads into clean executive summaries, cataloged decisions, and interactive trackable action items powered by Google Gemini 2.5 AI.

---

## 🌟 Key Features

- **Full User Authentication & JWT Sessions**: Secure registration, login, profile management, and password hashing using `bcryptjs` (cost factor 10) and 7-day JWT tokens.
- **Strict Data Isolation (RLS Pattern)**: Every single API query and database operation is strictly scoped to the authenticated `user_id`. Multi-tenant data leakage is impossible.
- **Backend-Only Gemini 2.5 AI Integration**: All AI operations execute strictly on the Express backend server using the `@google/genai` SDK with JSON schema enforcement (`responseMimeType: "application/json"`) and Zod validation. Zero API keys exposed on client.
- **Automatic AI Retry & Graceful Error Handling**: 20-second API timeout and automatic single retry with stricter system instructions if JSON output or validation fails.
- **Full Notes CRUD & Processing**: Create notes, save drafts, edit raw text, reprocess with AI (preserving task completion statuses), archive/delete.
- **Interactive Global Action Items Checklist**: View, filter (by status `open`/`done`, priority `high`/`medium`/`low`, search query), inline task editing, and status toggling across all notes.
- **Dashboard Metrics**: Real-time stats bar showing Total Notes, Open Action Items, Tasks Completed This Week, and AI Automation Rate.
- **Rich Dark Theme Aesthetics**: Crafted with Tailwind CSS, Glassmorphism, CSS micro-interactions, Google Fonts ('Outfit' & 'Inter'), and Lucide Icons.

---

## 🏗️ Technology Stack

- **Frontend**: React.js 18, Vite 5, Tailwind CSS 3, Lucide React, Axios, React Router 6
- **Backend**: Node.js 26, Express.js 4, JWT, bcryptjs, Zod 3, `@google/genai` SDK
- **Database**: PostgreSQL (`pg`) with automatic fallback to local JSON database store (`server/db/dataStore.js`) for instant zero-config offline development.

---

## 📁 Project Structure

```
noteflow-ai/
├── client/                     # Vite + React Frontend
│   ├── src/
│   │   ├── components/         # Reusable UI Primitives (Navbar, NoteCard, ActionItemRow, etc.)
│   │   ├── context/            # AuthContext (JWT session state)
│   │   ├── pages/              # Route pages (Landing, Dashboard, NoteDetail, GlobalActionItems, etc.)
│   │   ├── services/           # Axios instance with request/response interceptors
│   │   ├── App.jsx             # React Router structure
│   │   ├── main.jsx            # React root entry point
│   │   └── index.css           # Tailwind CSS & Glassmorphism styles
│   ├── index.html
│   ├── vite.config.js
│   ├── tailwind.config.js
│   ├── .env
│   └── .env.example
├── server/                     # Node.js + Express Backend
│   ├── db/                     # PostgreSQL connection pool, schema migrations & local fallback store
│   ├── middleware/             # JWT authMiddleware & global errorHandler
│   ├── routes/                 # Express API routes (auth, notes, actionItems, dashboard)
│   ├── services/               # Gemini AI integration service (processNotesWithAI)
│   ├── validators/             # Zod validation schemas
│   ├── server.js               # Main Express application entry point
│   ├── test_e2e.js             # Automated E2E verification test script
│   ├── .env
│   └── .env.example
├── .gitignore
├── README.md
└── package.json
```

---

## 🚀 Quick Start & Installation

### 1. Install Dependencies
Run the command below from the root directory to install both server and client packages:

```bash
npm run install:all
```

### 2. Environment Variables Configuration

- **Server configuration (`server/.env`)**:
  ```env
  PORT=5000
  NODE_ENV=development
  CLIENT_URL=http://localhost:5173
  JWT_SECRET=your_jwt_secret_here
  GEMINI_API_KEY=your_google_gemini_api_key
  DATABASE_URL=postgres://user:password@localhost:5432/noteflow_db
  ```
  *(Note: If `DATABASE_URL` or `GEMINI_API_KEY` are not set, the application automatically runs in local offline store mode so you can test all features seamlessly out-of-the-box!)*

- **Client configuration (`client/.env`)**:
  ```env
  VITE_API_BASE_URL=http://localhost:5000
  ```

### 3. Run Development Servers

- **Backend Server**:
  ```bash
  npm run dev:server
  ```
  *Server starts on `http://localhost:5000`*

- **Frontend Client**:
  ```bash
  npm run dev:client
  ```
  *Client starts on `http://localhost:5173`*

---

## 🧪 Running Automated E2E Verification Tests

Run the programmatic test suite to verify authentication, note creation, Gemini AI extraction, task toggling, and multi-tenant user data isolation:

```bash
cd server
node test_e2e.js
```

---

## 🛡️ Security Architecture

1. **Server-Side API Key Storage**: `GEMINI_API_KEY` is referenced strictly inside `server/services/geminiService.js` and is never sent to the frontend or bundled into client code.
2. **User Data Isolation**: Express middleware (`authMiddleware`) decodes JWT and assigns `req.user.id`. Every database operation appends `WHERE user_id = req.user.id`.
3. **Password Security**: Passwords are hashed with `bcryptjs` using 10 rounds of salt before database persistence.
