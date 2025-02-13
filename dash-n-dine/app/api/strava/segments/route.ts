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

    // First get the segments
    const segmentsResponse = await fetch(
      `https://www.strava.com/api/v3/segments/explore?bounds=${bounds.min_lat},${bounds.min_lng},${bounds.max_lat},${bounds.max_lng}&activity_type=running`,
      {
        headers: {
          'Authorization': `Bearer ${process.env.NEXT_STRAVA_ACCESS_TOKEN}`
        }
      }
    );

    if (!segmentsResponse.ok) {
      throw new Error('Failed to fetch from Strava API');
    }

    const segmentsData = await segmentsResponse.json();

    // For each segment, get its detailed path data
    const segmentsWithPaths = await Promise.all(
      segmentsData.segments.map(async (segment: any) => {
        try {
          const streamResponse = await fetch(
            `https://www.strava.com/api/v3/segments/${segment.id}/streams?keys=latlng&key_by_type=true`,
            {
              headers: {
                'Authorization': `Bearer ${process.env.NEXT_STRAVA_ACCESS_TOKEN}`
              }
            }
          );

          if (!streamResponse.ok) {
            return segment;
          }

          const streamData = await streamResponse.json();
          return {
            ...segment,
            path: streamData.latlng?.data || []
          };
        } catch (error) {
          console.error(`Failed to fetch path for segment ${segment.id}:`, error);
          return segment;
        }
      })
    );

    return NextResponse.json({ segments: segmentsWithPaths });
  } catch (error) {
    console.error('Strava API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch segments' },
      { status: 500 }
    );
  }
} 