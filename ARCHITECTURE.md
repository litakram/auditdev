# AI Insights Generator - Architecture Documentation

## Overview
This system generates AI-powered insights for the audit report using Google Gemini API and displays them in a professional PDF format.

## Architecture Components

### 1. **insights-generator.js**
Main JavaScript file that handles the entire insights generation process.

**Key Features:**
- Initializes with audit data and company information
- Calls Google Gemini API to generate insights
- Parses AI response into structured JSON
- Prepares data for PDF template
- Opens PDF page with populated data
- Shows/hides loading animations

**Main Methods:**
- `initialize(auditData, companyInfo)` - Set up the generator
- `generateInsights()` - Call AI and get insights
- `generateAndDisplay()` - Main entry point
- `preparePDFData()` - Format data for PDF template
- `openPDFPage()` - Open populated PDF in new window

### 2. **loader.css**
Provides professional loading animation during AI generation.

**Features:**
- Full-screen overlay with blur effect
- Animated spinner
- Progress bar
- Informative messages

### 3. **pdf.html**
Professional PDF template with placeholders for dynamic data.

**Placeholders:**
- Company info: `${companyName}`, `${companyEmail}`, `${companyPhone}`
- Scores: `${Score}`, `${axis1Score}`, etc.
- Insights: `${axis1Strength1}`, `${axis1Recommendation1}`, etc.
- Analysis: `${globalAnalysis}`, `${RoadmapConclusion}`

### 4. **app.js Integration**
Updated to trigger insights generation when company form is submitted.

**Flow:**
1. User fills company information form
2. Clicks "Passer au rapport"
3. `handleCompanyFormSubmit()` called
4. `generateInsightsReport()` initiated
5. InsightsGenerator creates insights
6. PDF page opens with results

## Data Flow

```
User Input (Questionnaire + Company Info)
    ↓
handleCompanyFormSubmit()
    ↓
generateInsightsReport()
    ↓
InsightsGenerator.initialize()
    ↓
[LOADER SHOWS]
    ↓
preparePrompt() → Creates AI prompt with audit data
    ↓
callGeminiAPI() → Sends request to Google Gemini
    ↓
parseInsights() → Converts JSON response to structured data
    ↓
preparePDFData() → Formats data for PDF template
    ↓
openPDFPage() → Replaces placeholders and opens PDF
    ↓
[LOADER HIDES]
    ↓
PDF Displayed in New Window
```

## AI Prompt Structure

The system sends a comprehensive prompt to Gemini including:
1. Company context (name, sector, size, description)
2. Complete audit results with scores per axis
3. Detailed sub-axis scores
4. Specific JSON structure requirements
5. Instructions for professional, actionable recommendations

## Expected AI Response Format

```json
{
  "resume_executif": "...",
  "niveau_maturite": "...",
  "axes": [
    {
      "nom": "STRATÉGIE IA",
      "score": 3.5,
      "points_forts": ["...", "..."],
      "faiblesses": ["...", "..."],
      "recommandations": ["...", "...", "..."],
      "evaluation_detaillee": "..."
    }
    // ... 6 axes total
  ],
  "analyse_globale": "...",
  "feuille_de_route": {
    "actions_prioritaires": ["...", "...", "...", "...", "..."],
    "conclusion": "..."
  }
}
```

## Features

### ✅ Dynamic Data
- No static placeholders - all data generated in real-time
- Adapts to actual audit responses
- Company-specific recommendations

### ✅ Professional Loading
- Animated spinner during AI generation
- Progress bar for user feedback
- Informative status messages
- Prevents user interaction during loading

### ✅ Error Handling
- API call failures caught and reported
- JSON parsing validation
- User-friendly error messages
- Graceful fallbacks

### ✅ Chart Integration
- Radar chart for overall maturity
- Bar chart for axis comparison
- Doughnut chart for weight distribution
- All charts render with actual data

## Usage

### For Developers

1. **Initialize Generator:**
```javascript
const generator = new InsightsGenerator();
generator.initialize(auditData, companyInfo);
```

2. **Generate Insights:**
```javascript
await generator.generateAndDisplay();
```

3. **Access Generated Data:**
```javascript
const insights = generator.generatedInsights;
```

### For Users

1. Complete the audit questionnaire
2. Fill in company information form
3. Click "Passer au rapport"
4. Wait for AI generation (loading screen)
5. PDF opens automatically in new window
6. Review, print, or download the report

## Customization

### API Key
Update in `insights-generator.js`:
```javascript
const apiKey = 'YOUR_API_KEY';
```

### AI Model
Modify the API URL to use different Gemini models:
```javascript
const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-pro:generateContent?key=${apiKey}`;
```

### Prompt Engineering
Adjust the prompt in `preparePrompt()` method to get different types of insights.

### PDF Template
Modify `pdf.html` to change layout, colors, or add new sections.

## Benefits

1. **Automated Analysis** - AI generates insights automatically
2. **Personalized Reports** - Tailored to each company
3. **Professional Output** - PDF-ready format
4. **Fast Generation** - Real-time results
5. **Scalable** - Works for any industry/company size
6. **User-Friendly** - Simple loading and display

## Future Enhancements

- Multiple language support
- PDF download/email integration
- Historical comparison
- Custom branding options
- Offline mode with cached templates
