import { useEffect, useState } from 'react';
import Map, { NavigationControl } from 'react-map-gl';
import * as Tabs from '@radix-ui/react-tabs';
import { supabase } from './lib/supabase';
import { DistilleryMarker } from './components/DistilleryMarker';
import { DistilleryList } from './components/DistilleryList';
import { DistilleryModal } from './components/DistilleryModal';
import type { Distillery, Bottle, UserVisit } from './types';
import 'mapbox-gl/dist/mapbox-gl.css';

const INITIAL_VIEW_STATE = {
  latitude: 36.2048,
  longitude: 138.2529,
  zoom: 5,
};

function App() {
  const [viewState, setViewState] = useState(INITIAL_VIEW_STATE);
  const [distilleries, setDistilleries] = useState<(Distillery & {
    bottles: Bottle[];
    tastedCount: number;
    userVisit?: UserVisit;
  })[]>([]);
  const [selectedDistillery, setSelectedDistillery] = useState<Distillery | null>(null);
  const [mapLoaded, setMapLoaded] = useState(false);

  const fetchDistilleries = async () => {
    try {
      const { data: distilleriesData, error: distilleriesError } = await supabase
        .from('distilleries')
        .select(`
          *,
          bottles(*),
          user_visits(*)
        `);

      if (distilleriesError) throw distilleriesError;

      const distilleriesWithCounts = distilleriesData.map((distillery: any) => ({
        ...distillery,
        tastedCount: distillery.bottles.filter((b: Bottle) => 
          b.status === 'tasted' || b.status === 'owned' || b.status === 'owned_and_tasted'
        ).length,
        userVisit: distillery.user_visits[0]
      }));

      setDistilleries(distilleriesWithCounts);
    } catch (error) {
      console.error('蒸留所データの取得に失敗しました:', error);
    }
  };

  useEffect(() => {
    fetchDistilleries();
  }, []);

  const mapboxToken = import.meta.env.VITE_MAPBOX_ACCESS_TOKEN;

  if (!mapboxToken) {
    return <div className="p-4">エラー: Mapboxアクセストークンが見つかりません</div>;
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <Tabs.Root defaultValue="map" className="h-screen flex flex-col">
        <Tabs.List className="bg-white border-b border-gray-200 px-4">
          <div className="max-w-7xl mx-auto flex">
            <Tabs.Trigger
              value="map"
              className="px-4 py-3 text-sm font-medium text-gray-500 hover:text-gray-700 border-b-2 border-transparent data-[state=active]:border-blue-500 data-[state=active]:text-blue-600"
            >
              地図表示
            </Tabs.Trigger>
            <Tabs.Trigger
              value="list"
              className="px-4 py-3 text-sm font-medium text-gray-500 hover:text-gray-700 border-b-2 border-transparent data-[state=active]:border-blue-500 data-[state=active]:text-blue-600"
            >
              一覧表示
            </Tabs.Trigger>
          </div>
        </Tabs.List>

        <Tabs.Content value="map" className="flex-1">
          <Map
            {...viewState}
            onMove={evt => setViewState(evt.viewState)}
            mapboxAccessToken={mapboxToken}
            mapStyle="mapbox://styles/mapbox/streets-v12"
            style={{ width: '100%', height: '100%' }}
            reuseMaps
            trackResize={false}
            cooperativeGestures={true}
            attributionControl={false}
            onLoad={() => setMapLoaded(true)}
            crossSourceCollisions={false}
            collectResourceTiming={false}
            transformRequest={(url, resourceType) => {
              if (resourceType === 'Source' || resourceType === 'Style' || resourceType === 'Tile') {
                return {
                  url,
                  headers: {
                    'Referrer-Policy': 'no-referrer-when-downgrade'
                  }
                };
              }
            }}
          >
            <NavigationControl />
            {mapLoaded && distilleries.map((distillery) => (
              <DistilleryMarker
                key={distillery.id}
                latitude={distillery.latitude}
                longitude={distillery.longitude}
                visited={!!distillery.userVisit}
                tastedCount={distillery.tastedCount}
                toursAvailable={distillery.tours_available}
                onClick={() => setSelectedDistillery(distillery)}
              />
            ))}
          </Map>
        </Tabs.Content>

        <Tabs.Content value="list" className="flex-1 overflow-auto p-4">
          <div className="max-w-3xl mx-auto">
            <DistilleryList
              distilleries={distilleries}
              onDistilleryClick={setSelectedDistillery}
            />
          </div>
        </Tabs.Content>
      </Tabs.Root>

      {selectedDistillery && (
        <DistilleryModal
          distillery={distilleries.find(d => d.id === selectedDistillery.id)!}
          isOpen={!!selectedDistillery}
          onClose={() => setSelectedDistillery(null)}
          onBottleStatusChange={fetchDistilleries}
        />
      )}
    </div>
  );
}

export default App;