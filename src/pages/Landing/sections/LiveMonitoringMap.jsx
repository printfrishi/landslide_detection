import { useRef, useState } from 'react';
import {
  Crosshair,
  Maximize2,
} from 'lucide-react';
import {
  MapContainer,
  TileLayer,
  Polygon,
  Polyline,
  CircleMarker,
  Marker,
  Popup,
  Tooltip,
  LayersControl,
  LayerGroup,
  ScaleControl,
} from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import SectionHeading from './SectionHeading';
import { NETWORK_STATS } from './DemoData';
import useNow from './useNow';
import { useToast } from '../../../context/ToastContext';

/**
 * Approximate demo boundaries for the five monitored districts. Geometry is
 * illustrative — not official survey data.
 */
const DISTRICT_ZONES = [
  {
    name: 'Uttarkashi',
    risk: 'WATCH',
    riskLabel: 'WATCH',
    alerts: '01',
    position: [30.55, 78.55],
    polygon: [[30.98, 77.95], [31.02, 78.85], [30.62, 79.0], [30.38, 78.4], [30.55, 77.75]],
  },
  {
    name: 'Chamoli',
    risk: 'WATCH',
    riskLabel: 'WATCH',
    alerts: '01',
    position: [30.45, 79.55],
    polygon: [[31.05, 79.35], [30.85, 80.05], [30.25, 79.95], [30.02, 79.25], [30.62, 79.02]],
  },
  {
    name: 'Rudraprayag',
    risk: 'HIGH',
    riskLabel: 'HIGH',
    alerts: '03',
    position: [30.25, 79.05],
    polygon: [[30.62, 78.98], [30.48, 79.5], [30.02, 79.44], [29.98, 78.92], [30.35, 78.72]],
  },
  {
    name: 'Tehri Garhwal',
    risk: 'MODERATE',
    riskLabel: 'MODERATE',
    alerts: '02',
    position: [30.05, 78.55],
    polygon: [[30.5, 78.42], [30.32, 79.0], [29.86, 78.9], [29.72, 78.2], [30.22, 77.98]],
  },
  {
    name: 'Pauri Garhwal',
    risk: 'LOW',
    riskLabel: 'LOW',
    alerts: '00',
    position: [29.85, 79.0],
    polygon: [[30.12, 79.18], [30.0, 79.45], [29.5, 79.2], [29.48, 78.42], [29.9, 78.3]],
  },
];

const ZONE_STYLE = {
  LOW: { color: '#059669', fillColor: '#10b981' },
  WATCH: { color: '#d97706', fillColor: '#fbbf24' },
  MODERATE: { color: '#d97706', fillColor: '#fbbf24' },
  HIGH: { color: '#ea580c', fillColor: '#f97316' },
  CRITICAL: { color: '#dc2626', fillColor: '#dc2626' },
};

const STATIONS = [
  { name: 'Rain Gauge — Uttarkashi', zone: 'Zone C belt', position: [30.75, 78.5] },
  { name: 'Soil Probe — Chamoli ridge', zone: 'Chamoli', position: [30.9, 79.2] },
  { name: 'Extensometer — Rudraprayag cliff', zone: 'Zone B belt', position: [30.42, 79.3] },
  { name: 'Tiltmeter — NH-07 cutting', zone: 'Rudraprayag', position: [30.25, 79.02] },
  { name: 'Piezometer — Tehri valley', zone: 'Zone A belt', position: [30.1, 78.6] },
  { name: 'Rain Gauge — Pauri east', zone: 'Pauri Garhwal', position: [29.85, 79.0] },
  { name: 'Weather Node — Tehri dam approach', zone: 'Tehri Garhwal', position: [30.3, 78.35] },
  { name: 'Geophone — Pauri south', zone: 'Pauri Garhwal', position: [29.7, 78.5] },
];

const ROADS = [
  { name: 'NH-07 (Rudraprayag stretch — caution)', positions: [[30.4, 78.92], [30.28, 79.02], [30.1, 79.15], [29.92, 79.3]] },
  { name: 'NH-34 (Uttarkashi section)', positions: [[30.6, 78.12], [30.3, 78.35], [29.95, 78.5]] },
];

const RIVERS = [
  { name: 'Alaknanda (sample course)', positions: [[31.0, 79.6], [30.5, 79.4], [30.0, 79.2], [29.6, 78.9]] },
  { name: 'Bhagirathi (sample course)', positions: [[30.9, 78.6], [30.4, 78.5], [29.9, 78.55]] },
];

const INCIDENT = { name: 'Active incident — NH-07 slope movement', position: [30.22, 79.0] };

const INCIDENT_ICON = L.divIcon({
  className: '',
  html: '<span style="display:inline-flex;width:18px;height:18px;position:relative;"><span style="position:absolute;inset:0;border-radius:9999px;background:#dc2626;opacity:.55;animation:ping 1.2s cubic-bezier(0,0,.2,1) infinite;"></span><span style="position:relative;display:inline-block;width:18px;height:18px;border-radius:9999px;background:#dc2626;box-shadow:0 0 0 2px #fff;"></span></span>',
  iconSize: [18, 18],
  iconAnchor: [9, 9],
});

const RAINFALL_BARS = [4, 6, 9, 14, 22, 31, 26, 38, 44, 36, 28, 18];

/** Live geospatial monitoring map on Leaflet with real terrain tiles. */
export default function LiveMonitoringMap() {
  const toast = useToast();
  const now = useNow(30000);
  const containerRef = useRef(null);
  const mapRef = useRef(null);
  const [showLegend, setShowLegend] = useState(true);

  const locateMe = () => {
    if (!navigator.geolocation) {
      toast.error('Location is not supported in this browser.');
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (position) => {
        mapRef.current?.flyTo([position.coords.latitude, position.coords.longitude], 10, {
          duration: 1.2,
        });
        toast.info('Centered on your location (demo map).');
      },
      () => toast.error('Unable to read your location. Check browser permissions.'),
      { timeout: 8000 }
    );
  };

  const toggleFullscreen = () => {
    const node = containerRef.current;
    if (!node) return;
    if (document.fullscreenElement) {
      document.exitFullscreen().catch(() => {});
    } else if (node.requestFullscreen) {
      node.requestFullscreen().catch(() => toast.error('Fullscreen is not available right now.'));
    } else {
      toast.info('Fullscreen is not supported in this browser.');
    }
  };

  return (
    <section id="live-monitoring" aria-labelledby="live-monitoring-heading" className="scroll-mt-24 bg-secondary-50 py-16 sm:py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeading
          id="live-monitoring-heading"
          eyebrow="Live Landslide Monitoring"
          title="Network status across the monitored terrain"
          description="An interactive geospatial view of risk zones, stations, corridors and rivers. Toggle layers, open popups for details, zoom to any area."
          meta="Approximate boundaries and sample monitoring data"
        />

        <div className="mt-10 grid gap-6 lg:grid-cols-3">
          {/* Map */}
          <div className="lg:col-span-2">
            <div
              ref={containerRef}
              className="relative z-0 overflow-hidden rounded-xl border shadow-sm"
            >
              <MapContainer
                ref={mapRef}
                center={[30.2, 78.9]}
                zoom={8}
                scrollWheelZoom={false}
                className="h-[420px] w-full sm:h-[480px]"
                attributionControl
              >
                <LayersControl position="topright">
                  <LayersControl.BaseLayer checked name="Terrain (streets)">
                    <TileLayer
                      attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                      url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    />
                  </LayersControl.BaseLayer>
                  <LayersControl.BaseLayer name="Satellite">
                    <TileLayer
                      attribution="Tiles &copy; Esri — Source: Esri, Maxar, Earthstar Geographics"
                      url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
                    />
                  </LayersControl.BaseLayer>

                  <LayersControl.Overlay checked name="Risk zones">
                    <LayerGroup>
                      {DISTRICT_ZONES.map((zone) => {
                        const style = ZONE_STYLE[zone.risk];
                        return (
                          <Polygon
                            key={zone.name}
                            positions={zone.polygon}
                            pathOptions={{
                              color: style.color,
                              fillColor: style.fillColor,
                              fillOpacity: 0.25,
                              weight: 2,
                            }}
                          >
                            <Tooltip sticky direction="top">
                              <strong>{zone.name}</strong> — {zone.riskLabel} risk
                            </Tooltip>
                            <Popup>
                              <p className="m-0 text-sm font-bold">{zone.name} District</p>
                              <p className="m-0 text-xs">
                                Risk level: <strong>{zone.riskLabel}</strong>
                                <br />
                                Active alerts: {zone.alerts}
                                <br />
                                Sample boundary — illustrative only
                              </p>
                            </Popup>
                          </Polygon>
                        );
                      })}
                    </LayerGroup>
                  </LayersControl.Overlay>

                  <LayersControl.Overlay checked name="Monitoring stations">
                    <LayerGroup>
                      {STATIONS.map((station) => (
                        <CircleMarker
                          key={station.name}
                          center={station.position}
                          radius={6}
                          pathOptions={{ color: '#ffffff', weight: 2, fillColor: '#0a2f5a', fillOpacity: 1 }}
                        >
                          <Popup>
                            <p className="m-0 text-sm font-bold">{station.name}</p>
                            <p className="m-0 text-xs">
                              {station.zone}
                              <br />
                              Status: reporting · Sample station (demo)
                            </p>
                          </Popup>
                        </CircleMarker>
                      ))}
                    </LayerGroup>
                  </LayersControl.Overlay>

                  <LayersControl.Overlay checked name="Road corridors">
                    <LayerGroup>
                      {ROADS.map((road) => (
                        <Polyline
                          key={road.name}
                          positions={road.positions}
                          pathOptions={{ color: '#334155', weight: 4, dashArray: '8 8' }}
                        >
                          <Tooltip sticky>{road.name}</Tooltip>
                        </Polyline>
                      ))}
                    </LayerGroup>
                  </LayersControl.Overlay>

                  <LayersControl.Overlay checked name="Rivers">
                    <LayerGroup>
                      {RIVERS.map((river) => (
                        <Polyline
                          key={river.name}
                          positions={river.positions}
                          pathOptions={{ color: '#0ea5e9', weight: 4, opacity: 0.8 }}
                        >
                          <Tooltip sticky>{river.name}</Tooltip>
                        </Polyline>
                      ))}
                    </LayerGroup>
                  </LayersControl.Overlay>

                  <LayersControl.Overlay checked name="Active incidents">
                    <LayerGroup>
                      <Marker position={INCIDENT.position} icon={INCIDENT_ICON}>
                        <Popup>
                          <p className="m-0 text-sm font-bold text-red-700">{INCIDENT.name}</p>
                          <p className="m-0 text-xs">
                            Extensometer detects 3.2 mm/hr movement.
                            <br />
                            Demo data — 10 Sep 2026, 11:42 PM
                          </p>
                        </Popup>
                      </Marker>
                    </LayerGroup>
                  </LayersControl.Overlay>
                </LayersControl>

                <ScaleControl imperial={false} position="bottomright" />
              </MapContainer>

              {/* custom controls */}
              <div className="absolute bottom-16 right-3 z-[500] flex flex-col gap-1.5">
                <button
                  type="button"
                  onClick={locateMe}
                  aria-label="Locate me"
                  title="Locate me"
                  className="inline-flex h-9 w-9 items-center justify-center rounded-md border bg-white text-secondary-700 shadow-sm transition-colors hover:bg-secondary-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  <Crosshair className="h-4 w-4" aria-hidden="true" />
                </button>
                <button
                  type="button"
                  onClick={toggleFullscreen}
                  aria-label="Toggle fullscreen"
                  title="Toggle fullscreen"
                  className="inline-flex h-9 w-9 items-center justify-center rounded-md border bg-white text-secondary-700 shadow-sm transition-colors hover:bg-secondary-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  <Maximize2 className="h-4 w-4" aria-hidden="true" />
                </button>
              </div>

              {showLegend && (
                <div className="absolute bottom-3 left-3 z-[500] rounded-md border bg-white/95 p-3 text-xs shadow-lg">
                  <div className="mb-1.5 flex items-center justify-between gap-3">
                    <p className="font-semibold uppercase tracking-wide text-secondary-500">Legend</p>
                    <button
                      type="button"
                      onClick={() => setShowLegend(false)}
                      aria-label="Hide legend"
                      className="rounded px-1 text-secondary-500 hover:bg-secondary-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    >
                      ✕
                    </button>
                  </div>
                  <ul className="space-y-1">
                    <li className="flex items-center gap-2">
                      <span className="h-3 w-5 rounded-sm bg-orange-500/30 ring-1 ring-orange-600" aria-hidden="true" /> High risk
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="h-3 w-5 rounded-sm bg-amber-400/25 ring-1 ring-amber-600" aria-hidden="true" /> Watch / Moderate
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="h-3 w-5 rounded-sm bg-emerald-500/25 ring-1 ring-emerald-600" aria-hidden="true" /> Low risk
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="h-2.5 w-2.5 rounded-full bg-[#0a2f5a]" aria-hidden="true" /> Monitoring station
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="h-2.5 w-2.5 rounded-full bg-red-600" aria-hidden="true" /> Active incident
                    </li>
                  </ul>
                </div>
              )}

              {!showLegend && (
                <button
                  type="button"
                  onClick={() => setShowLegend(true)}
                  className="absolute bottom-3 left-3 z-[500] rounded-md border bg-white/95 px-2.5 py-1.5 text-xs font-semibold text-secondary-700 shadow-sm hover:bg-secondary-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  Show legend
                </button>
              )}
            </div>
          </div>

          {/* Live panel */}
          <div className="space-y-6">
            <div className="rounded-xl border bg-white p-5 shadow-sm">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold uppercase tracking-wider text-[#0a2f5a]">Network snapshot</h3>
                <span className="rounded bg-amber-100 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-amber-800">
                  Demo data
                </span>
              </div>
              <dl className="mt-4 grid grid-cols-2 gap-3">
                {NETWORK_STATS.map((stat) => (
                  <div key={stat.label} className="rounded-lg bg-secondary-50 p-3">
                    <dd className="text-2xl font-extrabold tabular-nums text-primary-700">{stat.value}</dd>
                    <dt className="text-xs text-secondary-600">{stat.label}</dt>
                  </div>
                ))}
              </dl>
              <p className="mt-3 text-xs text-secondary-400">
                Last updated{' '}
                {now.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })} · Sample monitoring data
              </p>
            </div>

            <div className="rounded-xl border bg-white p-5 shadow-sm">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold uppercase tracking-wider text-[#0a2f5a]">24 h rainfall trend</h3>
                <span className="text-xs text-secondary-400">mm · demo</span>
              </div>
              <svg viewBox="0 0 260 90" className="mt-3 w-full" role="img" aria-label="Bar chart of hourly rainfall over 24 hours, peaking around hour 20">
                <g stroke="#e2e8f0" strokeWidth="1">
                  <line x1="0" y1="22" x2="260" y2="22" />
                  <line x1="0" y1="48" x2="260" y2="48" />
                  <line x1="0" y1="74" x2="260" y2="74" />
                </g>
                {RAINFALL_BARS.map((value, index) => (
                  <rect
                    key={index}
                    x={8 + index * 21}
                    y={78 - value * 1.6}
                    width="13"
                    height={value * 1.6}
                    rx="2"
                    className={index === 8 ? 'fill-orange-500' : 'fill-sky-500/80'}
                  />
                ))}
                <text x="4" y="88" fontSize="8" fill="#64748b">00:00</text>
                <text x="228" y="88" fontSize="8" fill="#64748b">now</text>
              </svg>
              <p className="mt-2 text-xs text-secondary-500">
                Peak: 44 mm between 16:00–18:00 · Rudraprayag gauge (sample data)
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
