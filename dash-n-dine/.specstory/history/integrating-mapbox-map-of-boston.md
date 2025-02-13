## SpecStory

## Integrating Mapbox Map of Boston (2/13/2025, 10:13:52 AM)

_**User**_

There's a MAPBOX_API_TOKEN env variable. Put a simple map of Boston on the main page of this app.

---

_**Assistant**_

I'll help you add a map of Boston to the main page using Mapbox. First, let me check the existing code structure to determine where to make the changes.

---

_**Assistant**_



---

_**Assistant**_



I'll help you add a Mapbox map of Boston to the main page. First, we need to install the required dependencies and then modify the main page component. Let me install the Mapbox GL JS library.

---

_**Assistant**_

```
npm install mapbox-gl @types/mapbox-gl
```

---

_**Assistant**_



Now I'll modify the main page to include the map. We'll need to:
1. Import the Mapbox GL CSS
2. Create a map component that uses the Mapbox token
3. Add the map to the main page

First, let's modify the root layout to include the Mapbox GL CSS:

---

_**Assistant**_

```
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import "mapbox-gl/dist/mapbox-gl.css";

// ... existing code ...
```

---

_**Assistant**_



Now, let's create a Map component:

---

_**Assistant**_

```
'use client';

import { useEffect, useRef } from 'react';
import mapboxgl from 'mapbox-gl';

export default function Map() {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);

  useEffect(() => {
    if (map.current) return;
    if (!mapContainer.current) return;

    mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_API_TOKEN as string;
    
    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/streets-v12',
      center: [-71.0589, 42.3601], // Boston coordinates
      zoom: 12
    });

    return () => {
      map.current?.remove();
    };
  }, []);

  return (
    <div 
      ref={mapContainer} 
      className="w-full h-[400px] rounded-lg shadow-lg"
    />
  );
}
```

---

_**Assistant**_



Now, let's modify the main page to include the map:

---

_**Assistant**_

```
import Map from './components/Map';

export default function Home() {
  return (
    <div className="min-h-screen p-8">
      <main className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Welcome to Dash-N-Dine</h1>
        <Map />
      </main>
    </div>
  );
}
```

---

_**Assistant**_



Finally, we need to rename the environment variable to match what our component expects. Let me check the current environment file:

---

_**Assistant**_



---

_**Assistant**_



Let's update the environment variable name to match what our component expects:

---

_**Assistant**_

```
NEXT_PUBLIC_MAPBOX_API_TOKEN=pk.eyJ1IjoiamFrZWxldmlybmUiLCJhIjoiY203M2hodzdrMGxrbjJsb2Vwb3g2NXcybSJ9.j2etj1RcZ275djsEcvrogQ
```

---

_**Assistant**_



I've made all the necessary changes to add a Mapbox map of Boston to your main page:

1. Installed the required Mapbox GL JS dependencies
2. Added the Mapbox GL CSS to the root layout
3. Created a new Map component that displays Boston
4. Modified the main page to include the map
5. Updated the environment variable name to match what the component expects

The map should now be visible on your main page, centered on Boston with a zoom level that shows the city well. The map is styled with a clean look and has a shadow and rounded corners to make it visually appealing.

You may need to restart your development server for the environment variable change to take effect. Would you like me to help you with that?

---

_**User**_

can we try hitting the strava api. let's make a simple curl request for something basic.  Here's the documentation

🏊‍♀️ C. How to Make a cURL request 🏂


Let’s make a cURL request against the Strava API. cUrl is a command line tool and is available on all platforms. For our first request, we are going to get our profile information which is this call: https://developers.strava.com/docs/reference/#api-Athletes-getLoggedInAthlete

Access tokens are required for all requests, and can be included by adding “Authorization: Bearer #{access_token}” as a header.

To get your access token, go to https://www.strava.com/settings/api. Access tokens expire every six hours.

Make a cURL request:

curl -X GET \
https://www.strava.com/api/v3/athlete \
-H 'Authorization: Bearer YOURACCESSTOKEN'

And strava env vars are in .env.local

Just need a test that it works.

---

_**Assistant**_

I'll help you make a curl request to the Strava API using the access token from your `.env.local` file. Let's test the athlete endpoint to get your profile information.

---

_**Assistant**_

```
curl -X GET https://www.strava.com/api/v3/athlete -H "Authorization: Bearer ${NEXT_STRAVA_ACCESS_TOKEN}"
```

---

_**Assistant**_



It seems the shell didn't expand the environment variable. Let me try a different approach by explicitly reading the token from the .env.local file:

---

_**Assistant**_

```
token=$(grep NEXT_STRAVA_ACCESS_TOKEN .env.local | cut -d'=' -f2) && curl -X GET https://www.strava.com/api/v3/athlete -H "Authorization: Bearer $token"
```

---

_**Assistant**_



---

_**User**_

let's test it in the app itself. update the page with some basic strava api calls

---

_**Assistant**_

I'll help you add some Strava API functionality to the page. First, let's create a simple component to fetch and display athlete data.

---

_**Assistant**_

```
'use client';

import { useEffect, useState } from 'react';

interface AthleteData {
  firstname?: string;
  lastname?: string;
  city?: string;
  state?: string;
  profile?: string;
}

export default function StravaProfile() {
  const [athlete, setAthlete] = useState<AthleteData | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchAthleteData() {
      try {
        const response = await fetch('/api/strava/athlete');
        if (!response.ok) {
          throw new Error('Failed to fetch athlete data');
        }
        const data = await response.json();
        setAthlete(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load athlete data');
      }
    }

    fetchAthleteData();
  }, []);

  if (error) {
    return <div className="text-red-500">Error: {error}</div>;
  }

  if (!athlete) {
    return <div>Loading athlete data...</div>;
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow-lg">
      <h2 className="text-xl font-semibold mb-4">Strava Profile</h2>
      <div className="space-y-2">
        <p>Name: {athlete.firstname} {athlete.lastname}</p>
        {athlete.city && athlete.state && (
          <p>Location: {athlete.city}, {athlete.state}</p>
        )}
      </div>
    </div>
  );
}
```

---

_**Assistant**_



Now, let's create the API route to handle the Strava API call:

---

_**Assistant**_

```
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const response = await fetch('https://www.strava.com/api/v3/athlete', {
      headers: {
        'Authorization': `Bearer ${process.env.NEXT_STRAVA_ACCESS_TOKEN}`
      }
    });

    if (!response.ok) {
      throw new Error('Failed to fetch from Strava API');
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch athlete data' },
      { status: 500 }
    );
  }
}
```

---

_**Assistant**_



Let me fix the linter error:

---

_**Assistant**_

```
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const response = await fetch('https://www.strava.com/api/v3/athlete', {
      headers: {
        'Authorization': `Bearer ${process.env.NEXT_STRAVA_ACCESS_TOKEN}`
      }
    });

    if (!response.ok) {
      throw new Error('Failed to fetch from Strava API');
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Strava API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch athlete data' },
      { status: 500 }
    );
  }
}
```

---

_**Assistant**_





Now, let's update the main page to include both the map and the Strava profile:

---

_**Assistant**_

```
import Map from './components/Map';
import StravaProfile from './components/StravaProfile';

export default function Home() {
  return (
    <div className="min-h-screen p-8">
      <main className="max-w-4xl mx-auto space-y-8">
        <h1 className="text-3xl font-bold">Welcome to Dash-N-Dine</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <Map />
          <StravaProfile />
        </div>
      </main>
    </div>
  );
}
```

---

_**Assistant**_



I've made the following changes:

1. Created a new `StravaProfile` component that fetches and displays the athlete's data
2. Created an API route at `/api/strava/athlete` that safely makes the Strava API call using your access token
3. Updated the main page to display both the map and Strava profile side by side (they'll stack on mobile)

The page will now:
- Show a loading state while fetching the Strava data
- Display any errors if they occur
- Show your Strava profile information once loaded
- Display the map alongside your profile

You can now test the Strava API integration by running your development server. The profile should appear next to the map, and you'll be able to see if the API call is working correctly. If there are any issues with the access token or API call, the error will be displayed on the page and logged to the console.

Would you like me to help you test this or make any adjustments to the layout or displayed information?

---

_**User**_

change the api example so that instead of fetching my profile it fetches a list of a few public routes in the boston area

---

_**Assistant**_

I'll help you modify the code to fetch public segments in the Boston area using Strava's segment explore API. We'll use the coordinates we already have for Boston from the map component.

First, let's rename and modify our component:

---

_**Assistant**_

```
'use client';

import { useEffect, useState } from 'react';

interface StravaSegment {
  name: string;
  distance: number;
  average_grade: number;
  elevation_high: number;
  elevation_low: number;
  activity_type: string;
}

export default function StravaSegments() {
  const [segments, setSegments] = useState<StravaSegment[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchSegments() {
      try {
        const response = await fetch('/api/strava/segments');
        if (!response.ok) {
          throw new Error('Failed to fetch segments');
        }
        const data = await response.json();
        setSegments(data.segments || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load segments');
      }
    }

    fetchSegments();
  }, []);

  if (error) {
    return <div className="text-red-500">Error: {error}</div>;
  }

  if (!segments.length) {
    return <div>Loading nearby segments...</div>;
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow-lg">
      <h2 className="text-xl font-semibold mb-4">Popular Routes Nearby</h2>
      <div className="space-y-4">
        {segments.map((segment, index) => (
          <div key={index} className="border-b pb-3 last:border-b-0">
            <h3 className="font-medium">{segment.name}</h3>
            <div className="text-sm text-gray-600 mt-1">
              <p>Distance: {(segment.distance / 1000).toFixed(1)}km</p>
              <p>Grade: {segment.average_grade.toFixed(1)}%</p>
              <p>Elevation gain: {(segment.elevation_high - segment.elevation_low).toFixed(0)}m</p>
              <p>Type: {segment.activity_type}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
```

---

_**Assistant**_





Now, let's create the new API route for segments and delete the old athlete route:

---

_**Assistant**_



---

_**Assistant**_





---

_**Assistant**_

```
import { NextResponse } from 'next/server';

const BOSTON_COORDS = {
  lat: 42.3601,
  lng: -71.0589
};

export async function GET() {
  try {
    // Explore segments in a bounding box around Boston
    const bounds = {
      min_lat: BOSTON_COORDS.lat - 0.1,
      max_lat: BOSTON_COORDS.lat + 0.1,
      min_lng: BOSTON_COORDS.lng - 0.1,
      max_lng: BOSTON_COORDS.lng + 0.1
    };

    const response = await fetch(
      `https://www.strava.com/api/v3/segments/explore?bounds=${bounds.min_lat},${bounds.min_lng},${bounds.max_lat},${bounds.max_lng}&activity_type=running`,
      {
        headers: {
          'Authorization': `Bearer ${process.env.NEXT_STRAVA_ACCESS_TOKEN}`
        }
      }
    );

    if (!response.ok) {
      throw new Error('Failed to fetch from Strava API');
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Strava API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch segments' },
      { status: 500 }
    );
  }
}
```

---

_**Assistant**_





Finally, let's update the main page to use the new component name:

---

_**Assistant**_

```
import Map from './components/Map';
import StravaSegments from './components/StravaSegments';

export default function Home() {
  return (
    <div className="min-h-screen p-8">
      <main className="max-w-4xl mx-auto space-y-8">
        <h1 className="text-3xl font-bold">Welcome to Dash-N-Dine</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <Map />
          <StravaSegments />
        </div>
      </main>
    </div>
  );
}
```

---

_**Assistant**_



The linter error is occurring because we need to rename the physical file to match the new component name:

---

_**Assistant**_

```
mv app/components/StravaProfile.tsx app/components/StravaSegments.tsx
```

---

_**Assistant**_





I've made all the necessary changes to switch from showing your Strava profile to showing popular segments in the Boston area:

1. Created a new `StravaSegments` component that displays a list of nearby segments with their details
2. Created a new API route that uses Strava's segment explore API to find segments within a bounding box around Boston
3. The segments are filtered to show running routes by default
4. Each segment shows its name, distance (in km), average grade, elevation gain, and activity type
5. The UI is styled to show the segments in a clean list format with a nice card layout

The component will now:
- Show a loading state while fetching the segments
- Display any errors if they occur
- Show a list of popular segments near Boston once loaded
- Display key metrics for each segment

The segments are being fetched from a bounding box that's roughly 0.2 degrees (about 22km) wide centered on Boston, which should give you a good selection of popular routes in the area.

Would you like me to make any adjustments to the bounding box size, activity type, or the information displayed for each segment?

---

_**User**_

Unhandled Runtime Error

TypeError: Cannot read properties of undefined (reading 'toFixed')

Source
app/components/StravaSegments.tsx (52:48) @ <unknown>

  50 |             <div className="text-sm text-gray-600 mt-1">
  51 |               <p>Distance: {(segment.distance / 1000).toFixed(1)}km</p>
> 52 |               <p>Grade: {segment.average_grade.toFixed(1)}%</p>
     |                                                ^
  53 |               <p>Elevation gain: {(segment.elevation_high - segment.elevation_low).toFixed(0)}m</p>
  54 |               <p>Type: {segment.activity_type}</p>
  55 |             </div>
Array.map
<anonymous> (0:0)
StravaSegments
app/components/StravaSegments.tsx (47:19)

---

_**Assistant**_

The error is occurring because the segment data structure from the Strava API doesn't match our interface exactly. Let me check the API response and fix the component to handle the actual data structure.

---

_**Assistant**_

```
'use client';

import { useEffect, useState } from 'react';

interface StravaSegment {
  name: string;
  distance: number;
  avg_grade: number;
  elev_difference: number;
  climb_category: number;
  avg_grade: number;
  start_latlng: [number, number];
  end_latlng: [number, number];
}

export default function StravaSegments() {
  const [segments, setSegments] = useState<StravaSegment[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchSegments() {
      try {
        const response = await fetch('/api/strava/segments');
        if (!response.ok) {
          throw new Error('Failed to fetch segments');
        }
        const data = await response.json();
        setSegments(data.segments || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load segments');
      }
    }

    fetchSegments();
  }, []);

  if (error) {
    return <div className="text-red-500">Error: {error}</div>;
  }

  if (!segments.length) {
    return <div>Loading nearby segments...</div>;
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow-lg">
      <h2 className="text-xl font-semibold mb-4">Popular Routes Nearby</h2>
      <div className="space-y-4">
        {segments.map((segment, index) => (
          <div key={index} className="border-b pb-3 last:border-b-0">
            <h3 className="font-medium">{segment.name}</h3>
            <div className="text-sm text-gray-600 mt-1">
              <p>Distance: {(segment.distance / 1000).toFixed(1)}km</p>
              <p>Grade: {segment.avg_grade?.toFixed(1) || 'N/A'}%</p>
              <p>Elevation gain: {segment.elev_difference?.toFixed(0) || 'N/A'}m</p>
              <p>Category: {segment.climb_category || 'N/A'}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
```

---

_**Assistant**_





Let me fix the duplicate property in the interface:

---



---

