import { useEffect, useMemo, useState } from 'react';
import { BellOff, ExternalLink, Loader2, MapPin, Phone, Search, User, X } from 'lucide-react';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { Skeleton } from '../../components/ui/Skeleton';
import EmptyState from '../../components/ui/EmptyState';
import ErrorMessage from '../../components/ui/ErrorMessage';

const API_BASE_URL = 'https://landslideearlywarning-system-backend.onrender.com';
const REPORTS_ENDPOINT = `${API_BASE_URL}/landslide-report/getAllReports`;

const buildMapsUrl = (lat, lon) =>
  `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(lat)},${encodeURIComponent(lon)}`;

const isValidNumber = (v) => typeof v === 'number' && Number.isFinite(v);

const formatCoords = (lat, lon) => {
  if (!isValidNumber(lat) || !isValidNumber(lon)) return null;
  return `${lat.toFixed(5)}, ${lon.toFixed(5)}`;
};

/**
 * Citizen landslide reports feed.
 *
 * Pulls /landslide-report/getAllReports and renders every report as a card
 * with a full detail modal and a "See on map" button that opens Google Maps
 * at the report's exact coordinates.
 */
export default function Alerts() {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');
  const [selectedReport, setSelectedReport] = useState(null);
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError(null);

    fetch(REPORTS_ENDPOINT)
      .then(async (res) => {
        const contentType = res.headers.get('content-type') ?? '';
        const payload = contentType.includes('application/json')
          ? await res.json().catch(() => null)
          : null;

        if (!res.ok) {
          throw new Error(
            payload?.error ??
              payload?.message ??
              `Failed to load reports (HTTP ${res.status}).`
          );
        }
        return Array.isArray(payload) ? payload : [];
      })
      .then((data) => {
        if (!active) return;
        setReports(data);
      })
      .catch((err) => {
        if (active) setError(err?.message ?? 'Could not load reports.');
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [attempt]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return reports;
    return reports.filter((r) => {
      const haystack = [
        r.name,
        r.mobileNo,
        r.Description,
        r.description,
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();
      return haystack.includes(q);
    });
  }, [reports, search]);

  const total = reports.length;
  const withPhoto = reports.filter((r) => r.imageUrl).length;

  return (
    <div>
      <h1 className="text-2xl font-semibold tracking-tight">Citizen Landslide Reports</h1>
      <p className="mt-1 text-sm text-muted-foreground" role="status">
        {loading
          ? 'Loading reports…'
          : `${total} report${total === 1 ? '' : 's'} · ${withPhoto} with photo`}
      </p>

      <div className="mt-6 max-w-md">
        <div className="relative">
          <Search
            className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
            aria-hidden="true"
          />
          <Input
            name="search"
            type="search"
            placeholder="Search by name, phone, or description…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            inputClassName="pl-9"
            aria-label="Search reports"
          />
        </div>
      </div>

      {loading ? (
        <div className="mt-6 space-y-4" aria-hidden="true">
          {[0, 1, 2].map((i) => (
            <div key={i} className="rounded-xl border bg-white shadow-sm">
              <div className="flex gap-4 p-5">
                <Skeleton className="h-28 w-28 shrink-0 rounded-lg" />
                <div className="flex-1 space-y-3">
                  <Skeleton className="h-4 w-1/3" />
                  <Skeleton className="h-3 w-1/2" />
                  <Skeleton className="h-3 w-3/4" />
                  <Skeleton className="h-8 w-32 rounded-md" />
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : error ? (
        <ErrorMessage
          title="Could not load reports"
          message={error}
          onRetry={() => setAttempt((a) => a + 1)}
          className="mt-6"
        />
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={BellOff}
          title={search ? 'No reports match your search' : 'No reports yet'}
          description={
            search
              ? 'Try a different keyword or clear the search box.'
              : 'When citizens submit landslide reports, they will appear here.'
          }
          action={
            search ? (
              <Button variant="outline" onClick={() => setSearch('')}>
                Clear search
              </Button>
            ) : null
          }
          className="mt-6"
        />
      ) : (
        <div className="mt-6 space-y-4">
          {filtered.map((report) => (
            <ReportCard
              key={report.id}
              report={report}
              onOpen={() => setSelectedReport(report)}
            />
          ))}
        </div>
      )}

      {selectedReport && (
        <ReportDetailModal
          report={selectedReport}
          onClose={() => setSelectedReport(null)}
        />
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Card                                                                */
/* ------------------------------------------------------------------ */

function ReportCard({ report, onOpen }) {
  const description = report.Description ?? report.description ?? 'No description provided.';
  const coords = formatCoords(report.latitude, report.longitude);
  const mapsUrl = coords ? buildMapsUrl(report.latitude, report.longitude) : null;

  return (
    <article className="overflow-hidden rounded-xl border bg-white shadow-sm transition-shadow hover:shadow-md">
      <div className="flex flex-col gap-4 p-5 sm:flex-row">
        <div className="h-40 w-full shrink-0 overflow-hidden rounded-lg border bg-secondary-100 sm:h-32 sm:w-40">
          {report.imageUrl ? (
            <img
              src={report.imageUrl}
              alt={`Report ${report.id}`}
              className="h-full w-full object-cover"
              loading="lazy"
            />
          ) : (
            <div className="flex h-full items-center justify-center text-xs text-secondary-400">
              No photo
            </div>
          )}
        </div>

        <div className="flex flex-1 flex-col">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-secondary-500">
                Report #{report.id}
              </p>
              <h3 className="mt-0.5 text-base font-bold text-[#0a2f5a]">
                {report.name?.trim() || 'Anonymous reporter'}
              </h3>
            </div>
          </div>

          <p className="mt-2 line-clamp-2 text-sm text-secondary-700">{description}</p>

          <dl className="mt-3 grid grid-cols-1 gap-x-4 gap-y-1 text-xs text-secondary-600 sm:grid-cols-2">
            <div className="flex items-center gap-1.5">
              <Phone className="h-3.5 w-3.5" aria-hidden="true" />
              <span className="font-mono">{report.mobileNo ?? '—'}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <MapPin className="h-3.5 w-3.5" aria-hidden="true" />
              <span className="font-mono">{coords ?? 'No coordinates'}</span>
            </div>
          </dl>

          <div className="mt-4 flex flex-wrap gap-2">
            <Button size="sm" variant="outline" onClick={onOpen}>
              View details
            </Button>
            {mapsUrl && (
              <a
                href={mapsUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 rounded-md bg-[#0a2f5a] px-3 py-2 text-sm font-semibold text-white transition-colors hover:bg-[#134b8a] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <MapPin className="h-4 w-4" aria-hidden="true" />
                See on map
                <ExternalLink className="h-3 w-3 opacity-70" aria-hidden="true" />
              </a>
            )}
          </div>
        </div>
      </div>
    </article>
  );
}

/* ------------------------------------------------------------------ */
/* Detail modal                                                        */
/* ------------------------------------------------------------------ */

function ReportDetailModal({ report, onClose }) {
  const description = report.Description ?? report.description ?? 'No description provided.';
  const coords = formatCoords(report.latitude, report.longitude);
  const mapsUrl = coords ? buildMapsUrl(report.latitude, report.longitude) : null;

  useEffect(() => {
    const handleKey = (e) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', handleKey);
      document.body.style.overflow = '';
    };
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="report-detail-title"
      onClick={onClose}
    >
      <div
        className="relative max-h-[92vh] w-full max-w-3xl overflow-y-auto rounded-2xl bg-white shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b bg-gradient-to-r from-[#0a2f5a] to-[#134b8a] px-6 py-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-amber-300">
              Report #{report.id}
            </p>
            <h2 id="report-detail-title" className="text-lg font-bold text-white">
              {report.name?.trim() || 'Anonymous reporter'}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-1.5 text-white/80 transition-colors hover:bg-white/10 hover:text-white"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="grid gap-6 p-6 sm:grid-cols-2">
          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-secondary-500">
              Photo
            </p>
            <div className="overflow-hidden rounded-lg border bg-secondary-100">
              {report.imageUrl ? (
                <img
                  src={report.imageUrl}
                  alt={`Report ${report.id}`}
                  className="h-auto w-full object-contain"
                />
              ) : (
                <div className="flex h-48 items-center justify-center text-sm text-secondary-400">
                  No photo attached
                </div>
              )}
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-secondary-500">
                Reporter
              </p>
              <div className="rounded-lg border bg-secondary-50/60 p-3 space-y-2 text-sm">
                <div className="flex items-center gap-2 text-secondary-700">
                  <User className="h-4 w-4 text-secondary-500" aria-hidden="true" />
                  <span className="font-semibold">
                    {report.name?.trim() || 'Anonymous'}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-secondary-700">
                  <Phone className="h-4 w-4 text-secondary-500" aria-hidden="true" />
                  <a href={`tel:${report.mobileNo}`} className="font-mono hover:underline">
                    {report.mobileNo ?? '—'}
                  </a>
                </div>
              </div>
            </div>

            <div>
              <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-secondary-500">
                Location
              </p>
              <div className="rounded-lg border bg-secondary-50/60 p-3 space-y-2 text-sm">
                <div className="flex items-start gap-2 text-secondary-700">
                  <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-secondary-500" aria-hidden="true" />
                  <span className="font-mono">{coords ?? 'No coordinates'}</span>
                </div>
                {mapsUrl && (
                  <a
                    href={mapsUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 rounded-md bg-[#0a2f5a] px-3 py-2 text-xs font-semibold text-white transition-colors hover:bg-[#134b8a]"
                  >
                    <MapPin className="h-3.5 w-3.5" aria-hidden="true" />
                    Open in Google Maps
                    <ExternalLink className="h-3 w-3 opacity-70" aria-hidden="true" />
                  </a>
                )}
              </div>
            </div>
          </div>

          <div className="sm:col-span-2">
            <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-secondary-500">
              Description
            </p>
            <div className="rounded-lg border bg-white p-4 text-sm leading-6 text-secondary-800">
              {description}
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-2 border-t bg-secondary-50/60 px-6 py-4">
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
        </div>
      </div>
    </div>
  );
}