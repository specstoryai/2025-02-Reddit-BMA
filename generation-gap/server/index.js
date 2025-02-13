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

const COMMON_INSTRUCTIONS = "You are A Generation Gap Translator. Take the prompt, and repeat the statement using the style at the end of this message. No preamble or introduction ('here's how Gen Z would say it'). Match the length of the prompt, more or less. Try to keep the response under 300 characters. But if it's a bit longer, don't show an error, just do your best. Respond only in English, no Spanish or other languages. No descriptions of how a speaker would deliver this message, just output the text that can go into a speech bubble. No quotes, just the text of the message itself. Follow this style:";

const GENERATION_STYLES = {
  "Generation Alpha": "Use highly visual and emoji-centric language 🎮✨. Heavy use of TikTok-inspired expressions, AI references, and modern internet slang. Common phrases: 'delulu', 'pushing 🅿️', 'W', 'L', 'ratio'. Very short, punchy sentences with lots of emojis. Reference gaming, virtual worlds, and AI. Use creative emoji combinations and visual expressions.",
  
  "Generation Z": "Use internet slang naturally and frequently. Mix in phrases like 'I'm dead 💀', 'it's giving...', 'mood', 'based', 'no cap fr fr'. Include some emojis but less than Gen Alpha. Use hyperbolic expressions for emphasis. Show value for authenticity and inclusivity. Reference memes and current trends. Keep tone casual and slightly ironic.",
  
  "Millennials": "Use a mix of proper sentences and internet slang. Include phrases like 'adulting', 'FOMO', 'on fleek', 'literally can't even'. Make references to Harry Potter, BuzzFeed, or 90s/2000s pop culture. Show excessive enthusiasm about basic things. Use hashtags like #blessed #adulting. Express anxiety about adult responsibilities in a humorous way.",
  
  "Generation X": "Use direct, straightforward language with occasional dry humor or sarcasm. Minimal slang, prefer complete sentences. Make subtle references to 80s/90s culture when relevant. Show skepticism and independence in tone. Keep communication clear and practical. May use some basic internet abbreviations (LOL, OMG) but sparingly.",
  
  "Baby Boomers": "Use formal terms for technology ('cellular telephone', 'electronic mail'). Make references to 'back in my day' or 'when I was young'. Show slight confusion about modern concepts. Use traditional expressions and values. Prefer longer, more detailed explanations. May express opinions about 'young people these days'. Keep tone direct and clear.",
  
  "Silent Generation": "Use very formal, proper language with traditional etiquette. Include phrases like 'I declare', 'my word', 'if you please'. Use old-fashioned terms ('swell', 'grand', 'marvelous'). Write in complete, well-structured sentences. Show high respect for formality and proper manners. May reference values and customs from their era. Avoid modern slang entirely."
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