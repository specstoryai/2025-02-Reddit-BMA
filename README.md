# The Great Debate - Where Internet Arguments Finally Make Sense! 🎭

Ever wished your internet debates were less "keyboard warrior" and more "enlightened discourse"? Well, probably not, but here we are! The Great Debate is your go-to arena for throwing down about everything from "Does free will exist?" to "Should pineapple go on pizza?" (spoiler: it's complicated). We've taken the internet's favorite pastime—arguing with strangers—and turned it into something almost productive!

## Features

- Structured debate format
- Multiple debate topics
- User provided debate topic
- Human and/or AI participants
- AI Judge
- Clean and intuitive user interface

## Categories

- Philosophy
- Religion
- Politics
- Culture

## Prerequisites

- Python 3.8 or higher
- pip (Python package manager)
- Anthropic API key

## Installation

1. Clone the repository:
```bash
git clone https://github.com/specstoryai/2025-02-Reddit-BMA
cd 2025-02-Reddit-BMA
git checkout the-great-debate
```

2. Create and activate a virtual environment (recommended):
```bash
python -m venv venv
# On macOS/Linux:
source venv/bin/activate
# On Windows:
.\venv\Scripts\activate
```

3. Install dependencies:
```bash
pip install -r requirements.txt
```

4. Set up environment variables:
```bash
# Create a .env file in the project root
echo "ANTHROPIC_API_KEY=your_api_key_here" > .env
```

5. Set up development environment:
```bash
# On macOS/Linux:
export FLASK_ENV=development
export FLASK_DEBUG=1
export FLASK_APP=src.app
# On Windows:
set FLASK_ENV=development
set FLASK_DEBUG=1
set FLASK_APP=src.app

```

6. Start the development server:
```bash
flask run
```

The application will be running on `http://localhost:5000` with hot reloading enabled. Any changes you make to the Python files will automatically trigger a server reload.

## Development Features

- **Hot Reloading**: Changes to Python files are automatically detected and the server reloads
- **Debug Mode**: Detailed error pages and interactive debugger
- **Auto-Reload**: Template changes are reflected immediately

## Project Structure

```
src/
  ├── data/          # Data files including topics and categories
  │   └── topics.json
  ├── templates/     # Jinja2 templates
  ├── static/        # Static files (CSS, JS, images)
  └── app.py         # Main application file
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Contact

Project Link: https://github.com/yourusername/great-debate 