import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Download,
  RefreshCw,
  Satellite,
  Search,
} from 'lucide-react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts';
import useDebounce from '../../hooks/useDebounce';
import { getNodeByName, getNodes } from '../../services/api';
import TelemetryChart from '../../components/features/monitoring/TelemetryChart';
import { LIVE_METRICS } from '../../components/features/monitoring/telemetryData';
import { Button } from '../../components/ui/Button';
import { Skeleton } from '../../components/ui/Skeleton';
import ErrorMessage from '../../components/ui/ErrorMessage';
import { Badge } from '../../components/ui/Badge';
import Spinner from '../../components/ui/Spinner';

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ??
  'https://landslideearlywarning-system-backend.onrender.com';

const SATELLITE_API_URL = 'https://sentinal-backend.vercel.app/predict';
const POLL_INTERVAL_MS = 15000;
const IST_TIME_ZONE = 'Asia/Kolkata';

/* ------------------------------------------------------------------ */
/* Time helpers                                                        */
/*                                                                     */
/* Backend sends UTC wall-clock strings like "2026-09-16T18:47:30"    */
/* (Java LocalDateTime.now() on a UTC JVM). We parse them as UTC and   */
/* render every display in IST.                                        */
/* ------------------------------------------------------------------ */

function toUtcDate(value) {
  if (value === null || value === undefined || value === '') return null;
  if (value instanceof Date) return Number.isNaN(value.getTime()) ? null : value;

  if (typeof value === 'number') {
    const ms = value < 1e12 ? value * 1000 : value;
    const d = new Date(ms);
    return Number.isNaN(d.getTime()) ? null : d;
  }

  if (typeof value === 'string') {
    const trimmed = value.trim();

    if (/^\d+$/.test(trimmed)) {
      const n = Number(trimmed);
      const ms = n < 1e12 ? n * 1000 : n;
      const d = new Date(ms);
      return Number.isNaN(d.getTime()) ? null : d;
    }

    const isoNoTz = trimmed.match(
      /^(\d{4})-(\d{2})-(\d{2})[T ](\d{2}):(\d{2}):(\d{2})(?:\.(\d+))?$/
    );
    if (isoNoTz) {
      const [, y, mo, d, h, mi, s, frac] = isoNoTz;
      const ms = frac ? Math.floor(Number(`0.${frac}`) * 1000) : 0;
      return new Date(
        Date.UTC(
          Number(y),
          Number(mo) - 1,
          Number(d),
          Number(h),
          Number(mi),
          Number(s),
          ms
        )
      );
    }
  }

  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? null : d;
}

/** e.g. "6:36:54 pm" in IST */
function formatLocalTime(value) {
  const d = toUtcDate(value);
  if (!d) return '—';
  return d.toLocaleTimeString('en-IN', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: true,
    timeZone: IST_TIME_ZONE,
  });
}

/** e.g. "6:36 pm · 16 Sep 2026" in IST */
function formatFriendlyDateTime(value) {
  const d = toUtcDate(value);
  if (!d) return '—';
  const time = d.toLocaleTimeString('en-IN', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
    timeZone: IST_TIME_ZONE,
  });
  const date = d.toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    timeZone: IST_TIME_ZONE,
  });
  return `${time} · ${date}`;
}

/** e.g. "6:36 pm" in IST — for chart axes */
function formatShortTime(value) {
  const d = toUtcDate(value);
  if (!d) return '';
  return d.toLocaleTimeString('en-IN', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
    timeZone: IST_TIME_ZONE,
  });
}

const TIME_KEY_PATTERN = /^(localDateTime|.*At|.*_at|.*time.*|.*Time.*|.*date.*|.*Date.*|timestamp.*|created.*|updated.*|recorded.*)$/;

function isTimeKey(key) {
  return TIME_KEY_PATTERN.test(key);
}

/** Format a value for the raw node response list. */
function formatRawValue(value, key) {
  if (value === null || value === undefined || value === '') return '—';

  if (isTimeKey(key) && (typeof value === 'string' || typeof value === 'number')) {
    const formatted = formatFriendlyDateTime(value);
    if (formatted !== '—') return formatted;
  }

  if (typeof value === 'number') {
    return Number.isInteger(value) ? String(value) : value.toFixed(2);
  }
  if (typeof value === 'boolean') return value ? 'Yes' : 'No';
  if (typeof value === 'object')
    return Array.isArray(value) ? `${value.length} items` : `${Object.keys(value).length} fields`;
  return String(value);
}

/* ------------------------------------------------------------------ */
/* Normal-range thresholds                                             */
/* ------------------------------------------------------------------ */

const READINGS_CONFIG = [
  { key: 'soilMoisture', label: 'Soil moisture', unit: '%', min: 0, max: 100, warn: 40, critical: 60 },
  { key: 'rainDrops', label: 'Rainfall', unit: '%', min: 0, max: 100, warn: 40, critical: 60 },
  { key: 'vibrations', label: 'Vibrations', unit: '%', min: 0, max: 100, warn: 20, critical: 45 },
  { key: 'tiltAngle', label: 'Tilt angle', unit: '°', min: 0, max: 90, warn: 5, critical: 20 },
  { key: 'sound', label: 'Sound', unit: '', min: 0, max: 50, warn: 5, critical: 12 },
  { key: 'humidity', label: 'Humidity', unit: '%', min: 0, max: 100, warn: 60, critical: 75 },
  { key: 'temp', label: 'Temperature', unit: '°C', min: 0, max: 50, warn: 30, critical: 35 },
];

function readStatus(config, value) {
  if (value === null || value === undefined || !Number.isFinite(Number(value))) {
    return { key: 'unknown', label: 'No data', tone: 'neutral' };
  }
  const n = Number(value);
  if (n >= config.critical) return { key: 'critical', label: 'Critical', tone: 'danger' };
  if (n >= config.warn) return { key: 'elevated', label: 'Elevated', tone: 'warning' };
  return { key: 'normal', label: 'Normal', tone: 'success' };
}

const STATUS_TONE_CLASSES = {
  neutral: 'border-secondary-200 bg-secondary-50 text-secondary-600',
  success: 'border-emerald-200 bg-emerald-50 text-emerald-800',
  warning: 'border-amber-200 bg-amber-50 text-amber-800',
  danger: 'border-red-200 bg-red-50 text-red-800',
};

/* ------------------------------------------------------------------ */
/* Page                                                                */
/* ------------------------------------------------------------------ */

export default function Monitoring() {
  const [nodes, setNodes] = useState([]);
  const [nodesLoading, setNodesLoading] = useState(true);
  const [nodesError, setNodesError] = useState(null);
  const [nodeName, setNodeName] = useState('');
  const [nodeId, setNodeId] = useState(null);
  const [nodeData, setNodeData] = useState(null);
  const [nodeLoading, setNodeLoading] = useState(false);
  const [nodeError, setNodeError] = useState(null);
  const [series, setSeries] = useState({});
  const [lastUpdated, setLastUpdated] = useState(null);
  const [nodesAttempt, setNodesAttempt] = useState(0);
  const nodeNameRef = useRef(nodeName);
  nodeNameRef.current = nodeName;

  const [history, setHistory] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [historyError, setHistoryError] = useState(null);
  const [historySearch, setHistorySearch] = useState('');
  const debouncedHistorySearch = useDebounce(historySearch, 300);

  const [satelliteLoading, setSatelliteLoading] = useState(false);
  const [satelliteResult, setSatelliteResult] = useState(null);
  const [satelliteError, setSatelliteError] = useState(null);
  const [imageLoading, setImageLoading] = useState(false);
  const [imageError, setImageError] = useState(false);

  /* ---------------- node list ---------------- */
  useEffect(() => {
    let active = true;
    setNodesLoading(true);
    setNodesError(null);
    getNodes()
      .then((payload) => {
        if (!active) return;
        const list = Array.isArray(payload) ? payload : [];
        const options = list
          .map((n) => ({ id: n?.id ?? null, name: n?.nodeName ?? n?.name ?? null }))
          .filter((n) => n.name);
        setNodes(options);
        if (options.length) {
          setNodeName((current) => current || options[0].name);
          setNodeId((current) => current ?? options[0].id);
        }
      })
      .catch((fetchError) => {
        if (active) setNodesError(fetchError?.message ?? 'Could not load the node list.');
      })
      .finally(() => {
        if (active) setNodesLoading(false);
      });
    return () => {
      active = false;
    };
  }, [nodesAttempt]);

  /* ---------------- live poll ---------------- */
  const pollNode = useCallback(async () => {
    const selected = nodeNameRef.current;
    if (!selected) return;
    setNodeLoading(true);
    try {
      const payload = await getNodeByName(selected);
      setNodeData(payload ?? null);
      setNodeError(null);
      setLastUpdated(new Date());
      if (payload && typeof payload === 'object') {
        const timestamp = new Date();
        setSeries((current) => {
          const next = { ...current };
          for (const metric of LIVE_METRICS) {
            const value = payload[metric.key];
            if (typeof value === 'number' && Number.isFinite(value)) {
              const points = [...(next[metric.key] ?? []), { t: timestamp, v: value }];
              next[metric.key] = points.slice(-30);
            }
          }
          return next;
        });
      }
    } catch (pollError) {
      setNodeError(pollError?.message ?? 'Could not load node data.');
    } finally {
      setNodeLoading(false);
    }
  }, []);

  /* ---------------- history ---------------- */
  const loadHistory = useCallback(async (id) => {
    if (id === null || id === undefined) return;
    setHistoryLoading(true);
    setHistoryError(null);
    try {
      const res = await fetch(`${API_BASE_URL}/nodeHistory/getHistory/${id}`);
      const contentType = res.headers.get('content-type') ?? '';
      const payload = contentType.includes('application/json')
        ? await res.json().catch(() => null)
        : null;
      if (!res.ok) {
        throw new Error(
          payload?.message ?? payload?.error ?? `Failed to load history (HTTP ${res.status}).`
        );
      }
      const rows = Array.isArray(payload) ? payload : [];
      rows.sort((a, b) => {
        const da = toUtcDate(a?.localDateTime);
        const db = toUtcDate(b?.localDateTime);
        return (db?.getTime() ?? 0) - (da?.getTime() ?? 0);
      });
      setHistory(rows);
    } catch (err) {
      setHistoryError(err?.message ?? 'Could not load node history.');
      setHistory([]);
    } finally {
      setHistoryLoading(false);
    }
  }, []);

  /* ---------------- node change ---------------- */
  useEffect(() => {
    if (!nodeName) return undefined;
    const match = nodes.find((n) => n.name === nodeName);
    setNodeId(match?.id ?? null);
    setSeries({});
    setNodeData(null);
    setNodeError(null);
    setLastUpdated(null);
    setSatelliteResult(null);
    setSatelliteError(null);
    setImageError(false);
    setImageLoading(false);
    pollNode();
    loadHistory(match?.id ?? null);
    return undefined;
  }, [nodeName, nodes, pollNode, loadHistory]);

  useEffect(() => {
    if (!nodeName) return undefined;
    const timer = setInterval(pollNode, POLL_INTERVAL_MS);
    return () => clearInterval(timer);
  }, [nodeName, pollNode]);

  useEffect(() => {
    if (!nodeId) return undefined;
    const timer = setInterval(() => loadHistory(nodeId), POLL_INTERVAL_MS);
    return () => clearInterval(timer);
  }, [nodeId, loadHistory]);

  const handlePollNow = () => pollNode();
  const handleRefreshHistory = () => loadHistory(nodeId);

  /* ---------------- satellite ---------------- */
  const extractLatLng = useCallback((data) => {
    if (!data || typeof data !== 'object') return null;
    const sources = [data, data.location, data.coordinates, data.coords, data.position].filter(
      (s) => s && typeof s === 'object'
    );
    for (const src of sources) {
      const lat = src.latitude ?? src.lat ?? src.Latitude ?? src.LAT ?? null;
      const lng = src.longitude ?? src.lng ?? src.lon ?? src.Longitude ?? src.LNG ?? null;
      if (lat !== null && lng !== null) {
        const numLat = Number(lat);
        const numLng = Number(lng);
        if (Number.isFinite(numLat) && Number.isFinite(numLng)) {
          return { latitude: numLat, longitude: numLng };
        }
      }
    }
    return null;
  }, []);

  const handleCheckSatellite = useCallback(async () => {
    setSatelliteError(null);
    setSatelliteResult(null);
    setImageError(false);
    setImageLoading(false);
    const coords = extractLatLng(nodeData);
    if (!coords) {
      setSatelliteError(
        'No latitude/longitude found in this node’s response. Make sure the node payload includes them.'
      );
      return;
    }
    setSatelliteLoading(true);
    try {
      const res = await fetch(SATELLITE_API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(coords),
      });
      const contentType = res.headers.get('content-type') ?? '';
      const payload = contentType.includes('application/json')
        ? await res.json().catch(() => null)
        : null;
      if (!res.ok) {
        throw new Error(
          payload?.message ?? `Satellite request failed with status ${res.status}.`
        );
      }
      setSatelliteResult({ ...payload, _coords: coords });
      if (payload?.images?.pngUrl) setImageLoading(true);
    } catch (err) {
      setSatelliteError(err?.message ?? 'Could not reach the satellite backend.');
    } finally {
      setSatelliteLoading(false);
    }
  }, [nodeData, extractLatLng]);

  const refreshedAt = lastUpdated ? formatLocalTime(lastUpdated) : null;

  /* ---------------- derived ---------------- */
  const filteredHistory = useMemo(() => {
    const q = debouncedHistorySearch.trim().toLowerCase();
    if (!q) return history;
    return history.filter((row) =>
      Object.values(row).some((v) => String(v ?? '').toLowerCase().includes(q))
    );
  }, [history, debouncedHistorySearch]);

  const historyChartData = useMemo(() => {
    if (!history.length) return [];
    const asc = [...history].sort((a, b) => {
      const da = toUtcDate(a?.localDateTime);
      const db = toUtcDate(b?.localDateTime);
      return (da?.getTime() ?? 0) - (db?.getTime() ?? 0);
    });
    return asc.map((row) => ({
      t: row.localDateTime,
      label: formatShortTime(row.localDateTime),
      soilMoisture: row.soilMoisture,
      tiltAngle: row.tiltAngle,
      rainDrops: row.rainDrops,
      sound: row.sound,
      vibrations: row.vibrations,
      temp: row.temp,
      humidity: row.humidity,
    }));
  }, [history]);

  const currentReadings = useMemo(() => {
    if (!nodeData || typeof nodeData !== 'object') return [];
    return READINGS_CONFIG.map((config) => {
      const value = nodeData[config.key];
      const status = readStatus(config, value);
      return { config, value, status };
    });
  }, [nodeData]);

  return (
    <div>
      <h1 className="text-2xl font-semibold tracking-tight">Live Sensor Monitoring</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Real node telemetry polled every 15 seconds, plus the full sensor history of the selected
        node. All timestamps are shown in IST.
      </p>

      {/* ---------------- live node console ---------------- */}
      <section aria-labelledby="live-node-heading" className="mt-8">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 id="live-node-heading" className="text-lg font-bold text-[#0a2f5a]">
            Node telemetry — live backend
          </h2>
          <div className="flex items-center gap-2">
            {nodeLoading && <Spinner size="sm" />}
            <Badge variant="success">Live · polling every 15 s</Badge>
          </div>
        </div>

        <div className="mt-4 rounded-xl border bg-white shadow-sm">
          <div className="grid gap-4 px-5 py-4 sm:grid-cols-[1fr_auto] sm:items-end">
            <div>
              <label
                htmlFor="live-node-select"
                className="mb-1.5 block text-sm font-medium text-secondary-700"
              >
                Node
              </label>
              {nodesLoading ? (
                <Skeleton className="h-10 w-full" />
              ) : (
                <select
                  id="live-node-select"
                  value={nodeName}
                  onChange={(event) => setNodeName(event.target.value)}
                  className="block h-10 w-full rounded-md border border-input bg-white px-3 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-ring"
                >
                  {nodes.length === 0 && <option value="">No nodes returned</option>}
                  {nodes.map((n) => (
                    <option key={n.id ?? n.name} value={n.name}>
                      {n.name}
                    </option>
                  ))}
                </select>
              )}
            </div>
            <div className="flex flex-wrap items-center gap-3 sm:justify-end">
              <p className="text-xs text-secondary-500">
                {refreshedAt ? `Last poll ${refreshedAt} IST` : 'Not polled yet'}
              </p>
              <Button
                variant="outline"
                size="sm"
                onClick={handlePollNow}
                disabled={!nodeName || nodeLoading}
              >
                <RefreshCw
                  className={`h-3.5 w-3.5 ${nodeLoading ? 'animate-spin' : ''}`}
                  aria-hidden="true"
                />
                Poll now
              </Button>
              <Button
                size="sm"
                onClick={handleCheckSatellite}
                disabled={!nodeData || satelliteLoading}
                title="Send this node's latitude/longitude to the satellite prediction API"
              >
                {satelliteLoading ? (
                  <Spinner size="sm" className="mr-1.5" />
                ) : (
                  <Satellite className="mr-1.5 h-3.5 w-3.5" aria-hidden="true" />
                )}
                Check satellite
              </Button>
            </div>
          </div>

          {(satelliteLoading || satelliteResult || satelliteError) && (
            <div className="border-t px-5 py-4">
              <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-secondary-500">
                Satellite landslide prediction
              </p>

              {satelliteLoading && (
                <div className="flex items-center gap-2 text-sm text-secondary-600">
                  <Spinner size="sm" />
                  Querying satellite backend…
                </div>
              )}

              {satelliteError && !satelliteLoading && (
                <ErrorMessage title="Satellite check failed" message={satelliteError} />
              )}

              {satelliteResult && !satelliteLoading && (
                <div className="rounded-lg border bg-secondary-50/60 p-4">
                  <div className="flex flex-wrap items-center gap-3">
                    <Badge
                      variant={
                        satelliteResult.landslide === true ||
                        String(satelliteResult.verdict).toLowerCase() === 'yes'
                          ? 'danger'
                          : 'success'
                      }
                    >
                      {satelliteResult.landslide === true ||
                      String(satelliteResult.verdict).toLowerCase() === 'yes'
                        ? 'Landslide risk detected'
                        : 'No landslide detected'}
                    </Badge>
                    <span className="text-sm text-secondary-700">
                      Verdict: <strong>{satelliteResult.verdict ?? '—'}</strong>
                    </span>
                    {typeof satelliteResult.probability === 'number' && (
                      <span className="text-sm text-secondary-700">
                        Probability:{' '}
                        <strong>{(satelliteResult.probability * 100).toFixed(2)}%</strong>
                      </span>
                    )}
                    {typeof satelliteResult.threshold === 'number' && (
                      <span className="text-sm text-secondary-500">
                        Threshold: {satelliteResult.threshold}
                      </span>
                    )}
                  </div>

                  {satelliteResult?.images?.pngUrl && (
                    <div className="mt-4">
                      <div className="mb-1.5 flex items-center justify-between">
                        <p className="text-xs font-semibold uppercase tracking-wider text-secondary-500">
                          Sentinel-2 satellite preview
                        </p>
                        <a
                          href={satelliteResult.images.pngUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1 text-xs font-medium text-[#0a2f5a] underline hover:no-underline"
                        >
                          <Download className="h-3 w-3" aria-hidden="true" />
                          Open PNG
                        </a>
                      </div>
                      <div className="relative overflow-hidden rounded-lg border bg-secondary-100">
                        {imageLoading && !imageError && (
                          <div className="absolute inset-0 flex items-center justify-center bg-secondary-50/70">
                            <Spinner size="sm" />
                          </div>
                        )}
                        {imageError ? (
                          <div className="flex h-40 items-center justify-center px-4 text-center text-xs text-secondary-500">
                            Could not load the satellite preview. You can still{' '}
                            <a
                              href={satelliteResult.images.pngUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="ml-1 underline"
                            >
                              open it in a new tab
                            </a>
                            .
                          </div>
                        ) : (
                          <img
                            src={satelliteResult.images.pngUrl}
                            alt={`Sentinel-2 satellite patch around ${satelliteResult._coords?.latitude}, ${satelliteResult._coords?.longitude}`}
                            className="block max-h-80 w-full object-contain"
                            loading="lazy"
                            onLoad={() => setImageLoading(false)}
                            onError={() => {
                              setImageLoading(false);
                              setImageError(true);
                            }}
                          />
                        )}
                      </div>
                    </div>
                  )}

                  {satelliteResult?.images?.tiffUrl && (
                    <div className="mt-3">
                      <a
                        href={satelliteResult.images.tiffUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 text-xs font-medium text-secondary-600 underline hover:no-underline"
                      >
                        <Download className="h-3 w-3" aria-hidden="true" />
                        Download raw TIFF
                      </a>
                    </div>
                  )}

                  {satelliteResult.note && (
                    <p className="mt-2 text-xs italic text-secondary-500">
                      {satelliteResult.note}
                    </p>
                  )}
                </div>
              )}
            </div>
          )}

          {nodesError && (
            <div className="px-5 pb-4">
              <ErrorMessage
                title="Node list unavailable"
                message={nodesError}
                onRetry={() => setNodesAttempt((attempt) => attempt + 1)}
              />
            </div>
          )}
        </div>

        {currentReadings.length > 0 && (
          <div className="mt-6">
            <div className="mb-2 flex items-center justify-between">
              <h3 className="text-sm font-bold uppercase tracking-wider text-[#0a2f5a]">
                Current readings
              </h3>
              <p className="text-xs text-secondary-500">
                Normal ranges per sensor · green = normal, amber = elevated, red = critical
              </p>
            </div>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {currentReadings.map(({ config, value, status }) => (
                <ReadingCard key={config.key} config={config} value={value} status={status} />
              ))}
            </div>
          </div>
        )}

        <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {LIVE_METRICS.map((metric) => (
            <TelemetryChart
              key={metric.key}
              title={metric.title}
              unit={metric.unit}
              color={metric.color}
              threshold={metric.threshold}
              points={series[metric.key] ?? []}
            />
          ))}
        </div>

        {nodeData && typeof nodeData === 'object' && (
          <div className="mt-6">
            <div className="mb-2 flex items-center justify-between rounded-t-lg border-b-2 border-amber-400 bg-gradient-to-r from-[#0a2f5a] to-[#134b8a] px-4 py-2.5">
              <p className="text-sm font-bold uppercase tracking-wider text-white">
                Latest node response
              </p>
              <span className="text-[11px] font-medium text-white/80">
                Timestamps in IST
              </span>
            </div>
            <ul className="divide-y divide-secondary-100 overflow-hidden rounded-b-lg border">
              {Object.entries(nodeData)
                .filter(([, value]) => typeof value !== 'object' || value === null)
                .map(([key, value]) => (
                  <li
                    key={key}
                    className="flex items-center justify-between gap-4 px-4 py-2 text-sm odd:bg-white even:bg-secondary-50/60"
                  >
                    <span className="font-medium text-secondary-600">{key}</span>
                    <span className="break-all text-right font-mono text-[13px] text-secondary-900">
                      {formatRawValue(value, key)}
                    </span>
                  </li>
                ))}
            </ul>
          </div>
        )}
      </section>

      {/* ---------------- node history ---------------- */}
      <section aria-labelledby="history-heading" className="mt-12">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 id="history-heading" className="text-lg font-bold text-[#0a2f5a]">
              Sensor history — {nodeName || 'no node selected'}
            </h2>
            <p className="text-xs text-secondary-500">
              Every reading persisted for this node, newest first. Auto-refreshing every 15 s.
            </p>
          </div>
          <div className="flex items-center gap-2">
            {historyLoading && <Spinner size="sm" />}
            <Button
              variant="outline"
              size="sm"
              onClick={handleRefreshHistory}
              disabled={nodeId === null || historyLoading}
            >
              <RefreshCw
                className={`h-3.5 w-3.5 ${historyLoading ? 'animate-spin' : ''}`}
                aria-hidden="true"
              />
              Refresh history
            </Button>
          </div>
        </div>

        {historyChartData.length > 1 && (
          <div className="mt-4 rounded-xl border bg-white p-4 shadow-sm">
            <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-secondary-500">
              Trend — soil moisture, rain, humidity (last {historyChartData.length} samples)
            </p>
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={historyChartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis
                    dataKey="label"
                    tick={{ fontSize: 11 }}
                    stroke="#94a3b8"
                    minTickGap={24}
                  />
                  <YAxis tick={{ fontSize: 11 }} stroke="#94a3b8" />
                  <Tooltip
                    contentStyle={{ fontSize: 12, borderRadius: 8, borderColor: '#e2e8f0' }}
                    labelStyle={{ fontWeight: 600 }}
                  />
                  <Line
                    type="monotone"
                    dataKey="soilMoisture"
                    stroke="#2563eb"
                    strokeWidth={2}
                    dot={false}
                    name="Soil moisture (%)"
                  />
                  <Line
                    type="monotone"
                    dataKey="rainDrops"
                    stroke="#0891b2"
                    strokeWidth={2}
                    dot={false}
                    name="Rainfall (%)"
                  />
                  <Line
                    type="monotone"
                    dataKey="humidity"
                    stroke="#7c3aed"
                    strokeWidth={2}
                    dot={false}
                    name="Humidity (%)"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        <div className="mt-4 max-w-md">
          <div className="relative">
            <Search
              className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
              aria-hidden="true"
            />
            <input
              type="search"
              placeholder="Search readings by value or time…"
              value={historySearch}
              onChange={(e) => setHistorySearch(e.target.value)}
              className="block h-10 w-full rounded-md border border-input bg-white pl-9 pr-3 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-ring"
              aria-label="Search history"
            />
          </div>
        </div>

        {historyLoading ? (
          <HistoryTableSkeleton />
        ) : historyError ? (
          <ErrorMessage
            title="Could not load history"
            message={historyError}
            onRetry={handleRefreshHistory}
            className="mt-6"
          />
        ) : filteredHistory.length === 0 ? (
          <div className="mt-6 rounded-xl border bg-white px-6 py-10 text-center shadow-sm">
            <p className="text-sm text-secondary-500">
              {history.length === 0
                ? 'No history recorded for this node yet.'
                : 'No rows match your search.'}
            </p>
          </div>
        ) : (
          <>
            <p className="mt-4 text-sm text-muted-foreground" role="status">
              Showing {filteredHistory.length} of {history.length} readings
            </p>

            <div className="mt-3 overflow-x-auto rounded-xl border shadow-sm">
              <table className="w-full min-w-[960px] border-collapse bg-white text-left text-sm">
                <caption className="sr-only">
                  Full sensor history for the selected node, newest first
                </caption>
                <thead className="sticky top-0 z-10">
                  <tr className="border-b bg-secondary-100 text-xs uppercase tracking-wider text-secondary-600">
                    <th scope="col" className="px-4 py-3 font-semibold">Timestamp (IST)</th>
                    <th scope="col" className="px-4 py-3 text-right font-semibold">Soil moisture</th>
                    <th scope="col" className="px-4 py-3 text-right font-semibold">Rainfall</th>
                    <th scope="col" className="px-4 py-3 text-right font-semibold">Vibrations</th>
                    <th scope="col" className="px-4 py-3 text-right font-semibold">Tilt</th>
                    <th scope="col" className="px-4 py-3 text-right font-semibold">Sound</th>
                    <th scope="col" className="px-4 py-3 text-right font-semibold">Humidity</th>
                    <th scope="col" className="px-4 py-3 text-right font-semibold">Temp</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-secondary-100">
                  {filteredHistory.map((row, index) => (
                    <tr
                      key={`${row.nodeId ?? 'n'}-${row.localDateTime ?? index}-${index}`}
                      className="transition-colors hover:bg-secondary-50"
                    >
                      <th
                        scope="row"
                        className="whitespace-nowrap px-4 py-3 font-medium text-[#0a2f5a]"
                      >
                        {formatFriendlyDateTime(row.localDateTime)}
                      </th>
                      <NumericCell value={row.soilMoisture} unit="%" />
                      <NumericCell value={row.rainDrops} unit="%" />
                      <NumericCell value={row.vibrations} unit="%" />
                      <NumericCell value={row.tiltAngle} unit="°" />
                      <NumericCell value={row.sound} unit="" />
                      <NumericCell value={row.humidity} unit="%" />
                      <NumericCell value={row.temp} unit="°C" />
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </section>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Sub-components                                                      */
/* ------------------------------------------------------------------ */

function ReadingCard({ config, value, status }) {
  const num = Number(value);
  const pct = Number.isFinite(num)
    ? Math.max(0, Math.min(100, ((num - config.min) / (config.max - config.min)) * 100))
    : 0;

  const barColor =
    status.key === 'critical'
      ? 'bg-red-500'
      : status.key === 'elevated'
        ? 'bg-amber-500'
        : status.key === 'normal'
          ? 'bg-emerald-500'
          : 'bg-secondary-300';

  return (
    <div className="rounded-xl border bg-white p-4 shadow-sm">
      <div className="flex items-start justify-between gap-2">
        <p className="text-xs font-semibold uppercase tracking-wider text-secondary-500">
          {config.label}
        </p>
        <span
          className={`rounded-full border px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
            STATUS_TONE_CLASSES[status.tone]
          }`}
        >
          {status.label}
        </span>
      </div>

      <p className="mt-2 text-2xl font-bold tabular-nums text-secondary-900">
        {value === null || value === undefined
          ? '—'
          : Number.isInteger(num)
            ? num
            : num.toFixed(2)}
        <span className="ml-0.5 text-sm font-semibold text-secondary-500">{config.unit}</span>
      </p>

      <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-secondary-100">
        <div className={`h-full ${barColor}`} style={{ width: `${pct}%` }} />
      </div>

      <div className="mt-2 flex items-center justify-between text-[11px] text-secondary-500">
        <span>
          Normal &lt; {config.warn}
          {config.unit}
        </span>
        <span>
          Critical ≥ {config.critical}
          {config.unit}
        </span>
      </div>
    </div>
  );
}

function NumericCell({ value, unit = '' }) {
  if (value === null || value === undefined || value === '') {
    return <td className="px-4 py-3 text-right font-mono text-secondary-400">—</td>;
  }
  const num = Number(value);
  const display = Number.isFinite(num) && !Number.isInteger(num) ? num.toFixed(2) : String(value);
  return (
    <td className="whitespace-nowrap px-4 py-3 text-right font-mono tabular-nums text-secondary-900">
      {display}
      {unit}
    </td>
  );
}

function HistoryTableSkeleton() {
  return (
    <div className="mt-4 overflow-hidden rounded-xl border" aria-hidden="true">
      <div className="space-y-3 bg-white p-4">
        {[0, 1, 2, 3, 4].map((row) => (
          <div key={row} className="flex items-center gap-4">
            <Skeleton className="h-4 w-40" />
            <Skeleton className="h-4 w-16" />
            <Skeleton className="h-4 w-16" />
            <Skeleton className="h-4 w-16" />
            <Skeleton className="h-4 w-16" />
            <Skeleton className="h-4 w-16" />
            <Skeleton className="h-4 w-16" />
            <Skeleton className="h-4 w-16" />
          </div>
        ))}
      </div>
    </div>
  );
}