import React, { useState, useEffect, useRef } from 'react';
import { RadarFrame } from '@/types/weather';
import Image from 'next/image';

interface RadarTile {
  x: number;
  y: number;
}

interface RadarUrlResult {
  zoom: number;
  tiles: RadarTile[];
  url?: (x: number, y: number) => string;
}

interface RadarProps {
  radarFrames: RadarFrame[];
  getRadarUrl: (path?: string) => RadarUrlResult;
  formatRadarTime: (timestamp: number) => string;
}

const Radar = React.memo(({ radarFrames, getRadarUrl, formatRadarTime }: RadarProps) => {
  const [currentFrame, setCurrentFrame] = useState(0);
  const lastUpdateTime = useRef<number>(0);
  const animationFrame = useRef<number | undefined>(undefined);

  useEffect(() => {
    if (radarFrames.length === 0) {
      if (animationFrame.current) {
        cancelAnimationFrame(animationFrame.current);
      }
      return;
    }

    const animate = (timestamp: number) => {
      if (timestamp - lastUpdateTime.current >= 500) { // Update every 500ms
        setCurrentFrame(prev => (prev + 1) % radarFrames.length);
        lastUpdateTime.current = timestamp;
      }
      animationFrame.current = requestAnimationFrame(animate);
    };

    lastUpdateTime.current = performance.now();
    animationFrame.current = requestAnimationFrame(animate);

    return () => {
      if (animationFrame.current) {
        cancelAnimationFrame(animationFrame.current);
      }
    };
  }, [radarFrames.length]);

  return (
    <div className="border-border border rounded p-4">
      <div className="relative w-full aspect-square">
        {/* Base map tiles */}
        <div className="absolute inset-0 grid grid-cols-2 grid-rows-2">
          {getRadarUrl().tiles.map((tile: RadarTile, i: number) => (
            <Image
              key={`map-${i}`}
              src={`https://tile.openstreetmap.org/${getRadarUrl().zoom}/${tile.x}/${tile.y}.png`}
              alt={`Map tile ${i}`}
              className="w-full h-full object-cover"
              width={256}
              height={256}
              unoptimized
            />
          ))}
        </div>
        
        {/* Radar layers */}
        <div className="absolute inset-0">
          {radarFrames.length === 0 ? (
            <div className="h-full flex items-center justify-center">
              No radar data available
            </div>
          ) : (
            radarFrames.map((frame, frameIndex) => {
              const radarData = getRadarUrl(frame.path);
              return radarData.url ? (
                <div key={frameIndex} className="absolute inset-0 grid grid-cols-2 grid-rows-2">
                  {radarData.tiles.map((tile: RadarTile, tileIndex: number) => (
                    <Image
                      key={`radar-${frameIndex}-${tileIndex}`}
                      src={(radarData.url as (x: number, y: number) => string)(tile.x, tile.y)}
                      alt={`Radar frame ${frameIndex} tile ${tileIndex}`}
                      width={256}
                      height={256}
                      className={`w-full h-full object-cover transition-opacity duration-300 ${
                        frameIndex === currentFrame ? 'opacity-70' : 'opacity-0'
                      }`}
                      unoptimized
                      crossOrigin="anonymous"
                    />
                  ))}
                </div>
              ) : null;
            })
          )}
        </div>
        
        {/* Timestamp overlay */}
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2">
          <div className="px-3 py-1 bg-black/70 rounded-full text-sm text-white">
            {radarFrames.length > 0 ? formatRadarTime(radarFrames[currentFrame].time) : 'No data'}
          </div>
        </div>
      </div>
    </div>
  );
});

Radar.displayName = 'Radar';

export default Radar;
