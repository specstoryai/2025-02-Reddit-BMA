# Choose My Dinner

A modern web application that helps you decide where to eat by randomly selecting restaurants in your area based on your preferences. Built with React, TypeScript, and Express, using the Google Places API.

## Features

- 🍽️ Find restaurants based on:
  - Location (using your address)
  - Price range (from budget-friendly to fine dining)
  - Cuisine type
  - Search radius
- 🎲 Randomly selects 3 restaurants matching your criteria
- 🗺️ Direct links to Google Maps for each restaurant
- 💅 Modern UI built with Shadcn/ui and Tailwind CSS
- 🌐 Full-stack application with TypeScript support

## Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- Google Places API key

## Setup

1. Clone the repository:
```bash
git clone <repository-url>
cd choose-my-dinner
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:

Create a `.env` file in the server directory:
```env
PORT=3000
CLIENT_URL=http://localhost:5173
GOOGLE_PLACES_API_KEY=your_api_key_here
```

Create a `.env` file in the client directory:
```env
VITE_API_URL=http://localhost:3000
```

4. Get a Google Places API key:
- Go to the [Google Cloud Console](https://console.cloud.google.com/)
- Create a new project or select an existing one
- Enable the Places API and Geocoding API
- Create credentials (API key)
- Copy the API key to your server's `.env` file

## Development

Start both the client and server in development mode:

```bash
npm run dev
```

Or run them separately:

```bash
# Start the client (from the root directory)
npm run dev -w client

# Start the server (from the root directory)
npm run dev -w server
```

The client will be available at `http://localhost:5173` and the server at `http://localhost:3000`.

## Project Structure

```
choose-my-dinner/
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/    # React components
│   │   ├── types/        # TypeScript types
│   │   └── App.tsx       # Main application component
│   └── package.json
├── server/                # Express backend
│   ├── src/
│   │   ├── services/     # Business logic
│   │   ├── types/       # TypeScript types
│   │   └── index.ts     # Server entry point
│   └── package.json
└── package.json          # Root package.json for workspaces
```

## Available Scripts

- `npm run dev` - Start both client and server in development mode
- `npm run build` - Build both client and server
- `npm run start` - Start the production server

## Technologies Used

- **Frontend**:
  - React with TypeScript
  - Vite
  - Shadcn/ui
  - Tailwind CSS
  - Axios

- **Backend**:
  - Express
  - TypeScript
  - Google Places API

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details. 