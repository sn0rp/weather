# Weather

A comprehensive weather PWA built with Next.js, TypeScript, and Tailwind. The app provides real-time weather data, forecasts, and radar imagery using free, reliable APIs.

## Features

- Progressive Web App with offline support
- Automatic geolocation detection
- Location search with OpenStreetMap's Nominatim API
- Real-time weather data from OpenMeteo
- Hourly and daily forecasts
- Comprehensive weather metrics (temperature, precipitation, wind, UV, AQI, etc.)
- Sun and moon times
- Interactive weather radar using RainViewer API
- Smooth carousel navigation
- Responsive design
- Server-side rendering for optimal performance

## Installation & Operation

```bash
git clone https://github.com/sn0rp/weather
cd weather
pnpm install
pnpm dev       # pnpm build, pnpm start for production
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## API Integration

The app uses the following free APIs:

- OpenMeteo Weather API (https://api.open-meteo.com/v1/forecast)
- OpenMeteo Air Quality API (https://air-quality-api.open-meteo.com/v1/air-quality)
- RainViewer API (https://www.rainviewer.com/api.html)
- Nominatim API (https://nominatim.org/release-docs/latest/api/Overview/)

No API keys are required for these services.