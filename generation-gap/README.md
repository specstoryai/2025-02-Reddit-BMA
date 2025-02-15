# 🌟 Generation Gap Translator

See how different generations would express the same thing? From Silent Generation to Gen Alpha, see how your message would be expressed across different eras!

## ✨ Features

- Real-time translation powered by AI
- Translate text across 6 different generations:
  - Silent Generation (1928-1945)
  - Baby Boomers (1946-1964)
  - Generation X (1965-1980)
  - Millennials (1981-1996)
  - Generation Z (1997-2009)
  - Generation Alpha (2010-2024)


## 🚀 Getting Started

### Prerequisites

- Node.js (v14 or higher)
- Yarn package manager
- Anthropic API key (for Claude AI translations)

### Local Development

1. Clone the repository, and get on the right branch:
```bash
git clone git@github.com:specstoryai/2025-02-Reddit-BMA.git
git checkout generation-gap
cd generation-gap
```

2. Install dependencies:
```bash
yarn install
```

3. Create a `.env` file in the root directory and add your Anthropic API key:
```
ANTHROPIC_API_KEY=your_api_key_here
```

4. Start the development server:
```bash
yarn start
```


## 📝 Notes

- The app uses the Anthropic Claude AI model for generating translations, so responses may vary
- See generations.json for the list of generations and their speaking styles.
