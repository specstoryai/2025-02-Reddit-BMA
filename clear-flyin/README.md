# Aviation Weather Route Planner

A modern web application for pilots to visualize and analyze weather conditions along their flight route. Built with React, TypeScript, and Material-UI, this app provides real-time weather information from the AVWX API.

## Features

### Route Planning
- Enter airport identifiers to create a flight route (e.g., "KBOS KORD KDEN")
- Interactive map display with route visualization
- Automatic route parsing and validation

### Weather Information
- Real-time METAR data for each airport
- Visual wind direction arrows on the map
- Color-coded flight rules indicators (VFR, MVFR, IFR, LIFR)
- Comprehensive weather briefing summary

### Weather Display Features
- **Flight Rules**: Color-coded indicators for quick reference
  - VFR (Green)
  - MVFR (Blue)
  - IFR (Red)
  - LIFR (Purple)

- **Wind Information**:
  - Dynamic wind direction arrows
  - Wind speed and gusts
  - Visual representation on the map

- **Significant Weather Alerts**:
  - Automatic detection of adverse conditions
  - Alerts for strong winds (≥15 knots)
  - Visibility warnings (≤5 miles)
  - Active weather phenomena

### Detailed Station Information
- Temperature and dewpoint
- Visibility conditions
- Cloud layers and coverage
- Barometric pressure
- Raw METAR data

## Getting Started

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn
- AVWX API key (get one at [account.avwx.rest](https://account.avwx.rest))

### Installation

1. Clone the repository:
```bash
git clone [repository-url]
cd aviation-weather-planner
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file in the root directory and add your AVWX API key:
```
VITE_AVWX_API_KEY=your_api_key_here
```

4. Start the development server:
```bash
npm run dev
```

The application will be available at `http://localhost:5173`

## Technology Stack

- **Frontend**:
  - React
  - TypeScript
  - Material-UI (MUI)
  - Leaflet (map visualization)
  - Vite (build tool)

- **Backend**:
  - Node.js
  - Express
  - SQLite (airport database)

- **APIs**:
  - AVWX (weather data)
  - OpenStreetMap (map tiles)

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- AVWX for providing comprehensive aviation weather data
- OpenStreetMap contributors for map data
- The aviation community for feedback and suggestions
