export interface HistoryEntry {
  url: string;
  title: string;
  visitCount: number;
  lastVisitTime: number;
}

export interface BrowsingPattern {
  domain: string;
  frequency: number;
  timeOfDay: number[];
}

export interface DatabaseConfig {
  path: string;
  maxConnections: number;
  timeout: number;
} 