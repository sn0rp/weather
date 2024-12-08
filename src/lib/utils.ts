export function convertTemperature(temp: number, unit: 'C' | 'F'): number {
  if (unit === 'F') {
    return Math.round((temp * 9/5) + 32);
  }
  return temp;
}

export function convertPressure(pressure: number, unit: 'mb' | 'inHg'): string {
  if (unit === 'inHg') {
    return (pressure / 33.86389).toFixed(2);
  }
  return pressure.toString();
}

export function formatTime(time: number | string | Date, format: '12' | '24'): string {
  let date: Date;
  
  if (typeof time === 'number') {
    // Handle hour number (0-23)
    date = new Date();
    date.setHours(time, 0, 0, 0);
  } else if (time instanceof Date) {
    date = time;
  } else if (typeof time === 'string') {
    // Parse ISO string
    date = new Date(time);
  } else {
    return 'Invalid Date';
  }

  if (isNaN(date.getTime())) {
    return 'Invalid Date';
  }

  return date.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: format === '12',
  });
}
