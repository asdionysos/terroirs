import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/supabaseClient';
import { MapContainer, TileLayer, Circle, Marker, Popup, Tooltip } from 'react-leaflet';
import L from 'leaflet';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const farmingColors = {
  biodynamie: '#16a34a',
  biologique: '#22c55e',
  nature: '#84cc16',
  raisonne: '#f59e0b',
  conventionnel: '#6b7280',
};

const REGION_COLORS = ['#8B2252','#1a6b3c','#b5830a','#1e4d8c','#7b3f00'];

export default function Carte() {
  const { data: domains = [] } = useQuery({
    queryKey: ['domains'],
    queryFn: () => base44.entities.Domain.list('-created_at', 300),
  });

  const { data: regions = [] } = useQuery({
    queryKey: ['regions'],
    queryFn: () => base44.entities.Region.list(),
  });

  const domainsWithCoords = domains.filter(d => d.latitude && d.longitude);
  const regionsWithCoords = regions.filter(r => r.latitude && r.longitude);

  return (
    <div style={{ position: 'absolute', top: '64px', left: 0, right: 0, bottom: 0 }}>
      <MapContainer
        center={[46.5, 2.5]}
        zoom={6}
        style={{ width: '100%', height: '100%' }}
      >
        <TileLayer
          attribution='&copy; OpenStreetMap'
          url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
        />
        {regionsWithCoords.map((region, idx) => (
          <Circle
            key={region.id}
            center={[region.latitude, region.longitude]}
            radius={60000}
            pathOptions={{
              color: region.color_hex || REGION_COLORS[idx % REGION_COLORS.length],
              fillColor: region.color_hex || REGION_COLORS[idx % REGION_COLORS.length],
              fillOpacity: 0.12,
              weight: 2,
            }}
          >
            <Tooltip>{region.name}</Tooltip>
          </Circle>
        ))}
        {domainsWithCoords.map((domain) => {
          const color = farmingColors[domain.farming_method] || '#7c2d3e';
          const icon = L.divIcon({
            className: '',
            html: `<div style="width:26px;height:26px;border-radius:50%;background:${color};display:flex;align-items:center;justify-content:center;color:white;font-size:12px;box-shadow:0 2px 6px rgba(0,0,0,0.3);border:2px solid white;">🍷</div>`,
            iconSize: [26, 26],
            iconAnchor: [13, 26],
            popupAnchor: [0, -28],
          });
          return (
            <Marker key={domain.id} position={[domain.latitude, domain.longitude]} icon={icon}>
              <Popup>
                <b>{domain.name}</b><br />
                {domain.farming_method}<br />
                {domain.area_hectares && `${domain.area_hectares} ha`}
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>
    </div>
  );
}
