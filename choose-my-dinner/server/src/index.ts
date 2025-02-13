import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { PlacesService } from './services/places.service';
import { SearchParams } from './types/search';

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

// Initialize Places Service
const placesService = new PlacesService(process.env.GOOGLE_PLACES_API_KEY || '');

// Request logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  console.log('Headers:', req.headers);
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});

// Configure CORS
const corsOptions = {
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  methods: ['GET', 'POST', 'OPTIONS', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type'],
  credentials: false
};

app.use(cors(corsOptions));

// Handle preflight requests
app.options('*', cors(corsOptions));

app.use(express.json());

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Search endpoint
app.post('/api/search', async (req, res) => {
  try {
    console.log('Received search request with body:', req.body);
    const searchParams: SearchParams = req.body;

    // Validate required fields
    if (!searchParams.address) {
      return res.status(400).json({ error: 'Address is required' });
    }

    // Validate API key
    if (!process.env.GOOGLE_PLACES_API_KEY) {
      return res.status(500).json({ error: 'Google Places API key is not configured' });
    }

    const restaurants = await placesService.searchRestaurants(searchParams);
    console.log('Sending response with restaurants:', restaurants);
    res.json(restaurants);
  } catch (error) {
    console.error('Search error:', error);
    res.status(500).json({
      error: error instanceof Error ? error.message : 'An unexpected error occurred',
    });
  }
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
}); 