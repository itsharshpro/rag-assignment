const { GoogleGenerativeAI } = require('@google/generative-ai');
const config = require('../../config');

class GeminiService {
  constructor() {
    this.genAI = null;
    this.model = null;
    this.initializeModel();
  }

  /**
   * Initialize the Gemini AI model
   */
  initializeModel() {
    if (config.geminiApiKey && config.geminiApiKey !== '') {
      this.genAI = new GoogleGenerativeAI(config.geminiApiKey);
      this.model = this.genAI.getGenerativeModel({ model: config.geminiModel });
    }
  }

  /**
   * Check if Gemini API is available
   * @returns {boolean} - True if API key is configured
   */
  isAvailable() {
    return this.model !== null;
  }

  /**
   * Generate content using Gemini AI
   * @param {string} prompt - The prompt to send to AI
   * @returns {Promise<string>} - The AI response
   * @throws {Error} - If API call fails
   */
  async generateContent(prompt) {
    if (!this.isAvailable()) {
      throw new Error('Gemini API is not configured');
    }

    try {
      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      return response.text();
    } catch (error) {
      console.error('Gemini API error:', error.message);
      throw new Error(`AI generation failed: ${error.message}`);
    }
  }

  /**
   * Get model configuration
   * @returns {Object} - Model configuration details
   */
  getModelConfig() {
    return {
      model: 'gemini-2.0-flash',
      available: this.isAvailable(),
      hasApiKey: !!config.geminiApiKey
    };
  }
}

module.exports = new GeminiService();
