/**
 * Live metric definitions for the monitoring console. Metrics map 1:1 to
 * fields on the node objects returned by the hosted backend
 * (temp, humidity, soilMoisture, tiltAngle, vibrations, rainDrops, …).
 */

export const LIVE_METRICS = [
  { key: 'rainDrops', title: 'Rainfall', unit: 'drops', color: '#0284c7', threshold: 90 },
  { key: 'tiltAngle', title: 'Tilt', unit: '°', color: '#b45309', threshold: 3 },
  { key: 'soilMoisture', title: 'Soil Moisture', unit: '%', color: '#047857', threshold: 80 },
  { key: 'vibrations', title: 'Vibration', unit: 'mm/s', color: '#dc2626', threshold: 2.5 },
  { key: 'humidity', title: 'Humidity', unit: '%', color: '#0369a1', threshold: 90 },
  { key: 'temp', title: 'Temperature', unit: '°C', color: '#7c3aed', threshold: 40 },
];

/**
 * Deterministic per-sensor 24 h trend for the station-register sparklines.
 * The register itself is the demo sensor set, so its trends stay sample data.
 */
export function sensorTrend(sensor) {
  let seed = 0;
  for (const ch of sensor.id) seed = (seed * 31 + ch.charCodeAt(0)) % 9973;
  const dir = seed % 3; // 0 up, 1 down, 2 flat
  const base = Math.max(1, Math.abs(sensor.lastReading) || 1);
  const points = [];
  let t = seed % 2147483647;
  if (t <= 0) t += 2147483646;
  const rand = () => {
    t = (t * 16807) % 2147483647;
    return (t - 1) / 2147483646;
  };
  for (let i = 0; i < 16; i += 1) {
    const wave = Math.sin((i / 16) * Math.PI * 1.6) * base * 0.18;
    const noise = (rand() - 0.5) * base * 0.12;
    const blip = dir === 0 && i === 13 ? base * 0.4 : 0;
    points.push(Math.max(0, +(base + wave + noise + blip).toFixed(2)));
  }
  const pct = [18, 12, 4][dir] * (((seed % 5) + 6) / 10);
  return {
    points,
    direction: ['up', 'down', 'flat'][dir],
    changePct: +(dir === 2 ? 1.2 : pct).toFixed(1),
  };
}

/** Normalizes a nodes payload that is an array or wrapped as { data: [...] }. */
export function toNodeNames(payload) {
  const list = Array.isArray(payload) ? payload : (payload?.data ?? payload?.nodes ?? []);
  const names = list
    .map((raw) => (typeof raw === 'string' ? raw : (raw?.name ?? raw?.nodeName ?? raw?.node_name ?? null)))
    .filter(Boolean)
    .map(String);
  return [...new Set(names)];
}
