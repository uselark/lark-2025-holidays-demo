# Lark 2025 Thanksgiving demo

A fun little app that demonstrates a billing integration with [Lark](https://uselark.ai/)

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

4. Set up environment variables:
   - Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```
   - Add appropriate values for the environment variable

5. Run the FastAPI server:
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
   - Add appropriate values for the environment variable

4. Configure Stytch OAuth:
   - Go to [Stytch Dashboard → OAuth](https://stytch.com/dashboard/oauth)
   - Enable Google OAuth
   - Add redirect URL: `http://localhost:5174/authenticate`

5. Run the development server:
```bash
npm run dev
```

The frontend will be available at `http://localhost:5174`
