# Restaurant Logger

A modern web app for discovering, saving, and sharing your favorite restaurants.

## Features

- 🔍 **Search by Zip Code**: Find restaurants in any US zip code
- 🗺️ **Interactive Map**: 
  - Blue markers show search results
  - Red markers show your saved places
  - Green markers highlight selected restaurants
  - "Search This Area" button appears when zoomed in for exploring specific neighborhoods

- 🏷️ **Smart Filtering**:
  - Filter by price range ($ to $$$$)
  - Filter by rating (3+ to 4.5+ stars)
  - Show only currently open restaurants
  - Sort by rating, price, or name

- 📝 **Restaurant Logging**:
  - Save restaurants to your personal list
  - Add visit dates and personal ratings
  - Write notes about your experience
  - Track your dining history

- 🔗 **Sharing**: Generate shareable links to your restaurant list (This functionality is only mocked up)

## Getting Started

1. Clone this repository
2. Install dependencies:
   ```bash
   npm install
   ```

NOTE: You need to enable the PLACES API in the Google Cloud Console as well as the Maps JavaScript API and Geocoding API.

3. Create a `.env.local` file with your Google Maps API key:
   ```
   NEXT_PUBLIC_GOOGLE_PLACES_API_KEY=your_api_key_here
   ```

4. Run the development server:
   ```bash
   npm run dev
   ```

5. Open [http://localhost:3000](http://localhost:3000) in your browser

## How to Use

1. **Finding Restaurants**:
   - Enter a zip code in the search box
   - Browse the results in the list or on the map
   - Zoom in and use "Search This Area" for more specific locations

2. **Saving Places**:
   - Click on any blue marker on the map
   - Click "Add to List" in the popup
   - Add your visit date, rating, and notes
   - Click "Add to List" to save

3. **Managing Your List**:
   - Switch to "Saved Places" tab to view your restaurants
   - Click the trash icon to remove entries
   - Click "Share List" to generate a shareable link

4. **Filtering Results**:
   - Use the dropdown menus in the "Search Results" tab
   - Combine filters to find exactly what you're looking for
   - Results update in real-time on both list and map

## Built With

- Next.js 14
- Google Maps & Places API
- Tailwind CSS
- TypeScript

## Notes

- All data is stored locally in your browser
- Requires a valid Google Maps API key with Places API enabled
- Works best on modern browsers (Chrome, Firefox, Safari, Edge)
