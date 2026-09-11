/** Sensor domain metadata shared by monitoring and dashboard features. */
export const SENSOR_TYPES = [
  { value: 'rainfall', label: 'Rainfall' },
  { value: 'soil-moisture', label: 'Soil Moisture' },
  { value: 'movement', label: 'Movement' },
  { value: 'groundwater', label: 'Groundwater' },
];

export const SENSOR_STATUSES = [
  { value: 'online', label: 'Online' },
  { value: 'maintenance', label: 'Maintenance' },
  { value: 'offline', label: 'Offline' },
];

/** Maps a sensor status to a Badge variant (online = emerald per design system). */
export const SENSOR_STATUS_VARIANTS = {
  online: 'success',
  maintenance: 'warning',
  offline: 'danger',
};

export const SENSOR_TYPE_LABELS = Object.fromEntries(
  SENSOR_TYPES.map(({ value, label }) => [value, label])
);

export const SENSOR_STATUS_LABELS = Object.fromEntries(
  SENSOR_STATUSES.map(({ value, label }) => [value, label])
);
