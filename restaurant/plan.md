# Restaurant Logger with Maps & Notes - 1-Hour Web App Plan

## Overview

We'll use Next.js + TailwindCSS + Google Maps/Places API + Local Storage to make this as simple as possible.

## Tech Stack

* Next.js (Frontend, API routes if needed)
* Google Maps JavaScript API (For interactive maps)
* Google Places API (For restaurant search)
* Local Storage (For saving restaurant logs)
* Tailwind CSS (For quick styling)
* React Hook Form (For handling inputs efficiently)
* @react-google-maps/api (For React Google Maps integration)

## Feature Breakdown

### 1. Restaurant Search & Map View

* Input field for zip code
* Interactive map showing:
  * Current location marker
  * Restaurant markers from search results
  * Click markers to see restaurant details
* Call Google Places API to fetch restaurants
* Display search results as a clean list alongside map
* Click to "Add to My List"
* Map auto-centers on searched zip code

### 2. Restaurant Logging

* Clicking "Add to My List" saves:
  * Restaurant name
  * Google Place ID
  * Location coordinates (lat/lng)
  * Timestamp (Date of visit)
  * Notes (Text input)
* Data is saved in Local Storage (no backend needed)

### 3. Review Interface with Map

* Split view: List and Map
* Show a list of saved restaurants
* Display basic notes & visit date
* Interactive map showing all saved restaurants
* Hover on list item highlights map marker
* Click marker to see restaurant details
* Allow deletion from the list
* Option to recenter map on any saved location

## Development Plan

### Step 1: Setup (10 min)

### Step 2: Google Maps & Places Integration (25 min)

1. Get a Google API Key from the Google Cloud Console
2. Enable required APIs:
   * Places API
   * Maps JavaScript API
   * Geocoding API
3. Add the API Key to .env.local
4. Create components/Map.js for the interactive map
5. Implement map functionality:
   * Display current location
   * Show restaurant markers
   * Info windows for restaurant details
   * Click handlers for marker selection

### Step 3: Restaurant Logging & Local Storage (15 min)

* Implement local storage functionality
* Add coordinate storage
* Create data management functions

### Step 4: Integrate Everything (20 min)

1. Create split view layout
2. Implement map-list interactions:
   * Marker highlighting
   * List item hover effects
   * Synchronized selection
3. Add map recentering controls
4. Implement responsive design for mobile

## Extra Features (Optional)

* Cluster markers when zoomed out
* Draw radius circle for search area
* Save map view preferences
* Export saved locations as GeoJSON
* Share map view via URL

## Deployment (Optional)

1. Deploy to Vercel:
```bash
npm install -g vercel
vercel
```

2. Set environment variables in Vercel Dashboard:
   * NEXT_PUBLIC_GOOGLE_API_KEY

## Summary

* Interactive map integration
* Google Places API for restaurant search
* Synchronized map-list interaction
* Local storage to save restaurants & coordinates
* Mobile-responsive design
* 1 hour+ build time 🚀

---

**Note:** Want to add sharing? Later, integrate Supabase/Firebase for cloud storage and shared maps.