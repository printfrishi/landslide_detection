import { useEffect, useState } from 'react';
import { Plug, RefreshCw } from 'lucide-react';
import { getNodeByName, getNodes } from '../../../services/api';
import Spinner from '../../ui/Spinner';
import Skeleton from '../../ui/Skeleton';
import ErrorMessage from '../../ui/ErrorMessage';

const NODES_BACKEND_URL = 'https://landslideearlywarning-system-backend.onrender.com';

const SELECT_CLASSES =
  'block h-10 w-full rounded-md border border-input bg-white px-3 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-ring disabled:cursor-not-allowed disabled:opacity-60';

/** Preferred metrics rendered as cards, in this order, when present in the payload. */
const PREFERRED_METRICS = [
  ['temp', 'Temperature', '°C'],
  ['humidity', 'Humidity', '%'],
  ['soilMoisture', 'Soil Moisture', '%'],
  ['tiltAngle', 'Tilt Angle', '°'],
  ['vibrations', 'Vibrations', 'mm/s'],
  ['rainDrops', 'Rain Drops', ''],
  ['sound', 'Sound', 'dB'],
];

function formatValue(value) {
  if (value === null || value === undefined || value === '') return '—';
  if (typeof value === 'number') return Number.isInteger(value) ? String(value) : value.toFixed(2);
  return String(value);
}

/**
 * Live node explorer for the Monitoring page: the dropdown is populated from
 * GET /nodes/getAllNodes on mount; selecting a node calls
 * GET /nodes/getbyName/:name and renders its telemetry (temp, humidity,
 * soilMoisture, tiltAngle, vibrations, …) in a metric grid. Talks to the
 * hosted backend — cold starts on free hosting can make the first fetch slow.
 */
export default function StationApiExplorer() {
  const [nodes, setNodes] = useState([]);
  const [nodesLoading, setNodesLoading] = useState(true);
  const [nodesError, setNodesError] = useState(null);
  const [nodeName, setNodeName] = useState('');

  const [nodeData, setNodeData] = useState(null);
  const [dataLoading, setDataLoading] = useState(false);
  const [dataError, setDataError] = useState(null);
  const [nodesAttempt, setNodesAttempt] = useState(0);

  // Populate the node dropdown on mount (and on retry).
  useEffect(() => {
    let active = true;
    setNodesLoading(true);
    setNodesError(null);
    getNodes()
      .then((payload) => {
        if (!active) return;
        const list = Array.isArray(payload) ? payload : (payload?.data ?? payload?.nodes ?? []);
        const names = list
          .map((raw) =>
            typeof raw === 'string' ? raw : (raw?.name ?? raw?.nodeName ?? raw?.node_name ?? null)
          )
          .filter(Boolean)
          .map(String);
        setNodes([...new Set(names)]);
        setNodeName((current) => current || names[0] || '');
      })
      .catch((error) => {
        if (active) setNodesError(error?.message ?? 'Could not load the node list.');
      })
      .finally(() => {
        if (active) setNodesLoading(false);
      });
    return () => {
      active = false;
    };
  }, [nodesAttempt]);

  // Fetch one node whenever the selection changes.
  useEffect(() => {
    if (!nodeName) return undefined;
    let active = true;
    setDataLoading(true);
    setDataError(null);
    getNodeByName(nodeName)
      .then((payload) => {
        if (active) setNodeData(payload ?? null);
      })
      .catch((error) => {
        if (active) {
          setNodeData(null);
          setDataError(error?.message ?? 'Could not load node data.');
        }
      })
      .finally(() => {
        if (active) setDataLoading(false);
      });
    return () => {
      active = false;
    };
  }, [nodeName]);

  const entries = nodeData && typeof nodeData === 'object' ? Object.entries(nodeData) : [];
  const preferred = PREFERRED_METRICS.filter(([key]) => key in (nodeData ?? {}));
  const rest = entries.filter(
    ([key, value]) =>
      !PREFERRED_METRICS.some(([metricKey]) => metricKey === key) &&
      (typeof value !== 'object' || value === null)
  );

  return (
    <div className="rounded-xl border bg-white shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-secondary-100 px-5 py-4">
        <div>
          <h3 className="text-base font-bold text-[#0a2f5a]">Node telemetry — live backend</h3>
          <p className="mt-0.5 break-all text-xs text-secondary-500">
            Wired to{' '}
            <code className="rounded bg-secondary-100 px-1 py-0.5 font-mono text-[11px]">
              {NODES_BACKEND_URL}
            </code>{' '}
            (via Vite proxy)
          </p>
        </div>
        <span className="inline-flex items-center gap-1.5 rounded-full border border-sky-200 bg-sky-50 px-2.5 py-1 text-[11px] font-semibold text-sky-800">
          <Plug className="h-3.5 w-3.5" aria-hidden="true" />
          Real API
        </span>
      </div>

      <div className="grid gap-4 px-5 py-4 sm:grid-cols-2">
        <div>
          <label htmlFor="node-select" className="mb-1.5 block text-sm font-medium text-secondary-700">
            Node
          </label>
          {nodesLoading ? (
            <Skeleton className="h-10 w-full" />
          ) : nodesError ? (
            <p className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700" role="alert">
              {nodesError}
            </p>
          ) : (
            <select
              id="node-select"
              value={nodeName}
              onChange={(event) => setNodeName(event.target.value)}
              className={SELECT_CLASSES}
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

        <div className="flex items-end">
          <button
            type="button"
            onClick={() => setNodesAttempt((attempt) => attempt + 1)}
            disabled={nodesLoading}
            className="inline-flex items-center gap-1.5 rounded-md border px-3.5 py-2 text-sm font-semibold text-[#0a2f5a] transition-colors hover:bg-secondary-100 disabled:opacity-60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <RefreshCw className={`h-4 w-4 ${nodesLoading ? 'animate-spin' : ''}`} aria-hidden="true" />
            Refresh node list
          </button>
        </div>
      </div>

      <div className="border-t border-secondary-100 px-5 py-4" aria-live="polite">
        {dataLoading ? (
          <div>
            <p className="flex items-center gap-2 text-sm font-medium text-secondary-600">
              <Spinner size="sm" />
              Fetching data…
            </p>
            <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {[0, 1, 2].map((card) => (
                <Skeleton key={card} className="h-24 w-full rounded-lg" />
              ))}
            </div>
          </div>
        ) : dataError ? (
          <ErrorMessage title="Node data unavailable" message={dataError} onRetry={() => setNodeName(nodeName)} />
        ) : nodeData ? (
          <div>
            {preferred.length > 0 && (
              <dl className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {preferred.map(([key, label, unit]) => (
                  <div key={key} className="rounded-lg border bg-secondary-50/60 p-4">
                    <dt className="text-xs font-semibold uppercase tracking-wider text-secondary-500">
                      {label}
                    </dt>
                    <dd className="mt-1 text-2xl font-extrabold tabular-nums text-[#0a2f5a]">
                      {formatValue(nodeData[key])}
                      <span className="ml-1 text-sm font-medium text-secondary-500">{unit}</span>
                    </dd>
                  </div>
                ))}
              </dl>
            )}

            {rest.length > 0 && (
              <div className={preferred.length > 0 ? 'mt-5' : ''}>
                <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-secondary-500">
                  Other fields
                </p>
                <ul className="divide-y divide-secondary-100 overflow-hidden rounded-lg border">
                  {rest.map(([key, value]) => (
                    <li key={key} className="flex items-center justify-between gap-4 px-4 py-2 text-sm">
                      <span className="font-medium text-secondary-600">{key}</span>
                      <span className="break-all text-right font-mono text-[13px] text-secondary-900">
                        {formatValue(value)}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {entries.length === 0 && (
              <p className="text-sm text-secondary-500">The node returned no fields.</p>
            )}
          </div>
        ) : (
          <p className="text-sm text-secondary-500">
            {nodeName ? 'Select a node to load its telemetry.' : 'Waiting for the node list…'}
          </p>
        )}
      </div>
    </div>
  );
}
