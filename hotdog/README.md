# 🌭 Hotdog Detector

A modern web application that uses AI to determine if your photo contains a hotdog, inspired by Silicon Valley's "Not Hotdog" app. Built with Next.js 14 and OpenAI's Vision API.

## Features

- 📸 Real-time camera access
- 🤖 AI-powered image analysis
- 📊 Detailed reasoning for each analysis
- 📜 History of all your hotdog (and not hotdog) photos
- 📱 Responsive design for mobile and desktop

## Prerequisites

Before you begin, ensure you have:
- Node.js 18+ installed
- An OpenAI API key with access to GPT-4 Vision
- A modern web browser
- A device with a camera

## Setup

1. Clone the repository:
```bash
git clone <your-repo-url>
cd hotdog
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env.local` file in the root directory:
```bash
OPENAI_API_KEY=your_api_key_here
```

Replace `your_api_key_here` with your actual OpenAI API key.

## Running the App

1. Start the development server:
```bash
npm run dev
```

2. Open [http://localhost:3000](http://localhost:3000) in your browser

3. Allow camera access when prompted

## How to Use

1. Point your camera at any object you want to analyze
2. Click the "Take Photo" button
3. Wait for the AI to analyze the image
4. View the results:
   - ✅ Green checkmark for hotdogs
   - ❌ Red X for non-hotdogs
   - Detailed reasoning for the decision
   - Full AI analysis text

Previous analyses are stored in the history panel on the right (or below on mobile).

## Tech Stack

- **Frontend**: Next.js 14 (App Router)
- **Camera Access**: react-webcam
- **Styling**: Tailwind CSS
- **AI**: OpenAI GPT-4 Vision API
- **State Management**: React useState

## Development

The project structure:
```
hotdog/
├── app/
│   ├── api/
│   │   └── analyze/
│   │       └── route.ts    # API endpoint for image analysis
│   └── page.tsx            # Main application page
├── components/
│   └── Camera.tsx          # Camera component
└── ...config files
```

## Environment Variables

Required environment variables:
- `OPENAI_API_KEY`: Your OpenAI API key

## Limitations

- Requires camera access
- Requires an internet connection
- API calls count towards your OpenAI usage
- History is stored in memory (cleared on page refresh)

## Future Improvements

- Persistent storage for history
- Offline detection with TensorFlow.js
- Share results on social media
- Multiple image analysis models
- Export history
- PWA support

## Contributing

Feel free to open issues and pull requests!

## License

MIT License - feel free to use this for your own hotdog-detection needs!
