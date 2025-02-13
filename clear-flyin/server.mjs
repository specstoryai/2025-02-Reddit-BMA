import express from 'express';
import cors from 'cors';
import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = process.env.PORT || 3001;

// Enable CORS for the frontend
app.use(cors());

// Initialize database connection
const db = new Database(path.join(__dirname, 'data', 'global_airports_sqlite.db'));
const getAirportStmt = db.prepare(`
  SELECT icao_code, lat_decimal, lon_decimal
  FROM airports
  WHERE icao_code = ?
`);

// Endpoint to get airport coordinates
app.get('/api/airport/:icao', (req, res) => {
  const { icao } = req.params;
  
  try {
    const result = getAirportStmt.get(icao.toUpperCase());
    
    if (!result) {
      return res.status(404).json({ error: 'Airport not found' });
    }
    
    res.json({
      code: result.icao_code,
      coordinates: [result.lat_decimal, result.lon_decimal]
    });
  } catch (error) {
    console.error('Database error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Cleanup on server shutdown
process.on('SIGINT', () => {
  db.close();
  process.exit();
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
}); 