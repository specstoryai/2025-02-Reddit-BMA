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