import { NextResponse } from 'next/server';

interface StravaSegment {
  id: number;
  name: string;
  distance: number;
  avg_grade: number;
  elev_difference: number;
  climb_category: number;
  start_latlng: [number, number];
  end_latlng: [number, number];
  path?: [number, number][];
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const bounds = searchParams.get('bounds');

    if (!bounds) {
      return NextResponse.json(
        { error: 'Missing bounds parameter' },
        { status: 400 }
      );
    }

    const [min_lat, min_lng, max_lat, max_lng] = bounds.split(',').map(Number);

    // Explore segments in the provided bounding box
    const segmentsResponse = await fetch(
      `https://www.strava.com/api/v3/segments/explore?bounds=${min_lat},${min_lng},${max_lat},${max_lng}&activity_type=running`,
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
      segmentsData.segments.map(async (segment: StravaSegment) => {
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