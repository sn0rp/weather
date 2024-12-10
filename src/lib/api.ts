import { Location, WeatherData, RadarFrame } from '@/types/weather';

const OPEN_METEO_BASE = 'https://api.open-meteo.com/v1';
const AIR_QUALITY_BASE = 'https://air-quality-api.open-meteo.com/v1';
const NOMINATIM_BASE = 'https://nominatim.openstreetmap.org';
const RAINVIEWER_BASE = 'https://api.rainviewer.com/public/weather-maps.json';

interface NominatimAddress {
  city?: string;
  town?: string;
  village?: string;
  municipality?: string;
  suburb?: string;
  postcode?: string;
  country: string;
  state?: string;
  county?: string;
}

interface NominatimResponse {
  address: NominatimAddress;
  lat: string;
  lon: string;
  importance: number;
  display_name: string;
}

interface RainViewerFrame {
  time: number;
  path: string;
}

interface RainViewerResponse {
  radar: {
    past: RainViewerFrame[];
    nowcast: RainViewerFrame[];
  };
}

export async function searchLocation(query: string): Promise<Location[]> {
  const isZipCode = /^\d{5}$/.test(query);
  
  const params = new URLSearchParams({
    q: query,
    format: 'json',
    limit: '5',
    addressdetails: '1',
    ...(isZipCode && { countrycodes: 'us' })
  });

  const response = await fetch(`${NOMINATIM_BASE}/search?${params}`);
  const data = await response.json() as NominatimResponse[];

  return data
    .filter((item) => item.address)
    .map((item) => ({
      name: item.address?.city || item.address?.town || item.address?.village || item.display_name.split(',')[0],
      latitude: parseFloat(item.lat),
      longitude: parseFloat(item.lon),
      country: item.address?.country || 'Unknown',
      state: item.address?.state || undefined
    }))
    .filter((location: Location) => 
      location.name && 
      location.country !== 'Unknown'
    )
    .slice(0, 5);
}

export async function reverseGeocode(lat: number, lon: number): Promise<Location> {
  const params = new URLSearchParams({
    lat: lat.toString(),
    lon: lon.toString(),
    format: 'json',
  });

  const response = await fetch(`${NOMINATIM_BASE}/reverse?${params}`);
  const data = await response.json();

  return {
    name: data.address?.city || data.address?.town || data.address?.village || data.address?.suburb || 'Unknown Location',
    latitude: parseFloat(data.lat),
    longitude: parseFloat(data.lon),
    country: data.address?.country || 'Unknown',
    state: data.address?.state || undefined,
  };
}

function calculateSunMoonTimes(sunrise: string, sunset: string) {
  const sunriseDate = new Date(sunrise);
  const sunsetDate = new Date(sunset);

  // Create dawn time (30 minutes before sunrise)
  const dawnDate = new Date(sunriseDate);
  dawnDate.setMinutes(dawnDate.getMinutes() - 30);

  // Create dusk time (30 minutes after sunset)
  const duskDate = new Date(sunsetDate);
  duskDate.setMinutes(duskDate.getMinutes() + 30);

  return {
    dawn: dawnDate.toISOString(),
    sunrise: sunriseDate.toISOString(),
    sunset: sunsetDate.toISOString(),
    dusk: duskDate.toISOString(),
    dayLength: calculateDayLength(sunrise, sunset),
    nightLength: calculateNightLength(sunrise, sunset),
  };
}

export async function getWeatherData(lat: number, lon: number): Promise<WeatherData> {
  const [weather, airQuality] = await Promise.all([
    fetch(`${OPEN_METEO_BASE}/forecast?latitude=${lat}&longitude=${lon}&hourly=temperature_2m,precipitation_probability,precipitation,windspeed_10m,winddirection_10m,uv_index,visibility,relativehumidity_2m,pressure_msl,cloudcover&daily=temperature_2m_max,temperature_2m_min,sunrise,sunset&timezone=auto`).then(res => res.json()),
    fetch(`${AIR_QUALITY_BASE}/air-quality?latitude=${lat}&longitude=${lon}&hourly=us_aqi`).then(res => res.json()),
  ]);

  const location = await reverseGeocode(lat, lon);
  const currentDate = new Date();
  const currentHour = new Date(currentDate.setMinutes(0, 0, 0));
  const currentIndex = currentHour.getHours();

  const sunMoon = calculateSunMoonTimes(weather.daily.sunrise[0], weather.daily.sunset[0]);
  
  const hourlyData = weather.hourly.time
    .slice(currentIndex, currentIndex + 24)
    .map((time: string, i: number) => ({
      time: currentHour.getHours() + i,
      temp: Math.round(weather.hourly.temperature_2m[i + currentIndex]),
      condition: getWeatherEmoji(
        weather.hourly.precipitation[i + currentIndex],
        weather.hourly.temperature_2m[i + currentIndex],
        time,
        weather.hourly.cloudcover[i + currentIndex],
        sunMoon,
        false,
        weather.hourly.precipitation_probability[i + currentIndex]
      ),
      precip: Math.round(weather.hourly.precipitation_probability[i + currentIndex]),
      precipAmt: weather.hourly.precipitation[i + currentIndex].toFixed(2),
      wind: Math.round(weather.hourly.windspeed_10m[i + currentIndex] * 0.621371),
      windDir: getWindDirection(weather.hourly.winddirection_10m[i + currentIndex]),
      uv: Math.round(weather.hourly.uv_index[i + currentIndex]),
      aqi: airQuality.hourly.us_aqi[i + currentIndex],
      visibility: Math.round(weather.hourly.visibility[i + currentIndex] * 0.000621371),
      humidity: Math.round(weather.hourly.relativehumidity_2m[i + currentIndex]),
      pressure: Math.round(weather.hourly.pressure_msl[i + currentIndex]),
    }));

  const dailyData = weather.daily.time.map((time: string, i: number) => {
    const dailySunMoon = calculateSunMoonTimes(weather.daily.sunrise[i], weather.daily.sunset[i]);
    
    // Get all hours for this day (24 hours starting at index i * 24)
    const dayStart = i * 24;
    const dayEnd = dayStart + 24;
    
    // Calculate maximum values for the day
    const maxPrecipProb = Math.max(...weather.hourly.precipitation_probability.slice(dayStart, dayEnd));
    const maxPrecip = Math.max(...weather.hourly.precipitation.slice(dayStart, dayEnd));
    const avgCloudcover = weather.hourly.cloudcover
      .slice(dayStart, dayEnd)
      .reduce((sum: number, val: number) => sum + val, 0) / 24;

    // Add one day to the date to align with the data
    const date = new Date(time);
    date.setDate(date.getDate() + 1);

    return {
      date: date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'numeric',
        day: 'numeric'
      }),
      high: Math.round(weather.daily.temperature_2m_max[i]),
      low: Math.round(weather.daily.temperature_2m_min[i]),
      condition: getWeatherEmoji(
        maxPrecip,
        weather.hourly.temperature_2m[dayStart],
        time,
        avgCloudcover,
        dailySunMoon,
        true,
        maxPrecipProb
      ),
      precip: Math.round(maxPrecipProb),
      precipAmt: maxPrecip.toFixed(2),
      wind: Math.round(weather.hourly.windspeed_10m[dayStart] * 0.621371),
      windDir: getWindDirection(weather.hourly.winddirection_10m[dayStart]),
      uv: Math.round(weather.hourly.uv_index[dayStart]),
      aqi: airQuality.hourly.us_aqi[dayStart],
      visibility: Math.round(weather.hourly.visibility[dayStart] * 0.000621371),
      humidity: Math.round(weather.hourly.relativehumidity_2m[dayStart]),
      pressure: Math.round(weather.hourly.pressure_msl[dayStart]),
    };
  });

  return {
    location,
    current: hourlyData[currentIndex],
    hourly: hourlyData,
    daily: dailyData,
    sunMoon,
  };
}

export async function getRadarFrames(): Promise<RadarFrame[]> {
  const response = await fetch(RAINVIEWER_BASE);
  const data = await response.json() as RainViewerResponse;
  
  // Get past frames
  const pastFrames = data.radar.past.map((frame) => ({
    time: frame.time,
    path: frame.path,
  }));

  // Get future frames (nowcast)
  const futureFrames = data.radar.nowcast.map((frame) => ({
    time: frame.time,
    path: frame.path,
  }));

  // Combine and sort all frames
  const allFrames = [...pastFrames, ...futureFrames].sort((a, b) => a.time - b.time);
  
  // Find the middle frame (closest to current time)
  const now = Math.floor(Date.now() / 1000);
  const middleIndex = allFrames.findIndex(frame => frame.time >= now);
  
  // Take frames from 2 hours before to 2 hours after the middle frame
  const twoHoursInSeconds = 2 * 60 * 60;
  const middleTime = allFrames[middleIndex]?.time || now;
  
  return allFrames.filter(frame => 
    frame.time >= middleTime - twoHoursInSeconds && 
    frame.time <= middleTime + twoHoursInSeconds
  );
}

function getWeatherEmoji(
  precip: number, 
  temp: number, 
  time: string, 
  cloudcover: number,
  sunMoonTimes: { dawn: string; dusk: string },
  isDaily: boolean = false,
  precipProbability: number = 0
): string {
  let isNight = false;
  if (!isDaily) {
    const currentTime = new Date(time);
    const dawnTime = new Date(sunMoonTimes.dawn);
    const duskTime = new Date(sunMoonTimes.dusk);
    isNight = currentTime < dawnTime || currentTime > duskTime;
  }

  // Heavy precipitation (>= 1mm/h) or high probability of rain (>= 50%)
  if (precip >= 1 || precipProbability >= 50) {
    if (temp < 0) return '🌨️'; // Snow
    return precipProbability >= 70 ? '⛈️' : '🌧️'; // Heavy rain vs regular rain
  }

  // Light precipitation (>= 0.1mm/h) or moderate probability of rain (>= 30%)
  if (precip >= 0.1 || precipProbability >= 30) {
    if (temp < 0) return '🌨️'; // Light snow
    return '🌧️'; // Light rain
  }

  // Very cloudy (>= 80% cloud cover)
  if (cloudcover >= 80) {
    return '☁️'; // Cloudy (day or night)
  }

  // Partly cloudy (>= 30% cloud cover)
  if (cloudcover >= 30) {
    if (isNight) return '☁️'; // Cloudy night
    return '⛅'; // Partly cloudy day
  }

  // Clear conditions
  if (isNight) return '🌙'; // Clear night
  return '☀️'; // Clear day
}

function getWindDirection(degrees: number): string {
  const directions = ['⬆️', '↗️', '➡️', '↘️', '⬇️', '↙️', '⬅️', '↖️'];
  return directions[Math.round(degrees / 45) % 8];
}

function calculateDayLength(sunrise: string, sunset: string): string {
  const diff = new Date(sunset).getTime() - new Date(sunrise).getTime();
  const hours = Math.floor(diff / 3600000);
  const minutes = Math.floor((diff % 3600000) / 60000);
  return `${hours}h ${minutes}m`;
}

function calculateNightLength(sunrise: string, sunset: string): string {
  const dayMs = 24 * 60 * 60 * 1000;
  const dayLength = new Date(sunset).getTime() - new Date(sunrise).getTime();
  const nightLength = dayMs - dayLength;
  const hours = Math.floor(nightLength / 3600000);
  const minutes = Math.floor((nightLength % 3600000) / 60000);
  return `${hours}h ${minutes}m`;
} 