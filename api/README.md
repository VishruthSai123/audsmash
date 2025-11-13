# AudSmash API

Simple Express backend for handling YouTube search via Serper API.

## Setup

1. Install dependencies:
```bash
cd api
npm install
```

2. Make sure your `.env` file in the root directory has:
```
VITE_SERPER_API_KEY=your_serper_api_key
```

3. Start the server:
```bash
npm run dev
```

The API will run on http://localhost:3001

## Endpoints

### Health Check
- **GET** `/health`
- Returns server status

### YouTube Search
- **POST** `/api/search/youtube`
- Body: `{ "query": "search term" }`
- Returns: YouTube video results

## Note

This is a simple backend to keep your Serper API key secure. In production, you should add:
- Rate limiting
- Authentication
- Request validation
- Error logging
- HTTPS
