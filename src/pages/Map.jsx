import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { setOptions, importLibrary } from '@googlemaps/js-api-loader';
import h337 from 'heatmap.js';
import {
  Activity,
  AlertTriangle,
  Droplets,
  Gauge,
  Info,
  Layers,
  Loader2,
  Map as MapIcon,
  MapPin,
  Radio,
  RefreshCw,
  Satellite,
  Thermometer,
  Waves,
  Wind,
  X,
} from 'lucide-react';
import { Button } from '../components/ui/Button';
import ErrorMessage from '../components/ui/ErrorMessage';

const API_BASE_URL = 'https://landslideearlywarning-system-backend.onrender.com';
const NODES_ENDPOINT = `${API_BASE_URL}/nodes/getAllNodes`;
const POLL_INTERVAL_MS = 30000;

const CUTOUT_RADIUS_METERS = 60;
const CUTOUT_CIRCLE_POINTS = 64;
const HEATMAP_RADIUS_PX = 45;

const MAP_ID = import.meta.env.VITE_GOOGLE_MAPS_MAP_ID ?? 'DEMO_MAP_ID';

const RISK_LEVELS = [
  { key: 'safe', label: 'Safe', color: '#10b981', bg: '#d1fae5', min: 0 },
  { key: 'watch', label: 'Watch', color: '#f59e0b', bg: '#fef3c7', min: 0.35 },
  { key: 'high', label: 'High', color: '#f97316', bg: '#ffedd5', min: 0.6 },
  { key: 'critical', label: 'Critical', color: '#dc2626', bg: '#fee2e2', min: 0.8 },
];

function getRiskTier(prob) {
  if (prob >= 0.8) return RISK_LEVELS[3];
  if (prob >= 0.6) return RISK_LEVELS[2];
  if (prob >= 0.35) return RISK_LEVELS[1];
  return RISK_LEVELS[0];
}

function clamp01(x) {
  return Math.max(0, Math.min(1, x));
}

function normalize(value, min, max) {
  if (value === null || value === undefined || !Number.isFinite(value)) return 0;
  if (max === min) return 0;
  return clamp01((value - min) / (max - min));
}

function computeRisk(node) {
  const soil = normalize(node.soilMoisture, 40, 100);
  const rain = normalize(node.rainDrops, 40, 100);
  const vib = normalize(node.vibrations, 20, 100);
  const tilt = normalize(Math.abs(node.tiltAngle ?? 0), 5, 65);
  const sound = normalize(node.sound, 5, 30);
  const humidity = normalize(node.humidity, 60, 95);
  const temp = normalize(node.temp, 30, 45);

  const weighted = {
    soilMoisture: soil * 0.25,
    rainDrops: rain * 0.2,
    vibrations: vib * 0.2,
    tiltAngle: tilt * 0.15,
    sound: sound * 0.1,
    humidity: humidity * 0.05,
    temp: temp * 0.05,
  };

  const probability = clamp01(
    Object.values(weighted).reduce((a, b) => a + b, 0)
  );

  const raw = {
    soilMoisture: node.soilMoisture,
    rainDrops: node.rainDrops,
    vibrations: node.vibrations,
    tiltAngle: node.tiltAngle,
    sound: node.sound,
    humidity: node.humidity,
    temp: node.temp,
  };

  return {
    probability,
    color: getRiskTier(probability).color,
    bg: getRiskTier(probability).bg,
    label: getRiskTier(probability).label,
    factors: weighted,
    raw,
  };
}

function topDrivers(factors, count = 3) {
  return Object.entries(factors)
    .sort((a, b) => b[1] - a[1])
    .slice(0, count)
    .map(([key, value]) => ({ key, value }));
}

function offsetLatLng(lat, lon, dxMeters, dyMeters) {
  const dLat = dyMeters / 111320;
  const dLon = dxMeters / (111320 * Math.cos((lat * Math.PI) / 180));
  return { lat: lat + dLat, lng: lon + dLon };
}

function circlePath(center, radiusMeters, points = CUTOUT_CIRCLE_POINTS) {
  const path = [];
  for (let i = 0; i < points; i++) {
    const angle = (i / points) * Math.PI * 2;
    const dx = Math.cos(angle) * radiusMeters;
    const dy = Math.sin(angle) * radiusMeters;
    path.push(offsetLatLng(center.lat, center.lng, dx, dy));
  }
  return path;
}

const METRIC_ICONS = {
  soilMoisture: Droplets,
  rainDrops: Waves,
  vibrations: Activity,
  tiltAngle: Gauge,
  sound: Radio,
  humidity: Wind,
  temp: Thermometer,
};

const METRIC_LABELS = {
  soilMoisture: 'Soil moisture',
  rainDrops: 'Rainfall',
  vibrations: 'Vibrations',
  tiltAngle: 'Tilt angle',
  sound: 'Sound',
  humidity: 'Humidity',
  temp: 'Temperature',
};

const METRIC_UNITS = {
  soilMoisture: '%',
  rainDrops: '%',
  vibrations: '%',
  tiltAngle: '°',
  sound: '',
  humidity: '%',
  temp: '°C',
};

function metricStatus(key, value, weighted) {
  if (weighted >= 0.75) return 'critical';
  if (weighted >= 0.5) return 'elevated';
  if (weighted >= 0.25) return 'moderate';
  return 'low';
}

function statusColor(status) {
  switch (status) {
    case 'critical':
      return '#dc2626';
    case 'elevated':
      return '#f97316';
    case 'moderate':
      return '#f59e0b';
    default:
      return '#10b981';
  }
}

export default function Map() {
  const mapContainerRef = useRef(null);
  const mapRef = useRef(null);
  const overlaysRef = useRef([]);
  const heatLayersRef = useRef([]);
  const googleRef = useRef(null);
  const mapTypeRef = useRef('roadmap');

  const [nodes, setNodes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selected, setSelected] = useState(null);
  const [mapReady, setMapReady] = useState(false);
  const [attempt, setAttempt] = useState(0);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [showHeat, setShowHeat] = useState(true);
  const [mapType, setMapType] = useState('roadmap');

  /* ---------------- fetch ---------------- */
  useEffect(() => {
    let active = true;
    setLoading(true);
    setError(null);

    fetch(NODES_ENDPOINT)
      .then(async (res) => {
        const ct = res.headers.get('content-type') ?? '';
        const payload = ct.includes('application/json')
          ? await res.json().catch(() => null)
          : null;
        if (!res.ok) {
          throw new Error(
            payload?.error ?? payload?.message ?? `Failed to load nodes (HTTP ${res.status}).`
          );
        }
        return Array.isArray(payload) ? payload : [];
      })
      .then((data) => {
        if (!active) return;
        setNodes(data);
        setLastUpdated(new Date());
      })
      .catch((err) => {
        if (active) setError(err?.message ?? 'Could not load nodes.');
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [attempt]);

  useEffect(() => {
    const timer = setInterval(() => setAttempt((a) => a + 1), POLL_INTERVAL_MS);
    return () => clearInterval(timer);
  }, []);

  /* ---------------- init map ---------------- */
  useEffect(() => {
    if (mapRef.current || !mapContainerRef.current) return undefined;

    const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
    if (!apiKey) {
      setError('Missing VITE_GOOGLE_MAPS_API_KEY in your .env file.');
      return undefined;
    }

    let cancelled = false;
    setOptions({ key: apiKey, v: 'weekly' });

    Promise.all([
      importLibrary('maps'),
      importLibrary('geometry'),
      importLibrary('marker'),
    ])
      .then(([mapsLib]) => {
        if (cancelled || !mapContainerRef.current) return;
        googleRef.current = window.google;

        const map = new mapsLib.Map(mapContainerRef.current, {
          center: { lat: 30.382973, lng: 78.467093 },
          zoom: 14,
          mapId: MAP_ID,
          mapTypeId: 'roadmap',
          mapTypeControl: false,
          streetViewControl: false,
          fullscreenControl: true,
          zoomControl: true,
          gestureHandling: 'greedy',
          styles: [
            { elementType: 'geometry', stylers: [{ color: '#f7f8fa' }] },
            { elementType: 'labels.icon', stylers: [{ visibility: 'off' }] },
            { elementType: 'labels.text.fill', stylers: [{ color: '#475569' }] },
            { elementType: 'labels.text.stroke', stylers: [{ color: '#ffffff' }] },
            { featureType: 'administrative', elementType: 'geometry', stylers: [{ color: '#d4dae3' }] },
            { featureType: 'administrative.locality', elementType: 'labels.text.fill', stylers: [{ color: '#0a2f5a' }] },
            { featureType: 'poi', elementType: 'geometry', stylers: [{ color: '#eef1f5' }] },
            { featureType: 'poi.park', elementType: 'geometry', stylers: [{ color: '#e8f0e4' }] },
            { featureType: 'road', elementType: 'geometry', stylers: [{ color: '#ffffff' }] },
            { featureType: 'road.highway', elementType: 'geometry', stylers: [{ color: '#f0d9a8' }] },
            { featureType: 'water', elementType: 'geometry', stylers: [{ color: '#c7e2f7' }] },
            { featureType: 'water', elementType: 'labels.text.fill', stylers: [{ color: '#3b6f9e' }] },
          ],
        });

        mapRef.current = map;
        setMapReady(true);
      })
      .catch((err) => {
        if (!cancelled) {
          setError(`Failed to load Google Maps: ${err?.message ?? 'unknown error'}`);
        }
      });

    return () => {
      cancelled = true;
    };
  }, []);

  /* ---------------- switch map type ---------------- */
  useEffect(() => {
    if (!mapReady || !mapRef.current) return;
    if (mapTypeRef.current === mapType) return;
    mapRef.current.setMapTypeId(mapType);
    mapTypeRef.current = mapType;
  }, [mapType, mapReady]);

  /* ---------------- clear overlays ---------------- */
  const clearOverlays = useCallback(() => {
    overlaysRef.current.forEach((o) => o?.setMap?.(null));
    overlaysRef.current = [];

    heatLayersRef.current.forEach((layer) => {
      layer?._heatmap?.setData?.({ max: 100, data: [] });
    });
    heatLayersRef.current = [];
  }, []);

  /* ---------------- draw overlays ---------------- */
  useEffect(() => {
    if (!mapReady || !mapRef.current || !googleRef.current) return undefined;

    const google = googleRef.current;
    const map = mapRef.current;

    clearOverlays();

    if (!nodes.length) return undefined;

    const bounds = new google.maps.LatLngBounds();
    const { AdvancedMarkerElement } = google.maps.marker;

    nodes.forEach((node) => {
      if (!Number.isFinite(node.latitude) || !Number.isFinite(node.longitude)) return;

      const center = { lat: node.latitude, lng: node.longitude };
      const risk = computeRisk(node);
      const path = circlePath(center, CUTOUT_RADIUS_METERS);

      const polygon = new google.maps.Polygon({
        paths: path,
        strokeColor: risk.color,
        strokeOpacity: 0.85,
        strokeWeight: 1.5,
        fillColor: risk.color,
        fillOpacity: 0.08,
        map,
        zIndex: 2,
      });

      polygon.addListener('click', () => setSelected({ ...node, ...risk }));

      const markerContent = document.createElement('div');
      markerContent.style.cssText = `
        display: flex;
        align-items: center;
        justify-content: center;
        min-width: 38px;
        height: 38px;
        padding: 0 8px;
        border-radius: 999px;
        background: ${risk.color};
        border: 3px solid white;
        color: white;
        font-family: ui-sans-serif, system-ui, -apple-system, sans-serif;
        font-weight: 700;
        font-size: 11px;
        box-shadow: 0 3px 8px rgba(0, 0, 0, 0.22);
        cursor: pointer;
        transition: transform 0.15s ease;
      `;
      markerContent.textContent = `${Math.round(risk.probability * 100)}%`;
      markerContent.addEventListener('mouseenter', () => {
        markerContent.style.transform = 'scale(1.12)';
      });
      markerContent.addEventListener('mouseleave', () => {
        markerContent.style.transform = 'scale(1)';
      });

      const marker = new AdvancedMarkerElement({
        position: center,
        map,
        title: `${node.nodeName} · ${risk.label}`,
        content: markerContent,
        zIndex: 3,
      });

      marker.addListener('click', () => setSelected({ ...node, ...risk }));

      overlaysRef.current.push(polygon, marker);
      bounds.extend(center);
    });

    if (nodes.length > 1) {
      map.fitBounds(bounds, { padding: 100, maxZoom: 15 });
    } else if (nodes.length === 1) {
      map.setCenter({ lat: nodes[0].latitude, lng: nodes[0].longitude });
      map.setZoom(15);
    }

    return () => {
      if (google.maps.event) {
        // no persistent listeners to remove here
      }
    };
  }, [nodes, mapReady, clearOverlays]);

  /* ---------------- heat layers ---------------- */
  useEffect(() => {
    if (!mapReady || !mapRef.current || !googleRef.current) return undefined;
    if (!showHeat || !nodes.length) {
      heatLayersRef.current.forEach((layer) => {
        layer?._heatmap?.setData?.({ max: 100, data: [] });
      });
      heatLayersRef.current = [];
      return undefined;
    }

    const google = googleRef.current;
    const map = mapRef.current;

    const idleListener = google.maps.event.addListenerOnce(map, 'idle', () => {
      heatLayersRef.current.forEach((layer) => layer?._heatmap?.setData?.({ max: 100, data: [] }));
      heatLayersRef.current = [];

      nodes.forEach((node) => {
        if (!Number.isFinite(node.latitude) || !Number.isFinite(node.longitude)) return;
        const risk = computeRisk(node);

        const div = document.createElement('div');
        div.style.position = 'absolute';
        div.style.width = '1px';
        div.style.height = '1px';
        div.style.pointerEvents = 'none';

        const overlay = new google.maps.OverlayView();
        overlay.onAdd = function onAdd() {
          const panes = this.getPanes();
          panes?.overlayMouseTarget?.appendChild(div);
        };
        overlay.draw = function draw() {
          const projection = this.getProjection();
          if (!projection) return;
          const point = projection.fromLatLngToDivPixel(
            new google.maps.LatLng(node.latitude, node.longitude)
          );
          if (!point) return;
          div.style.left = `${point.x - HEATMAP_RADIUS_PX}px`;
          div.style.top = `${point.y - HEATMAP_RADIUS_PX}px`;
        };
        overlay.onRemove = function onRemove() {
          div.parentNode?.removeChild(div);
        };

        overlay.setMap(map);

        const heatmap = h337.create({
          container: div,
          radius: HEATMAP_RADIUS_PX,
          maxOpacity: 0.55,
          minOpacity: 0.05,
          blur: 0.85,
          gradient: {
            0.0: '#ffffff00',
            0.3: risk.color + '80',
            0.6: risk.color,
            1.0: risk.color,
          },
        });

        // Soft radial distribution centered on the node
        const data = [{ x: HEATMAP_RADIUS_PX, y: HEATMAP_RADIUS_PX, value: Math.round(risk.probability * 100) }];

        // Add a ring of lower-intensity samples so the patch has a natural falloff
        const ringSamples = 24;
        for (let i = 0; i < ringSamples; i++) {
          const angle = (i / ringSamples) * Math.PI * 2;
          const r = HEATMAP_RADIUS_PX * 0.65;
          data.push({
            x: HEATMAP_RADIUS_PX + Math.cos(angle) * r,
            y: HEATMAP_RADIUS_PX + Math.sin(angle) * r,
            value: Math.round(risk.probability * 50),
          });
        }

        heatmap.setData({ max: 100, data });

        heatLayersRef.current.push({ _heatmap: heatmap, overlay });
      });
    });

    return () => {
      google.maps.event.removeListener(idleListener);
    };
  }, [nodes, mapReady, showHeat]);

  /* ---------------- redraw on zoom/pan ---------------- */
  useEffect(() => {
    if (!mapReady || !mapRef.current || !googleRef.current) return undefined;
    const google = googleRef.current;
    const map = mapRef.current;

    let pending = null;
    const redraw = () => {
      if (pending) window.cancelAnimationFrame(pending);
      pending = window.requestAnimationFrame(() => {
        heatLayersRef.current.forEach((layer) => layer.overlay?.draw?.());
      });
    };

    const zoomListener = map.addListener('zoom_changed', redraw);
    const centerListener = map.addListener('center_changed', redraw);

    return () => {
      google.maps.event.removeListener(zoomListener);
      google.maps.event.removeListener(centerListener);
      if (pending) window.cancelAnimationFrame(pending);
    };
  }, [mapReady]);

  useEffect(() => () => clearOverlays(), [clearOverlays]);

  /* ---------------- stats ---------------- */
  const stats = useMemo(() => {
    if (!nodes.length) {
      return { total: 0, safe: 0, watch: 0, high: 0, critical: 0, avgRisk: 0 };
    }
    const b = { total: nodes.length, safe: 0, watch: 0, high: 0, critical: 0, sum: 0 };
    nodes.forEach((n) => {
      const { probability } = computeRisk(n);
      b.sum += probability;
      if (probability >= 0.8) b.critical++;
      else if (probability >= 0.6) b.high++;
      else if (probability >= 0.35) b.watch++;
      else b.safe++;
    });
    b.avgRisk = b.sum / b.total;
    return b;
  }, [nodes]);

  const refreshedAt = lastUpdated
    ? lastUpdated.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit', second: '2-digit' })
    : null;

  return (
    <div className="flex flex-col">
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Node Risk Map</h1>
          <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
            Live landslide risk per node, computed from soil moisture, rainfall, vibrations, tilt,
            sound, humidity and temperature. Click any node to see which readings are driving the
            risk.
          </p>
        </div>
        <div className="flex items-center gap-2">
          {refreshedAt && (
            <span className="hidden text-xs text-secondary-500 sm:inline">Updated {refreshedAt}</span>
          )}
          <Button variant="outline" size="sm" onClick={() => setAttempt((a) => a + 1)} disabled={loading}>
            <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} aria-hidden="true" />
            Refresh
          </Button>
        </div>
      </div>

      {/* KPI strip */}
      <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
        <KpiTile label="Total nodes" value={stats.total} tone="neutral" />
        <KpiTile label="Safe" value={stats.safe} tone="safe" />
        <KpiTile label="Watch" value={stats.watch} tone="watch" />
        <KpiTile label="High" value={stats.high} tone="high" />
        <KpiTile label="Critical" value={stats.critical} tone="critical" />
      </div>

      {/* Legend + toggles */}
      <div className="mt-4 flex flex-wrap items-center gap-3 rounded-lg border bg-white px-4 py-2.5 text-xs">
        <span className="flex items-center gap-1.5 font-semibold text-secondary-600">
          <Info className="h-3.5 w-3.5" aria-hidden="true" />
          Risk scale
        </span>
        {RISK_LEVELS.map((level) => (
          <span key={level.key} className="flex items-center gap-1.5">
            <span className="h-3 w-3 rounded-full" style={{ backgroundColor: level.color }} aria-hidden="true" />
            <span className="font-medium text-secondary-700">
              {level.label}
              {level.key === 'safe' && ' (<35%)'}
              {level.key === 'watch' && ' (35–60%)'}
              {level.key === 'high' && ' (60–80%)'}
              {level.key === 'critical' && ' (≥80%)'}
            </span>
          </span>
        ))}

        <span className="ml-auto flex items-center gap-2">
          <button
            type="button"
            onClick={() => setShowHeat((v) => !v)}
            aria-pressed={showHeat}
            className={`inline-flex items-center gap-1.5 rounded-md border px-2.5 py-1 text-[11px] font-semibold transition-colors ${
              showHeat
                ? 'border-[#0a2f5a] bg-[#0a2f5a] text-white'
                : 'border-secondary-300 bg-white text-secondary-700 hover:bg-secondary-50'
            }`}
          >
            <Layers className="h-3 w-3" aria-hidden="true" />
            Heat overlay
          </button>
          <div
            role="group"
            aria-label="Map type"
            className="inline-flex overflow-hidden rounded-md border"
          >
            {[
              { key: 'roadmap', label: 'Map', Icon: MapIcon },
              { key: 'satellite', label: 'Satellite', Icon: Satellite },
            ].map(({ key, label, Icon }) => (
              <button
                key={key}
                type="button"
                aria-pressed={mapType === key}
                onClick={() => setMapType(key)}
                className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-[11px] font-semibold transition-colors ${
                  mapType === key
                    ? 'bg-[#0a2f5a] text-white'
                    : 'bg-white text-secondary-700 hover:bg-secondary-50'
                }`}
              >
                <Icon className="h-3 w-3" aria-hidden="true" />
                {label}
              </button>
            ))}
          </div>
        </span>
      </div>

      {error && (
        <ErrorMessage
          title="Could not load the map"
          message={error}
          onRetry={() => setAttempt((a) => a + 1)}
          className="mt-4"
        />
      )}

      {/* Map + sidebar */}
      <div className="mt-4 grid gap-4 lg:grid-cols-[1fr_360px]">
        <div
          className="relative h-[640px] overflow-hidden rounded-2xl border bg-secondary-100 shadow-sm"
          aria-label="Node risk map"
        >
          <div ref={mapContainerRef} className="h-full w-full" />

          {!mapReady && !error && (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-white/80">
              <Loader2 className="h-6 w-6 animate-spin text-secondary-500" aria-hidden="true" />
              <p className="text-xs text-secondary-500">Initializing map…</p>
            </div>
          )}

          {mapReady && loading && (
            <div className="absolute right-3 top-3 flex items-center gap-2 rounded-full bg-white/95 px-3 py-1.5 shadow-md">
              <Loader2 className="h-3.5 w-3.5 animate-spin text-secondary-600" aria-hidden="true" />
              <span className="text-xs font-medium text-secondary-700">Updating…</span>
            </div>
          )}
        </div>

        <aside className="flex max-h-[640px] flex-col overflow-hidden rounded-2xl border bg-white shadow-sm">
          <div className="flex items-center justify-between border-b bg-gradient-to-r from-[#0a2f5a] to-[#134b8a] px-4 py-3">
            <p className="text-sm font-bold uppercase tracking-wider text-white">
              {selected ? 'Node details' : `Monitored nodes (${nodes.length})`}
            </p>
            {selected && (
              <button
                type="button"
                onClick={() => setSelected(null)}
                className="rounded-full p-1 text-white/80 transition-colors hover:bg-white/10 hover:text-white"
                aria-label="Close details"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>

          {selected ? (
            <NodeDetail node={selected} />
          ) : (
            <NodeList
              nodes={nodes}
              loading={loading}
              onSelect={(node) => setSelected({ ...node, ...computeRisk(node) })}
            />
          )}
        </aside>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* KPI tile                                                            */
/* ------------------------------------------------------------------ */

function KpiTile({ label, value, tone }) {
  const tones = {
    neutral: 'border-secondary-200 bg-white text-secondary-900',
    safe: 'border-emerald-200 bg-emerald-50 text-emerald-900',
    watch: 'border-amber-200 bg-amber-50 text-amber-900',
    high: 'border-orange-200 bg-orange-50 text-orange-900',
    critical: 'border-red-200 bg-red-50 text-red-900',
  };
  return (
    <div className={`rounded-xl border px-4 py-3 ${tones[tone] ?? tones.neutral}`}>
      <p className="text-xs font-medium uppercase tracking-wider opacity-70">{label}</p>
      <p className="mt-1 text-2xl font-bold tabular-nums">{value}</p>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Node list                                                           */
/* ------------------------------------------------------------------ */

function NodeList({ nodes, loading, onSelect }) {
  if (!nodes.length) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-2 p-6 text-center text-sm text-secondary-500">
        <MapPin className="h-6 w-6 text-secondary-400" aria-hidden="true" />
        {loading ? 'Loading nodes…' : 'No nodes returned by the backend.'}
      </div>
    );
  }

  return (
    <ul className="flex-1 divide-y divide-secondary-100 overflow-y-auto">
      {nodes.map((node) => {
        const risk = computeRisk(node);
        const drivers = topDrivers(risk.factors, 2);
        return (
          <li key={node.id}>
            <button
              type="button"
              onClick={() => onSelect(node)}
              className="flex w-full items-start gap-3 px-4 py-3 text-left transition-colors hover:bg-secondary-50"
            >
              <span
                className="mt-1 h-3 w-3 shrink-0 rounded-full ring-2 ring-white"
                style={{ backgroundColor: risk.color, boxShadow: `0 0 0 2px ${risk.bg}` }}
                aria-hidden="true"
              />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold text-[#0a2f5a]">{node.nodeName}</p>
                <p className="truncate text-xs text-secondary-500">
                  {node.latitude?.toFixed(4)}, {node.longitude?.toFixed(4)}
                </p>
                <div className="mt-1.5 flex items-center gap-2">
                  <span
                    className="rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white"
                    style={{ backgroundColor: risk.color }}
                  >
                    {risk.label}
                  </span>
                  <span className="text-[11px] font-semibold tabular-nums text-secondary-600">
                    {(risk.probability * 100).toFixed(0)}%
                  </span>
                </div>
                <p className="mt-1 text-[11px] text-secondary-500">
                  Drivers:{' '}
                  {drivers
                    .map((d) => `${METRIC_LABELS[d.key]} (${(d.value * 100).toFixed(0)}%)`)
                    .join(' · ')}
                </p>
              </div>
            </button>
          </li>
        );
      })}
    </ul>
  );
}

/* ------------------------------------------------------------------ */
/* Node detail                                                         */
/* ------------------------------------------------------------------ */

function NodeDetail({ node }) {
  const drivers = topDrivers(node.factors, 3);

  const readings = [
    { key: 'soilMoisture' },
    { key: 'rainDrops' },
    { key: 'vibrations' },
    { key: 'tiltAngle' },
    { key: 'sound' },
    { key: 'humidity' },
    { key: 'temp' },
  ];

  return (
    <div className="flex-1 overflow-y-auto">
      {/* Risk banner */}
      <div
        className="border-b px-5 py-4"
        style={{ backgroundColor: node.bg, borderColor: node.color }}
      >
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-secondary-600">
              Landslide risk
            </p>
            <p
              className="mt-1 flex items-center gap-2 text-lg font-bold"
              style={{ color: node.color }}
            >
              <AlertTriangle className="h-5 w-5" aria-hidden="true" />
              {node.label}
            </p>
          </div>
          <div className="text-right">
            <p className="text-xs font-medium text-secondary-600">Probability</p>
            <p className="text-3xl font-bold tabular-nums" style={{ color: node.color }}>
              {(node.probability * 100).toFixed(1)}%
            </p>
          </div>
        </div>
      </div>

      {/* Node header */}
      <div className="border-b px-5 py-4">
        <h3 className="text-base font-bold text-[#0a2f5a]">{node.nodeName}</h3>
        <p className="mt-0.5 text-xs text-secondary-500">
          Node #{node.id} · {node.active ? 'Active' : 'Inactive'}
          {node.localDateTime ? ` · ${node.localDateTime}` : ''}
        </p>
      </div>

      {/* Top drivers */}
      <div className="border-b px-5 py-4">
        <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-secondary-500">
          Top risk drivers
        </p>
        <div className="space-y-2">
          {drivers.map(({ key, value }) => {
            const status = metricStatus(key, node.raw[key], value);
            return (
              <div key={key} className="flex items-center gap-3">
                <span
                  className="h-1.5 w-1.5 rounded-full"
                  style={{ backgroundColor: statusColor(status) }}
                  aria-hidden="true"
                />
                <span className="flex-1 text-sm font-medium text-secondary-800">
                  {METRIC_LABELS[key]}
                </span>
                <span className="text-xs font-semibold tabular-nums text-secondary-600">
                  {(value * 100).toFixed(0)}%
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* All readings */}
      <div className="px-5 py-4">
        <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-secondary-500">
          Live readings
        </p>
        <div className="grid grid-cols-2 gap-2">
          {readings.map(({ key }) => {
            const Icon = METRIC_ICONS[key];
            const weighted = node.factors[key];
            const status = metricStatus(key, node.raw[key], weighted);
            const statusClr = statusColor(status);
            return (
              <div
                key={key}
                className="relative overflow-hidden rounded-lg border bg-secondary-50/60 px-3 py-2.5"
              >
                <span
                  className="absolute left-0 top-0 h-full w-1"
                  style={{ backgroundColor: statusClr }}
                  aria-hidden="true"
                />
                <div className="flex items-center gap-1.5 text-secondary-500">
                  <Icon className="h-3.5 w-3.5" aria-hidden="true" />
                  <span className="text-[11px] font-medium uppercase tracking-wider">
                    {METRIC_LABELS[key]}
                  </span>
                </div>
                <p className="mt-1 text-sm font-bold tabular-nums text-secondary-900">
                  {node.raw[key] ?? '—'}
                  {METRIC_UNITS[key]}
                </p>
                <p className="mt-0.5 text-[10px] font-medium" style={{ color: statusClr }}>
                  {status.toUpperCase()} · {(weighted * 100).toFixed(0)}% weight
                </p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Location */}
      <div className="border-t px-5 py-4">
        <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-secondary-500">
          Location
        </p>
        <div className="rounded-lg border bg-secondary-50/60 px-3 py-2 text-sm">
          <p className="font-mono text-secondary-900">
            {node.latitude?.toFixed(6)}, {node.longitude?.toFixed(6)}
          </p>
        </div>
        <a
          href={`https://www.google.com/maps/search/?api=1&query=${node.latitude},${node.longitude}`}
          target="_blank"
          rel="noreferrer"
          className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-md bg-[#0a2f5a] px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-[#134b8a]"
        >
          <MapPin className="h-4 w-4" aria-hidden="true" />
          Open in Google Maps
        </a>
      </div>
    </div>
  );
}