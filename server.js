// ==================== PDF GENERATION SERVER ====================
// Node.js/Express server for server-side PDF generation using Playwright

const express = require('express');
const cors = require('cors');
const path = require('path');
const chromium = require('playwright').chromium;

// Load environment variables from .env
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;

// Safe config pulled from environment (do NOT expose secrets)
const CONFIG = {
    GEMINI_MODEL: process.env.GEMINI_MODEL || 'gemini-2.5-flash',
    GEMINI_BASE_URL: process.env.GEMINI_BASE_URL || 'https://generativelanguage.googleapis.com/v1/models',
    PLAYWRIGHT_HEADLESS: (process.env.PLAYWRIGHT_HEADLESS || 'true') === 'true',
    PDF_FORMAT: process.env.PDF_FORMAT || 'A4',
    PDF_MARGIN_MM: parseInt(process.env.PDF_MARGIN_MM || '5', 10),
    LOG_LEVEL: process.env.LOG_LEVEL || 'info',
    NODE_ENV: process.env.NODE_ENV || 'development'
};

console.info('Server configuration (non-sensitive):', {
    PORT,
    model: CONFIG.GEMINI_MODEL,
    pdfFormat: CONFIG.PDF_FORMAT,
    pdfMarginMm: CONFIG.PDF_MARGIN_MM,
    playwrightHeadless: CONFIG.PLAYWRIGHT_HEADLESS
});

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb' }));
app.use(express.static(path.join(__dirname)));

/**
 * Health check endpoint
 */
app.get('/api/health', (req, res) => {
    res.json({ status: 'Server is running', timestamp: new Date().toISOString() });
});

// Expose non-sensitive configuration to the frontend if needed
app.get('/api/config', (req, res) => {
    res.json({
        model: CONFIG.GEMINI_MODEL,
        baseUrl: CONFIG.GEMINI_BASE_URL,
        pdfFormat: CONFIG.PDF_FORMAT,
        pdfMarginMm: CONFIG.PDF_MARGIN_MM,
        playwrightHeadless: CONFIG.PLAYWRIGHT_HEADLESS,
        nodeEnv: CONFIG.NODE_ENV,
        logLevel: CONFIG.LOG_LEVEL
    });
});

/**
 * PDF Generation Endpoint
 * POST /api/generate-pdf
 * Body: { html: "<html>...</html>", filename: "rapport.pdf" }
 * Returns: PDF file as binary
 */
app.post('/api/generate-pdf', async (req, res) => {
    let browser;
    try {
        const { html, filename = 'rapport.pdf' } = req.body;

        if (!html) {
            return res.status(400).json({ error: 'HTML content is required' });
        }

        // Helper to attempt launch and retry install if browsers are missing
        async function launchChromiumWithRetry() {
            const launchArgs = [
                '--disable-gpu',
                '--no-sandbox',
                '--disable-dev-shm-usage',
                '--disable-setuid-sandbox',
                '--disable-software-rasterizer',
                '--single-process',
                '--no-zygote'
            ];

            try {
                return await chromium.launch({
                    headless: CONFIG.PLAYWRIGHT_HEADLESS,
                    args: launchArgs
                });
            } catch (err) {
                console.warn('Playwright launch failed, attempting to install browsers and retry...', err.message);

                // Try to install browsers (best-effort). This can be slow on first-run.
                const { execSync } = require('child_process');
                try {
                    // Use npx to ensure correct playwright install is invoked
                    execSync('npx playwright install --with-deps', { stdio: 'inherit', timeout: 10 * 60 * 1000 });
                } catch (installErr) {
                    console.error('Playwright install failed:', installErr.message || installErr);
                    throw new Error('Playwright browsers not installed and automatic install failed: ' + (installErr.message || installErr));
                }

                // Retry launch once
                return await chromium.launch({
                    headless: CONFIG.PLAYWRIGHT_HEADLESS,
                    args: launchArgs
                });
            }
        }

        // Launch browser
        browser = await launchChromiumWithRetry();

        const page = await browser.newPage();

        // Set viewport for consistent rendering
        await page.setViewportSize({ width: 1024, height: 1280 });

        // Set content and wait for network to settle
        await page.setContent(html, {
            waitUntil: 'networkidle',
            timeout: 60000
        });

        // Wait a bit for any async rendering
        await page.waitForTimeout(1000);

        // Generate PDF with optimized settings
        const pdfBuffer = await page.pdf({
            format: CONFIG.PDF_FORMAT,
            margin: {
                top: `${CONFIG.PDF_MARGIN_MM}mm`,
                right: `${CONFIG.PDF_MARGIN_MM}mm`,
                bottom: `${CONFIG.PDF_MARGIN_MM}mm`,
                left: `${CONFIG.PDF_MARGIN_MM}mm`
            },
            printBackground: true,
            scale: 1.0,
            timeout: 60000
        });

        // Close browser
        try { await browser.close(); } catch (e) { /* ignore close errors */ }

        // Send PDF as response
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
        res.setHeader('Content-Length', pdfBuffer.length);
        res.send(pdfBuffer);

    } catch (error) {
        console.error('PDF Generation Error:', error && error.stack ? error.stack : error);

        // Close browser if still open
        if (browser) {
            try {
                await browser.close();
            } catch (closeError) {
                console.error('Error closing browser:', closeError);
            }
        }

        const isTimeout = error && /timeout/i.test(String(error.message || ''));
        const statusCode = isTimeout ? 408 : 500;

        // Provide more diagnostic info for deploy logs; avoid leaking secrets
        res.status(statusCode).json({
            error: 'Failed to generate PDF',
            message: String(error.message || error),
            hint: 'If this mentions missing browser binaries, run "npx playwright install --with-deps" during build or enable automatic install on startup',
            timestamp: new Date().toISOString()
        });
    }
});

/**
 * Proxy endpoint to call Gemini securely from the server using the API key in .env
 * POST /api/generate-insights
 * Body: { prompt: "...", generationConfig?: {...} }
 */
app.post('/api/generate-insights', async (req, res) => {
    try {
        const { prompt, generationConfig } = req.body || {};
        if (!prompt) return res.status(400).json({ error: 'Prompt is required' });

        if (!process.env.GEMINI_API_KEY) {
            return res.status(500).json({ error: 'Server misconfigured: GEMINI_API_KEY not set' });
        }

        const url = `${CONFIG.GEMINI_BASE_URL}/${encodeURIComponent(CONFIG.GEMINI_MODEL)}:generateContent?key=${encodeURIComponent(process.env.GEMINI_API_KEY)}`;

        // Only allow a whitelist of generationConfig keys to avoid misuse
        const allowedConfig = {
            temperature: 0.7,
            topK: 40,
            topP: 0.95,
            maxOutputTokens: 16384,
            ...(generationConfig || {})
        };

        const body = {
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: allowedConfig
        };

        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body)
        });

        const data = await response.json().catch(() => null);
        if (!response.ok) {
            console.error('Gemini proxy error:', data || response.statusText);
            return res.status(500).json({ error: 'Gemini API error', details: data });
        }

        // Return Gemini response directly to client
        res.json(data);

    } catch (error) {
        console.error('Error in /api/generate-insights:', error);
        res.status(500).json({ error: 'Failed to call Gemini API', message: error.message });
    }
});

/**
 * Error handling middleware
 */
app.use((err, req, res, next) => {
    console.error('Server Error:', err);
    res.status(500).json({
        error: 'Internal Server Error',
        message: err.message
    });
});

// Start server
app.listen(PORT, () => {
    console.log(`=== PDF Generation Server ===`);
    console.log(`Server running at http://localhost:${PORT}`);
    console.log(`API Endpoint: POST http://localhost:${PORT}/api/generate-pdf`);
    console.log(`==============================`);
});
