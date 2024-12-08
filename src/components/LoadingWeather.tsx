export default function LoadingWeather() {
  return (
    <div className="max-w-3xl mx-auto p-4 space-y-4 animate-pulse">
      <div className="flex items-center gap-2">
        <div className="flex-1 h-10 bg-gray-200 rounded" />
        <div className="w-6 h-6 bg-gray-200 rounded" />
      </div>

      <div className="space-y-4">
        {/* Hourly forecast skeleton */}
        <div className="flex overflow-x-auto py-2">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="min-w-48 p-2 border rounded shadow-sm mr-2 space-y-2"
            >
              <div className="h-4 bg-gray-200 rounded w-16" />
              <div className="grid grid-cols-2 gap-1">
                {Array.from({ length: 10 }).map((_, j) => (
                  <div key={j} className="h-3 bg-gray-200 rounded" />
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Daily forecast skeleton */}
        <div className="flex overflow-x-auto py-2">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="min-w-48 p-2 border rounded shadow-sm mr-2 space-y-2"
            >
              <div className="h-4 bg-gray-200 rounded w-24" />
              <div className="grid grid-cols-2 gap-1">
                {Array.from({ length: 10 }).map((_, j) => (
                  <div key={j} className="h-3 bg-gray-200 rounded" />
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Sun/Moon times skeleton */}
      <div className="grid grid-cols-2 gap-2">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="h-4 bg-gray-200 rounded w-32" />
        ))}
      </div>

      {/* Radar skeleton */}
      <div className="border rounded p-4 h-64 flex items-center justify-center">
        <div className="w-32 h-32 bg-gray-200 rounded-full" />
      </div>
    </div>
  );
} 