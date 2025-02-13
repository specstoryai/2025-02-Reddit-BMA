const express = require('express');
const Anthropic = require('@anthropic-ai/sdk');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 3001;

// Middleware
app.use(express.json());

// Initialize Anthropic client
const anthropic = new Anthropic({
  apiKey: process.env.REACT_APP_ANTHROPIC_API_KEY,
});

const COMMON_INSTRUCTIONS = "Translate directly without any preamble or introduction. Keep the response under 300 characters. Do not include phrases like 'here's how X would say it' or any meta-commentary. Respond only in English, no Spanish or other languages.";

const GENERATION_STYLES = {
  "Generation Alpha": "Use emojis, TikTok-inspired language, gaming references, shortened words, 'no cap', 'fr fr', 'based', etc.",
  "Generation Z": "Use internet slang, 'fr', 'bussin', 'no cap', 'based', 'lowkey/highkey', etc. Include some emojis but fewer than Gen Alpha.",
  "Millennials": "Use 'literally', 'I can't even', references to adulting, Harry Potter, BuzzFeed-style emphasis, '#blessed', excessive enthusiasm about basic things.",
  "Generation X": "Use skepticism, independence, pragmatism, and dry humor. Add subtle references to 80s/90s culture when appropriate.",
  "Baby Boomers": "Use formal terms for technology ('cellular telephone', 'electronic mail'), references to 'back in my day', slight confusion about modern concepts, and traditional values.",
  "Silent Generation": "Use very formal language, traditional expressions ('Well, I declare!', 'By golly'), old-fashioned terms ('swell', 'chum'), and references to values of their era."
};

// Translation endpoint
app.post('/api/translate', async (req, res) => {
  try {
    const { text, generation } = req.body;
    const style = GENERATION_STYLES[generation];
    
    if (!style) {
      return res.status(400).json({ error: 'Invalid generation specified' });
    }

    const message = await anthropic.messages.create({
      model: 'claude-3-sonnet-20240229',
      max_tokens: 1024,
      messages: [{
        role: 'user',
        content: `${COMMON_INSTRUCTIONS}\n\nStyle guide: ${style}\n\n"${text}"`
      }]
    });

    const translation = message.content[0].text;
    
    // Check if response exceeds character limit
    if (translation.length > 300) {
      return res.status(400).json({ error: 'Translation exceeded 300 character limit' });
    }

    res.json({ translation });
  } catch (error) {
    console.error('Translation error:', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = app; 