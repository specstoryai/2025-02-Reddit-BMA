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
  "Generation Alpha": "You are an expert in Generation Alpha (2010s-mid-2020s) communication style. Translate the following text into how a Gen Alpha would say it. Use their characteristic features like: heavy use of emojis, TikTok-inspired language, gaming references, shortened words, 'no cap', 'fr fr', 'based', etc. Keep the core meaning but make it sound authentic to Gen Alpha.",
  "Generation Z": "You are an expert in Generation Z (1997-2009) communication style. Translate the following text into how a Gen Z would say it. Use their characteristic features like: internet slang, 'fr', 'bussin', 'no cap', 'based', 'lowkey/highkey', etc. Include some emojis but fewer than Gen Alpha. Keep the core meaning but make it sound authentic to Gen Z.",
  "Millennials": "You are an expert in Millennial (1981-1996) communication style. Translate the following text into how a Millennial would say it. Use their characteristic features like: 'literally', 'I can't even', references to adulting, Harry Potter, BuzzFeed-style emphasis, '#blessed', excessive enthusiasm about basic things. Keep the core meaning but make it sound authentic to Millennials.",
  "Generation X": "You are an expert in Generation X (1965-1980) communication style. Translate the following text into how a Gen X would say it. Use their characteristic features like: skepticism, independence, pragmatism, and dry humor. Add subtle references to 80s/90s culture when appropriate. Keep the core meaning but make it sound authentic to Gen X.",
  "Baby Boomers": "You are an expert in Baby Boomer (1946-1964) communication style. Translate the following text into how a Boomer would say it. Use their characteristic features like: formal terms for technology ('cellular telephone', 'electronic mail'), references to 'back in my day', slight confusion about modern concepts, and traditional values. Keep the core meaning but make it sound authentic to Boomers.",
  "Silent Generation": "You are an expert in Silent Generation (1928-1945) communication style. Translate the following text into how someone from the Silent Generation would say it. Use their characteristic features like: very formal language, traditional expressions ('Well, I declare!', 'By golly'), old-fashioned terms ('swell', 'chum'), and references to values of their era. Keep the core meaning but make it sound authentic to the Silent Generation."
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
        content: `${prompt}\n\nText to translate: "${text}"\n\nTranslated version:`
      }]
    });

    res.json({ translation: message.content[0].text });
  } catch (error) {
    console.error('Translation error:', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = app; 