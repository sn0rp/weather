# Weather

A comprehensive weather Progressive Web App built with Next.js 14, TypeScript, and Tailwind CSS. The app provides real-time weather data, forecasts, and radar imagery using free, reliable APIs.

## Features

- 📱 Progressive Web App with offline support
- 🌍 Automatic geolocation detection
- 🔍 Location search with OpenStreetMap's Nominatim API
- ⛅ Real-time weather data from OpenMeteo
- 📊 Hourly and daily forecasts
- 🌡️ Comprehensive weather metrics (temperature, precipitation, wind, UV, AQI, etc.)
- 🌅 Sun and moon times
- 🗺️ Interactive weather radar using RainViewer API
- 💨 Smooth carousel navigation
- 📱 Responsive design
- ⚡ Server-side rendering for optimal performance

## Prerequisites

- Node.js 18.17 or later
- pnpm (recommended) or npm

## Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/weather-pwa.git
   cd weather-pwa
   ```

2. Install dependencies:
   ```bash
   pnpm install
   ```

3. Create required directories and files:
   ```bash
   mkdir -p public/icons
   ```

4. Add PWA icons to the `public/icons` directory:
   - `icon-192x192.png` (192x192 pixels)
   - `icon-512x512.png` (512x512 pixels)
   - `apple-touch-icon.png` (180x180 pixels)

## Development

Run the development server:

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Building for Production

1. Build the application:
   ```bash
   pnpm build
   ```

2. Start the production server:
   ```bash
   pnpm start
   ```

## API Integration

The app uses the following free APIs:

- OpenMeteo Weather API (https://api.open-meteo.com/v1/forecast)
- OpenMeteo Air Quality API (https://air-quality-api.open-meteo.com/v1/air-quality)
- RainViewer API (https://www.rainviewer.com/api.html)
- Nominatim API (https://nominatim.org/release-docs/latest/api/Overview/)

No API keys are required for these services.

## PWA Features

- Offline support with service worker
- Add to home screen capability
- Background updates
- Push notifications for severe weather (configurable)
- Responsive design for all devices

## Project Structure

```
weather-pwa/
├── src/
│   ├── app/
│   │   ├── layout.tsx
│   │   ├── page.tsx
│   │   └── globals.css
│   ├── components/
│   │   ├── WeatherApp.tsx
│   │   └── LoadingWeather.tsx
│   ├── lib/
│   │   └── api.ts
│   └── types/
│       └── weather.ts
├── public/
│   ├── icons/
│   │   ├── icon-192x192.png
│   │   ├── icon-512x512.png
│   │   └── apple-touch-icon.png
│   ├── manifest.json
│   ├── sw.js
│   └── offline.html
└── package.json
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.
