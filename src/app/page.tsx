import { Suspense } from 'react';
import { getWeatherData, getRadarFrames } from '@/lib/api';
import WeatherApp from '@/components/WeatherApp';
import LoadingWeather from '@/components/LoadingWeather';

const DEFAULT_LOCATION = {
  latitude: 30.2672,
  longitude: -97.7431,
};

export default async function Home() {
  const weatherData = await getWeatherData(
    DEFAULT_LOCATION.latitude,
    DEFAULT_LOCATION.longitude
  );
  const radarFrames = await getRadarFrames();

  return (
    <main className="min-h-screen bg-background">
      <Suspense fallback={<LoadingWeather />}>
        <WeatherApp
          initialWeatherData={weatherData}
          initialRadarFrames={radarFrames}
        />
      </Suspense>
    </main>
  );
}
