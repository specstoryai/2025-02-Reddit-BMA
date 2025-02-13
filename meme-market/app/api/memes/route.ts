import { promises as fs } from 'fs';
import path from 'path';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const filePath = path.join(process.cwd(), 'public', 'data', 'memes.json');
    const fileContent = await fs.readFile(filePath, 'utf8');
    const data = JSON.parse(fileContent);
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error reading memes.json:', error);
    return NextResponse.json(
      { error: 'Failed to fetch memes data' },
      { status: 500 }
    );
  }
} 