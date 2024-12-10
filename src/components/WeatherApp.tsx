'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Search } from 'lucide-react';
import { WeatherData, RadarFrame, Location, HourlyForecast, DailyForecast } from '@/types/weather';
import { searchLocation, getWeatherData } from '@/lib/api';
import Settings from './Settings';
import { convertTemperature, convertPressure, formatTime } from '@/lib/utils';
import Radar from './Radar';
import Image from 'next/image';
import LoadingWeather from '@/components/LoadingWeather';

interface WeatherAppProps {
  initialRadarFrames: RadarFrame[];
}

const useDebounce = <T,>(value: T, delay: number): T => {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
};

export default function WeatherApp({ initialRadarFrames }: WeatherAppProps) {
  const [weatherData, setWeatherData] = useState<WeatherData | null>(null);
  const [radarFrames, setRadarFrames] = useState(initialRadarFrames);
  const [location, setLocation] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<Location[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [theme, setTheme] = useState<'light' | 'dark' | 'system'>('system');
  const [units, setUnits] = useState<{
    temperature: 'C' | 'F';
    time: '12' | '24';
    pressure: 'mb' | 'inHg';
  }>({
    temperature: 'C',
    time: '24',
    pressure: 'mb'
  });

  const debouncedLocation = useDebounce(location, 300);
  const debouncedQuery = useDebounce(searchQuery, 300);

  useEffect(() => {
    const getInitialLocation = async () => {
      try {
        if (navigator.geolocation) {
          const position = await new Promise<GeolocationPosition>((resolve, reject) => {
            navigator.geolocation.getCurrentPosition(resolve, () => {
              // Silently handle the error and reject
              reject(new Error('Location access unavailable'));
            }, {
              timeout: 5000,
              maximumAge: 0
            });
          });

          const data = await getWeatherData(
            position.coords.latitude,
            position.coords.longitude
          );
          setWeatherData(data);
          setLocation(data.location.name);
        } else {
          // Silently fall back to Austin
          throw new Error('Geolocation not supported');
        }
      } catch {
        // Default to Austin without showing error messages
        const data = await getWeatherData(30.2672, -97.7431);
        setWeatherData(data);
        setLocation(data.location.name);
      } finally {
        setIsLoading(false);
      }
    };

    getInitialLocation();
  }, []);

  useEffect(() => {
    if (debouncedLocation.length > 2) {
      setSearchQuery(debouncedLocation);
    }
  }, [debouncedLocation]);

  useEffect(() => {
    const applyTheme = () => {
      document.documentElement.classList.remove('light', 'dark');
      
      if (theme === 'system') {
        const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
        document.documentElement.classList.add(systemTheme);
      } else {
        document.documentElement.classList.add(theme);
      }
    };

    applyTheme();

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = () => {
      if (theme === 'system') {
        applyTheme();
      }
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [theme]);

  useEffect(() => {
    localStorage.setItem('weather-theme', theme);
  }, [theme]);

  useEffect(() => {
    // Load saved units from localStorage
    const savedUnits = localStorage.getItem('weather-units');
    if (savedUnits) {
      setUnits(JSON.parse(savedUnits));
      return;
    }

    // Default to US units if we're in the US, metric otherwise
    const userLocale = navigator.language;
    const isUS = userLocale === 'en-US';
    setUnits({
      temperature: isUS ? 'F' : 'C',
      time: isUS ? '12' : '24',
      pressure: isUS ? 'inHg' : 'mb'
    });
  }, []);

  useEffect(() => {
    const checkAndReload = () => {
      const now = new Date();
      const minutes = now.getMinutes();
      const seconds = now.getSeconds();
      
      // Check if we're at a 10-minute interval (0, 10, 20, 30, 40, 50 minutes)
      if (minutes % 10 === 0 && seconds === 0) {
        window.location.reload();
      }
    };

    // Run the check every second
    const intervalId = setInterval(checkAndReload, 1000);

    return () => clearInterval(intervalId);
  }, []);

  useEffect(() => {
    let isCurrentSearch = true;

    const performSearch = async () => {
      if (debouncedQuery.length > 2 && debouncedQuery !== weatherData?.location.name) {
        setIsSearching(true);
        try {
          const results = await searchLocation(debouncedQuery);
          if (isCurrentSearch) {
            setSearchResults(results);
          }
        } catch (error) {
          console.error('Search failed:', error);
          if (isCurrentSearch) {
            setSearchResults([]);
          }
        } finally {
          if (isCurrentSearch) {
            setIsSearching(false);
          }
        }
      } else {
        setSearchResults([]);
        setIsSearching(false);
      }
    };

    performSearch();
    return () => {
      isCurrentSearch = false;
    };
  }, [debouncedQuery, weatherData?.location.name]);

  const handleSearchInput = (value: string) => {
    setSearchQuery(value);
    if (value.length <= 2) {
      setSearchResults([]);
    }
  };

  const handleSearchSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (location.length > 2) {
      try {
        setIsSearching(true);
        const results = await searchLocation(location);
        if (results.length > 0) {
          await selectLocation(results[0]);
        }
      } catch (error) {
        console.error('Search failed:', error);
      } finally {
        setIsSearching(false);
      }
    }
  };

  const selectLocation = async (loc: Location) => {
    setLocation(loc.name);
    setSearchResults([]);
    const data = await getWeatherData(loc.latitude, loc.longitude);
    setWeatherData(data);
  };

  const Card = React.memo(({ data, type }: { 
    data: HourlyForecast | DailyForecast; 
    type: 'hourly' | 'daily' 
  }) => {
    const temp = type === 'hourly' 
      ? convertTemperature((data as HourlyForecast).temp, units.temperature as 'C' | 'F')
      : `${convertTemperature((data as DailyForecast).high, units.temperature as 'C' | 'F')}°/${convertTemperature((data as DailyForecast).low, units.temperature as 'C' | 'F')}°`;

    const timeDisplay = type === 'hourly'
      ? new Date(new Date().setHours((data as HourlyForecast).time as number, 0, 0, 0)).toLocaleString('en-US', {
          hour: 'numeric',
          minute: '2-digit',
          hour12: units.time === '12',
          ...(((data as HourlyForecast).time as number) < new Date().getHours() && {
            month: 'short',
            day: 'numeric'
          })
        })
      : (data as DailyForecast).date;

    const pressure = convertPressure(data.pressure, units.pressure as 'mb' | 'inHg');
    const pressureUnit = units.pressure === 'mb' ? 'mb' : 'inHg';

    return (
      <div className="min-w-48 p-2 border-border border rounded shadow-sm mr-2 text-xs bg-background text-foreground">
        <div className="font-bold">{timeDisplay}</div>
        <div className="grid grid-cols-2 gap-1">
          <div>{type === 'hourly' ? `${temp}°` : temp}</div>
          <div>{data.condition}</div>
          <div>Rain: {data.precip}%</div>
          <div>{data.precipAmt}in</div>
          <div>{data.wind}mph {data.windDir}</div>
          <div>UV: {data.uv}</div>
          <div>AQI: {data.aqi}</div>
          <div>Vis: {data.visibility}mi</div>
          <div>Hum: {data.humidity}%</div>
          <div>{pressure}{pressureUnit}</div>
        </div>
      </div>
    );
  });

  Card.displayName = 'Card';

  const Carousel = React.memo(({ data, type }: { 
    data: (HourlyForecast | DailyForecast)[]; 
    type: 'hourly' | 'daily' 
  }) => {
    const scrollRef = useRef<HTMLDivElement>(null);
    const scrollPosRef = useRef(0);
    const [scrollPosition, setScrollPosition] = useState({
      isStart: true,
      isEnd: false
    });

    useEffect(() => {
      const scrollElement = scrollRef.current;
      if (!scrollElement) return;

      // Restore scroll position
      scrollElement.scrollLeft = scrollPosRef.current;

      const handleScroll = () => {
        if (scrollElement) {
          // Save current scroll position
          scrollPosRef.current = scrollElement.scrollLeft;
          
          const { scrollLeft, scrollWidth, clientWidth } = scrollElement;
          setScrollPosition({
            isStart: scrollLeft <= 0,
            isEnd: scrollLeft + clientWidth >= scrollWidth - 1
          });
        }
      };

      scrollElement.addEventListener('scroll', handleScroll);
      // Initial check
      handleScroll();

      return () => {
        scrollElement.removeEventListener('scroll', handleScroll);
      };
    }, []);

    const vignetteClass = scrollPosition.isStart
      ? scrollPosition.isEnd
        ? ''
        : 'vignette-right'
      : scrollPosition.isEnd
      ? 'vignette-left'
      : 'vignette-both';

    return (
      <div 
        ref={scrollRef}
        className={`flex overflow-x-auto no-scrollbar py-2 ${vignetteClass}`}
      >
        {data.map((item, i) => (
          <Card key={i} data={item} type={type} />
        ))}
      </div>
    );
  });

  Carousel.displayName = 'Carousel';

  useEffect(() => {
    const handleClickOutside = () => {
      setSearchResults([]);
    };

    document.addEventListener('click', handleClickOutside);
    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, []);

  const getRadarUrl = (path?: string) => {
    // Default to Austin coordinates if weather data is not available
    const lat = weatherData?.location.latitude ?? 30.2672;
    const lon = weatherData?.location.longitude ?? -97.7431;
    const zoom = 9;
    
    // Convert lat/lon to tile coordinates
    const latRad = lat * Math.PI / 180;
    const n = Math.pow(2, zoom);
    
    // Get exact tile coordinates
    const xtile = n * ((lon + 180) / 360);
    const ytile = n * (1 - Math.log(Math.tan(latRad) + 1 / Math.cos(latRad)) / Math.PI) / 2;
    
    // Get the base tile coordinates (floor to get valid tile numbers)
    const baseX = Math.floor(xtile);
    const baseY = Math.floor(ytile);
    
    // Calculate the offset within the tile (0 to 1)
    const xOffset = xtile - baseX;
    const yOffset = ytile - baseY;
    
    // Create a 2x2 grid that centers the location based on its position within the tile
    const tiles = [
      { x: baseX - (xOffset > 0.5 ? 0 : 1), y: baseY - (yOffset > 0.5 ? 0 : 1) },  // Top left
      { x: baseX + (xOffset > 0.5 ? 1 : 0), y: baseY - (yOffset > 0.5 ? 0 : 1) },  // Top right
      { x: baseX - (xOffset > 0.5 ? 0 : 1), y: baseY + (yOffset > 0.5 ? 1 : 0) },  // Bottom left
      { x: baseX + (xOffset > 0.5 ? 1 : 0), y: baseY + (yOffset > 0.5 ? 1 : 0) }   // Bottom right
    ];

    if (!path) {
      return { zoom, tiles };
    }
    
    return {
      zoom,
      tiles,
      url: (x: number, y: number) => 
        `https://tilecache.rainviewer.com${path}/256/${zoom}/${x}/${y}/2/1_1.png`
    };
  };

  const formatRadarTime = (timestamp: number) => {
    return new Date(timestamp * 1000).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: units.time === '12'
    });
  };

  useEffect(() => {
    const savedTheme = localStorage.getItem('weather-theme');
    if (savedTheme) {
      setTheme(savedTheme as 'light' | 'dark' | 'system');
    }
  }, []);

  useEffect(() => {
    const updateRadarFrames = async () => {
      try {
        const response = await fetch('/api/radar');
        const newFrames = await response.json();
        setRadarFrames(newFrames);
      } catch (error) {
        console.error('Failed to update radar frames:', error);
      }
    };

    // Update immediately on mount
    updateRadarFrames();

    // Then update every 5 minutes
    const interval = setInterval(updateRadarFrames, 5 * 60 * 1000);

    return () => clearInterval(interval);
  }, []);

  if (isLoading || !weatherData) {
    return <LoadingWeather />;
  }

  return (
    <div className="max-w-3xl mx-auto p-4 space-y-4 text-foreground bg-background">
      <div className="flex justify-between items-center">
        <div className="relative flex-1">
          <div className="relative">
            <form onSubmit={handleSearchSubmit} className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => handleSearchInput(e.target.value)}
                className="w-full p-2 pr-10 border-border border rounded bg-background text-foreground"
                placeholder="Enter location or zip code"
                onClick={(e) => e.stopPropagation()}
              />
              <button
                type="submit"
                className="absolute right-1 top-1/2 -translate-y-1/2 p-1.5 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                disabled={isSearching}
              >
                <Search className={`w-5 h-5 text-foreground ${isSearching ? 'animate-spin' : ''}`} />
              </button>
            </form>
            {searchResults.length > 0 && (
              <div 
                className="absolute w-full mt-1 bg-background border-border border rounded shadow-lg z-20 max-h-60 overflow-y-auto"
                onClick={(e) => e.stopPropagation()}
              >
                {searchResults.map((result, i) => (
                  <button
                    key={i}
                    className="w-full p-2 text-left hover:bg-gray-100 dark:hover:bg-gray-800 text-foreground"
                    onClick={() => selectLocation(result)}
                  >
                    <div className="font-medium">{result.name}</div>
                    <div className="text-sm text-gray-500">
                      {result.state && result.country ? `${result.state}, ${result.country}` : result.country}
                    </div>
                  </button>
                ))}
              </div>
            )}
            {isSearching && searchResults.length === 0 && (
              <div className="absolute w-full mt-1 bg-background border-border border rounded shadow-lg z-20 p-2 text-center text-foreground">
                Searching...
              </div>
            )}
          </div>
        </div>
        <Settings
          theme={theme}
          units={units}
          onThemeChange={setTheme}
          onUnitsChange={(key, value) => 
            setUnits(prev => ({ ...prev, [key]: value }))
          }
        />
      </div>

      <div className="space-y-4">
        <Carousel data={weatherData.hourly} type="hourly" />
        <Carousel data={weatherData.daily} type="daily" />
      </div>

      <div className="grid grid-cols-2 gap-2 text-sm">
        <div>Dawn: {formatTime(weatherData.sunMoon.dawn, units.time as '12' | '24')}</div>
        <div>Dusk: {formatTime(weatherData.sunMoon.dusk, units.time as '12' | '24')}</div>
        <div>Sunrise: {formatTime(weatherData.sunMoon.sunrise, units.time as '12' | '24')}</div>
        <div>Sunset: {formatTime(weatherData.sunMoon.sunset, units.time as '12' | '24')}</div>
        <div>Day Length: {weatherData.sunMoon.dayLength}</div>
        <div>Night Length: {weatherData.sunMoon.nightLength}</div>
      </div>

      <Radar 
        radarFrames={radarFrames}
        getRadarUrl={getRadarUrl}
        formatRadarTime={formatRadarTime}
      />

      <div className="flex items-center justify-center mt-4 text-sm">
        <span>Powered by </span>
        <a 
          href="https://snorp.dev" 
          target="_blank" 
          rel="noopener noreferrer"
          className="inline-flex items-center ml-1"
        >
          <Image 
            src="/snorpBadge.png" 
            alt="Snorp.dev" 
            width="80"
            height="15"
            className="w-20 h-[15px]"
          />
        </a>
      </div>
    </div>
  );
} 