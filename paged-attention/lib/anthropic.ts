import fs from 'fs';
import path from 'path';

const ANTHROPIC_API_URL = 'https://api.anthropic.com/v1/messages';

export async function chatWithPaper(userMessage: string) {
  // Read and parse the base request template
  const requestTemplate = JSON.parse(
    fs.readFileSync(path.join(process.cwd(), 'claude_request.json'), 'utf-8')
  );

  // Replace the default message with the user's message
  requestTemplate.messages[0].content[1].text = userMessage;

  try {
    const response = await fetch(ANTHROPIC_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY!,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify(requestTemplate)
    });

    if (!response.ok) {
      throw new Error(`API request failed: ${response.statusText}`);
    }

    const data = await response.json();
    return data.content[0].text;
  } catch (error) {
    console.error('Error calling Anthropic API:', error);
    throw error;
  }
} 