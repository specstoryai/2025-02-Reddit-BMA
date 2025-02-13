# Backpack Buddy 🎒

An interactive backpack packing visualization tool that helps you efficiently plan and organize your gear for any adventure.

## Features

- **Interactive Backpack Visualization**: Real-time visual representation of your backpack's dimensions and capacity
- **Smart Packing Algorithm**: Organizes items by priority and suggests optimal placement
- **Dynamic Volume Tracking**: Live monitoring of pack volume with color-coded indicators
- **Intelligent Upgrade Suggestions**: Recommends larger backpack options when capacity is exceeded
- **Multiple Backpack Types**: Support for various backpack sizes from hydration packs to extended trip bags
- **Comprehensive Item Database**: Pre-loaded with common hiking and adventure gear
- **Layer-Based Organization**: Automatically sorts items into bottom, middle, top layers, and pocket items

## Getting Started

### Prerequisites

- Node.js 18+ installed on your system
- npm or yarn package manager

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd backpacks
```

2. Install dependencies:
```bash
npm install
# or
yarn install
```

3. Start the development server:
```bash
npm run dev
# or
yarn dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser to use the app.

## How to Use

1. **Choose Your Backpack**
   - Select from different backpack types based on your trip duration
   - View real-time dimensions and capacity information

2. **Add Items**
   - Browse through categorized gear items
   - Click the '+' button to add items to your pack
   - Monitor the volume indicator to avoid overpacking

3. **Review Packing Strategy**
   - See items organized by priority and accessibility
   - Remove items by clicking the 'x' button
   - Follow suggested layer organization for optimal packing

## Technical Details

Built with:
- [Next.js 14](https://nextjs.org)
- [TypeScript](https://www.typescriptlang.org)
- [Tailwind CSS](https://tailwindcss.com)

## Project Structure

```
backpacks/
├── app/              # Next.js app router
├── components/       # React components
├── data/            # Static data (items, dimensions)
├── lib/             # Utility functions and types
└── public/          # Static assets
```

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the LICENSE file for details.
