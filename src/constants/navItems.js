import { LayoutDashboard, RadioTower, BellRing, User, Settings } from 'lucide-react';
import { ROUTES } from './routes';

export const NAV_ITEMS = [
  { label: 'Dashboard', to: ROUTES.DASHBOARD, icon: LayoutDashboard },
  { label: 'Monitoring', to: ROUTES.MONITORING, icon: RadioTower },
  { label: 'Alerts', to: ROUTES.ALERTS, icon: BellRing },
  { label: 'Profile', to: ROUTES.PROFILE, icon: User },
  { label: 'Settings', to: ROUTES.SETTINGS, icon: Settings },
];
