import { NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req: Request) {
  try {
    const { image } = await req.json();
    
    if (!image) {
      return NextResponse.json({ error: 'No image provided' }, { status: 400 });
    }

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "user",
          content: [
            { type: "text", text: "Analyze this image and tell me if it contains a hotdog. First line: answer only yes/no. Second line: briefly explain why in 10-15 words." },
            { type: "image_url", image_url: { url: image } }
          ],
        },
      ],
      max_tokens: 100,
    });

    const answer = response.choices[0].message.content?.toLowerCase() ?? '';
    const [yesNo, ...reasonParts] = answer.split('\n').map(line => line.trim());
    const isHotdog = yesNo.includes('yes');
    const reason = reasonParts.join(' ').replace(/^because\s|:/i, '');

    return NextResponse.json({ 
      isHotdog,
      reason,
      rawResponse: answer
    });
  } catch (error) {
    console.error('Error analyzing image:', error);
    return NextResponse.json(
      { error: 'Failed to analyze image' },
      { status: 500 }
    );
  }
} 