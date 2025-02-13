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
    console.log('Strava API response:', JSON.stringify(data, null, 2));
    return NextResponse.json(data);
  } catch (error) {
    console.error('Strava API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch segments' },
      { status: 500 }
    );
  }
} 