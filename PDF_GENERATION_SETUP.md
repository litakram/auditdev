# Server-Side PDF Generation Setup

## Overview
The PDF generation has been moved from client-side (html2pdf.js) to server-side using Playwright for better reliability, performance, and control.

## Architecture
- **Frontend**: `report.html` - Sends HTML content to backend API
- **Backend**: `server.js` - Node.js/Express server with Playwright
- **API Endpoint**: `POST http://localhost:3001/api/generate-pdf`

## Setup Instructions

### 1. Install Node.js Dependencies
```bash
cd c:\Users\user\Desktop\AIC\auditAIC
npm install
```

This will install:
- `express` - Web framework
- `cors` - Cross-Origin Resource Sharing
- `playwright` - Browser automation for PDF generation
- `dotenv` - Loads environment variables from a `.env` file

### 1.1 Configure environment variables
- Copy `.env.example` to `.env` and fill in the values (do NOT commit `.env`):

```bash
cp .env.example .env
# then edit .env and add your GEMINI_API_KEY
```

Important:
- **Never** put your real API keys in client-side files. The Gemini API key should be stored in the server `.env` and used only from the server.
- The project provides a secure server proxy endpoint `POST /api/generate-insights` that will forward prompts to Gemini using the server-side key.
- The `.env` file is ignored by default (`.gitignore` contains `.env`).

### 2. Start the Server
```bash
npm start
```

Or for development with auto-reload:
```bash
npm run dev
```

Expected output:
```
=== PDF Generation Server ===
Server running at http://localhost:3001
API Endpoint: POST http://localhost:3001/api/generate-pdf
==============================
```

### 3. Run the Application
Open your browser and navigate to:
```
http://localhost:8000/index.html
```
(or your current local server address)

## API Endpoint

### Generate PDF
**POST** `/api/generate-pdf`

**Request:**
```json
{
  "html": "<html>...</html>",
  "filename": "rapport.pdf"
}
```

**Response:**
- Success: PDF file (binary)
- Error: JSON error object

**Example:**
```javascript
const response = await fetch('http://localhost:3001/api/generate-pdf', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
        html: reportHTML,
        filename: 'Audit_Report.pdf'
    })
});

const blob = await response.blob();
```

## Workflow

1. **User completes audit** → Answers questionnaire
2. **Reviews results** → Checks scores and analysis
3. **Submits company info** → Redirects to report.html
4. **AI generates insights** → Gemini API processing
5. **Report displays** → Dynamic content population
6. **User clicks "Download"** → Calls `downloadPdfReport()`
7. **HTML sent to server** → POST request to `/api/generate-pdf`
8. **Playwright generates PDF** → Server-side rendering
9. **PDF downloaded** → Browser handles file download

---

## Deploying to Vercel
You can deploy this project to Vercel. The repository includes a `vercel.json` configuration that:
- Builds `server.js` as a serverless function (`@vercel/node`) and serves static assets
- Routes requests to `/api/*` to the serverless function

Recommended steps:
1. Install the Vercel CLI (optional): `npm i -g vercel`
2. Login and link your project: `vercel login` then `vercel link`
3. Set required environment variables in the Vercel dashboard or via CLI (secrets):
   - `GEMINI_API_KEY` (add as a secret/environment variable — **do not** store it in the repo)
   - `GEMINI_MODEL` (e.g., `gemini-2.5-flash`)
   - `GEMINI_BASE_URL` (e.g., `https://generativelanguage.googleapis.com/v1/models`)
   - `PLAYWRIGHT_HEADLESS` (true/false)
   - `PDF_FORMAT`, `PDF_MARGIN_MM` (optional)

Using the CLI to add a secret:
```bash
vercel env add GEMINI_API_KEY production
```

Notes:
- Use Vercel project settings to add `GEMINI_API_KEY` — do not commit secrets to Git.
- If you prefer a dedicated backend, deploy the server on a VM or managed service and configure `insights-generator.js` to use the hosted server URL.

## Features

- ✅ Server-side PDF generation with Playwright
- ✅ Better rendering than client-side html2pdf
- ✅ Support for complex CSS and JavaScript-rendered content
- ✅ Consistent PDF output across browsers
- ✅ Error handling and logging
- ✅ CORS enabled for frontend communication

## Troubleshooting

### Port Already in Use
If port 3001 is in use, modify the `PORT` variable in `server.js`:
```javascript
const PORT = process.env.PORT || 3001;
// or set via environment
PORT=3002 npm start
```

### Playwright Not Found
Ensure Playwright is installed:
```bash
npm install playwright
npx playwright install
```

### CORS Errors
The server is configured with CORS enabled. If you still get errors, check:
- Server is running on `localhost:3001`
- Frontend is making requests to `http://localhost:3001/api/generate-pdf`

### PDF Generation Fails
Check the terminal output for detailed error messages from Playwright.

## Files Modified

- ✅ `server.js` - NEW: Node.js/Express server
- ✅ `package.json` - NEW: Project dependencies
- ✅ `report.html` - MODIFIED: `downloadPdfReport()` now calls server API

## Environment Requirements

- Node.js 14+ 
- npm or yarn
- Local server running frontend (for testing)

## Performance Notes

- First PDF generation may take 2-3 seconds (browser startup)
- Subsequent requests are faster
- Large reports may take 5-10 seconds
- Server remains running for subsequent requests

## Security Considerations

⚠️ For production:
- Add authentication to `/api/generate-pdf` endpoint
- Validate HTML content to prevent injection attacks
- Run server behind HTTPS proxy
- Use environment variables for sensitive data
- Implement rate limiting
- Run Playwright in headless mode with security options
