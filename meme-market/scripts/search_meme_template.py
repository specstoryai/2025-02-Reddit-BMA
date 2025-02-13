#!/usr/bin/env python3

import sys
import os
import json
import requests
import urllib.parse
from urllib.parse import urlparse
from pathlib import Path
import time
import re

def get_direct_image_url(url):
    """Convert Imgur HTML URLs to direct image URLs."""
    parsed = urlparse(url)
    if 'imgur.com' in parsed.netloc:
        # If it's already a direct i.imgur.com URL, return as is
        if parsed.netloc == 'i.imgur.com':
            return url
        # Convert imgur.com/something.jpg to i.imgur.com/something.jpg
        print("Converting Imgur URL to direct image URL...")
        path = parsed.path
        if not path.startswith('/'):
            path = '/' + path
        return f"https://i.imgur.com{path}"
    return url

def sanitize_filename(filename):
    """Convert a string into a valid filename by removing invalid characters."""
    # Replace spaces with underscores and remove invalid filename characters
    filename = filename.lower().strip().replace(' ', '_')
    # Remove any character that isn't alphanumeric, dash, or underscore
    filename = re.sub(r'[^\w\-]', '', filename)
    return filename

def download_image(url, query, output_dir, index=None):
    """Download an image from a URL and save it to the specified directory."""
    print(f"\nDownloading image from: {url}")
    try:
        # Create the output directory if it doesn't exist
        if not os.path.exists(output_dir):
            print(f"Creating output directory: {output_dir}")
            os.makedirs(output_dir, exist_ok=True)
        
        # Get the extension from the URL, fallback to '.jpg' if not found
        original_filename = os.path.basename(urlparse(url).path)
        extension = os.path.splitext(original_filename)[1]
        if not extension:
            print("Could not determine file extension, using '.jpg'")
            extension = '.jpg'
        
        # Create filename from query
        base_filename = sanitize_filename(query)
        if not base_filename:
            base_filename = 'template'
            
        # Add index to filename if provided
        if index is not None:
            filename = f"{base_filename}_{index + 1}{extension}"
        else:
            filename = f"{base_filename}{extension}"
            
        print(f"Using filename: {filename}")
            
        output_path = os.path.join(output_dir, filename)
        print(f"Will save to: {output_path}")
        
        # Download the image with headers that look like a browser request
        print("Downloading image...")
        headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
            'Accept': 'image/webp,image/apng,image/*,*/*;q=0.8',
            'Accept-Language': 'en-US,en;q=0.9',
            'Referer': 'https://imgur.com/',
            'DNT': '1'
        }
        
        # Try up to 3 times with exponential backoff
        max_retries = 3
        for attempt in range(max_retries):
            try:
                response = requests.get(url, headers=headers, stream=True)
                response.raise_for_status()
                
                # Check if we got an HTML response instead of an image
                content_type = response.headers.get('content-type', '')
                if 'text/html' in content_type:
                    print(f"Received HTML instead of image (attempt {attempt + 1}/{max_retries})")
                    if attempt < max_retries - 1:
                        wait_time = 2 ** attempt
                        print(f"Waiting {wait_time} seconds before retry...")
                        time.sleep(wait_time)
                        continue
                    else:
                        raise Exception("Received HTML instead of image after all retries")
                
                # Save the image
                print("Saving image to disk...")
                with open(output_path, 'wb') as f:
                    for chunk in response.iter_content(chunk_size=8192):
                        f.write(chunk)
                
                print("Download complete!")
                return output_path
                
            except requests.exceptions.RequestException as e:
                if attempt < max_retries - 1:
                    wait_time = 2 ** attempt
                    print(f"Download failed (attempt {attempt + 1}/{max_retries}): {e}")
                    print(f"Waiting {wait_time} seconds before retry...")
                    time.sleep(wait_time)
                else:
                    raise
        
        return None
    except Exception as e:
        print(f"Error downloading image: {e}")
        return None

def search_meme_template(query, output_dir=None):
    """Search r/MemeTemplatesOfficial for a meme template using Reddit's public JSON API."""
    print(f"\nSearching for: '{query}' in r/MemeTemplatesOfficial")
    
    # URL encode the search query
    encoded_query = urllib.parse.quote(query)
    
    # Construct the search URL for r/MemeTemplatesOfficial
    url = f"https://www.reddit.com/r/MemeTemplatesOfficial/search.json?q={encoded_query}&restrict_sr=1&sort=relevance&limit=3"
    print(f"Using search URL: {url}")
    
    try:
        # Add a User-Agent header to be nice to Reddit's servers
        print("Sending request to Reddit...")
        headers = {'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'}
        response = requests.get(url, headers=headers)
        response.raise_for_status()
        
        print("Parsing response...")
        data = response.json()
        
        # Check if we have any results
        posts = data.get('data', {}).get('children', [])
        if not posts:
            print("No posts found matching the search query")
            return None
            
        print(f"Found {len(posts)} post(s)")
        
        results = []
        for i, post in enumerate(posts):
            post_data = post['data']
            result = {}
            
            # Get both the permalink and direct image URL
            permalink = post_data.get('permalink')
            image_url = post_data.get('url')
            
            if permalink:
                # Convert relative URL to absolute URL
                result['post_url'] = f"https://www.reddit.com{permalink}"
                print(f"Found post URL {i + 1}: {result['post_url']}")
            
            if image_url:
                print(f"Found image URL {i + 1}: {image_url}")
                # Download the image if it's an image URL
                if any(image_url.lower().endswith(ext) for ext in ['.jpg', '.jpeg', '.png', '.gif']):
                    # Convert to direct image URL if it's an Imgur URL
                    direct_url = get_direct_image_url(image_url)
                    print(f"URL {i + 1} appears to be an image, attempting download...")
                    downloaded_path = download_image(direct_url, query, output_dir or "downloaded_templates", i)
                    if downloaded_path:
                        result['image_path'] = downloaded_path
                        result['image_url'] = direct_url
                        results.append(result)
                else:
                    print(f"URL {i + 1} does not appear to be a direct image link")
            
            # Wait a bit between downloads to be nice to the servers
            if i < len(posts) - 1:
                time.sleep(0.5)
        
        return results if results else None
    except Exception as e:
        print(f"Error searching Reddit: {e}")
        return None

def process_memes_json(json_file_path):
    """Process a memes.json file and download missing or placeholder images."""
    print(f"\n=== Processing memes.json file: {json_file_path} ===")
    
    try:
        # Get the directory containing the JSON file for saving images
        json_dir = os.path.dirname(os.path.abspath(json_file_path))
        
        # Read the JSON file
        with open(json_file_path, 'r') as f:
            data = json.load(f)
        
        if 'memes' not in data:
            print("Error: JSON file does not contain a 'memes' array")
            return
        
        # Process each meme
        for i, meme in enumerate(data['memes']):
            name = meme.get('name')
            current_urls = meme.get('image_urls', [])
            
            if not name:
                print(f"Skipping meme {i+1}: No name provided")
                continue
                
            print(f"\nProcessing meme {i+1}/{len(data['memes'])}: {name}")
            
            # Check if we need to download this meme
            if not current_urls:
                print(f"Need to download images for: {name}")
                
                # Search and download the images
                results = search_meme_template(name, json_dir)
                if results:
                    # Update the JSON with the filenames
                    meme['image_urls'] = [
                        os.path.basename(result['image_path'])
                        for result in results
                    ]
                    print(f"Updated image_urls to: {meme['image_urls']}")
                else:
                    print(f"Could not find images for: {name}")
                    meme['image_urls'] = []
                
                # Wait between memes to avoid rate limits
                if i < len(data['memes']) - 1:  # Don't wait after the last one
                    print("Waiting 1 second before next meme...")
                    time.sleep(1)
            else:
                print(f"Skipping meme - already has {len(current_urls)} image(s): {current_urls}")
        
        # Save the updated JSON
        output_path = json_file_path
        print(f"\nSaving updated JSON to: {output_path}")
        with open(output_path, 'w') as f:
            json.dump(data, f, indent=2)
        print("Save complete!")
        
    except Exception as e:
        print(f"Error processing memes.json: {e}")

def main():
    if len(sys.argv) < 2:
        print("Usage:")
        print("  Search for a single meme:")
        print("    python search_meme_template.py 'your search query'")
        print("  Process a memes.json file:")
        print("    python search_meme_template.py --json path/to/memes.json")
        sys.exit(1)
    
    if sys.argv[1] == '--json':
        if len(sys.argv) < 3:
            print("Error: Please provide the path to memes.json")
            sys.exit(1)
        process_memes_json(sys.argv[2])
    else:
        # Original single-meme search functionality
        search_query = ' '.join(sys.argv[1:])
        print(f"\n=== Starting meme template search ===")
        
        results = search_meme_template(search_query)
        print("\n=== Search Results ===")
        if results:
            for i, result in enumerate(results):
                print(f"\nResult {i + 1}:")
                if 'post_url' in result:
                    print(f"✓ Found template post: {result['post_url']}")
                if 'image_path' in result:
                    print(f"✓ Downloaded image to: {result['image_path']}")
                    print(f"✓ Original image URL: {result['image_url']}")
        else:
            print("✗ No matching templates found.")
        print("\n=== Search complete ===")

if __name__ == "__main__":
    main() 