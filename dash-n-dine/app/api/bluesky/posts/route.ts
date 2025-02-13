import { NextResponse } from 'next/server';
import axios from 'axios';

interface BlueskyImage {
  fullsize: string;
  alt: string;
}

interface BlueskyEmbed {
  images?: BlueskyImage[];
}

interface BlueskyPost {
  post: {
    record: {
      text: string;
      createdAt: string;
    };
    embed?: BlueskyEmbed;
  };
}

interface BlueskyResponse {
  feed: BlueskyPost[];
}

interface TransformedPost {
  text: string;
  createdAt: string;
  images: { url: string; alt: string; }[];
  location?: {
    name: string;
    coordinates: [number, number]; // [longitude, latitude]
  };
}

function extractLocationFromText(text: string): { name: string; coordinates: [number, number] } | undefined {
  // Look for Google Maps URL in the text
  const mapsUrlMatch = text.match(/https:\/\/www\.google\.com\/maps\/search\/\?[^\\s]+/);
  if (!mapsUrlMatch) return undefined;

  // Extract restaurant name (text before the URL)
  const nameMatch = text.match(/^([^https]+)/);
  const name = nameMatch ? nameMatch[1].trim() : '';

  // Extract coordinates from the URL
  const url = new URL(mapsUrlMatch[0]);
  const queryParams = url.searchParams;
  const query = queryParams.get('query');
  
  if (query) {
    const [lat, lng] = query.split(',').map(Number);
    if (!isNaN(lat) && !isNaN(lng)) {
      return {
        name,
        coordinates: [lng, lat] // Mapbox uses [longitude, latitude] format
      };
    }
  }

  return undefined;
}

export async function GET() {
  try {
    const apiUrl = 'https://public.api.bsky.app/xrpc/app.bsky.feed.getAuthorFeed';
    const response = await axios.get<BlueskyResponse>(apiUrl, {
      params: {
        actor: 'restaurant-bot.bsky.social',
        limit: 10
      }
    });

    // Transform the feed data to match our interface
    const posts = response.data.feed.map((item: BlueskyPost): TransformedPost => {
      const post: TransformedPost = {
        text: item.post.record.text,
        createdAt: item.post.record.createdAt,
        images: []
      };

      // Extract location information from the post text
      const location = extractLocationFromText(item.post.record.text);
      if (location) {
        post.location = location;
      }

      // Check for images in the embed
      if (item.post.embed?.images) {
        post.images = item.post.embed.images.map((img: BlueskyImage) => ({
          url: img.fullsize,
          alt: img.alt || ''
        }));
      }

      return post;
    });

    return NextResponse.json({ posts });
  } catch (error) {
    console.error('Failed to fetch Bluesky posts:', error);
    return NextResponse.json(
      { error: 'Failed to fetch Bluesky posts' },
      { status: 500 }
    );
  }
} 