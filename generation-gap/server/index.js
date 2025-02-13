const express = require('express');
const Anthropic = require('@anthropic-ai/sdk');
const path = require('path');
const fs = require('fs');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 3001;

// Middleware
app.use(express.json());

// Initialize Anthropic client
const anthropic = new Anthropic({
  apiKey: process.env.REACT_APP_ANTHROPIC_API_KEY,
});

// Load generations data
const generationsPath = path.join(__dirname, '..', 'src', 'data', 'generations.json');
const generationsData = JSON.parse(fs.readFileSync(generationsPath, 'utf8'));

// Get translation instructions from config
const { translationInstructions: COMMON_INSTRUCTIONS, maxTranslationLength } = generationsData.timelineConfig;

// Create styles map from generations data
const GENERATION_STYLES = {};
generationsData.generations.forEach(gen => {
  GENERATION_STYLES[gen.name] = gen.speakingStyle;
});

// Translation endpoint
app.post('/api/translate', async (req, res) => {
  try {
    const { text, generation } = req.body;
    const style = GENERATION_STYLES[generation];
    
    if (!style) {
      return res.status(400).json({ error: 'Invalid generation specified' });
    }

    // Add character limit context to the prompt
    const prompt = `${COMMON_INSTRUCTIONS}

Try to keep your response under ${maxTranslationLength} characters. The original text is ${text.length} characters long - aim to match this length when possible.

Style guide: ${style}

"${text}"`;

    const message = await anthropic.messages.create({
      model: 'claude-3-sonnet-20240229',
      max_tokens: 1024,
      temperature: 0.7,
      messages: [{
        role: 'user',
        content: prompt
      }]
    });

    const translation = message.content[0].text.trim();
    res.json({ translation });
  } catch (error) {
    console.error('Translation error:', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = app; 