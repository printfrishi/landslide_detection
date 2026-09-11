/**
 * ALL fake data lives ONLY in this file. Data shapes are temporary until the
 * real backend exists. Components must never import from here — they go
 * through the service layer in src/services instead.
 */

const minutesAgo = (minutes) => new Date(Date.now() - minutes * 60 * 1000).toISOString();

export const MOCK_SENSORS = [
  {
    id: 'sns-001',
    name: 'Rain Gauge — Slope North',
    zone: 'Zone A',
    type: 'rainfall',
    status: 'online',
    lastReading: 42.5,
    unit: 'mm',
    riskLevel: 'HIGH',
    updatedAt: minutesAgo(12),
  },
  {
    id: 'sns-002',
    name: 'Soil Probe — Ridge East',
    zone: 'Zone A',
    type: 'soil-moisture',
    status: 'online',
    lastReading: 68,
    unit: '%',
    riskLevel: 'MODERATE',
    updatedAt: minutesAgo(25),
  },
  {
    id: 'sns-003',
    name: 'Extensometer — Cliff Face',
    zone: 'Zone B',
    type: 'movement',
    status: 'online',
    lastReading: 3.2,
    unit: 'mm',
    riskLevel: 'CRITICAL',
    updatedAt: minutesAgo(6),
  },
  {
    id: 'sns-004',
    name: 'Piezometer — Valley Well',
    zone: 'Zone B',
    type: 'groundwater',
    status: 'maintenance',
    lastReading: 5.8,
    unit: 'm',
    riskLevel: 'MODERATE',
    updatedAt: minutesAgo(240),
  },
  {
    id: 'sns-005',
    name: 'Rain Gauge — Meadow South',
    zone: 'Zone C',
    type: 'rainfall',
    status: 'offline',
    lastReading: 0,
    unit: 'mm',
    riskLevel: 'LOW',
    updatedAt: minutesAgo(1500),
  },
];

export const MOCK_ALERTS = [
  {
    id: 'alr-001',
    zone: 'Zone B',
    riskLevel: 'CRITICAL',
    title: 'Rapid slope movement detected',
    message:
      'Extensometer SNS-003 on the Zone B cliff face recorded 3.2 mm of movement within the last hour. The displacement rate has tripled since midnight. Evacuate the lower trail and keep personnel clear of the cliff base until geologists review the readings.',
    acknowledged: false,
    createdAt: minutesAgo(18),
  },
  {
    id: 'alr-002',
    zone: 'Zone A',
    riskLevel: 'HIGH',
    title: 'Heavy rainfall threshold breached',
    message:
      'Rain gauge SNS-001 measured 42.5 mm of rainfall over the past 24 hours, exceeding the safety threshold for Zone A slopes. Saturation is rising on the north slope and a shallow landslide remains possible if the rain continues.',
    acknowledged: false,
    createdAt: minutesAgo(55),
  },
  {
    id: 'alr-003',
    zone: 'Zone A',
    riskLevel: 'MODERATE',
    title: 'Soil moisture rising steadily',
    message:
      'Soil probe SNS-002 reports moisture at 68% and climbing after two days of drizzle on the Ridge East transect. No immediate danger, but continue to monitor in case rainfall intensifies.',
    acknowledged: true,
    createdAt: minutesAgo(180),
  },
];
