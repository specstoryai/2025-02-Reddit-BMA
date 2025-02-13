import * as cheerio from 'cheerio';

export interface ExtractedContent {
  url: string;
  title: string;
  content: string;
  metadata: {
    author?: string;
    publishDate?: string;
    tags?: string[];
  };
}

export async function extractContent(url: string): Promise<ExtractedContent> {
  try {
    const response = await fetch(url);
    const html = await response.text();
    const $ = cheerio.load(html);

    // Remove script tags, style tags, and comments
    $('script, style, comment').remove();

    const title = $('title').text().trim() || $('h1').first().text().trim();
    const author = $('meta[name="author"]').attr('content') || 
                  $('meta[property="article:author"]').attr('content');
    const publishDate = $('meta[name="publishedDate"]').attr('content') || 
                       $('meta[property="article:published_time"]').attr('content');
    
    // Extract main content (customize based on common article structures)
    const mainContent = $('article, [role="main"], .main-content, #main-content')
      .first()
      .text()
      .trim();

    // Fallback to body content if no main content found
    const content = mainContent || $('body').text().trim();

    // Extract tags/keywords
    const tags = $('meta[name="keywords"]')
      .attr('content')
      ?.split(',')
      .map(tag => tag.trim())
      .filter(Boolean);

    return {
      url,
      title,
      content,
      metadata: {
        author,
        publishDate,
        tags
      }
    };
  } catch (error) {
    console.error(`Failed to extract content from ${url}:`, error);
    throw error;
  }
} 