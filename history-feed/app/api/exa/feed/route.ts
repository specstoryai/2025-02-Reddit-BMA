import { NextResponse } from 'next/server';
import Exa from 'exa-js';

const exa = new Exa(process.env.EXA_API_KEY || '');


export async function POST(request: Request) {
  try {
    if (!process.env.EXA_API_KEY) {
      throw new Error('EXA_API_KEY is not configured');
    }

    const { urls, options = { numResults: 10 } } = await request.json();
    
    if (!urls || !Array.isArray(urls) || urls.length === 0) {
      return NextResponse.json(
        { error: 'URLs array is required' },
        { status: 400 }
      );
    }

    // Combine all URLs into a single query
    const query = urls.join(' OR ');
    console.log('🔍 Searching Exa with query:', query);

    const response = await exa.search(query, {
      numResults: options.numResults,
      useAutoprompt: true
    });

    console.log('✅ Exa response:', response);
    return NextResponse.json({ 
      data: {
        results: response.results,
        requestId: response.requestId,
      }
    });
  } catch (error) {
    console.error('Failed to fetch similar content:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch similar content' },
      { status: 500 }
    );
  }
} 