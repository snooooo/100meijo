import { useState } from 'react';
import { ChevronDown, MapPin } from 'lucide-react';
import type { Distillery, Bottle } from '../types';

interface DistilleryListProps {
  distilleries: (Distillery & {
    bottles: Bottle[];
    tastedCount: number;
  })[];
  onDistilleryClick: (distillery: Distillery) => void;
}

export function DistilleryList({ distilleries, onDistilleryClick }: DistilleryListProps) {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  return (
    <div className="space-y-3 sm:space-y-4">
      {distilleries.map((distillery) => (
        <button
          key={distillery.id}
          onClick={() => onDistilleryClick(distillery)}
          className="w-full text-left bg-white rounded-lg shadow hover:shadow-md transition-shadow"
        >
          <div className="p-3 sm:p-4">
            <div className="flex items-center justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <h3 className="text-base sm:text-lg font-semibold">{distillery.name}</h3>
                  <div className="flex items-center gap-1.5">
                    <span className={`text-[10px] sm:text-xs px-1.5 py-0.5 rounded-full font-medium ${
                      distillery.tours_available 
                        ? 'bg-green-100 text-green-700'
                        : 'bg-red-100 text-red-700'
                    }`}>
                      {distillery.tours_available ? '見学可' : '見学不可'}
                    </span>
                    {distillery.userVisit && (
                      <span className="text-[10px] sm:text-xs px-1.5 py-0.5 rounded-full font-medium bg-blue-100 text-blue-700">
                        訪問済み
                      </span>
                    )}
                  </div>
                </div>
                <p className="text-xs sm:text-sm text-gray-600">
                  試飲済みボトル数: {distillery.tastedCount}
                </p>
              </div>
              <span className="text-xs sm:text-sm text-blue-500">
                詳細を見る
              </span>
            </div>
          </div>
        </button>
      ))}
    </div>
  );
}