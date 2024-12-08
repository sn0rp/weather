import { Suspense } from 'react';
import { getRadarFrames } from '@/lib/api';
import WeatherApp from '@/components/WeatherApp';
import LoadingWeather from '@/components/LoadingWeather';

export default async function Home() {
  const radarFrames = await getRadarFrames();

  return (
    <main className="min-h-screen bg-background">
      <Suspense fallback={<LoadingWeather />}>
        <WeatherApp
          initialRadarFrames={radarFrames}
        />
      </Suspense>
    </main>
  );
}
