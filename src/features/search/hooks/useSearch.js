import { useState, useCallback } from "react";
import { eventsApi } from "src/features/search/services/searchApi";

export const useEventsSearch = () => {
  const [searchCriteria, setSearchCriteria] = useState({
    startDate: null,
    endDate: null,
    location: "",
  });
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState(null);

  const updateSearchCriteria = useCallback((updates) => {
    setSearchCriteria((prev) => ({ ...prev, ...updates }));
  }, []);

  const validateDates = useCallback((startDate, endDate) => {
    if (startDate && !startDate.isValid()) {
      throw new Error("تاريخ البداية غير صالح");
    }
    if (endDate && !endDate.isValid()) {
      throw new Error("تاريخ النهاية غير صالح");
    }
    return true;
  }, []);

  const executeSearch = useCallback(
    async (criteria) => {
      try {
        setIsSearching(true);
        setSearchError(null);

        validateDates(criteria.startDate, criteria.endDate);

        const params = {
          startDate: criteria.startDate?.format("YYYY-MM-DD"),
          endDate: criteria.endDate?.format("YYYY-MM-DD"),
          location: criteria.location.trim(),
        };

        return await eventsApi.search(params);
      } catch (error) {
        setSearchError(error.message);
        throw error;
      } finally {
        setIsSearching(false);
      }
    },
    [validateDates],
  );

  const resetSearch = useCallback(() => {
    setSearchCriteria({
      startDate: null,
      endDate: null,
      location: "",
    });
    setSearchError(null);
  }, []);

  const isSearchDisabled =
    !searchCriteria.startDate &&
    !searchCriteria.endDate &&
    searchCriteria.location.trim() === "";

  return {
    searchCriteria,
    updateSearchCriteria,
    executeSearch,
    resetSearch,
    isSearching,
    searchError,
    isSearchDisabled,
  };
};
