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

const GENERATION_PROMPTS = {
  "Generation Alpha": "Translate this text into Generation Alpha (2010s-mid-2020s) style. Use emojis, TikTok-inspired language, gaming references, shortened words, 'no cap', 'fr fr', 'based', etc.",
  "Generation Z": "Translate this text into Generation Z (1997-2009) style. Use internet slang, 'fr', 'bussin', 'no cap', 'based', 'lowkey/highkey', etc. Include some emojis but fewer than Gen Alpha.",
  "Millennials": "Translate this text into Millennial (1981-1996) style. Use 'literally', 'I can't even', references to adulting, Harry Potter, BuzzFeed-style emphasis, '#blessed', excessive enthusiasm about basic things.",
  "Generation X": "Translate this text into Generation X (1965-1980) style. Use skepticism, independence, pragmatism, and dry humor. Add subtle references to 80s/90s culture when appropriate.",
  "Baby Boomers": "Translate this text into Baby Boomer (1946-1964) style. Use formal terms for technology ('cellular telephone', 'electronic mail'), references to 'back in my day', slight confusion about modern concepts, and traditional values.",
  "Silent Generation": "Translate this text into Silent Generation (1928-1945) style. Use very formal language, traditional expressions ('Well, I declare!', 'By golly'), old-fashioned terms ('swell', 'chum'), and references to values of their era."
};

// Translation endpoint
app.post('/api/translate', async (req, res) => {
  try {
    const { text, generation } = req.body;
    const prompt = GENERATION_PROMPTS[generation];
    
    if (!prompt) {
      return res.status(400).json({ error: 'Invalid generation specified' });
    }

    const message = await anthropic.messages.create({
      model: 'claude-3-sonnet-20240229',
      max_tokens: 1024,
      messages: [{
        role: 'user',
        content: `${prompt}\n\n"${text}"`
      }]
    });

    res.json({ translation: message.content[0].text });
  } catch (error) {
    console.error('Translation error:', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = app; 