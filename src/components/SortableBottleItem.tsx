import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical } from 'lucide-react';
import type { Bottle } from '../types';

interface SortableBottleItemProps {
  bottle: Bottle;
  loading: boolean;
  onStatusUpdate: (bottleId: string, isTasted: boolean, isOwned: boolean) => void;
}

export function SortableBottleItem({ bottle, loading, onStatusUpdate }: SortableBottleItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: bottle.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 2 : 1,
  };

  const isTasted = bottle.status === 'tasted' || bottle.status === 'owned_and_tasted';
  const isOwned = bottle.status === 'owned' || bottle.status === 'owned_and_tasted';

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`bg-white p-3 sm:p-4 rounded-lg shadow ${
        isDragging ? 'shadow-lg ring-2 ring-blue-500 ring-opacity-50' : ''
      }`}
    >
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
        <div className="flex items-center gap-2 sm:gap-3">
          <button
            type="button"
            className="touch-none p-1 text-gray-400 hover:text-gray-600 cursor-grab active:cursor-grabbing"
            {...attributes}
            {...listeners}
          >
            <GripVertical className="h-4 sm:h-5 w-4 sm:w-5" />
          </button>
          <h4 className="text-sm sm:text-base font-semibold">
            {bottle.name} {bottle.age_statement && `(${bottle.age_statement})`}
          </h4>
        </div>
        <div className="flex flex-wrap sm:flex-nowrap gap-2 sm:gap-4">
          <button
            disabled={loading}
            onClick={() => onStatusUpdate(bottle.id, !isTasted, isOwned)}
            className={`flex-1 sm:flex-none flex items-center px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg text-sm transition-all duration-200 ${
              isTasted
                ? 'bg-blue-500 text-white font-medium shadow-md hover:bg-blue-600'
                : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
            }`}
          >
            <span className="relative flex h-2.5 sm:h-3 w-2.5 sm:w-3 mr-1.5 sm:mr-2">
              {isTasted && (
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-blue-400 opacity-75"></span>
              )}
              <span className={`relative inline-flex rounded-full h-2.5 sm:h-3 w-2.5 sm:w-3 ${
                isTasted ? 'bg-blue-500' : 'bg-gray-300'
              }`}></span>
            </span>
            試飲済
          </button>

          <button
            disabled={loading}
            onClick={() => onStatusUpdate(bottle.id, isTasted, !isOwned)}
            className={`flex-1 sm:flex-none flex items-center px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg text-sm transition-all duration-200 ${
              isOwned
                ? 'bg-green-500 text-white font-medium shadow-md hover:bg-green-600'
                : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
            }`}
          >
            <span className="relative flex h-2.5 sm:h-3 w-2.5 sm:w-3 mr-1.5 sm:mr-2">
              {isOwned && (
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-400 opacity-75"></span>
              )}
              <span className={`relative inline-flex rounded-full h-2.5 sm:h-3 w-2.5 sm:w-3 ${
                isOwned ? 'bg-green-500' : 'bg-gray-300'
              }`}></span>
            </span>
            所有
          </button>
        </div>
      </div>
    </div>
  );
}