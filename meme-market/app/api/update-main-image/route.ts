import { NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';
import { Meme } from '@/app/types/meme';

export async function POST(request: Request) {
  try {
    const { memeName, newMainImageUrl } = await request.json();

    // Read the current memes.json file
    const filePath = path.join(process.cwd(), 'public', 'data', 'memes.json');
    const fileContent = await fs.readFile(filePath, 'utf8');
    const data = JSON.parse(fileContent);

    // Update the main_image_url for the specified meme
    data.memes = data.memes.map((meme: Meme) => {
      if (meme.name === memeName) {
        return { ...meme, main_image_url: newMainImageUrl };
      }
      return meme;
    });

    // Write the updated data back to the file
    await fs.writeFile(filePath, JSON.stringify(data, null, 2));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error updating memes.json:', error);
    return NextResponse.json(
      { error: 'Failed to update main image' },
      { status: 500 }
    );
  }
} 