# Nudge Nudge Web App

A Clojure web application.

## Prerequisites

- [Clojure](https://clojure.org/guides/install_clojure)
- [Java JDK](https://adoptium.net/) (version 11 or later recommended)

## Getting Started

1. Clone this repository
2. Navigate to the project directory
3. Start the REPL:
   ```bash
   clj -M:dev
   ```
4. Once in the REPL, start the web server:
   ```clojure
   (require '[nudge.core :as core])
   (core/-main)
   ```
5. Visit http://localhost:3000 in your browser

## Development

The project uses the following main dependencies:
- Ring (web server)
- Compojure (routing)
- Hiccup (HTML templating)

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
└── README.md
```

## License

This project is licensed under the MIT License. 