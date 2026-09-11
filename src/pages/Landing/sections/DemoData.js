/**
 * Sample monitoring data for the HimRakshak demonstration portal.
 * Everything here is illustrative — no real government intelligence.
 */

export const DISTRICTS = [
  {
    id: 'rudraprayag',
    name: 'Rudraprayag',
    risk: 'HIGH',
    riskLabel: 'HIGH',
    alerts: '03',
    updated: '11:42 PM',
    rainfall: 'High (118 mm / 24 h)',
    soil: 'Saturated',
    slope: 'Unstable — movement detected',
    advisory: 'Avoid travel on NH-07 near the corridor; follow police diversions.',
    incidents: '2 in the last 7 days',
  },
  {
    id: 'tehri',
    name: 'Tehri Garhwal',
    risk: 'MODERATE',
    riskLabel: 'MODERATE',
    alerts: '02',
    updated: '11:40 PM',
    rainfall: 'Moderate (64 mm / 24 h)',
    soil: 'Elevated moisture',
    slope: 'Watch — slow creep observed',
    advisory: 'Exercise caution near vulnerable slopes and cut sections.',
    incidents: '0 in the last 7 days',
  },
  {
    id: 'chamoli',
    name: 'Chamoli',
    risk: 'WATCH',
    riskLabel: 'WATCH',
    alerts: '01',
    updated: '11:38 PM',
    rainfall: 'Light (21 mm / 24 h)',
    soil: 'Normal',
    slope: 'Stable with local seepage',
    advisory: 'No restrictions. Stay informed through official channels.',
    incidents: '0 in the last 7 days',
  },
  {
    id: 'pauri',
    name: 'Pauri Garhwal',
    risk: 'LOW',
    riskLabel: 'LOW',
    alerts: '00',
    updated: '11:41 PM',
    rainfall: 'Light (12 mm / 24 h)',
    soil: 'Normal',
    slope: 'Stable',
    advisory: 'Normal movement advised. Standard monsoon caution applies.',
    incidents: '0 in the last 7 days',
  },
  {
    id: 'uttarkashi',
    name: 'Uttarkashi',
    risk: 'WATCH',
    riskLabel: 'WATCH',
    alerts: '01',
    updated: '11:36 PM',
    rainfall: 'Moderate (48 mm / 24 h)',
    soil: 'Elevated moisture',
    slope: 'Stable — seepage reported at 2 sites',
    advisory: 'Avoid parking vehicles below cut slopes during rainfall.',
    incidents: '1 in the last 7 days',
  },
];

export const RISK_ORDER = { NORMAL: 0, MONITORING: 1, WATCH: 2, MODERATE: 2, HIGH: 3, WARNING: 3, CRITICAL: 4, LOW: 0 };

export const SEVERITY_STYLES = {
  LOW: { badge: 'success', bar: 'bg-emerald-500' },
  NORMAL: { badge: 'success', bar: 'bg-emerald-500' },
  MONITORING: { badge: 'info', bar: 'bg-sky-500' },
  WATCH: { badge: 'warning', bar: 'bg-amber-400' },
  MODERATE: { badge: 'warning', bar: 'bg-amber-400' },
  HIGH: { badge: 'danger', bar: 'bg-orange-500' },
  WARNING: { badge: 'danger', bar: 'bg-orange-500' },
  CRITICAL: { badge: 'critical', bar: 'bg-red-600' },
};

export const ACTIVE_ALERTS = [
  {
    severity: 'HIGH',
    badge: 'danger',
    location: 'NH-07 Corridor, Rudraprayag District',
    message: 'Increased slope movement detected. Traffic regulated between Kund and Tilwara.',
    action: 'Avoid the corridor; follow police diversions.',
    time: '10 Sep 2026, 11:42 PM',
    confidence: 'Sensor-confirmed',
  },
  {
    severity: 'MODERATE',
    badge: 'warning',
    location: 'Near Pratapnagar, Tehri Garhwal',
    message: 'Rainfall and soil-moisture conditions indicate elevated landslide susceptibility.',
    action: 'Exercise caution near vulnerable slopes.',
    time: '10 Sep 2026, 10:15 PM',
    confidence: 'Model-estimated',
  },
  {
    severity: 'WATCH',
    badge: 'warning',
    location: 'Uttarkashi District — Gangotri road',
    message: 'Seepage reported at two cut slopes after continued rainfall.',
    action: 'No restrictions. Stay informed through official channels.',
    time: '10 Sep 2026, 9:04 PM',
    confidence: 'Field-reported',
  },
];

export const CORRIDORS = [
  { id: 'NH-07', name: 'NH-07 Rudraprayag stretch', risk: 'HIGH', movement: 'Elevated (3.2 mm/hr)', advisory: 'Caution — diversions active' },
  { id: 'NH-34', name: 'NH-34 Uttarkashi section', risk: 'WATCH', movement: 'Within limits', advisory: 'Night-drive caution in rain' },
  { id: 'SH-62', name: 'SH-62 Pauri link road', risk: 'LOW', movement: 'Nominal', advisory: 'No restrictions' },
  { id: 'MRS-01', name: 'Rishikesh–Karnaprayag rail cuttings', risk: 'WATCH', movement: 'Slow creep at 1 site', advisory: 'Construction zone — restricted access' },
];

export const NOTICES = [
  { date: '10 SEP 2026', category: 'Advisory', title: 'Landslide monitoring advisory — Rudraprayag district', authority: 'HimRakshak Monitoring Cell (demo)' },
  { date: '08 SEP 2026', category: 'Preparedness', title: 'Monsoon preparedness update for hill districts', authority: 'HimRakshak Monitoring Cell (demo)' },
  { date: '05 SEP 2026', category: 'Report', title: 'Weekly district monitoring report published', authority: 'HimRakshak Analytics (demo)' },
];

export const DOCUMENTS = [
  { title: 'Weekly Landslide Monitoring Report — Week 36', type: 'Monitoring Report', date: '05 Sep 2026', size: '1.8 MB' },
  { title: 'District Risk Assessment Methodology (v0.3)', type: 'Technical Report', date: '28 Aug 2026', size: '2.4 MB' },
  { title: 'Landslide Safety Guidelines for Travellers', type: 'Safety Guidelines', date: '15 Aug 2026', size: '0.6 MB' },
  { title: 'Sample Landslide Inventory — Demo Extract', type: 'Landslide Inventory', date: '01 Aug 2026', size: '3.1 MB' },
];

export const NETWORK_STATS = [
  { label: 'Monitoring Stations', value: '128' },
  { label: 'Active Alerts', value: '07' },
  { label: 'High-Risk Zones', value: '14' },
  { label: 'Sensors Online', value: '96%' },
];
