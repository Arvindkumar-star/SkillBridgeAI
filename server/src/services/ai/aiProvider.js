const config = require('../../config/env');
const geminiProvider = require('./geminiProvider');
const groqProvider = require('./groqProvider');
const localRuleProvider = require('./localRuleProvider');

class AIProviderFactory {
  static getProvider() {
    const providerType = (config.AI_PROVIDER || 'gemini').toLowerCase();

    if (providerType === 'groq' && config.GROQ_API_KEY) {
      return groqProvider;
    }

    if (providerType === 'gemini' && config.GEMINI_API_KEY) {
      return geminiProvider;
    }

    if (config.GEMINI_API_KEY) {
      return geminiProvider;
    }

    if (config.GROQ_API_KEY) {
      return groqProvider;
    }

    return localRuleProvider;
  }
}

module.exports = {
  getAIProvider: AIProviderFactory.getProvider,
  AIProviderFactory
};
