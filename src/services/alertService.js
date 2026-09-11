import { ApiError, simulateDelay } from './api';
import { MOCK_ALERTS } from './mock/mockData';

const alertService = {
  async getAlerts() {
    // TODO(backend): GET /api/alerts — list alerts, newest first.
    await simulateDelay();
    return [...MOCK_ALERTS].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  },

  async acknowledgeAlert(id) {
    // TODO(backend): PATCH /api/alerts/:id/acknowledge — mark an alert acknowledged.
    await simulateDelay();
    const alert = MOCK_ALERTS.find((item) => item.id === id);
    if (!alert) throw new ApiError(`Alert "${id}" was not found.`, 404);
    alert.acknowledged = true;
    return { ...alert };
  },
};

export default alertService;
