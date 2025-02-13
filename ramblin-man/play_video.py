import glob
import sys
import os
import subprocess
import multiprocessing
import tkinter as tk
import json
import socket
import tempfile
import threading
import time
import re
from pathlib import Path
import matplotlib.pyplot as plt
from matplotlib.backends.backend_tkagg import FigureCanvasTkAgg
from matplotlib.figure import Figure

def parse_timestamp(timestamp):
    """Convert WebVTT timestamp to seconds."""
    hours, minutes, seconds = timestamp.split(':')
    seconds, milliseconds = seconds.split('.')
    return (int(hours) * 3600 + 
            int(minutes) * 60 + 
            int(seconds) + 
            int(milliseconds) / 1000)

def clean_text(text):
    """Clean up WebVTT text by removing XML tags and redundant whitespace."""
    # Remove XML-style tags
    text = re.sub(r'<[^>]+>', '', text)
    # Remove timestamp artifacts that might appear in text
    text = re.sub(r'\d{2}:\d{2}:\d{2}\.\d{3}', '', text)
    # Clean up whitespace
    text = ' '.join(text.split())
    return text

def parse_transcript(video_path):
    """Parse the WebVTT transcript file associated with the video."""
    transcript_path = video_path.replace('.webm', '.vtt')
    if not os.path.exists(transcript_path):
        return None
    
    transcript = []
    timestamp_pattern = r'(\d{2}:\d{2}:\d{2}\.\d{3}) --> (\d{2}:\d{2}:\d{2}\.\d{3})'
    
    with open(transcript_path, 'r', encoding='utf-8') as f:
        content = f.read()
        # Skip WebVTT header
        if content.startswith('WEBVTT'):
            content = content.split('\n\n', 1)[1]
        
        # Split into blocks (each block is a subtitle)
        blocks = content.split('\n\n')
        
        for block in blocks:
            lines = block.strip().split('\n')
            if len(lines) < 2:  # Skip invalid blocks
                continue
                
            # Look for timestamp line
            for line in lines:
                match = re.search(timestamp_pattern, line)
                if match:
                    start_time = parse_timestamp(match.group(1))
                    # Get the text (everything after the timestamp line)
                    text = ' '.join(lines[lines.index(line) + 1:])
                    text = clean_text(text)
                    if text:  # Only add if there's actual text
                        transcript.append((start_time, text))
                    break
    
    # Remove duplicates while preserving order
    seen = set()
    cleaned_transcript = []
    for time, text in transcript:
        if text not in seen:
            seen.add(text)
            cleaned_transcript.append((time, text))
    
    return sorted(cleaned_transcript) if cleaned_transcript else None

def get_current_lines(transcript, current_time, window_size=5):
    """Get the lines that should be displayed based on current playback time."""
    if not transcript:
        return "No transcript available."
    
    # Find the current line
    current_idx = 0
    for i, (time, _) in enumerate(transcript):
        if time > current_time:
            break
        current_idx = i
    
    # Get window_size lines before and after current line
    start_idx = max(0, current_idx - window_size)
    end_idx = min(len(transcript), current_idx + window_size + 1)
    
    lines = []
    for i in range(start_idx, end_idx):
        time, text = transcript[i]
        timestamp = f"{int(time//60):02d}:{int(time%60):02d}"
        if i == current_idx:
            # Highlight current line
            lines.append(f"➤ [{timestamp}] {text}")
        else:
            lines.append(f"  [{timestamp}] {text}")
    
    return "\n".join(lines)

def show_sentiment_window(root, video_path, socket_path):
    """Create a window showing the sentiment analysis graph with a time scrubber."""
    sentiment_window = tk.Toplevel(root)
    sentiment_window.title("Sentiment Analysis")
    
    # Set window size and position (bottom right corner)
    window_width = 500
    window_height = 300
    screen_width = root.winfo_screenwidth()
    screen_height = root.winfo_screenheight()
    x = screen_width - window_width - 20
    y = screen_height - window_height - 40
    
    sentiment_window.geometry(f"{window_width}x{window_height}+{x}+{y}")
    sentiment_window.configure(bg='black')
    sentiment_window.attributes('-topmost', True)
    
    try:
        # Load sentiment data from transcript_analysis.json
        analysis_file = 'transcript_analysis.json'
        
        with open(analysis_file, 'r') as f:
            analysis_data = json.load(f)
            
        # Extract times and sentiment scores
        times = []
        polarity = []
        subjectivity = []
        
        for entry in analysis_data:
            # Convert time string to minutes
            time_str = entry['start_time']
            h, m, s = map(float, time_str.replace('0 days ', '').split(':'))
            minutes = h * 60 + m + s / 60
            times.append(minutes)
            
            polarity.append(entry['sentiment']['polarity'])
            subjectivity.append(entry['sentiment']['subjectivity'])
        
        # Create matplotlib figure
        fig = Figure(figsize=(5, 3), dpi=100)
        fig.patch.set_facecolor('black')
        ax = fig.add_subplot(111)
        ax.set_facecolor('black')
        
        # Plot sentiment data
        ax.plot(times, polarity, label='Polarity', color='blue', marker='o')
        ax.plot(times, subjectivity, label='Subjectivity', color='red', marker='s')
        
        # Add initial scrubber line (will be updated)
        scrubber_line = ax.axvline(x=0, color='yellow', alpha=0.5, linestyle='--')
        
        # Customize the plot
        ax.set_xlabel('Time (minutes)', color='white')
        ax.set_ylabel('Score', color='white')
        ax.set_title('Sentiment Analysis Over Time', color='white')
        ax.grid(True, alpha=0.3)
        ax.legend()
        
        # Set colors for the graph
        ax.spines['bottom'].set_color('white')
        ax.spines['top'].set_color('white')
        ax.spines['left'].set_color('white')
        ax.spines['right'].set_color('white')
        ax.tick_params(colors='white')
        ax.yaxis.label.set_color('white')
        ax.xaxis.label.set_color('white')
        
        # Create canvas
        canvas = FigureCanvasTkAgg(fig, master=sentiment_window)
        canvas.draw()
        canvas.get_tk_widget().pack(fill=tk.BOTH, expand=True)
        
        # Function to update scrubber position
        def update_scrubber():
            try:
                # Connect to mpv's IPC socket
                sock = socket.socket(socket.AF_UNIX)
                sock.connect(socket_path)
                
                while True:
                    # Get current playback position
                    sock.send(b'{ "command": ["get_property", "playback-time"] }\n')
                    response = sock.recv(1024).decode()
                    try:
                        current_time = json.loads(response)['data']
                        # Convert to minutes for the graph
                        current_minutes = current_time / 60
                        
                        # Update scrubber line position
                        scrubber_line.set_xdata([current_minutes, current_minutes])
                        canvas.draw_idle()  # Redraw only the updated part
                    except (json.JSONDecodeError, KeyError):
                        pass
                    
                    time.sleep(0.1)  # Update 10 times per second
                    
            except (socket.error, ConnectionRefusedError):
                sentiment_window.quit()
        
        # Start update thread
        update_thread = threading.Thread(target=update_scrubber, daemon=True)
        update_thread.start()
        
    except Exception as e:
        # If there's an error loading or plotting the data, show error message
        error_label = tk.Label(
            sentiment_window,
            text=f"Error loading sentiment data:\n{str(e)}",
            font=("Arial", 12),
            fg='white',
            bg='black',
            padx=20,
            pady=20
        )
        error_label.pack(expand=True)
    
    return sentiment_window

def show_transcript_window(video_path, socket_path):
    """Display a window showing the synced transcript."""
    transcript = parse_transcript(video_path)
    if not transcript:
        print("No transcript file found. Expected:", video_path.replace('.webm', '.vtt'))
        return
    
    root = tk.Tk()
    root.title("Transcript")
    
    # Get screen width and height
    screen_width = root.winfo_screenwidth()
    screen_height = root.winfo_screenheight()
    
    # Set window size and position (right side of screen)
    window_width = 400
    window_height = 600
    x = screen_width - window_width - 20
    y = 20
    
    root.geometry(f"{window_width}x{window_height}+{x}+{y}")
    root.attributes('-topmost', True)
    root.configure(bg='black')
    
    # Add transcript text widget with styling
    text_widget = tk.Text(
        root,
        wrap=tk.WORD,
        font=("Courier", 12),
        fg='white',
        bg='black',
        padx=10,
        pady=10,
        height=20
    )
    text_widget.pack(fill=tk.BOTH, expand=True)
    
    # Create the sentiment analysis window
    sentiment_window = show_sentiment_window(root, video_path, socket_path)
    
    # Function to update transcript based on playback position
    def update_transcript():
        try:
            # Connect to mpv's IPC socket
            sock = socket.socket(socket.AF_UNIX)
            sock.connect(socket_path)
            
            while True:
                # Get current playback position
                sock.send(b'{ "command": ["get_property", "playback-time"] }\n')
                response = sock.recv(1024).decode()
                try:
                    current_time = json.loads(response)['data']
                    
                    # Update text widget with current lines
                    text_widget.delete(1.0, tk.END)
                    text_widget.insert(tk.END, get_current_lines(transcript, current_time))
                except (json.JSONDecodeError, KeyError):
                    pass
                
                time.sleep(0.1)  # Update 10 times per second
                
        except (socket.error, ConnectionRefusedError):
            root.quit()
    
    # Start update thread
    update_thread = threading.Thread(target=update_transcript, daemon=True)
    update_thread.start()
    
    root.mainloop()

def find_webm_files():
    """Find all .webm files in the current directory."""
    return glob.glob("*.webm")

def play_video(video_path):
    """Play the specified video file using mpv with IPC socket."""
    try:
        print(f"\nPlaying: {video_path}")
        print("Press q to quit playback")
        
        # Create a temporary socket path
        with tempfile.NamedTemporaryFile(delete=False) as tmp:
            socket_path = tmp.name
        
        # Start the transcript window in a separate process
        transcript_process = multiprocessing.Process(
            target=show_transcript_window,
            args=(video_path, socket_path)
        )
        transcript_process.start()
        
        # Play the video with IPC socket enabled
        subprocess.run(['mpv', video_path, f'--input-ipc-server={socket_path}'])
        
        # Clean up
        transcript_process.terminate()
        transcript_process.join()
        os.unlink(socket_path)
        
    except KeyboardInterrupt:
        print("\nPlayback stopped by user")
        if 'transcript_process' in locals():
            transcript_process.terminate()
            transcript_process.join()
        if 'socket_path' in locals():
            os.unlink(socket_path)

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