import useSWR from "swr";
import { useState, useCallback } from "react";

export const useSequenceApi = (apiEndpoint) => {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetcher = useCallback(
    (url) =>
      fetch(url).then(async (res) => {
        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`);
        }
        return res.json();
      }),
    [],
  );

  const { data, mutate } = useSWR(apiEndpoint, fetcher, {
    revalidateOnFocus: false,
    revalidateOnReconnect: false,
    onError: (error) => {
      console.error("SWR Error:", error);
      setError(error);
      setIsLoading(false);
    },
    onSuccess: () => {
      setError(null);
      setIsLoading(false);
    },
  });

  const updateSequence = useCallback(async (apiUpdateEndpoint, payload) => {
    try {
      const response = await fetch(apiUpdateEndpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();

      if (result.status !== "success") {
        throw new Error(result.message || "حدث خطأ أثناء الحفظ");
      }

      return result;
    } catch (err) {
      throw err;
    }
  }, []);

  return {
    data,
    isLoading,
    error,
    mutate,
    updateSequence,
  };
};
