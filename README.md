# AIC Audit Application

## Description

The AIC Audit Application is a web-based tool for conducting AI maturity audits. It features a questionnaire interface for assessing organizational AI readiness and generates detailed PDF reports using server-side rendering with Playwright.

## Features

- Interactive AI maturity questionnaire
- Real-time insights generation
- Server-side PDF report generation
- Responsive web interface

## Technologies Used

- **Backend**: Node.js, Express.js
- **PDF Generation**: Playwright
- **Frontend**: HTML5, CSS3, JavaScript
- **Other**: CORS for cross-origin requests, dotenv for environment variables

## Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/litakram/auditdev.git
   cd auditdev
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables:
   - Copy `.env.example` to `.env` (if available) or create a `.env` file with necessary configurations.

## Usage

1. Start the development server:
   ```bash
   npm run dev
   ```

2. For production:
   ```bash
   npm start
   ```

3. Open your browser and navigate to `http://localhost:3000` (or the configured port) to access the application.

4. Fill out the AI maturity questionnaire in `index.html`.

5. Generate and download PDF reports via the server.

## Project Structure

```
auditdev/
├── index.html              # Main application interface
├── report.html             # Report template
├── server.js               # Express server for PDF generation
├── package.json            # Project dependencies and scripts
├── .env                    # Environment variables
├── assets/
│   └── images/             # Static images
└── src/
    ├── css/
    │   └── styles.css      # Application styles
    ├── data/
    │   └── questionnaire_maturite_ia.json  # Questionnaire data
    └── js/
        ├── app.js          # Main application logic
        └── insights-generator.js  # Insights generation logic
```

## Scripts

- `npm start`: Start the production server
- `npm run dev`: Start the development server with nodemon
- `npm run build`: No build step (placeholder)
- `npm run render-build`: Install Playwright and run build

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## License

This project is licensed under the MIT License.