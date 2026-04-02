import { useEffect, useRef, useState } from 'react';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';

interface Props {
  latitude: number;
  longitude: number;
  onLocationChange: (lat: number, lon: number) => void;
}

export default function InteractiveMap({ latitude, longitude, onLocationChange }: Props) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<maplibregl.Map | null>(null);
  const marker = useRef<maplibregl.Marker | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [searching, setSearching] = useState(false);
  const lastSearchTime = useRef(0);

  useEffect(() => {
    if (!mapContainer.current || map.current) return;

    map.current = new maplibregl.Map({
      container: mapContainer.current,
      // Free OpenStreetMap raster tiles — no API key needed
      style: {
        version: 8,
        sources: {
          osm: {
            type: 'raster',
            tiles: ['https://tile.openstreetmap.org/{z}/{x}/{y}.png'],
            tileSize: 256,
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
          },
        },
        layers: [
          {
            id: 'osm',
            type: 'raster',
            source: 'osm',
          },
        ],
      },
      center: [longitude, latitude],
      zoom: 4,
    });

    map.current.addControl(new maplibregl.NavigationControl(), 'top-right');

    // Add draggable marker
    marker.current = new maplibregl.Marker({ color: '#f59e0b', draggable: true })
      .setLngLat([longitude, latitude])
      .addTo(map.current);

    marker.current.on('dragend', () => {
      const lngLat = marker.current!.getLngLat();
      onLocationChange(lngLat.lat, lngLat.lng);
    });

    // Click to move marker
    map.current.on('click', (e) => {
      marker.current!.setLngLat(e.lngLat);
      onLocationChange(e.lngLat.lat, e.lngLat.lng);
    });

    return () => {
      map.current?.remove();
      map.current = null;
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Update marker when props change (e.g., from search)
  useEffect(() => {
    if (marker.current) {
      marker.current.setLngLat([longitude, latitude]);
    }
    if (map.current) {
      map.current.flyTo({ center: [longitude, latitude], zoom: 6, duration: 1000 });
    }
  }, [latitude, longitude]);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    const query = searchQuery.trim().slice(0, 200);
    if (!query) return;

    // Rate limit: 1 request per second (Nominatim usage policy)
    const now = Date.now();
    if (now - lastSearchTime.current < 1000) return;
    lastSearchTime.current = now;

    setSearching(true);
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&limit=1`,
        { headers: { 'User-Agent': 'VitaminDCalculator/1.0' } }
      );
      if (!res.ok) return;
      const data = await res.json();
      if (Array.isArray(data) && data.length > 0) {
        const lat = parseFloat(data[0].lat);
        const lon = parseFloat(data[0].lon);
        if (!isNaN(lat) && !isNaN(lon)) {
          onLocationChange(lat, lon);
        }
      }
    } catch {
      // Silently fail — user can click map instead
    } finally {
      setSearching(false);
    }
  };

  return (
    <div className="relative rounded-2xl overflow-hidden border border-gray-200 shadow-sm">
      {/* Search bar overlay */}
      <form
        onSubmit={handleSearch}
        className="absolute top-3 left-3 z-10 flex gap-2"
      >
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search location..."
          maxLength={200}
          className="px-4 py-2 bg-white/95 backdrop-blur-sm rounded-lg shadow-md border border-gray-200 text-sm w-64 focus:outline-none focus:ring-2 focus:ring-sunshine-400"
        />
        <button
          type="submit"
          disabled={searching}
          className="px-4 py-2 bg-sunshine-500 text-white rounded-lg shadow-md text-sm font-medium hover:bg-sunshine-600 transition-colors disabled:opacity-50 cursor-pointer"
        >
          {searching ? '...' : 'Search'}
        </button>
      </form>

      {/* Coordinates overlay */}
      <div className="absolute bottom-3 left-3 z-10 bg-white/90 backdrop-blur-sm rounded-lg px-3 py-1.5 text-xs text-gray-600 shadow-sm">
        {latitude.toFixed(4)}°N, {longitude.toFixed(4)}°E
      </div>

      <div ref={mapContainer} className="w-full h-[400px]" />
    </div>
  );
}
