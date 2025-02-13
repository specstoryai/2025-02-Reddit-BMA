import sqlite3 from 'sqlite3';
import { open, Database } from 'sqlite';
import { HistoryEntry } from './types';

let db: Database | null = null;

// Chrome stores timestamps in microseconds since Jan 1, 1601
// We need to convert it to Unix timestamp (milliseconds since Jan 1, 1970)
const WINDOWS_EPOCH_TO_UNIX = 11644473600000000; // Microseconds between 1601 and 1970

function chromeTimeToUnixTimestamp(chromeTime: number): number {
  // Convert from microseconds to milliseconds and adjust for epoch difference
  return Math.floor((chromeTime - WINDOWS_EPOCH_TO_UNIX) / 1000);
}

export async function initializeDatabase(path: string) {
  if (db) return db;
  
  db = await open({
    filename: path,
    driver: sqlite3.Database,
    mode: sqlite3.OPEN_READONLY
  });
  
  return db;
}

export async function getRecentHistory(limit = 100, offset = 0): Promise<HistoryEntry[]> {
  if (!db) throw new Error('Database not initialized');

  const entries = await db.all<HistoryEntry[]>(`
    SELECT 
      urls.url,
      urls.title,
      urls.visit_count as visitCount,
      urls.last_visit_time as lastVisitTime
    FROM urls
    WHERE urls.title IS NOT NULL
      AND urls.title != ''
      AND urls.url LIKE 'http%'
    ORDER BY urls.last_visit_time DESC
    LIMIT ? OFFSET ?
  `, [limit, offset]);

  return entries.map(entry => ({
    ...entry,
    lastVisitTime: chromeTimeToUnixTimestamp(Number(entry.lastVisitTime))
  }));
}

export async function closeDatabase() {
  if (db) {
    await db.close();
    db = null;
  }
} 