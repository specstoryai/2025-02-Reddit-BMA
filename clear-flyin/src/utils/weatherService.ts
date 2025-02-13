const AVWX_API_BASE = 'https://avwx.rest/api';
const API_KEY = import.meta.env.VITE_AVWX_API_KEY;

interface Meta {
  timestamp: string;
}

export interface Altimeter {
  repr: string;
  value: number;
  spoken: string;
}

export interface Cloud {
  repr: string;
  type: string;
  altitude: number;
  modifier: string | null;
  direction: string | null;
}

export interface Visibility {
  repr: string;
  value: number;
  spoken: string;
}

export interface Wind {
  repr: string;
  value: number;
  spoken: string;
}

export interface WxCode {
  repr: string;
  value: string;
}

interface Time {
  repr: string;
  dt: string;
}

export interface Dewpoint {
  repr: string;
  value: number;
  spoken: string;
}

interface RemarkCode {
  repr: string;
  value: string;
}

interface DecimalValue {
  repr: string;
  value: number;
  spoken: string;
}

interface RemarksInfo {
  maximum_temperature_6: number | null;
  minimum_temperature_6: number | null;
  pressure_tendency: number | null;
  precip_36_hours: number | null;
  precip_24_hours: number | null;
  sunshine_minutes: number | null;
  codes: RemarkCode[];
  dewpoint_decimal: DecimalValue;
  maximum_temperature_24: number | null;
  minimum_temperature_24: number | null;
  precip_hourly: number | null;
  sea_level_pressure: DecimalValue;
  snow_depth: number | null;
  temperature_decimal: DecimalValue;
}

export interface Temperature {
  repr: string;
  value: number;
  spoken: string;
}

export interface Units {
  accumulation: string;
  altimeter: string;
  altitude: string;
  temperature: string;
  visibility: string;
  wind_speed: string;
}

export interface MetarData {
  meta: Meta;
  altimeter: Altimeter;
  clouds: Cloud[];
  flight_rules: string;
  other: string[];
  sanitized: string;
  visibility: Visibility;
  wind_direction: Wind;
  wind_gust: Wind;
  wind_speed: Wind;
  wx_codes: WxCode[];
  raw: string;
  station: string;
  time: Time;
  remarks: string;
  dewpoint: Dewpoint;
  relative_humidity: number;
  remarks_info: RemarksInfo;
  runway_visibility: string[];
  temperature: Temperature;
  wind_variable_direction: Wind[];
  density_altitude: number;
  pressure_altitude: number;
  units: Units;
}

export async function fetchAirportWeather(icaoCode: string): Promise<MetarData | null> {
  try {
    // Fetch METAR data from the stations along a flight path
    // The route will be the icaoCodes array joined by semicolons
    const routeReportResponse = await fetch(`${AVWX_API_BASE}/metar/${icaoCode}`, {
      headers: {
        'Authorization': `Bearer ${API_KEY}`
      }
    });

    if (!routeReportResponse.ok) {
      console.error('Failed to fetch route report:', await routeReportResponse.text());
      return null;
    }

    const routeReportData = await routeReportResponse.json() as MetarData;

    return routeReportData;
  } catch (error) {
    console.error('Error fetching weather data:', error);
    return null;
  }
} 