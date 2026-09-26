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
