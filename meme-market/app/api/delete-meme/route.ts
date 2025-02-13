import { promises as fs } from 'fs';
import path from 'path';
import { NextResponse } from 'next/server';
import { MemeData } from '@/app/types/meme';

export async function POST(request: Request) {
  try {
    const { memeName } = await request.json();

    // Read the current memes.json file
    const filePath = path.join(process.cwd(), 'public', 'data', 'memes.json');
    const fileContent = await fs.readFile(filePath, 'utf8');
    const data = JSON.parse(fileContent) as MemeData;

    // Filter out the meme to delete
    data.memes = data.memes.filter(meme => meme.name !== memeName);

    // Write the updated data back to the file
    await fs.writeFile(filePath, JSON.stringify(data, null, 2));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting meme:', error);
    return NextResponse.json(
      { error: 'Failed to delete meme' },
      { status: 500 }
    );
  }
} 