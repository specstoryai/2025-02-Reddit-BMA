import { NextResponse } from 'next/server';
import { extractContent } from '@/lib/content-extractor';

export async function POST(request: Request) {
  try {
    const { url } = await request.json();
    
    if (!url) {
      return NextResponse.json(
        { error: 'URL is required' },
        { status: 400 }
      );
    }

    const content = await extractContent(url);
    return NextResponse.json({ content });
  } catch (error) {
    console.error('Failed to extract content:', error);
    return NextResponse.json(
      { error: 'Failed to extract content' },
      { status: 500 }
    );
  }
} 