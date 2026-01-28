// ==================== INSIGHTS GENERATOR ====================
// This module handles AI-powered insights generation for the audit report

// NOTE: For security, the Gemini API key is stored on the server and accessed via a proxy endpoint.
// Do NOT hard-code API keys in client-side code. The server exposes POST /api/generate-insights which proxies requests to Gemini.


/**
 * Main class for generating AI insights
 */
class InsightsGenerator {
    constructor() {
        this.auditData = null;
        this.companyInfo = null;
        this.insights = null;
    }

    /**
     * Load audit data from localStorage
     */
    loadAuditData() {
        try {
            const savedResponses = localStorage.getItem('audit-responses');
            const savedCompanyInfo = localStorage.getItem('company-info');
            const savedQuestionnaire = localStorage.getItem('audit-questionnaire');

            if (savedResponses) {
                this.responses = JSON.parse(savedResponses);
            }

            if (savedCompanyInfo) {
                this.companyInfo = JSON.parse(savedCompanyInfo);
            }

            return true;
        } catch (error) {
            console.error('Error loading audit data:', error);
            return false;
        }
    }

    /**
     * Load questionnaire data
     */
    async loadQuestionnaire() {
        try {
            const response = await fetch('/src/data/questionnaire_maturite_ia.json');
            this.questionnaire = await response.json();
            return true;
        } catch (error) {
            console.error('Error loading questionnaire:', error);
            return false;
        }
    }

    /**
     * Calculate axis score
     */
    calculateAxisScore(axisId) {
        if (!this.questionnaire || !this.responses) return 0;

        const axis = this.questionnaire.axes.find(a => a.id === axisId);
        if (!axis) return 0;

        let totalScore = 0;
        let answeredQuestions = 0;

        axis.sub_axes.forEach(subAxis => {
            subAxis.questions.forEach(question => {
                const response = this.responses[question.id];
                if (response && response.score !== undefined) {
                    totalScore += response.score;
                    answeredQuestions++;
                }
            });
        });

        return answeredQuestions > 0 ? totalScore / answeredQuestions : 0;
    }

    /**
     * Calculate global score
     */
    calculateGlobalScore() {
        if (!this.questionnaire) return 0;

        let totalWeightedScore = 0;
        let totalWeight = 0;

        this.questionnaire.axes.forEach(axis => {
            const axisScore = this.calculateAxisScore(axis.id);
            const weight = axis.weight_percent / 100;
            totalWeightedScore += axisScore * weight;
            totalWeight += weight;
        });

        return totalWeight > 0 ? totalWeightedScore : 0;
    }

    /**
     * Prepare comprehensive audit data for AI analysis
     */
    prepareAuditDataForAI() {
        if (!this.questionnaire || !this.responses) {
            console.error('Questionnaire or responses not available');
            return null;
        }

        const auditData = {
            globalScore: this.calculateGlobalScore(),
            company: this.companyInfo,
            axes: []
        };

        // Compile information for each axis
        this.questionnaire.axes.forEach(axis => {
            const axisScore = this.calculateAxisScore(axis.id);

            const axisData = {
                id: axis.id,
                title: axis.title,
                score: axisScore,
                weight: axis.weight_percent,
                sub_axes: []
            };

            // Compile information for each sub-axis
            axis.sub_axes.forEach(subAxis => {
                const subAxisData = {
                    id: subAxis.id,
                    title: subAxis.title,
                    questions: []
                };

                // Compile responses for each question
                subAxis.questions.forEach(question => {
                    const response = this.responses[question.id] || {};
                    const score = response.score !== undefined ? response.score : 0;

                    // Get score meaning
                    const scoreSignification = question.notes ? question.notes[score] || '' : '';

                    subAxisData.questions.push({
                        id: question.id,
                        text: question.text,
                        score: score,
                        signification: scoreSignification
                    });
                });

                axisData.sub_axes.push(subAxisData);
            });

            auditData.axes.push(axisData);
        });

        return auditData;
    }

    /**
     * Get maturity level description
     */
    getMaturityLevel(score) {
        if (score >= 4.5) return "Excellence - Votre organisation est un leader en matière d'IA";
        if (score >= 3.5) return "Avancé - Bonne maturité avec quelques axes d'amélioration";
        if (score >= 2.5) return "Intermédiaire - Fondations solides, développement en cours";
        if (score >= 1.5) return "Débutant - Premiers pas vers la maturité IA";
        return "Initial - Opportunités significatives de développement";
    }

    /**
     * Build the prompt for AI analysis
     */
    buildPrompt(auditData) {
        return `Tu es un consultant expert en transformation digitale et intelligence artificielle. 
Analyse les résultats de cet audit de maturité IA et génère un rapport détaillé en JSON.

## Informations de l'entreprise:
- Nom: ${auditData.company?.name || 'Non spécifié'}
- Secteur: ${auditData.company?.sector || 'Non spécifié'}
- Taille: ${auditData.company?.size || 'Non spécifié'}
- Description: ${auditData.company?.description || 'Non spécifié'}

## Score Global: ${auditData.globalScore.toFixed(2)}/5

## Résultats par Axe:
${auditData.axes.map(axis => `
### ${axis.title} (Score: ${axis.score.toFixed(2)}/5, Poids: ${axis.weight}%)
${axis.sub_axes.map(subAxis => `
  - ${subAxis.title}:
${subAxis.questions.map(q => `    * ${q.text}: ${q.score}/5 - ${q.signification}`).join('\n')}`).join('\n')}`).join('\n')}

## Instructions:
Génère un JSON avec EXACTEMENT cette structure (remplace les valeurs par ton analyse):

{
  "resume_executif": "Un paragraphe de synthèse globale de la maturité IA de l'entreprise",
  "niveau_maturite": "Description du niveau de maturité (Initial/Débutant/Intermédiaire/Avancé/Excellence)",
  "axes": [
    {
      "id": 1,
      "titre": "STRATÉGIE IA",
      "score": 3.5,
      "forces": ["Force majeure 1", "Force majeure 2"],
      "faiblesses": ["Faiblesse critique 1", "Faiblesse critique 2"],
      "recommandations": ["Recommandation 1", "Recommandation 2", "Recommandation 3"],
      "evaluation_detaillee": "Paragraphe d'évaluation détaillée de cet axe - MAXIMUM 5 PHRASES"
    },
    {
      "id": 2,
      "titre": "DATA",
      "score": 3.8,
      "forces": ["Force majeure 1", "Force majeure 2"],
      "faiblesses": ["Faiblesse critique 1", "Faiblesse critique 2"],
      "recommandations": ["Recommandation 1", "Recommandation 2", "Recommandation 3"],
      "evaluation_detaillee": "Paragraphe d'évaluation détaillée de cet axe - MAXIMUM 5 PHRASES"
    },
    {
      "id": 3,
      "titre": "TECHNOLOGIES",
      "score": 2.9,
      "forces": ["Force majeure 1", "Force majeure 2"],
      "faiblesses": ["Faiblesse critique 1", "Faiblesse critique 2"],
      "recommandations": ["Recommandation 1", "Recommandation 2", "Recommandation 3"],
      "evaluation_detaillee": "Paragraphe d'évaluation détaillée de cet axe - MAXIMUM 5 PHRASES"
    },
    {
      "id": 4,
      "titre": "GOUVERNANCE",
      "score": 3.1,
      "forces": ["Force majeure 1", "Force majeure 2"],
      "faiblesses": ["Faiblesse critique 1", "Faiblesse critique 2"],
      "recommandations": ["Recommandation 1", "Recommandation 2", "Recommandation 3"],
      "evaluation_detaillee": "Paragraphe d'évaluation détaillée de cet axe - MAXIMUM 5 PHRASES"
    },
    {
      "id": 5,
      "titre": "CULTURE ORGANISATIONNELLE",
      "score": 3.6,
      "forces": ["Force majeure 1", "Force majeure 2"],
      "faiblesses": ["Faiblesse critique 1", "Faiblesse critique 2"],
      "recommandations": ["Recommandation 1", "Recommandation 2", "Recommandation 3"],
      "evaluation_detaillee": "Paragraphe d'évaluation détaillée de cet axe - MAXIMUM 5 PHRASES"
    },
    {
      "id": 6,
      "titre": "INFRASTRUCTURE",
      "score": 3.0,
      "forces": ["Force majeure 1", "Force majeure 2"],
      "faiblesses": ["Faiblesse critique 1", "Faiblesse critique 2"],
      "recommandations": ["Recommandation 1", "Recommandation 2", "Recommandation 3"],
      "evaluation_detaillee": "Paragraphe d'évaluation détaillée de cet axe - MAXIMUM 5 PHRASES"
    }
  ],
  "analyse_globale": "Paragraphe d'analyse globale de la maturité IA",
  "feuille_de_route": {
    "actions_prioritaires": [
      "Action prioritaire 1 avec description détaillée",
      "Action prioritaire 2 avec description détaillée",
      "Action prioritaire 3 avec description détaillée",
      "Action prioritaire 4 avec description détaillée",
      "Action prioritaire 5 avec description détaillée"
    ],
    "conclusion": "Paragraphe de conclusion avec vision à moyen/long terme"
  }
}

IMPORTANT: 
- Utilise les scores RÉELS de l'audit fournis ci-dessus
- Adapte l'analyse au secteur et à la taille de l'entreprise
- Sois spécifique et actionnable dans les recommandations
- Pour le champ "evaluation_detaillee": MAXIMUM 2 PHRASES par axe (pas plus)
- Réponds UNIQUEMENT avec le JSON, sans texte avant ou après`;
    }

    /**
     * Call Gemini API to generate insights
     */
    async callGeminiAPI(prompt) {
        try {
            // Resolve server proxy URL dynamically to avoid calling localhost from deployed site.
            async function resolveServerUrl() {
                // 1) If a global override is provided (e.g. injected at deploy time), use it
                if (window && window.API_URL) {
                    return window.API_URL.replace(/\/+$/,'') + '/api/generate-insights';
                }

                // 2) Try to read server config from same-origin `/api/config` (works when server and frontend share host)
                try {
                    const cfgResp = await fetch('/api/config');
                    if (cfgResp.ok) {
                        const cfg = await cfgResp.json();
                        // if the server provided a base URL, use it
                        if (cfg && cfg.baseUrl) {
                            return cfg.baseUrl.replace(/\/+$/,'') + '/api/generate-insights';
                        }
                    }
                } catch (e) {
                    // ignore and fallback
                }

                // 3) Fallback to relative API path on the same origin. This is the safest for many deployments where
                // the static site and API are served from the same domain (e.g., Render with a single service).
                return '/api/generate-insights';
            }

            const serverUrl = await resolveServerUrl();
            const response = await fetch(serverUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ prompt })
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                console.error('Server proxy error:', errorData);
                throw new Error(`Server proxy error: ${response.status}`);
            }

            const data = await response.json();

            // If Gemini proxy returned the same structure, examine candidates
            if (data && data.candidates && data.candidates[0]) {
                const candidate = data.candidates[0];
                if (candidate.finishReason === 'MAX_TOKENS') {
                    console.error('Proxy: API response truncated due to token limit.');
                }
                if (candidate.content && candidate.content.parts) {
                    const textContent = candidate.content.parts[0].text;
                    try {
                        return JSON.parse(textContent);
                    } catch (parseError) {
                        console.error('Initial JSON parse failed, attempting fallback:', parseError.message);
                        const jsonMatch = textContent.match(/\{[\s\S]*\}/);
                        if (jsonMatch) {
                            try {
                                return JSON.parse(jsonMatch[0]);
                            } catch (fallbackError) {
                                console.error('Fallback JSON parse also failed');
                                throw new Error(`Failed to parse AI response. Response length: ${textContent.length}, Finish reason: ${candidate.finishReason}`);
                            }
                        }
                        throw new Error('No JSON found in API response');
                    }
                }
            }

            // If the proxy returns a different shape (directly parsed), return it
            if (data && typeof data === 'object' && (data.resume_executif || data.axes)) {
                return data;
            }

            throw new Error('Invalid API response structure from proxy');

        } catch (error) {
            console.error('Error calling server proxy for Gemini:', error);
            throw error;
        }
    }

    /**
     * Generate insights using AI
     */
    async generateInsights(onProgress = null) {
        try {
            if (onProgress) onProgress('Chargement des données...', 10);

            // Load data
            this.loadAuditData();
            await this.loadQuestionnaire();

            if (onProgress) onProgress('Préparation de l\'analyse...', 25);

            // Prepare audit data
            const auditData = this.prepareAuditDataForAI();
            if (!auditData) {
                throw new Error('Failed to prepare audit data');
            }

            if (onProgress) onProgress('Génération des insights IA...', 50);

            // Build prompt and call API
            const prompt = this.buildPrompt(auditData);
            const insights = await this.callGeminiAPI(prompt);

            if (onProgress) onProgress('Finalisation du rapport...', 90);

            // Store insights
            this.insights = {
                ...insights,
                generatedAt: new Date().toISOString(),
                company: this.companyInfo,
                globalScore: auditData.globalScore
            };

            // Save to localStorage for the report page
            localStorage.setItem('generated-insights', JSON.stringify(this.insights));

            if (onProgress) onProgress('Rapport prêt!', 100);

            return this.insights;
        } catch (error) {
            console.error('Error generating insights:', error);
            throw error;
        }
    }

    /**
     * Get stored insights
     */
    getStoredInsights() {
        try {
            const stored = localStorage.getItem('generated-insights');
            return stored ? JSON.parse(stored) : null;
        } catch (error) {
            console.error('Error getting stored insights:', error);
            return null;
        }
    }
}

// Create global instance
window.insightsGenerator = new InsightsGenerator();

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = InsightsGenerator;
}
