# Lark 2025 Holidays Demo

A minimal demo application with a React frontend and FastAPI backend.

## Project Structure

```
lark-2025-holidays-demo/
├── backend/          # FastAPI backend
│   ├── main.py      # Main API application
│   └── requirements.txt
└── frontend/         # React frontend with Vite + TypeScript
    ├── src/
    │   ├── App.tsx  # Main app component
    │   ├── main.tsx
    │   └── index.css
    ├── tsconfig.json
    ├── package.json
    └── vite.config.ts
```

## Features

- **Frontend**: React 18 with TypeScript, Vite, and Tailwind CSS
- **Backend**: FastAPI with in-memory storage (no database)
- **API**: RESTful endpoints for CRUD operations
- **CORS**: Configured for local development
- **Auth**: Stytch OAuth (Google) authentication with protected routes

## Prerequisites

- Python 3.8+
- Node.js 18+
- npm or yarn
- TypeScript (installed as dev dependency)
- Stytch account (free tier available at [stytch.com](https://stytch.com))

## Setup Instructions

### Backend Setup

1. Navigate to the backend directory:
```bash
cd backend
```

2. Create a virtual environment:
```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

3. Install dependencies:
```bash
pip install -r requirements.txt
```

4. Run the FastAPI server:
```bash
uvicorn main:app --reload --port 8000
```

The backend will be available at `http://localhost:8000`

### Frontend Setup

1. Navigate to the frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
   - Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```
   - Get your Stytch public token from the [Stytch Dashboard](https://stytch.com/dashboard/api-keys)
   - Update `.env` with your Stytch public token:
   ```
   VITE_STYTCH_PUBLIC_TOKEN=public-token-live-your-actual-token-here
   ```

4. Configure Stytch OAuth:
   - Go to [Stytch Dashboard → OAuth](https://stytch.com/dashboard/oauth)
   - Enable Google OAuth
   - Add redirect URL: `http://localhost:5173/authenticate`

5. Run the development server:
```bash
npm run dev
```

The frontend will be available at `http://localhost:5173`

## API Endpoints

- `GET /` - Root endpoint
- `GET /api/health` - Health check
- `GET /api/items` - Get all items
- `GET /api/items/{item_id}` - Get specific item
- `POST /api/items` - Create new item

## Development

Both servers support hot-reload during development:
- Backend: FastAPI with `--reload` flag
- Frontend: Vite's fast HMR (Hot Module Replacement)

## Authentication Flow

1. Users visit the app and are presented with a Google OAuth login button
2. After clicking, they're redirected to Google for authentication
3. Google redirects back to `/authenticate` with a token
4. The app exchanges the token with Stytch for a session
5. Users are redirected to the dashboard with an active session
6. Protected routes check for valid session before rendering content

## Project Structure (Updated)

```
frontend/src/
├── auth/
│   ├── LoginOrSignup.tsx    # Login/signup UI component
│   └── Authenticate.tsx      # OAuth callback handler
├── components/
│   ├── ProtectedRoute.tsx   # HOC for protected routes
│   └── Dashboard.tsx         # Main dashboard (protected)
├── App.tsx                   # Router configuration
└── main.tsx                  # App entry with Stytch provider
```

## Next Steps

- [x] Add user authentication with Stytch
- [x] Implement protected routes
- [x] Add customer sign-up functionality
- [ ] Add backend authentication verification
- [ ] Deploy to production

## License

MIT

