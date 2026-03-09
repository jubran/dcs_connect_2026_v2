// src/myApp/services/SequenceManager.api.js
import API_ROUTES from "src/myApp/utils/API_ROUTES";

export const sequenceApi = {
  fetchSequence: async (sequenceKeyOrEndpoint) => {
    const endpoint = sequenceKeyOrEndpoint.startsWith("/api")
      ? sequenceKeyOrEndpoint
      : API_ROUTES.sequences()[sequenceKeyOrEndpoint];
    const res = await fetch(endpoint);
    if (!res.ok) throw new Error(`Failed to fetch: ${res.status}`);
    return res.json();
  },

  updateSequence: async (sequenceKeyOrEndpoint, payload) => {
    const endpoint = sequenceKeyOrEndpoint.startsWith("/api")
      ? sequenceKeyOrEndpoint
      : API_ROUTES.sequences()[sequenceKeyOrEndpoint];
    const res = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error(`Failed to update: ${res.status}`);
    return res.json();
  },
};
