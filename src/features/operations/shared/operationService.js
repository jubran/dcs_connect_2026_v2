// shared/operationService.js
// Moved from: services/operationService.js
// Single API service used by all form modules.

import axios from "axios";
import API_ROUTES from "src/shared/utils/API_ROUTES";

const ENTITY_OPERATIONS_MAP = {
  units: API_ROUTES.units.operations,
  tank: API_ROUTES.tanks.operations,
  transformer: API_ROUTES.transformers.operations,
  noneStatus: API_ROUTES.units.operations,
  bsde: API_ROUTES.units.operations,
};

// Map frontend entityType → backend entityType accepted by server
const ENTITY_TYPE_SERVER_MAP = {
  noneStatus: 'nonestatus',
};

const ENTITY_OPERATIONS_DELETE_MAP = {
  units: API_ROUTES.units.delete,
  tank: API_ROUTES.tanks.delete,
};

class OperationService {
  constructor() {
    this.api = axios.create({ baseURL: "/", withCredentials: true });

    this.api.interceptors.request.use(
      (config) => {
        const token = this.getAuthToken();
        if (token) config.headers.Authorization = `Bearer ${token}`;
        return config;
      },
      (error) => Promise.reject(error),
    );
  }

  getAuthToken() {
    try {
      return localStorage.getItem("accessToken") || null;
    } catch (error) {
      console.error("Error getting auth token:", error);
      return null;
    }
  }

  async createOperation({ entityType, payload, isEditMode = false }) {
    const operations = ENTITY_OPERATIONS_MAP[entityType];
    if (!operations) throw new Error(`Unsupported entityType: ${entityType}`);

    const url = isEditMode
      ? operations.update(payload?.id)
      : operations.create();

    // Translate frontend entityType to the value the server accepts
    const serverEntityType = ENTITY_TYPE_SERVER_MAP[entityType] ?? entityType;
    const serverPayload = { ...payload, entityType: serverEntityType };

    try {
      const response = await this.api.post(url, serverPayload);
      return response.data;
    } catch (error) {
      const data = error.response?.data;
      if (data?.code === "UNAUTHORIZED") console.warn("Session expired");
      throw data || error;
    }
  }

  async deleteOperation({ id }) {
    const operations = ENTITY_OPERATIONS_DELETE_MAP["tank"];
    if (!operations?.multiple) {
      throw new Error("Delete operation not supported for entityType: tank");
    }
    if (!id) throw new Error("ID is required for delete operation");

    try {
      const response = await this.api.post(operations.multiple(id));
      return response.data;
    } catch (error) {
      const data = error.response?.data;
      if (data?.code === "UNAUTHORIZED") console.warn("Session expired");
      throw data || error;
    }
  }
}

export const operationService = new OperationService();
export default operationService;
