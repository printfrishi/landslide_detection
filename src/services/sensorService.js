import { ApiError, simulateDelay } from './api';
import { MOCK_SENSORS } from './mock/mockData';

const sensorService = {
  async getSensors() {
    // TODO(backend): GET /api/sensors — list all field sensors.
    await simulateDelay();
    return [...MOCK_SENSORS];
  },

  async getSensorById(id) {
    // TODO(backend): GET /api/sensors/:id — fetch a single sensor by id.
    await simulateDelay();
    const sensor = MOCK_SENSORS.find((item) => item.id === id);
    if (!sensor) throw new ApiError(`Sensor "${id}" was not found.`, 404);
    return { ...sensor };
  },
};

export default sensorService;
