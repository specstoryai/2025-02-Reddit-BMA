import { promises as fs } from 'fs';
import path from 'path';
import { NextResponse } from 'next/server';
import { MemeData } from '@/app/types/meme';

export async function POST(request: Request) {
  try {
    const { memeNames } = await request.json() as { memeNames: string[] };

    // Read the current memes.json file
    const filePath = path.join(process.cwd(), 'public', 'data', 'memes.json');
    const fileContent = await fs.readFile(filePath, 'utf8');
    const data = JSON.parse(fileContent) as MemeData;

    // Create a Set of existing meme names (case insensitive)
    const existingMemeNames = new Set(
      data.memes.map(meme => meme.name.toLowerCase())
    );

    // Remove duplicates from the input list itself (keeping first occurrence)
    const uniqueMemeNames = Array.from(
      new Map(
        memeNames.map(name => [name.toLowerCase(), name])
      ).values()
    );

    // Filter out names that already exist in the JSON
    const newMemes = uniqueMemeNames
      .filter((name: string) => !existingMemeNames.has(name.toLowerCase()))
      .map((name: string) => ({
        name,
        main_image_url: "placeholder/default.jpg",
        image_urls: []
      }));

    // Add new memes to the data
    data.memes = [...data.memes, ...newMemes];

    // Write the updated data back to the file
    await fs.writeFile(filePath, JSON.stringify(data, null, 2));

    return NextResponse.json({ 
      success: true,
      added: newMemes.length,
      skipped: memeNames.length - newMemes.length
    });
  } catch (error) {
    console.error('Error adding memes:', error);
    return NextResponse.json(
      { error: 'Failed to add memes' },
      { status: 500 }
    );
  }
} 