# Clovet App

A clothing organization and curation app that helps you manage your wardrobe.

## Features

- **Saved Items**: View and manage all your saved clothing items
- **Curated Collection**: AI-powered curation of your clothing items to create stylish outfits

## Getting Started

### Prerequisites

- Node.js 14+ and npm
- Expo CLI: `npm install -g expo-cli`

### Installation

1. Clone the repository
2. Install dependencies:
   ```
   cd clovet-app
   npm install
   ```

3. Start the app:
   ```
   npm run dev
   ```

### Backend Setup

1. Navigate to the backend directory:
   ```
   cd clovet-backend
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Start the backend server:
   ```
   node index.js
   ```

   Or with OpenAI API key for AI curation:
   ```
   node start.js YOUR_OPENAI_API_KEY
   ```

## Using the Curated Tab

The Curated tab uses AI to select items from your saved collection that work well together. To use this feature:

1. Save several clothing items in the Saved tab
2. Navigate to the Curated tab
3. The app will automatically generate a curated collection
4. Tap the "Refresh" button to generate a new curated collection
5. Tap on any item to see why it was selected

### AI Curation

The AI curation feature uses OpenAI's GPT model to:
- Analyze your saved clothing items
- Select items that work well together
- Provide reasons for each selection

For the best results:
- Save at least 5-10 clothing items
- Include a variety of clothing types (tops, bottoms, accessories)
- Make sure your clothing items have descriptive text

## License

This project is licensed under the MIT License.
