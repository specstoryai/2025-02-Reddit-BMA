import { NextResponse } from 'next/server';
import { initializeDatabase, getRecentHistory } from '@/lib/db';

const CHROME_HISTORY_PATH = process.env.CHROME_HISTORY_PATH || '/Users/gdc/Library/Application Support/Google/Chrome/Default/History';
const DEFAULT_PAGE_SIZE = 100;
const MAX_PAGE_SIZE = 500;

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const page = Number(searchParams.get('page')) || 1;
    const pageSize = Math.min(
      Number(searchParams.get('pageSize')) || DEFAULT_PAGE_SIZE,
      MAX_PAGE_SIZE
    );
    const offset = (page - 1) * pageSize;

    await initializeDatabase(CHROME_HISTORY_PATH);
    const history = await getRecentHistory(pageSize, offset);

    return NextResponse.json({
      history,
      page,
      pageSize,
      hasMore: history.length === pageSize
    });
  } catch (error) {
    console.error('Failed to fetch history:', error);
    return NextResponse.json(
      { error: 'Failed to fetch history' },
      { status: 500 }
    );
  }
} 