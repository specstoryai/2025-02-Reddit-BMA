import Database from 'better-sqlite3';
import path from 'path';

interface AirportData {
  icao_code: string;
  lat_decimal: number;
  lon_decimal: number;
}

class AirportDatabase {
  private db: Database.Database;
  private getAirportStmt: Database.Statement;

  constructor() {
    this.db = new Database(path.join(process.cwd(), 'data', 'global_airports_sqlite.db'));
    
    // Prepare the statement for reuse
    this.getAirportStmt = this.db.prepare(`
      SELECT icao_code, lat_decimal, lon_decimal
      FROM airports
      WHERE icao_code = ?
    `);
  }

  getAirportCoordinates(icaoCode: string): [number, number] | null {
    const result = this.getAirportStmt.get(icaoCode.toUpperCase()) as AirportData | undefined;
    
    if (!result) {
      return null;
    }

    return [result.lat_decimal, result.lon_decimal];
  }

  close() {
    this.db.close();
  }
}

// Create a singleton instance
const airportDb = new AirportDatabase();

// Ensure the database is closed when the application exits
process.on('exit', () => {
  airportDb.close();
});

export { airportDb }; 