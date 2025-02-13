import glob
import sys
import os
import subprocess
import multiprocessing
import tkinter as tk
from pathlib import Path

def show_filename_window(filename):
    """Display a window showing the current filename."""
    root = tk.Tk()
    root.title("Now Playing")
    
    # Get screen width and height
    screen_width = root.winfo_screenwidth()
    screen_height = root.winfo_screenheight()
    
    # Set window size and position (top right corner)
    window_width = 300
    window_height = 100
    x = screen_width - window_width - 20
    y = 20
    
    root.geometry(f"{window_width}x{window_height}+{x}+{y}")
    
    # Make window stay on top
    root.attributes('-topmost', True)
    
    # Set background color and style
    root.configure(bg='black')
    
    # Add filename label with styling
    label = tk.Label(
        root,
        text=f"Now Playing:\n{Path(filename).name}",
        wraplength=280,
        justify="center",
        font=("Arial", 12),
        fg='white',
        bg='black',
        padx=10,
        pady=10
    )
    label.pack(expand=True)
    
    root.mainloop()

def find_webm_files():
    """Find all .webm files in the current directory."""
    return glob.glob("*.webm")

def play_video(video_path):
    """Play the specified video file using mpv."""
    try:
        print(f"\nPlaying: {video_path}")
        print("Press q to quit playback")
        
        # Start the filename display window in a separate process
        filename_process = multiprocessing.Process(
            target=show_filename_window,
            args=(video_path,)
        )
        filename_process.start()
        
        # Play the video
        subprocess.run(['mpv', video_path])
        
        # Clean up the filename window process
        filename_process.terminate()
        filename_process.join()
        
    except KeyboardInterrupt:
        print("\nPlayback stopped by user")
        if 'filename_process' in locals():
            filename_process.terminate()
            filename_process.join()

def main():
    if sys.platform == 'darwin':
        # Required for multiprocessing on macOS
        multiprocessing.set_start_method('spawn')
    
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