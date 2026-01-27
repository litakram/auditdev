// ==================== AI INSIGHTS GENERATOR ====================
// This file handles the generation of AI-powered insights for the audit report

class InsightsGenerator {
    constructor() {
        this.apiKey = null; // Will be set when needed
        this.auditData = null;
        this.companyInfo = null;
        this.generatedInsights = null;
    }

    /**
     * Initialize the generator with audit data
     */
    initialize(auditData, companyInfo) {
        this.auditData = auditData;
        this.companyInfo = companyInfo;
    }

    /**
     * Generate insights using Google Gemini API
     */
    async generateInsights() {
        try {
            // Show loading state
            this.showLoader();

            // Prepare the prompt for AI
            const prompt = this.preparePrompt();

            // Call Gemini API
            const insights = await this.callGeminiAPI(prompt);

            // Parse and structure the insights
            this.generatedInsights = this.parseInsights(insights);

            // Hide loader
            this.hideLoader();

            return this.generatedInsights;
        } catch (error) {
            console.error('Error generating insights:', error);
            this.hideLoader();
            throw error;
        }
    }

    /**
     * Prepare the AI prompt with audit data
     */
    preparePrompt() {
        const axesScores = this.auditData.axes.map(axis => ({
            title: axis.title,
            score: this.calculateAxisScore(axis),
            weight: axis.weight_percent
        }));

        const globalScore = this.calculateGlobalScore();

        const prompt = `Tu es un expert en intelligence artificielle et en transformation digitale. Tu réalises un audit de maturité IA pour l'entreprise "${this.companyInfo.name}".

CONTEXTE DE L'ENTREPRISE:
- Nom: ${this.companyInfo.name}
- Secteur: ${this.companyInfo.sector || 'Non spécifié'}
- Taille: ${this.companyInfo.size || 'Non spécifié'}
- Description: ${this.companyInfo.description || 'Non spécifié'}

RÉSULTATS DE L'AUDIT (Score global: ${globalScore.toFixed(2)}/5):

${axesScores.map(axis => `
${axis.title} (${axis.weight}%): ${axis.score.toFixed(2)}/5
${this.getAxisDetails(axis.title)}
`).join('\n')}

INSTRUCTIONS:
Génère un rapport d'analyse complet au format JSON avec la structure EXACTE suivante:

{
  "resume_executif": "Un résumé concis de 2-3 phrases sur le niveau de maturité IA global",
  "niveau_maturite": "Excellence|Avancé|Intermédiaire|Débutant|Initial avec une brève explication",
  "axes": [
    {
      "nom": "STRATÉGIE IA",
      "score": ${axesScores[0].score.toFixed(1)},
      "points_forts": ["Point fort 1", "Point fort 2"],
      "faiblesses": ["Faiblesse 1", "Faiblesse 2"],
      "recommandations": ["Recommandation 1", "Recommandation 2", "Recommandation 3"],
      "evaluation_detaillee": "Une évaluation détaillée de cet axe en 2-3 phrases"
    },
    ... (répéter pour les 6 axes)
  ],
  "analyse_globale": "Une analyse approfondie de la maturité globale en 4-5 phrases, incluant les tendances, les risques et opportunités",
  "feuille_de_route": {
    "actions_prioritaires": [
      "Action prioritaire 1 avec des détails spécifiques",
      "Action prioritaire 2 avec des détails spécifiques",
      "Action prioritaire 3 avec des détails spécifiques",
      "Action prioritaire 4 avec des détails spécifiques",
      "Action prioritaire 5 avec des détails spécifiques"
    ],
    "conclusion": "Une conclusion motivante et orientée action en 2-3 phrases"
  }
}

IMPORTANT: 
- Retourne UNIQUEMENT du JSON valide, sans texte avant ou après
- Les recommandations doivent être spécifiques, actionnables et adaptées au secteur de l'entreprise
- L'analyse doit être professionnelle, constructive et orientée solutions
- Utilise les scores réels pour guider ton analyse
- Les 6 axes sont: STRATÉGIE IA, DATA, TECHNOLOGIES, GOUVERNANCE, CULTURE ORGANISATIONNELLE, INFRASTRUCTURE`;

        return prompt;
    }

    /**
     * Get detailed information about an axis
     */
    getAxisDetails(axisTitle) {
        const axis = this.auditData.axes.find(a => a.title === axisTitle);
        if (!axis) return '';

        let details = '';
        axis.sub_axes.forEach(subAxis => {
            const subScore = this.calculateSubAxisScore(axis.id, subAxis.id);
            details += `  - ${subAxis.title}: ${subScore.toFixed(2)}/5\n`;
        });

        return details;
    }

    /**
     * Calculate score for an axis
     */
    calculateAxisScore(axis) {
        let totalScore = 0;
        let totalQuestions = 0;

        axis.sub_axes.forEach(subAxis => {
            subAxis.questions.forEach(question => {
                const response = this.auditData.responses[question.id];
                if (response && response.score) {
                    totalScore += response.score;
                    totalQuestions++;
                }
            });
        });

        return totalQuestions > 0 ? totalScore / totalQuestions : 0;
    }

    /**
     * Calculate score for a sub-axis
     */
    calculateSubAxisScore(axisId, subAxisId) {
        const axis = this.auditData.axes.find(a => a.id === axisId);
        if (!axis) return 0;

        const subAxis = axis.sub_axes.find(sa => sa.id === subAxisId);
        if (!subAxis) return 0;

        let totalScore = 0;
        let totalQuestions = 0;

        subAxis.questions.forEach(question => {
            const response = this.auditData.responses[question.id];
            if (response && response.score) {
                totalScore += response.score;
                totalQuestions++;
            }
        });

        return totalQuestions > 0 ? totalScore / totalQuestions : 0;
    }

    /**
     * Calculate global score
     */
    calculateGlobalScore() {
        let weightedSum = 0;
        let totalWeight = 0;

        this.auditData.axes.forEach(axis => {
            const axisScore = this.calculateAxisScore(axis);
            weightedSum += axisScore * axis.weight_percent;
            totalWeight += axis.weight_percent;
        });

        return totalWeight > 0 ? weightedSum / totalWeight : 0;
    }

    /**
     * Call Google Gemini API
     */
    async callGeminiAPI(prompt) {
        const apiKey = ''; // API key from user
        const apiUrl = `https://generativelanguage.googleapis.com/v1/models/gemini-2.5-flash:generateContent?key=${apiKey}`;

        const requestBody = {
            contents: [{
                parts: [{
                    text: prompt
                }]
            }],
            generationConfig: {
                temperature: 0.7,
                topK: 40,
                topP: 0.95,
                maxOutputTokens: 8192,
            }
        };

        try {
            const response = await fetch(apiUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(requestBody)
            });

            if (!response.ok) {
                throw new Error(`API call failed: ${response.statusText}`);
            }

            const data = await response.json();
            
            if (data.candidates && data.candidates[0] && data.candidates[0].content) {
                return data.candidates[0].content.parts[0].text;
            } else {
                throw new Error('Invalid API response structure');
            }
        } catch (error) {
            console.error('Gemini API Error:', error);
            throw error;
        }
    }

    /**
     * Parse AI response into structured insights
     */
    parseInsights(aiResponse) {
        try {
            // Remove markdown code blocks if present
            let cleanedResponse = aiResponse.trim();
            if (cleanedResponse.startsWith('```json')) {
                cleanedResponse = cleanedResponse.replace(/```json\n?/g, '').replace(/```\n?/g, '');
            } else if (cleanedResponse.startsWith('```')) {
                cleanedResponse = cleanedResponse.replace(/```\n?/g, '');
            }

            const insights = JSON.parse(cleanedResponse);
            
            // Validate the structure
            if (!insights.axes || insights.axes.length !== 6) {
                throw new Error('Invalid insights structure: missing or incorrect number of axes');
            }

            return insights;
        } catch (error) {
            console.error('Error parsing insights:', error);
            console.log('AI Response:', aiResponse);
            throw new Error('Failed to parse AI insights. Please try again.');
        }
    }

    /**
     * Prepare data for PDF template
     */
    preparePDFData() {
        if (!this.generatedInsights) {
            throw new Error('Insights not generated yet');
        }

        const globalScore = this.calculateGlobalScore();
        const axesScores = this.auditData.axes.map(axis => this.calculateAxisScore(axis));
        const axesLabels = this.auditData.axes.map(axis => axis.title);

        // Prepare data object with all placeholders
        const pdfData = {
            // Company information
            companyName: this.companyInfo.name || 'Entreprise',
            companyEmail: this.companyInfo.email || 'Non spécifié',
            companyPhone: this.companyInfo.phone || 'Non spécifié',
            reportDate: new Date().toLocaleDateString('fr-FR', {
                day: '2-digit',
                month: 'long',
                year: 'numeric'
            }),

            // Global score
            Score: globalScore.toFixed(1),
            maturityLevel: this.generatedInsights.niveau_maturite,

            // Chart data
            axesLabels: axesLabels,
            axesScores: axesScores.map(s => parseFloat(s.toFixed(1))),

            // Individual axes data
            ...this.prepareAxesData(),

            // Global analysis
            globalAnalysis: this.generatedInsights.analyse_globale,

            // Roadmap
            ...this.prepareRoadmapData()
        };

        return pdfData;
    }

    /**
     * Prepare axes-specific data
     */
    prepareAxesData() {
        const axesData = {};

        this.generatedInsights.axes.forEach((axis, index) => {
            const axisNum = index + 1;
            
            axesData[`axis${axisNum}Score`] = axis.score;
            axesData[`axis${axisNum}Strength1`] = axis.points_forts[0] || '';
            axesData[`axis${axisNum}Strength2`] = axis.points_forts[1] || '';
            axesData[`axis${axisNum}Weakness1`] = axis.faiblesses[0] || '';
            axesData[`axis${axisNum}Weakness2`] = axis.faiblesses[1] || '';
            axesData[`axis${axisNum}Recommendation1`] = axis.recommandations[0] || '';
            axesData[`axis${axisNum}Recommendation2`] = axis.recommandations[1] || '';
            axesData[`axis${axisNum}Recommendation3`] = axis.recommandations[2] || '';
            axesData[`axis${axisNum}DetailedEvaluation`] = axis.evaluation_detaillee || '';
        });

        return axesData;
    }

    /**
     * Prepare roadmap data
     */
    prepareRoadmapData() {
        const actions = this.generatedInsights.feuille_de_route.actions_prioritaires;
        
        return {
            Action1: actions[0] || '',
            Action2: actions[1] || '',
            Action3: actions[2] || '',
            Action4: actions[3] || '',
            Action5: actions[4] || '',
            RoadmapConclusion: this.generatedInsights.feuille_de_route.conclusion || ''
        };
    }

    /**
     * Open PDF page with generated data
     */
    openPDFPage() {
        const pdfData = this.preparePDFData();
        
        // Read the PDF template
        fetch('pdf.html')
            .then(response => response.text())
            .then(template => {
                // Replace all placeholders with actual data
                let populatedHTML = template;
                
                Object.keys(pdfData).forEach(key => {
                    if (typeof pdfData[key] !== 'object') {
                        const placeholder = `\${${key}}`;
                        const value = pdfData[key];
                        populatedHTML = populatedHTML.replace(new RegExp(placeholder.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'), value);
                    }
                });

                // Open in new window
                const pdfWindow = window.open('', '_blank');
                pdfWindow.document.write(populatedHTML);
                pdfWindow.document.close();

                // Pass chart data to the new window
                pdfWindow.axesData = {
                    axesLabels: pdfData.axesLabels,
                    axesScores: pdfData.axesScores
                };

                // Save insights to localStorage for later use
                localStorage.setItem('last-generated-insights', JSON.stringify(this.generatedInsights));
            })
            .catch(error => {
                console.error('Error loading PDF template:', error);
                alert('Erreur lors du chargement du template PDF');
            });
    }

    /**
     * Show loading overlay
     */
    showLoader() {
        let loader = document.getElementById('insights-loader');
        if (!loader) {
            loader = document.createElement('div');
            loader.id = 'insights-loader';
            loader.className = 'insights-loader';
            loader.innerHTML = `
                <div class="loader-content">
                    <div class="loader-spinner"></div>
                    <h3>Génération des insights IA en cours...</h3>
                    <p>Analyse de vos réponses et création du rapport personnalisé</p>
                    <div class="loader-progress">
                        <div class="loader-progress-bar"></div>
                    </div>
                </div>
            `;
            document.body.appendChild(loader);
        }
        loader.style.display = 'flex';

        // Animate progress bar
        const progressBar = loader.querySelector('.loader-progress-bar');
        let progress = 0;
        const interval = setInterval(() => {
            progress += Math.random() * 15;
            if (progress > 90) progress = 90;
            progressBar.style.width = `${progress}%`;
        }, 500);
        
        loader.progressInterval = interval;
    }

    /**
     * Hide loading overlay
     */
    hideLoader() {
        const loader = document.getElementById('insights-loader');
        if (loader) {
            if (loader.progressInterval) {
                clearInterval(loader.progressInterval);
            }
            const progressBar = loader.querySelector('.loader-progress-bar');
            progressBar.style.width = '100%';
            
            setTimeout(() => {
                loader.style.display = 'none';
            }, 500);
        }
    }

    /**
     * Main function to generate and display insights
     */
    async generateAndDisplay() {
        try {
            // Generate insights
            await this.generateInsights();

            // Open PDF page with insights
            this.openPDFPage();

            return this.generatedInsights;
        } catch (error) {
            console.error('Error in generateAndDisplay:', error);
            alert('Une erreur est survenue lors de la génération des insights. Veuillez réessayer.');
            throw error;
        }
    }
}

// Export for use in other files
window.InsightsGenerator = InsightsGenerator;
