import glob
import sys
import os
import subprocess

def find_webm_files():
    """Find all .webm files in the current directory."""
    return glob.glob("*.webm")

def play_video(video_path):
    """Play the specified video file using mpv."""
    try:
        print(f"\nPlaying: {video_path}")
        print("Press q to quit playback")
        subprocess.run(['mpv', video_path])
    except KeyboardInterrupt:
        print("\nPlayback stopped by user")

def main():
    # If a specific file is provided as an argument, play that file
    if len(sys.argv) > 1:
        video_path = sys.argv[1]
        if not os.path.exists(video_path):
            print(f"Error: File '{video_path}' not found")
            return
        if not video_path.endswith('.webm'):
            print("Error: Please specify a .webm file")
            return
        play_video(video_path)
        return

    # Otherwise, look for .webm files in the current directory
    webm_files = find_webm_files()
    
    if not webm_files:
        print("No .webm files found in the current directory")
        print("Usage: python play_video.py [video_file.webm]")
        return
    
    if len(webm_files) == 1:
        play_video(webm_files[0])
    else:
        print("Multiple .webm files found. Please specify which one to play:")
        for i, file in enumerate(webm_files, 1):
            print(f"{i}. {file}")
        print("\nUsage: python play_video.py <video_file.webm>")

if __name__ == "__main__":
    main() 