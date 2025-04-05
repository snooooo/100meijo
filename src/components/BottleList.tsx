import { useState } from 'react';
import type { Bottle } from '../types';
import { supabase } from '../lib/supabase';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { SortableBottleItem } from './SortableBottleItem';

interface BottleListProps {
  bottles: Bottle[];
  onStatusChange: () => void;
}

export function BottleList({ bottles: initialBottles, onStatusChange }: BottleListProps) {
  const [loading, setLoading] = useState(false);
  const [bottles, setBottles] = useState(initialBottles);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(TouchSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const updateBottleStatus = async (bottleId: string, isTasted: boolean, isOwned: boolean) => {
    try {
      setLoading(true);
      
      let status: Bottle['status'] = 'not_tasted';
      if (isTasted && isOwned) status = 'owned_and_tasted';
      else if (isTasted) status = 'tasted';
      else if (isOwned) status = 'owned';

      const { error } = await supabase
        .from('bottles')
        .update({ 
          status,
          tasting_date: isTasted ? new Date().toISOString() : null
        })
        .eq('id', bottleId);

      if (error) throw error;

      // ローカルの状態を更新
      setBottles(currentBottles => 
        currentBottles.map(bottle => 
          bottle.id === bottleId 
            ? { ...bottle, status, tasting_date: isTasted ? new Date().toISOString() : null }
            : bottle
        )
      );

      onStatusChange();
    } catch (error) {
      console.error('ボトルのステータス更新に失敗しました:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      setBottles((items) => {
        const oldIndex = items.findIndex((item) => item.id === active.id);
        const newIndex = items.findIndex((item) => item.id === over.id);
        return arrayMove(items, oldIndex, newIndex);
      });
    }
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
    >
      <SortableContext
        items={bottles}
        strategy={verticalListSortingStrategy}
      >
        <div className="space-y-4">
          {bottles.map((bottle) => (
            <SortableBottleItem
              key={bottle.id}
              bottle={bottle}
              loading={loading}
              onStatusUpdate={updateBottleStatus}
            />
          ))}
        </div>
      </SortableContext>
    </DndContext>
  );
}