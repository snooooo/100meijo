import { Marker } from 'react-map-gl';
import { MapPin } from 'lucide-react';

interface DistilleryMarkerProps {
  latitude: number;
  longitude: number;
  visited: boolean;
  tastedCount: number;
  toursAvailable: boolean;
  onClick?: () => void;
}

export function DistilleryMarker({ latitude, longitude, visited, tastedCount, toursAvailable, onClick }: DistilleryMarkerProps) {
  return (
    <Marker latitude={latitude} longitude={longitude} onClick={onClick}>
      <div className="relative cursor-pointer group">
        <MapPin 
          className={`h-6 w-6 ${
            toursAvailable 
              ? 'text-green-600' 
              : 'text-gray-400'
          } transition-colors`}
          strokeWidth={2}
          fill={visited ? 'currentColor' : 'none'}
        />
        
        {tastedCount > 0 && (
          <div className="absolute -top-2 -right-2 bg-blue-500 text-white text-[10px] rounded-full w-4 h-4 flex items-center justify-center">
            {tastedCount}
          </div>
        )}

        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 bg-black bg-opacity-75 text-white text-xs rounded px-2 py-1 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
          {toursAvailable ? (
            <div className="flex items-center gap-2">
              <span>見学可</span>
              <span>•</span>
              <span>{visited ? '訪問済み' : '未訪問'}</span>
              <span>•</span>
              <span>{tastedCount}種試飲済み</span>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <span>見学不可</span>
              {tastedCount > 0 && (
                <>
                  <span>•</span>
                  <span>{tastedCount}種試飲済み</span>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </Marker>
  );
}