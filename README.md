<<<<<<< HEAD
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
=======
# NoteFlow AI

NoteFlow AI is an AI-powered productivity and knowledge-management application that converts unstructured notes and text into structured, actionable information.

Users can provide meeting notes, discussions, email content, lecture notes, project information, or other unstructured text. The application uses Google Gemini to generate a concise summary, identify key decisions, and extract actionable tasks with relevant owners, deadlines, and priorities.

## Features

### User Authentication

* User registration and login
* JWT-based authentication
* Secure password hashing with bcrypt
* Protected application routes
* User-specific data access

### Note Management

* Create notes from raw text
* View individual notes
* Edit existing notes
* Archive or delete notes
* Search and filter notes
* Sort notes by recent activity
* Track note processing status

### AI-Powered Processing

NoteFlow AI processes unstructured text using Google Gemini and generates:

* Concise summaries
* Key decisions
* Action items
* Task owners when identified
* Deadlines when mentioned
* Task priorities

AI responses are validated before being stored in the database to ensure that the application receives data in the expected structure.

### Action Item Management

Action items extracted from notes can be managed independently.

Users can:

* View action items across notes
* Mark tasks as open or completed
* Edit tasks
* Update owners
* Update deadlines
* Change priorities
* Delete action items
* Filter action items by status, priority, and deadline

### Dashboard

The dashboard provides an overview of the user's workspace, including:

* Total notes
* Open action items
* Recently created notes
* Completed tasks

### AI Processing Reliability

The application includes handling for AI-processing failures.

If an AI request fails, the application retries the request once. If processing still fails, the note is marked as failed while preserving the original user content.

## Application Workflow

```text
User
  |
  v
Create or Edit Note
  |
  v
Enter Unstructured Text
  |
  v
Process with AI
  |
  v
Google Gemini
  |
  +-------------------+-------------------+
  |                   |                   |
  v                   v                   v
Summary           Decisions         Action Items
                                      |
                              +-------+-------+
                              |       |       |
                              v       v       v
                            Owner  Deadline Priority
```

The generated information is stored and associated with the authenticated user's account.

## Technology Stack

### Frontend

* React.js
* Vite
* React Router
* Tailwind CSS
* Axios
* Lucide Icons

### Backend

* Node.js
* Express.js
* JWT
* bcrypt
* Zod

### Database

* PostgreSQL
* Supabase

### Generative AI

* Google Gemini API
* `@google/genai`

## Architecture

The application follows a client-server architecture.

```text
+-----------------------+
|       React Client    |
|                       |
| Dashboard             |
| Notes                 |
| Action Items          |
| Authentication        |
+-----------+-----------+
            |
            | HTTP API
            v
+-----------------------+
|    Express Server     |
|                       |
| Authentication       |
| Note APIs             |
| Action Item APIs      |
| Validation            |
| AI Service            |
+-----------+-----------+
            |
      +-----+------+
      |            |
      v            v
+-----------+  +----------------+
| Supabase  |  | Google Gemini  |
| PostgreSQL|  | API            |
+-----------+  +----------------+
```

The Gemini API is accessed from the server rather than directly from the client. API credentials are stored in environment variables and are not exposed to the frontend.

## Data Model

The core application uses three primary entities.

### Users

Stores authenticated user information.

Main fields include:

* ID
* Email
* Password hash
* Name
* Created timestamp

### Notes

Stores the original content and AI-generated results.

Main fields include:

* ID
* User ID
* Title
* Raw text
* Summary
* Decisions
* Processing status
* Archive status
* Created timestamp
* Updated timestamp

### Action Items

Stores actionable tasks extracted from notes.

Main fields include:

* ID
* Note ID
* User ID
* Task
* Owner
* Deadline
* Priority
* Status
* Created timestamp
* Updated timestamp

## Security

Security and data isolation are core parts of the application.

The application is designed to:

* Hash passwords using bcrypt
* Authenticate protected requests using JWT
* Validate incoming request data with Zod
* Restrict database operations to the authenticated user
* Keep Gemini API credentials on the server
* Prevent API secrets from being exposed in client-side code
* Use Supabase Row Level Security where applicable
* Prevent users from accessing other users' notes and action items

## Project Structure

```text
noteflow-ai/
|
+-- client/
|   +-- src/
|       +-- components/
|       +-- pages/
|       +-- context/
|       +-- services/
|       +-- App.jsx
|
+-- server/
|   +-- routes/
|   +-- middleware/
|   +-- services/
|   +-- validators/
|   +-- db/
|   +-- server.js
|
+-- README.md
+-- .gitignore
```

The exact structure may evolve as the project develops.

## Getting Started

### Prerequisites

Make sure the following are installed:

* Node.js
* npm
* A Supabase project
* A Google Gemini API key

### Clone the Repository

```bash
git clone YOUR_REPOSITORY_URL
cd noteflow-ai
```

### Install Dependencies

Install the dependencies for the client and server according to their respective `package.json` files.

### Environment Variables

Configure the required environment variables.

Example server configuration:

```env
PORT=5000
NODE_ENV=development
CLIENT_URL=http://localhost:5173

JWT_SECRET=your_jwt_secret
GEMINI_API_KEY=your_gemini_api_key
DATABASE_URL=your_database_connection_string
```

Example client configuration:

```env
VITE_API_BASE_URL=http://localhost:5000
```

Do not commit actual API keys, passwords, database credentials, or `.env` files to the repository.

## Running the Application

Start the backend server using the project's configured development command.

Then start the React client using its configured development command.

Once both services are running, open the frontend application in a browser.

## AI Response Validation

Gemini responses are expected to follow a structured JSON format.

The application validates the response before storing it.

The expected structure contains:

```json
{
  "summary": "string",
  "decisions": ["string"],
  "action_items": [
    {
      "task": "string",
      "owner": "string | null",
      "deadline": "YYYY-MM-DD | null",
      "priority": "low | medium | high"
    }
  ]
}
```

Zod validation is used on the server to ensure that generated data matches the expected structure.

## Example

### Input

```text
The team discussed the upcoming project demo.

Ravi will prepare the presentation by Friday.
Meghana will complete the database design tomorrow.

The team decided to use React and Supabase.
The final demo will be on Monday.
```

### Generated Information

**Summary**

The team discussed the upcoming project demo, assigned presentation and database tasks, and selected React and Supabase for the project.

**Decisions**

* Use React for the application.
* Use Supabase for the database.
* Conduct the final demo on Monday.

**Action Items**

| Task                         | Owner   | Deadline | Priority |
| ---------------------------- | ------- | -------- | -------- |
| Prepare the presentation     | Ravi    | Friday   | High     |
| Complete the database design | Meghana | Tomorrow | High     |

## Use Cases

NoteFlow AI can be used for:

* Meeting notes
* Project discussions
* Team planning
* Lecture notes
* Brainstorming sessions
* Email discussions
* Hackathon planning
* Software development discussions
* Personal notes

## Current Development

NoteFlow AI is an actively developed project. The application is being extended with additional productivity and content-input capabilities while maintaining the existing note-processing and action-management workflow.

## Future Enhancements

Potential future improvements include:

* Additional document and file input support
* AI-powered questions about individual notes
* Tags and favorites
* Collections
* Calendar-based deadline management
* Recent activity tracking
* AI-generated workspace insights
* Additional content sources
* Advanced knowledge search
* Collaboration features

## Project Objective

The objective of NoteFlow AI is to demonstrate how Generative AI can be integrated into a practical full-stack application to transform unstructured information into structured and actionable data.

The project combines:

* Full-stack web development
* Generative AI
* Database management
* Authentication and authorization
* Data validation
* Secure API integration
* Productivity-focused user experience

## License

This project is currently developed as an academic and portfolio project.

A specific open-source license can be added if the project is later intended for public redistribution or open-source contribution.
>>>>>>> 8a8d1cdfe9e2b51ab8734e23634a9b75ac1e4330
