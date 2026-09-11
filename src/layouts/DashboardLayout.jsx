import { useEffect, useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from '../components/layout/Sidebar';
import MobileNavDrawer from '../components/layout/MobileNavDrawer';
import Topbar from '../components/layout/Topbar';
import alertService from '../services/alertService';

/**
 * Authenticated shell: fixed w-64 sidebar on desktop, slide-in drawer below
 * lg, and a sticky topbar. Keeps the unacknowledged-alert count for the
 * sidebar badge fresh by re-reading alerts on every route change.
 */
export default function DashboardLayout() {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [unacknowledgedCount, setUnacknowledgedCount] = useState(0);
  const location = useLocation();

  useEffect(() => {
    setDrawerOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    let active = true;
    alertService
      .getAlerts()
      .then((alerts) => {
        if (active) {
          setUnacknowledgedCount(alerts.filter((alert) => !alert.acknowledged).length);
        }
      })
      .catch(() => {});
    return () => {
      active = false;
    };
  }, [location.pathname]);

  return (
    <div className="min-h-screen bg-background">
      <Sidebar unacknowledgedCount={unacknowledgedCount} />
      <MobileNavDrawer
        isOpen={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        unacknowledgedCount={unacknowledgedCount}
      />
      <div className="flex min-h-screen flex-col lg:pl-64">
        <Topbar onMenuClick={() => setDrawerOpen(true)} />
        <main className="flex-1 px-4 py-6 sm:px-6 lg:px-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
