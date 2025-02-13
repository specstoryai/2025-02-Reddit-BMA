# Video Analysis and Playback Tool

A Python-based toolkit for downloading YouTube videos, analyzing their transcripts for sentiment and key phrases, and playing them with a floating "Now Playing" window.

## Prerequisites

1. Python 3.13+ with tkinter support
   - On macOS: `brew install python-tk@3.13`
   - On Linux: `sudo apt-get install python3-tk` (or your distro's equivalent)

2. MPV media player
   - On macOS: `brew install mpv`
   - On Linux: `sudo apt-get install mpv` (or your distro's equivalent)
   - On Windows: Download from [mpv.io](https://mpv.io/installation/)

3. yt-dlp
   - On macOS: `brew install yt-dlp`
   - On Linux: `pip install yt-dlp`
   - On Windows: `pip install yt-dlp`

## Setup

1. Clone this repository:
   ```bash
   git clone <repository-url>
   cd <repository-name>
   ```

2. Create and activate a virtual environment:
   ```bash
   python3.13 -m venv venv
   source venv/bin/activate  # On Unix/macOS
   # or
   .\venv\Scripts\activate  # On Windows
   ```

3. Install dependencies:
   ```bash
   pip install --only-binary :all: -r requirements.txt
   ```

## Usage

### 1. Download Video and Transcript

Use yt-dlp to download both the video and its transcript:

```bash
# Download video in WebM format
yt-dlp -f webm <youtube-url> -o video.webm

# Download transcript in VTT format
yt-dlp --write-auto-sub --skip-download --sub-format vtt <youtube-url> -o video
```

This will create:
- `video.webm`: The video file
- `video.en.vtt`: The transcript file (rename to match your script if needed)

### 2. Analyze Transcript

Run the transcript analysis script:

```bash
python analyze_transcript.py
```

This will generate:
- `transcript_analysis.png`: Visualizations of sentiment and key phrases
- `transcript_analysis.json`: Detailed analysis results
- `transcript_stats.json`: Summary statistics

### 3. Play Video

Play the video with the floating window:

```bash
python play_video.py video.webm
```

Or simply run:
```bash
python play_video.py
```
And it will automatically detect and play any .webm file in the directory.

## Controls

- **q**: Quit playback
- **Space**: Pause/Play
- **Left/Right Arrow**: Seek backward/forward
- **Up/Down Arrow**: Volume control

## Features

### Video Player
- Automatic video file detection
- Floating "Now Playing" window
- Multiple video file support
- Simple command-line interface

### Transcript Analysis
- Sentiment analysis over time
- Key phrase extraction
- Visualization of trends
- Detailed JSON output
- Statistical summaries

## Output Files

### Transcript Analysis
- `transcript_analysis.png`: Visual representation of:
  - Sentiment over time
  - Key phrase frequency
  - Rolling sentiment trends
- `transcript_analysis.json`: Detailed analysis including:
  - Timestamped segments
  - Key phrases
  - Sentiment scores
- `transcript_stats.json`: Summary statistics including:
  - Total duration
  - Average sentiment
  - Most positive/negative moments
  - Top phrases

## Note

The script uses Python standard library modules for video playback and additional packages for transcript analysis. Ensure you have Python installed with tkinter support and all required dependencies installed via pip. 