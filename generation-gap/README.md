# 🌟 Generation Gap Translator

Ever wondered how different generations would express the same thing? The Generation Gap Translator is a fun web application that helps bridge the communication divide between generations. From Silent Generation to Gen Alpha, see how your message would be expressed across different eras!

## ✨ Features

- Translate text across 6 different generations:
  - Silent Generation (1928-1945)
  - Baby Boomers (1946-1964)
  - Generation X (1965-1980)
  - Millennials (1981-1996)
  - Generation Z (1997-2009)
  - Generation Alpha (2010-2024)
- Interactive timeline visualization
- Real-time translation powered by AI
- Modern, responsive design

## 🚀 Getting Started

### Prerequisites

- Node.js (v14 or higher)
- Yarn package manager
- Anthropic API key (for Claude AI translations)

### Local Development

1. Clone the repository:
```bash
git clone [your-repo-url]
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

This will run both the frontend and backend concurrently:
- Frontend: [http://localhost:3000](http://localhost:3000)
- Backend: [http://localhost:3001](http://localhost:3001)

### Available Scripts

- `yarn start` - Starts both frontend and backend in development mode
- `yarn client` - Runs only the frontend
- `yarn server` - Runs only the backend
- `yarn build` - Builds the app for production
- `yarn start:prod` - Runs the production build

## 🛠️ Built With

- React.js
- Express.js
- Anthropic Claude AI
- CSS3 for styling

## 📝 Notes

- The app uses the Anthropic Claude AI model for generating translations, so responses may vary
- Each generation's speaking style is carefully crafted based on historical and cultural context
- The timeline visualization helps users understand the chronological spread of different generations

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.
