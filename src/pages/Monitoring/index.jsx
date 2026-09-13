import { useMemo, useState } from 'react';
import {
  ArrowDownRight,
  ArrowRight,
  ArrowUpRight,
  LayoutGrid,
  Minus,
  Search,
  SearchX,
  Table2,
} from 'lucide-react';
import useFetch from '../../hooks/useFetch';
import useDebounce from '../../hooks/useDebounce';
import sensorService from '../../services/sensorService';
import SensorCard from '../../components/features/monitoring/SensorCard';
import TelemetryChart from '../../components/features/monitoring/TelemetryChart';
import StationApiExplorer from '../../components/features/monitoring/StationApiExplorer';
import { TELEMETRY, sensorTrend } from '../../components/features/monitoring/telemetryData';
import { Input } from '../../components/ui/Input';
import { SelectField } from '../../components/ui/Select';
import { Button } from '../../components/ui/Button';
import { Skeleton } from '../../components/ui/Skeleton';
import { Card, CardContent } from '../../components/ui/Card';
import EmptyState from '../../components/ui/EmptyState';
import ErrorMessage from '../../components/ui/ErrorMessage';
import { Badge } from '../../components/ui/Badge';
import {
  RISK_LEVELS,
  riskLevelLabel,
} from '../../constants/riskLevels';
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

const TREND_ICONS = {
  up: { Icon: ArrowUpRight, class: 'text-red-600 bg-red-50' },
  down: { Icon: ArrowDownRight, class: 'text-emerald-600 bg-emerald-50' },
  flat: { Icon: Minus, class: 'text-secondary-600 bg-secondary-100' },
};

/**
 * Advanced monitoring console: six telemetry charts (rain, tilt, soil
 * moisture, vibration, frequency, humidity) plus a searchable station
 * register with card and table views.
 */
export default function Monitoring() {
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

  return (
    <div>
      <div className="sm:flex sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Live Sensor Monitoring</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Telemetry console for rainfall, tilt, soil moisture, vibration, frequency and humidity —
            sample data refreshed hourly.
          </p>
        </div>
      </div>

      {/* Telemetry overview */}
      <section aria-labelledby="telemetry-heading" className="mt-8">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 id="telemetry-heading" className="text-lg font-bold text-[#0a2f5a]">
            Telemetry — last 24 hours
          </h2>
          <Badge variant="warning">Sample data · hourly resolution</Badge>
        </div>
        <div className="mt-4 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {TELEMETRY.map((metric) => (
            <TelemetryChart key={metric.key} {...metric} />
          ))}
        </div>
      </section>

      {/* Live-API explorer — real backend endpoints, not the mock layer */}
      <section aria-labelledby="live-api-heading" className="mt-12">
        <h2 id="live-api-heading" className="text-lg font-bold text-[#0a2f5a]">
          Station data explorer
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Pulls live station readings straight from the API — populate the dropdowns and inspect the
          raw response.
        </p>
        <div className="mt-4">
          <StationApiExplorer />
        </div>
      </section>

      {/* Station register */}
      <section aria-labelledby="stations-heading" className="mt-12">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 id="stations-heading" className="text-lg font-bold text-[#0a2f5a]">
            Station register
          </h2>
          <div
            role="group"
            aria-label="Station view"
            className="inline-flex overflow-hidden rounded-md border"
          >
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
                            <span
                              className={`inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs font-semibold ${Trend.class}`}
                            >
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
