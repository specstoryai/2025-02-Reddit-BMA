export interface Meme {
  name: string;
  main_image_url: string;
  image_urls: string[];
}

export interface MemeData {
  memes: Meme[];
} 