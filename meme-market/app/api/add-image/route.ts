import { promises as fs } from 'fs';
import path from 'path';
import { NextResponse } from 'next/server';
import { MemeData } from '@/app/types/meme';

export async function POST(request: Request) {
  try {
    const { memeName, imageUrl } = await request.json();

    // Generate a filename based on the meme name and existing files
    const filePath = path.join(process.cwd(), 'public', 'data', 'memes.json');
    const fileContent = await fs.readFile(filePath, 'utf8');
    const data = JSON.parse(fileContent) as MemeData;

    // Find the meme
    const meme = data.memes.find(m => m.name === memeName);
    if (!meme) {
      return NextResponse.json({ error: 'Meme not found' }, { status: 404 });
    }

    // Determine file extension from URL
    const urlExtension = imageUrl.split('.').pop()?.toLowerCase();
    const validExtensions = ['jpg', 'jpeg', 'png', 'gif'];
    const extension = validExtensions.includes(urlExtension || '') ? urlExtension : 'jpg';

    // Generate filename based on meme name and count
    const baseName = memeName.toLowerCase()
      .replace(/[^a-z0-9]+/g, '_')
      .replace(/^_+|_+$/g, '');
    
    const existingCount = meme.image_urls.length;
    const newFileName = `${baseName}_${existingCount + 1}.${extension}`;
    const imagePath = path.join(process.cwd(), 'public', 'data', newFileName);

    // Fetch and save the image
    const imageResponse = await fetch(imageUrl);
    if (!imageResponse.ok) {
      return NextResponse.json({ error: 'Failed to fetch image' }, { status: 400 });
    }
    const imageBuffer = await imageResponse.arrayBuffer();
    await fs.writeFile(imagePath, Buffer.from(imageBuffer));

    // Update meme data
    meme.image_urls.push(newFileName);
    meme.main_image_url = newFileName;

    // Save updated meme data
    await fs.writeFile(filePath, JSON.stringify(data, null, 2));

    return NextResponse.json({ 
      success: true,
      fileName: newFileName
    });
  } catch (error) {
    console.error('Error adding image:', error);
    return NextResponse.json(
      { error: 'Failed to add image' },
      { status: 500 }
    );
  }
} 