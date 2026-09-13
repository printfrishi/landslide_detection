import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  ArrowDownRight,
  ArrowRight,
  ArrowUpRight,
  LayoutGrid,
  Minus,
  RefreshCw,
  Search,
  SearchX,
  Table2,
} from 'lucide-react';
import useFetch from '../../hooks/useFetch';
import useDebounce from '../../hooks/useDebounce';
import { getNodeByName, getNodes } from '../../services/api';
import sensorService from '../../services/sensorService';
import SensorCard from '../../components/features/monitoring/SensorCard';
import TelemetryChart from '../../components/features/monitoring/TelemetryChart';
import { LIVE_METRICS, sensorTrend, toNodeNames } from '../../components/features/monitoring/telemetryData';
import { Input } from '../../components/ui/Input';
import { SelectField } from '../../components/ui/Select';
import { Button } from '../../components/ui/Button';
import { Skeleton } from '../../components/ui/Skeleton';
import { Card, CardContent } from '../../components/ui/Card';
import EmptyState from '../../components/ui/EmptyState';
import ErrorMessage from '../../components/ui/ErrorMessage';
import { Badge } from '../../components/ui/Badge';
import Spinner from '../../components/ui/Spinner';
import { RISK_LEVELS, riskLevelLabel } from '../../constants/riskLevels';
import {
  SENSOR_STATUSES,
  SENSOR_TYPES,
  SENSOR_STATUS_VARIANTS,
  SENSOR_STATUS_LABELS,
  SENSOR_TYPE_LABELS,
} from '../../constants/sensors';
import { timeAgo } from '../../utils/formatters';

const DEFAULT_FILTERS = { search: '', type: 'all', status: 'all' };
const TYPE_OPTIONS = [{ value: 'all', label: 'All types' }, ...SENSOR_TYPES];
const STATUS_OPTIONS = [{ value: 'all', label: 'All statuses' }, ...SENSOR_STATUSES];
const POLL_INTERVAL_MS = 15000;

const TREND_ICONS = {
  up: { Icon: ArrowUpRight, class: 'text-red-600 bg-red-50' },
  down: { Icon: ArrowDownRight, class: 'text-emerald-600 bg-emerald-50' },
  flat: { Icon: Minus, class: 'text-secondary-600 bg-secondary-100' },
};

const formatValue = (value) => {
  if (value === null || value === undefined || value === '') return '—';
  if (typeof value === 'number') return Number.isInteger(value) ? String(value) : value.toFixed(2);
  if (typeof value === 'boolean') return value ? 'Yes' : 'No';
  if (typeof value === 'object') return Array.isArray(value) ? `${value.length} items` : `${Object.keys(value).length} fields`;
  return String(value);
};

/**
 * Advanced monitoring console: a live node selector polls the hosted backend
 * every 15 s and feeds REAL readings into the six telemetry charts (rain,
 * tilt, soil moisture, vibration, humidity, temperature). Below it, the
 * demo station register keeps its search, filters and card/table views.
 */
export default function Monitoring() {
  /* ---------------- station register (demo sensor set) ---------------- */
  const { data: sensors, isLoading, error, refetch } = useFetch(() => sensorService.getSensors(), []);
  const [search, setSearch] = useState(DEFAULT_FILTERS.search);
  const [type, setType] = useState(DEFAULT_FILTERS.type);
  const [status, setStatus] = useState(DEFAULT_FILTERS.status);
  const [view, setView] = useState('cards');
  const debouncedSearch = useDebounce(search, 300);

  const filtered = useMemo(() => {
    if (!sensors) return [];
    const query = debouncedSearch.trim().toLowerCase();
    return sensors.filter((sensor) => {
      const matchesSearch =
        !query ||
        sensor.name.toLowerCase().includes(query) ||
        sensor.zone.toLowerCase().includes(query);
      const matchesType = type === 'all' || sensor.type === type;
      const matchesStatus = status === 'all' || sensor.status === status;
      return matchesSearch && matchesType && matchesStatus;
    });
  }, [sensors, debouncedSearch, type, status]);

  const filtersActive =
    debouncedSearch.trim() !== '' || type !== DEFAULT_FILTERS.type || status !== DEFAULT_FILTERS.status;

  const clearFilters = () => {
    setSearch(DEFAULT_FILTERS.search);
    setType(DEFAULT_FILTERS.type);
    setStatus(DEFAULT_FILTERS.status);
  };

  /* ---------------- live node console (real API) ---------------- */
  const [nodes, setNodes] = useState([]);
  const [nodesLoading, setNodesLoading] = useState(true);
  const [nodesError, setNodesError] = useState(null);
  const [nodeName, setNodeName] = useState('');
  const [nodeData, setNodeData] = useState(null);
  const [nodeLoading, setNodeLoading] = useState(false);
  const [nodeError, setNodeError] = useState(null);
  const [series, setSeries] = useState({});
  const [lastUpdated, setLastUpdated] = useState(null);
  const [nodesAttempt, setNodesAttempt] = useState(0);
  const nodeNameRef = useRef(nodeName);
  nodeNameRef.current = nodeName;

  // Populate the node dropdown on mount (and on retry).
  useEffect(() => {
    let active = true;
    setNodesLoading(true);
    setNodesError(null);
    getNodes()
      .then((payload) => {
        if (!active) return;
        const names = toNodeNames(payload);
        setNodes(names);
        setNodeName((current) => current || names[0] || '');
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

  // One poll = fetch the node snapshot and append real readings to each series.
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

  // New node selected: reset collected history and poll immediately.
  useEffect(() => {
    if (!nodeName) return undefined;
    setSeries({});
    setNodeData(null);
    setNodeError(null);
    setLastUpdated(null);
    pollNode();
    return undefined;
  }, [nodeName, pollNode]);

  // Poll again every 15 s so the charts accumulate real readings.
  useEffect(() => {
    if (!nodeName) return undefined;
    const timer = setInterval(pollNode, POLL_INTERVAL_MS);
    return () => clearInterval(timer);
  }, [nodeName, pollNode]);

  const handlePollNow = () => pollNode();

  const refreshedAt = lastUpdated
    ? lastUpdated.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit', second: '2-digit' })
    : null;

  return (
    <div>
      <h1 className="text-2xl font-semibold tracking-tight">Live Sensor Monitoring</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Real node telemetry polled every 15 seconds, plus the demo station register with search,
        filters and table view.
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
              <label htmlFor="live-node-select" className="mb-1.5 block text-sm font-medium text-secondary-700">
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
                  {nodes.map((name) => (
                    <option key={name} value={name}>
                      {name}
                    </option>
                  ))}
                </select>
              )}
            </div>
            <div className="flex items-center gap-3 sm:justify-end">
              <p className="text-xs text-secondary-500">
                {refreshedAt ? `Last poll ${refreshedAt}` : 'Not polled yet'}
              </p>
              <Button
                variant="outline"
                size="sm"
                onClick={handlePollNow}
                disabled={!nodeName || nodeLoading}
              >
                <RefreshCw className={`h-3.5 w-3.5 ${nodeLoading ? 'animate-spin' : ''}`} aria-hidden="true" />
                Poll now
              </Button>
            </div>
          </div>

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

        {/* six live charts */}
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

        {/* raw node fields */}
        {nodeData && typeof nodeData === 'object' && (
          <div className="mt-6">
            <div className="mb-2 flex items-center gap-2 rounded-t-lg border-b-2 border-amber-400 bg-gradient-to-r from-[#0a2f5a] to-[#134b8a] px-4 py-2.5">
              <p className="text-sm font-bold uppercase tracking-wider text-white">
                Latest node response
              </p>
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
                      {formatValue(value)}
                    </span>
                  </li>
                ))}
            </ul>
          </div>
        )}
      </section>

      {/* ---------------- demo station register ---------------- */}
      <section aria-labelledby="stations-heading" className="mt-12">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 id="stations-heading" className="text-lg font-bold text-[#0a2f5a]">
              Station register
            </h2>
            <p className="text-xs text-secondary-500">Demo sensor set — sample trends</p>
          </div>
          <div role="group" aria-label="Station view" className="inline-flex overflow-hidden rounded-md border">
            {[
              { key: 'cards', label: 'Cards', Icon: LayoutGrid },
              { key: 'table', label: 'Table', Icon: Table2 },
            ].map(({ key, label, Icon }) => (
              <button
                key={key}
                type="button"
                aria-pressed={view === key}
                onClick={() => setView(key)}
                className={`inline-flex items-center gap-1.5 px-3.5 py-2 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
                  view === key
                    ? 'bg-[#0a2f5a] text-white'
                    : 'bg-white text-secondary-700 hover:bg-secondary-100'
                }`}
              >
                <Icon className="h-4 w-4" aria-hidden="true" />
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Filter bar */}
        <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-end">
          <div className="relative flex-1">
            <Search
              className="pointer-events-none absolute left-3 top-[38px] h-4 w-4 -translate-y-1/2 text-muted-foreground"
              aria-hidden="true"
            />
            <Input
              label="Search"
              name="search"
              type="search"
              placeholder="Search by sensor name or zone…"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              inputClassName="pl-9"
              aria-label="Search sensors by name or zone"
            />
          </div>
          <SelectField
            label="Type"
            value={type}
            onValueChange={setType}
            options={TYPE_OPTIONS}
            className="sm:w-44"
          />
          <SelectField
            label="Status"
            value={status}
            onValueChange={setStatus}
            options={STATUS_OPTIONS}
            className="sm:w-44"
          />
        </div>

        {/* Results */}
        {isLoading ? (
          view === 'cards' ? (
            <MonitoringSkeleton />
          ) : (
            <TableSkeleton />
          )
        ) : error ? (
          <ErrorMessage
            title="Could not load sensors"
            message="The sensor service did not respond. Try again in a moment."
            onRetry={refetch}
            className="mt-6"
          />
        ) : filtered.length === 0 ? (
          <EmptyState
            icon={SearchX}
            title="No sensors found"
            description={
              filtersActive
                ? 'No sensors match your current search and filters. Try different keywords or clear the filters.'
                : 'No sensors have been deployed yet.'
            }
            action={
              filtersActive ? (
                <Button variant="outline" onClick={clearFilters}>
                  Clear filters
                </Button>
              ) : null
            }
            className="mt-6"
          />
        ) : (
          <>
            <p className="mt-6 text-sm text-muted-foreground" role="status">
              Showing {filtered.length} of {sensors.length} stations
            </p>

            {view === 'cards' ? (
              <div className="mt-3 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                {filtered.map((sensor) => (
                  <SensorCard key={sensor.id} sensor={sensor} />
                ))}
              </div>
            ) : (
              <div className="mt-3 overflow-x-auto rounded-xl border shadow-sm">
                <table className="w-full min-w-[820px] border-collapse bg-white text-left text-sm">
                  <caption className="sr-only">
                    Station register with latest readings, 24-hour trend, risk and status
                  </caption>
                  <thead>
                    <tr className="border-b bg-secondary-100 text-xs uppercase tracking-wider text-secondary-600">
                      <th scope="col" className="px-4 py-3 font-semibold">Station</th>
                      <th scope="col" className="px-4 py-3 font-semibold">Zone</th>
                      <th scope="col" className="px-4 py-3 font-semibold">Type</th>
                      <th scope="col" className="px-4 py-3 font-semibold">Latest</th>
                      <th scope="col" className="px-4 py-3 font-semibold">24 h trend</th>
                      <th scope="col" className="px-4 py-3 font-semibold">Risk</th>
                      <th scope="col" className="px-4 py-3 font-semibold">Status</th>
                      <th scope="col" className="px-4 py-3 font-semibold">Updated</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-secondary-100">
                    {filtered.map((sensor) => {
                      const trend = sensorTrend(sensor);
                      const Trend = TREND_ICONS[trend.direction];
                      return (
                        <tr key={sensor.id} className="transition-colors hover:bg-secondary-50">
                          <th scope="row" className="px-4 py-3 font-semibold text-[#0a2f5a]">
                            {sensor.name}
                          </th>
                          <td className="px-4 py-3 text-secondary-700">{sensor.zone}</td>
                          <td className="px-4 py-3 text-secondary-700">
                            {SENSOR_TYPE_LABELS[sensor.type] ?? sensor.type}
                          </td>
                          <td className="px-4 py-3 font-semibold tabular-nums text-secondary-900">
                            {sensor.lastReading} {sensor.unit}
                          </td>
                          <td className="px-4 py-3">
                            <span className={`inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs font-semibold ${Trend.class}`}>
                              <Trend.Icon className="h-3.5 w-3.5" aria-hidden="true" />
                              {trend.direction === 'flat' ? 'steady' : `${trend.changePct}%`}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <Badge variant={RISK_LEVELS[sensor.riskLevel]?.variant ?? 'neutral'}>
                              {riskLevelLabel(sensor.riskLevel)}
                            </Badge>
                          </td>
                          <td className="px-4 py-3">
                            <Badge variant={SENSOR_STATUS_VARIANTS[sensor.status] ?? 'neutral'}>
                              {SENSOR_STATUS_LABELS[sensor.status] ?? sensor.status}
                            </Badge>
                          </td>
                          <td className="px-4 py-3 text-secondary-500">{timeAgo(sensor.updatedAt)}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </>
        )}
      </section>
    </div>
  );
}

/** Inline panel header used for the raw node response list. */
function PortalPanelLike({ title }) {
  return (
    <div className="mb-2 flex items-center gap-2 rounded-t-lg border-b-2 border-amber-400 bg-gradient-to-r from-[#0a2f5a] to-[#134b8a] px-4 py-2.5">
      <p className="text-sm font-bold uppercase tracking-wider text-white">{title}</p>
    </div>
  );
}

function MonitoringSkeleton() {
  return (
    <div className="mt-3 grid gap-4 sm:grid-cols-2 xl:grid-cols-3" aria-hidden="true">
      {[0, 1, 2, 3, 4, 5].map((index) => (
        <Card key={index}>
          <CardContent className="pt-6">
            <div className="flex items-start gap-3">
              <Skeleton className="h-10 w-10 rounded-md" />
              <div className="w-full space-y-2">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-3 w-1/2" />
              </div>
            </div>
            <div className="mt-4 flex items-end justify-between">
              <Skeleton className="h-8 w-24" />
              <Skeleton className="h-5 w-16 rounded-md" />
            </div>
          </CardContent>
          <div className="flex items-center justify-between border-t px-6 py-3">
            <Skeleton className="h-5 w-20 rounded-md" />
            <Skeleton className="h-3 w-24" />
          </div>
        </Card>
      ))}
    </div>
  );
}

function TableSkeleton() {
  return (
    <div className="mt-3 overflow-hidden rounded-xl border" aria-hidden="true">
      <div className="space-y-3 bg-white p-4">
        {[0, 1, 2, 3, 4].map((row) => (
          <div key={row} className="flex items-center gap-4">
            <Skeleton className="h-4 w-1/3" />
            <Skeleton className="h-4 w-16" />
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-4 w-16" />
            <Skeleton className="h-5 w-16 rounded-md" />
          </div>
        ))}
      </div>
    </div>
  );
}
