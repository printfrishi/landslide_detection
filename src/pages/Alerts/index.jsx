import { useEffect, useMemo, useState } from 'react';
import { BellOff } from 'lucide-react';
import useFetch from '../../hooks/useFetch';
import { useToast } from '../../context/ToastContext';
import alertService from '../../services/alertService';
import AlertCard from '../../components/features/alerts/AlertCard';
import AlertDetailModal from '../../components/features/alerts/AlertDetailModal';
import { SelectField } from '../../components/ui/Select';
import { Button } from '../../components/ui/Button';
import { Skeleton } from '../../components/ui/Skeleton';
import EmptyState from '../../components/ui/EmptyState';
import ErrorMessage from '../../components/ui/ErrorMessage';
import ConfirmDialog from '../../components/ui/ConfirmDialog';
import { RISK_LEVELS, RISK_LEVEL_KEYS, riskLevelLabel } from '../../constants/riskLevels';

const DEFAULT_FILTERS = { risk: 'all', status: 'all' };

const RISK_OPTIONS = [
  { value: 'all', label: 'All risk levels' },
  ...RISK_LEVEL_KEYS.map((level) => ({ value: level, label: riskLevelLabel(level) })),
];

const ACK_OPTIONS = [
  { value: 'all', label: 'All alerts' },
  { value: 'unacknowledged', label: 'Unacknowledged' },
  { value: 'acknowledged', label: 'Acknowledged' },
];

/**
 * Alert feed with risk/acknowledgement filters, a detail modal, and an
 * acknowledge flow guarded by ConfirmDialog.
 */
export default function Alerts() {
  const toast = useToast();
  const { data: alerts, isLoading, error, refetch } = useFetch(() => alertService.getAlerts(), []);

  // Keep a local copy so acknowledging updates the feed instantly.
  const [localAlerts, setLocalAlerts] = useState(null);
  useEffect(() => {
    if (alerts) setLocalAlerts(alerts);
  }, [alerts]);

  const [riskFilter, setRiskFilter] = useState(DEFAULT_FILTERS.risk);
  const [statusFilter, setStatusFilter] = useState(DEFAULT_FILTERS.status);
  const [detailAlert, setDetailAlert] = useState(null);
  const [confirmAlert, setConfirmAlert] = useState(null);
  const [acknowledging, setAcknowledging] = useState(false);

  const visibleAlerts = localAlerts ?? alerts ?? [];

  const filtered = useMemo(
    () =>
      visibleAlerts.filter((alert) => {
        const matchesRisk = riskFilter === 'all' || alert.riskLevel === riskFilter;
        const matchesStatus =
          statusFilter === 'all' ||
          (statusFilter === 'unacknowledged' && !alert.acknowledged) ||
          (statusFilter === 'acknowledged' && alert.acknowledged);
        return matchesRisk && matchesStatus;
      }),
    [visibleAlerts, riskFilter, statusFilter]
  );

  const filtersActive = riskFilter !== DEFAULT_FILTERS.risk || statusFilter !== DEFAULT_FILTERS.status;
  const unacknowledgedCount = visibleAlerts.filter((alert) => !alert.acknowledged).length;

  const clearFilters = () => {
    setRiskFilter(DEFAULT_FILTERS.risk);
    setStatusFilter(DEFAULT_FILTERS.status);
  };

  const requestAcknowledge = (alert) => {
    setDetailAlert(null);
    setConfirmAlert(alert);
  };

  const confirmAcknowledge = async () => {
    if (!confirmAlert) return;
    setAcknowledging(true);
    try {
      const updated = await alertService.acknowledgeAlert(confirmAlert.id);
      setLocalAlerts((current) =>
        (current ?? []).map((alert) => (alert.id === updated.id ? updated : alert))
      );
      setConfirmAlert(null);
      toast.success('Alert acknowledged');
    } catch (ackError) {
      toast.error(ackError?.message ?? 'Could not acknowledge the alert. Please try again.');
    } finally {
      setAcknowledging(false);
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-semibold tracking-tight">Alerts</h1>
      <p className="mt-1 text-sm text-muted-foreground" role="status">
        {unacknowledgedCount} unacknowledged alert{unacknowledgedCount === 1 ? '' : 's'} across all
        zones.
      </p>

      {/* Filter bar */}
      <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-end">
        <SelectField
          label="Risk level"
          value={riskFilter}
          onValueChange={setRiskFilter}
          options={RISK_OPTIONS}
          className="sm:w-44"
        />
        <SelectField
          label="Status"
          value={statusFilter}
          onValueChange={setStatusFilter}
          options={ACK_OPTIONS}
          className="sm:w-44"
        />
      </div>

      {/* Feed */}
      {isLoading ? (
        <div className="mt-6 space-y-4" aria-hidden="true">
          {[0, 1, 2].map((index) => (
            <div key={index} className="rounded-xl border bg-card shadow-sm">
              <div className="space-y-3 p-6">
                <div className="flex items-center gap-2">
                  <Skeleton className="h-5 w-16 rounded-md" />
                  <Skeleton className="h-3 w-24" />
                  <Skeleton className="h-3 w-16" />
                </div>
                <Skeleton className="h-5 w-2/3" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-1/2" />
              </div>
            </div>
          ))}
        </div>
      ) : error ? (
        <ErrorMessage
          title="Could not load alerts"
          message="The alert service did not respond. Try again in a moment."
          onRetry={refetch}
          className="mt-6"
        />
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={BellOff}
          title={filtersActive ? 'No alerts match your filters' : 'No alerts yet'}
          description={
            filtersActive
              ? 'Try different filters or clear them to see every alert.'
              : 'All zones are currently calm. New warnings will appear here as sensors raise them.'
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
        <div className="mt-6 space-y-4">
          {filtered.map((alert) => (
            <AlertCard
              key={alert.id}
              alert={alert}
              onView={setDetailAlert}
              onAcknowledge={requestAcknowledge}
            />
          ))}
        </div>
      )}

      <AlertDetailModal
        alert={detailAlert}
        onClose={() => setDetailAlert(null)}
        onAcknowledge={requestAcknowledge}
      />
      <ConfirmDialog
        isOpen={Boolean(confirmAlert)}
        onClose={() => setConfirmAlert(null)}
        onConfirm={confirmAcknowledge}
        title="Acknowledge alert?"
        message={`You are acknowledging "${confirmAlert?.title ?? ''}" in ${confirmAlert?.zone ?? ''}. This signals to the team that the warning has been seen and handled.`}
        confirmLabel="Acknowledge"
        loading={acknowledging}
      />
    </div>
  );
}
