export interface Location {
  name: string;
  latitude: number;
  longitude: number;
  country: string;
  state?: string;
}

export interface WeatherCondition {
  time: number | string;
  temp?: number;
  high?: number;
  low?: number;
  condition: string;
  precip: number;
  precipAmt: number;
  wind: number;
  windDir: string;
  uv: number;
  aqi: number;
  visibility: number;
  humidity: number;
  pressure: number;
}

export interface HourlyForecast extends WeatherCondition {
  time: number;
  temp: number;
}

export interface DailyForecast extends WeatherCondition {
  date: string;
  high: number;
  low: number;
}

export interface SunMoonTimes {
  dawn: string;
  dusk: string;
  sunrise: string;
  sunset: string;
  dayLength: string;
  nightLength: string;
}

export interface WeatherData {
  location: Location;
  current: WeatherCondition;
  hourly: HourlyForecast[];
  daily: DailyForecast[];
  sunMoon: SunMoonTimes;
}

export interface RadarFrame {
  time: number;
  path: string;
} 