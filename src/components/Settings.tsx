import { Settings as SettingsIcon } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';

interface SettingsProps {
  theme: 'light' | 'dark' | 'system';
  units: {
    temperature: 'C' | 'F';
    time: '12' | '24';
    pressure: 'mb' | 'inHg';
  };
  onThemeChange: (theme: 'light' | 'dark' | 'system') => void;
  onUnitsChange: (
    key: 'temperature' | 'time' | 'pressure',
    value: 'C' | 'F' | '12' | '24' | 'mb' | 'inHg'
  ) => void;
}

export default function Settings({ theme, units, onThemeChange, onUnitsChange }: SettingsProps) {
  const [isOpen, setIsOpen] = useState(false);
  const settingsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (settingsRef.current && !settingsRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleThemeChange = (value: 'light' | 'dark' | 'system') => {
    onThemeChange(value);
    setIsOpen(false);
  };

  const handleUnitsChange = (
    key: 'temperature' | 'time' | 'pressure',
    value: 'C' | 'F' | '12' | '24' | 'mb' | 'inHg'
  ) => {
    onUnitsChange(key, value);
    setIsOpen(false);
  };

  return (
    <div className="relative" ref={settingsRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-800 transition-colors"
      >
        <SettingsIcon className="w-5 h-5" />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 bg-background border rounded-lg shadow-lg p-4 space-y-4 z-50">
          <div className="space-y-2">
            <label className="block text-sm font-medium">Theme</label>
            <select
              value={theme}
              onChange={(e) => handleThemeChange(e.target.value as 'light' | 'dark' | 'system')}
              className="w-full rounded border bg-background text-foreground"
            >
              <option value="system">System</option>
              <option value="light">Light</option>
              <option value="dark">Dark</option>
            </select>
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium">Temperature</label>
            <select
              value={units.temperature}
              onChange={(e) => handleUnitsChange('temperature', e.target.value as 'C' | 'F')}
              className="w-full rounded border bg-background text-foreground"
            >
              <option value="C">Celsius</option>
              <option value="F">Fahrenheit</option>
            </select>
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium">Time Format</label>
            <select
              value={units.time}
              onChange={(e) => handleUnitsChange('time', e.target.value as '12' | '24')}
              className="w-full rounded border bg-background text-foreground"
            >
              <option value="12">12-hour</option>
              <option value="24">24-hour</option>
            </select>
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium">Pressure</label>
            <select
              value={units.pressure}
              onChange={(e) => handleUnitsChange('pressure', e.target.value as 'mb' | 'inHg')}
              className="w-full rounded border bg-background text-foreground"
            >
              <option value="mb">Millibars</option>
              <option value="inHg">Inches Hg</option>
            </select>
          </div>
        </div>
      )}
    </div>
  );
}
