# 🤖 AI-Powered Audit Insights Generator

## 📋 Overview

This system generates professional, AI-powered insights for your IA Maturity Audit using Google Gemini. It creates beautiful PDF reports with personalized recommendations, analysis, and actionable roadmaps.

## 🎯 Key Features

- **✨ Dynamic AI Insights** - Real-time generation using Google Gemini AI
- **📊 Professional PDF Reports** - Beautiful, print-ready documents
- **⏱️ Smart Loading** - Animated loader with progress feedback
- **📈 Interactive Charts** - Radar, bar, and doughnut visualizations
- **🎨 Custom Branding** - Company-specific information
- **🔄 Real-time Processing** - No static data, everything is generated live

## 🚀 Quick Start

### 1. Complete the Audit

Navigate through all 6 axes of the questionnaire and answer all questions.

### 2. Fill Company Information

On the final screen, provide:
- Company name
- Email address
- Phone number
- Sector
- Company size
- Description

### 3. Generate Report

Click **"Passer au rapport"** button. The system will:
1. Show an animated loading screen
2. Call Google Gemini API
3. Generate personalized insights
4. Open a professional PDF in a new window

### 4. Review & Save

The PDF report includes:
- Executive summary with maturity score
- Visual charts (radar, bar, doughnut)
- Detailed analysis for each of 6 axes
- Strengths and weaknesses
- Actionable recommendations
- Priority action roadmap

## 🧪 Testing

Open `test-insights.html` in your browser to test the insights generator with sample data.

```bash
# Start local server
python -m http.server 8000

# Open in browser
http://localhost:8000/test-insights.html
```

## 🏗️ Architecture

### File Structure

```
auditAIC/
├── index.html                 # Main application
├── pdf.html                   # PDF report template
├── test-insights.html         # Testing page
├── ARCHITECTURE.md            # Detailed architecture docs
├── src/
│   ├── js/
│   │   ├── app.js            # Main application logic
│   │   └── insights-generator.js  # AI insights generator
│   ├── css/
│   │   ├── styles.css        # Main styles
│   │   └── loader.css        # Loading animation styles
│   └── data/
│       └── questionnaire_maturite_ia.json  # Questions
```

### Component Interaction

```
┌─────────────────┐
│   User Input    │
│  (Questionnaire)│
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│   app.js        │
│  Main Logic     │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ insights-       │
│ generator.js    │ ──► Gemini API
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│   pdf.html      │
│  Report Display │
└─────────────────┘
```

## 🔧 Configuration

### API Key

The Gemini API key is configured in `insights-generator.js`:

```javascript
const apiKey = 'AIzaSyAXOZ0t_iplPxo-eN2xzXMOaI0R37xUj3o';
```

### AI Model

To use a different Gemini model, update the API URL:

```javascript
// Current: gemini-1.5-flash
const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;

// For Pro version:
const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-pro:generateContent?key=${apiKey}`;
```

## 📊 Data Flow

1. **User Completes Audit** → Responses saved in localStorage
2. **Submit Company Info** → Triggers `handleCompanyFormSubmit()`
3. **Initialize Generator** → Creates `InsightsGenerator` instance
4. **Show Loader** → Displays animated loading screen
5. **Prepare Prompt** → Builds comprehensive AI prompt with:
   - Company context
   - Audit scores (all 6 axes)
   - Sub-axis details
   - JSON structure requirements
6. **Call Gemini API** → Sends request to Google AI
7. **Parse Response** → Validates and structures JSON data
8. **Prepare PDF Data** → Replaces all placeholders
9. **Open PDF Window** → Displays report in new tab
10. **Hide Loader** → Removes loading screen

## 🎨 Customization

### Change Colors

Edit `pdf.html` CSS variables:

```css
:root {
    --primary: #081d3f;
    --secondary: #ECDC2C;
    --text: #1e293b;
}
```

### Modify PDF Layout

Edit sections in `pdf.html`:
- Cover page
- Table of contents
- Executive summary
- Axis-specific pages
- Roadmap

### Adjust AI Prompt

Modify `preparePrompt()` in `insights-generator.js` to:
- Change tone (formal/casual)
- Add more context
- Request specific formats
- Include industry benchmarks

### Loading Animation

Edit `loader.css` to customize:
- Spinner style
- Colors
- Progress bar
- Messages

## 🐛 Troubleshooting

### PDF doesn't open
- **Check**: Browser popup blocker settings
- **Solution**: Allow popups from localhost

### Loader stays visible
- **Check**: Console for API errors
- **Solution**: Verify API key and internet connection

### Charts not rendering
- **Check**: Chart.js loaded correctly
- **Solution**: Check browser console for errors

### AI returns invalid JSON
- **Check**: API response in console
- **Solution**: Prompt might need adjustment

## 📝 AI Response Format

Expected JSON structure from Gemini:

```json
{
  "resume_executif": "Brief executive summary...",
  "niveau_maturite": "Excellence|Avancé|Intermédiaire|Débutant|Initial - Explanation",
  "axes": [
    {
      "nom": "STRATÉGIE IA",
      "score": 3.5,
      "points_forts": ["Strength 1", "Strength 2"],
      "faiblesses": ["Weakness 1", "Weakness 2"],
      "recommandations": ["Rec 1", "Rec 2", "Rec 3"],
      "evaluation_detaillee": "Detailed evaluation..."
    }
    // ... 6 axes total
  ],
  "analyse_globale": "Overall maturity analysis...",
  "feuille_de_route": {
    "actions_prioritaires": [
      "Action 1", "Action 2", "Action 3", "Action 4", "Action 5"
    ],
    "conclusion": "Motivating conclusion..."
  }
}
```

## 🔒 Security Notes

- API key should be stored securely (use environment variables in production)
- Validate all user inputs
- Sanitize AI responses before display
- Use HTTPS in production

## 📈 Performance

- **Average AI Generation Time**: 5-10 seconds
- **PDF Rendering**: 2-3 seconds
- **Total Process**: ~12 seconds

## 🎓 Best Practices

1. **Complete All Questions** - Better insights with complete data
2. **Provide Detailed Company Info** - More personalized recommendations
3. **Review Generated Content** - AI suggestions should be reviewed
4. **Save Reports** - Print or download for records
5. **Regular Updates** - Re-run audit periodically for progress tracking

## 📞 Support

For issues or questions:
1. Check `ARCHITECTURE.md` for technical details
2. Review browser console for errors
3. Test with `test-insights.html`
4. Verify API key is valid

## 🚀 Future Enhancements

- [ ] Multi-language support
- [ ] Email delivery of reports
- [ ] Historical comparison
- [ ] Custom branding upload
- [ ] PDF download button
- [ ] Report templates selector
- [ ] Offline mode
- [ ] API rate limiting

## 📄 License

© 2025 AI Crafters - All rights reserved

---

**Made with ❤️ using Google Gemini AI**
