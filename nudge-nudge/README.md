# Nudge Nudge Web App

A Clojure web application that provides different perspectives on your dilemmas using AI.

## Prerequisites

- [Clojure](https://clojure.org/guides/install_clojure)
- [Java JDK](https://adoptium.net/) (version 11 or later recommended)
- An Anthropic API key (for Claude AI integration)

## Getting Started

1. Clone this repository
2. Navigate to the project directory
3. Copy the environment template and add your API key:
   ```bash
   cp .env.template .env
   ```
   Then edit `.env` and replace `your-api-key-here` with your actual Anthropic API key
4. Start the REPL:
   ```bash
   clj -M:dev
   ```
5. Once in the REPL, start the web server:
   ```clojure
   (require '[nudge.core :as core])
   (core/-main)
   ```
6. Visit http://localhost:3000 in your browser

## Environment Variables

The following environment variables are required:

- `ANTHROPIC_API_KEY`: Your Anthropic API key for Claude AI integration

These should be set in your `.env` file, which is not committed to version control for security.

## Development

The project uses the following main dependencies:
- Ring (web server)
- Compojure (routing)
- Hiccup (HTML templating)
- clj-http (HTTP client for Anthropic API)
- environ (environment variable management)

## Project Structure

```
.
├── src/
│   └── nudge/         # Main source code
│       ├── core.clj   # Application entry point
│       ├── handler.clj # Web request handlers
│       └── views.clj   # View templates
├── resources/          # Static resources
├── test/              # Test files
├── deps.edn           # Project dependencies
├── .env.template      # Template for environment variables
└── README.md
```

## License

This project is licensed under the MIT License. 