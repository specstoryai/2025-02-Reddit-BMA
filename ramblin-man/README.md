# WebM Video Player

A simple Python script to play WebM videos with a floating "Now Playing" window.

## Prerequisites

1. Python 3.13+ with tkinter support
   - On macOS: `brew install python-tk@3.13`
   - On Linux: `sudo apt-get install python3-tk` (or your distro's equivalent)

2. MPV media player
   - On macOS: `brew install mpv`
   - On Linux: `sudo apt-get install mpv` (or your distro's equivalent)
   - On Windows: Download from [mpv.io](https://mpv.io/installation/)

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

## Usage

1. Place your .webm video files in the project directory

2. Run the script:
   ```bash
   python play_video.py
   ```
   - If there's only one .webm file, it will play automatically
   - If there are multiple files, you'll be prompted to specify which one to play

3. To play a specific video:
   ```bash
   python play_video.py your_video.webm
   ```

## Controls

- **q**: Quit playback
- **Space**: Pause/Play
- **Left/Right Arrow**: Seek backward/forward
- **Up/Down Arrow**: Volume control

## Features

- Automatic video file detection
- Floating "Now Playing" window
- Multiple video file support
- Simple command-line interface

## Note

The script uses only Python standard library modules, so no additional Python packages are required. However, make sure you have Python installed with tkinter support and mpv installed on your system. 