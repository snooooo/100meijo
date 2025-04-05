import * as Dialog from '@radix-ui/react-dialog';
import { X, MapPin } from 'lucide-react';
import { useState } from 'react';
import { supabase } from '../lib/supabase';
import type { Distillery, Bottle, UserVisit } from '../types';
import { BottleList } from './BottleList';

interface DistilleryModalProps {
  distillery: Distillery & { bottles: Bottle[]; userVisit?: UserVisit };
  isOpen: boolean;
  onClose: () => void;
  onBottleStatusChange: () => void;
}

export function DistilleryModal({ distillery, isOpen, onClose, onBottleStatusChange }: DistilleryModalProps) {
  const [isVisited, setIsVisited] = useState(!!distillery.userVisit);
  const [visitNotes, setVisitNotes] = useState(distillery.userVisit?.notes || '');
  const [visitDate, setVisitDate] = useState(
    distillery.userVisit?.visit_date || new Date().toISOString().split('T')[0]
  );
  const [isSaving, setIsSaving] = useState(false);

  const handleVisitToggle = async () => {
    try {
      setIsSaving(true);
      
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      if (isVisited) {
        // Delete visit record
        const { error } = await supabase
          .from('user_visits')
          .delete()
          .eq('distillery_id', distillery.id)
          .eq('user_id', user.id);
        
        if (error) throw error;
        setIsVisited(false);
        setVisitNotes('');
      } else {
        // Check if visit record already exists
        const { data: existingVisit } = await supabase
          .from('user_visits')
          .select('*')
          .eq('distillery_id', distillery.id)
          .eq('user_id', user.id)
          .single();

        if (existingVisit) {
          // Update existing visit
          await handleVisitUpdate();
          setIsVisited(true);
        } else {
          // Add new visit record
          const { error } = await supabase
            .from('user_visits')
            .insert({
              distillery_id: distillery.id,
              user_id: user.id,
              visit_date: visitDate,
              notes: visitNotes
            });
          
          if (error) throw error;
          setIsVisited(true);
        }
      }
    } catch (error) {
      console.error('Failed to update visit record:', error);
      alert('Failed to update visit record. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleVisitUpdate = async () => {
    try {
      setIsSaving(true);
      
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { error } = await supabase
        .from('user_visits')
        .update({
          visit_date: visitDate,
          notes: visitNotes
        })
        .eq('distillery_id', distillery.id)
        .eq('user_id', user.id);
      
      if (error) throw error;
    } catch (error) {
      console.error('Failed to update visit record:', error);
      alert('Failed to update visit record. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Dialog.Root open={isOpen} onOpenChange={onClose}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/50 backdrop-blur-sm" />
        <Dialog.Content className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white rounded-lg shadow-lg w-[95%] sm:w-full sm:max-w-lg max-h-[90vh] overflow-y-auto">
          <div className="p-4 sm:p-6">
            <div className="flex items-center justify-between mb-4">
              <Dialog.Title className="text-lg sm:text-xl font-semibold">
                {distillery.name}
              </Dialog.Title>
              <Dialog.Close asChild>
                <button className="text-gray-400 hover:text-gray-600">
                  <X className="h-5 w-5" />
                </button>
              </Dialog.Close>
            </div>
            
            <div className="mb-6 space-y-4">
              <p className="text-sm sm:text-base text-gray-600">{distillery.description}</p>
              
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <MapPin className={`h-5 w-5 mt-0.5 ${distillery.tours_available ? 'text-green-500' : 'text-red-500'}`} />
                  <div>
                    <h4 className="text-sm font-medium mb-1">
                      {distillery.tours_available ? 'Tours Available' : 'No Tours Available'}
                    </h4>
                    <p className="text-sm text-gray-600">{distillery.tour_info}</p>
                  </div>
                </div>
              </div>

              <div className="bg-gray-50 rounded-lg p-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-medium">Visit Record</h4>
                    <button
                      onClick={handleVisitToggle}
                      disabled={isSaving}
                      className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                        isVisited
                          ? 'bg-red-100 text-red-700 hover:bg-red-200'
                          : 'bg-green-100 text-green-700 hover:bg-green-200'
                      }`}
                    >
                      {isVisited ? 'Remove Visit' : 'Record Visit'}
                    </button>
                  </div>

                  {isVisited && (
                    <div className="space-y-3">
                      <div>
                        <label htmlFor="visitDate" className="block text-sm text-gray-600 mb-1">
                          Visit Date
                        </label>
                        <input
                          type="date"
                          id="visitDate"
                          value={visitDate}
                          onChange={(e) => setVisitDate(e.target.value)}
                          className="w-full rounded-md border-gray-300 shadow-sm text-sm"
                        />
                      </div>
                      <div>
                        <label htmlFor="visitNotes" className="block text-sm text-gray-600 mb-1">
                          Notes
                        </label>
                        <textarea
                          id="visitNotes"
                          value={visitNotes}
                          onChange={(e) => setVisitNotes(e.target.value)}
                          className="w-full rounded-md border-gray-300 shadow-sm text-sm"
                          rows={3}
                        />
                      </div>
                      <button
                        onClick={handleVisitUpdate}
                        disabled={isSaving}
                        className="w-full px-3 py-1.5 bg-blue-500 text-white rounded-md text-sm font-medium hover:bg-blue-600 transition-colors"
                      >
                        Update
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-base sm:text-lg font-semibold mb-3">Available Bottles</h3>
              <BottleList 
                bottles={distillery.bottles} 
                onStatusChange={onBottleStatusChange}
              />
            </div>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}