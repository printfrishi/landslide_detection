/** Deterministic sample telemetry for the monitoring console (demo data only). */

function mulberry(seed) {
  let t = seed % 2147483647;
  if (t <= 0) t += 2147483646;
  return () => {
    t = (t * 16807) % 2147483647;
    return (t - 1) / 2147483646;
  };
}

function makeSeries(seed, { points = 24, base, amp, spikeAt = -1, spike = 0 }) {
  const rand = mulberry(seed);
  const values = [];
  for (let i = 0; i < points; i += 1) {
    const wave = Math.sin((i / points) * Math.PI * 1.6) * amp * 0.5;
    const noise = (rand() - 0.5) * amp * 0.35;
    const blip = i === spikeAt ? spike : 0;
    values.push(Math.max(0, +(base + wave + noise + blip).toFixed(2)));
  }
  return values;
}

/** The six monitored reading types, in the project's fixed order. */
export const TELEMETRY = [
  {
    key: 'rain',
    title: 'Rainfall',
    unit: 'mm',
    color: '#0284c7',
    threshold: 40,
    points: makeSeries(11, { base: 10, amp: 10, spikeAt: 19, spike: 32 }),
    description: '24 h accumulation at the reference rain gauge',
  },
  {
    key: 'tilt',
    title: 'Tilt',
    unit: '°',
    color: '#b45309',
    threshold: 3,
    points: makeSeries(23, { base: 1.4, amp: 1.1, spikeAt: 20, spike: 1.5 }),
    description: 'Inclinometer borehole — reference station',
  },
  {
    key: 'soil',
    title: 'Soil Moisture',
    unit: '%',
    color: '#047857',
    threshold: 80,
    points: makeSeries(37, { base: 58, amp: 10 }),
    description: 'Sub-surface probe at 30 cm depth',
  },
  {
    key: 'vibration',
    title: 'Vibration',
    unit: 'mm/s',
    color: '#dc2626',
    threshold: 2.5,
    points: makeSeries(41, { base: 0.9, amp: 0.7, spikeAt: 21, spike: 1.1 }),
    description: 'Geophone peak particle velocity',
  },
  {
    key: 'frequency',
    title: 'Frequency',
    unit: 'Hz',
    color: '#7c3aed',
    threshold: 20,
    points: makeSeries(53, { base: 12, amp: 3.5 }),
    description: 'Dominant slope-oscillation frequency',
  },
  {
    key: 'humidity',
    title: 'Humidity',
    unit: '%',
    color: '#0369a1',
    threshold: 90,
    points: makeSeries(67, { base: 72, amp: 8 }),
    description: 'Relative humidity at station shelter',
  },
];

/** Deterministic per-sensor 24 h trend for sparklines and table deltas. */
export function sensorTrend(sensor) {
  let seed = 0;
  for (const ch of sensor.id) seed = (seed * 31 + ch.charCodeAt(0)) % 9973;
  const dir = seed % 3; // 0 up, 1 down, 2 flat
  const base = Math.max(1, Math.abs(sensor.lastReading) || 1);
  const points = makeSeries(seed, {
    points: 16,
    base,
    amp: Math.max(1, base * 0.35),
    spikeAt: dir === 0 ? 13 : -1,
    spike: base * 0.4,
  });
  const pct = [18, 12, 4][dir] * ((seed % 5) + 6) / 10;
  return {
    points,
    direction: ['up', 'down', 'flat'][dir],
    changePct: +(dir === 2 ? 1.2 : pct).toFixed(1),
  };
}

export function seriesStats(values) {
  return {
    last: values[values.length - 1],
    min: Math.min(...values),
    max: Math.max(...values),
  };
}
