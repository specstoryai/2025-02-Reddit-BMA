import { promises as fs } from 'fs';
import path from 'path';
import { NextResponse } from 'next/server';
import { MemeData } from '@/app/types/meme';

export async function GET() {
  try {
    const filePath = path.join(process.cwd(), 'public', 'data', 'memes.json');
    const fileContent = await fs.readFile(filePath, 'utf8');
    const data = JSON.parse(fileContent) as MemeData;

    // Deduplicate memes, keeping the first occurrence of each name (case-insensitive)
    const seenNames = new Map<string, boolean>();
    const uniqueMemes = data.memes.filter(meme => {
      const nameLower = meme.name.toLowerCase();
      if (seenNames.has(nameLower)) {
        return false;
      }
      seenNames.set(nameLower, true);
      return true;
    });

    // If we found and removed duplicates, update the file
    if (uniqueMemes.length < data.memes.length) {
      console.log(`Removed ${data.memes.length - uniqueMemes.length} duplicate memes`);
      data.memes = uniqueMemes;
      await fs.writeFile(filePath, JSON.stringify(data, null, 2));
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('Error reading memes.json:', error);
    return NextResponse.json(
      { error: 'Failed to fetch memes data' },
      { status: 500 }
    );
  }
} 