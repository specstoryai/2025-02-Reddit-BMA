# Digital Time Machine

Turn your Chrome browsing history into a curated feed of fascinating content. This application analyzes your browsing patterns and uses AI to discover similar high-quality content that matches your interests.

## Features

- 📚 Browse and search your Chrome history
- 🔍 Filter by date ranges and domains
- 📊 View browsing statistics and patterns
- 🤖 AI-powered content discovery using Exa
- 🎯 Smart recommendations based on your selected pages
- ♾️ Infinite scroll for browsing history
- 📱 Responsive design

## Prerequisites

- Node.js 18+ and npm
- Google Chrome browser
- An Exa API key (get one at [dashboard.exa.ai](https://dashboard.exa.ai))
- Access to your Chrome history file (typically located in `~/Library/Application Support/Google/Chrome/Default/History` on macOS)

## Setup

1. Clone the repository and install dependencies:
```bash
git clone <repository-url>
cd history-feed
npm install
```

2. Create a `.env.local` file in the project root with the following configuration:
```env
# Required: Path to your Chrome history database
CHROME_HISTORY_PATH="/Users/<username>/Library/Application Support/Google/Chrome/Default/History"

# Required: Your Exa API key
EXA_API_KEY="your-api-key-here"

# Optional: Feed configuration
FEED_REFRESH_INTERVAL=3600
MAX_CACHED_ITEMS=1000
```

3. Start the development server:
```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser

## Important Notes

- The application needs read access to your Chrome history file. 
- Your Exa API key should be kept secret. Never commit it to version control.
- The app uses local storage to persist your filter preferences and selected URLs.

## Usage

1. **Browse History**: Your browsing history is displayed in the middle column. Scroll to load more entries.

2. **Filter & Search**:
   - Use the search bar to find specific pages
   - Filter by time period (today, week, month, all time)
   - Click on domains to filter by website
   - Sort by date or visit count

3. **Create Curations**:
   - Select interesting pages from your history
   - Click "Create Curation" to generate recommendations
   - View similar content in the right sidebar

## Development

The project uses:
- Next.js 14 with App Router
- TypeScript
- Tailwind CSS
- Zustand for state management
- SQLite for reading Chrome history
- Exa API for content discovery

### Project Structure
```
history-feed/
├── app/              # Next.js app router pages
├── components/       # React components
├── lib/             # Utilities and store
│   ├── db.ts        # Chrome history database interface
│   ├── store.ts     # Global state management
│   ├── types.ts     # TypeScript types
│   └── utils.ts     # Helper functions
└── public/          # Static assets
```

### Key Components
- `HistoryFeed`: Main component displaying the three-column layout
- `ExaFeed`: Displays AI-curated content recommendations
- `SelectionControls`: Manages URL selection and curation creation
- `FilterControls`: Handles history filtering and sorting

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- Built with [Next.js](https://nextjs.org/)
- Content discovery powered by [Exa](https://exa.ai)
- Inspired by Reddit user request for a smarter browsing history tool
