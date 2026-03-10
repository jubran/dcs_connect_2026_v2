import { useState, useEffect, useCallback } from "react";

// ----------------------------------------------------------------------

export function useLocalStorage(key, initialState) {
  const [state, setState] = useState(initialState);
  const [isInitialized, setIsInitialized] = useState(false);

  // تهيئة أولية بدون useEffect
  useState(() => {
    const restored = getStorage(key);
    if (restored) {
      setState((prevValue) => ({
        ...prevValue,
        ...restored,
      }));
    }
    setIsInitialized(true);
  });

  // هذا useEffect للتحديثات من مصادر خارجية (إذا كانت مطلوبة)
  useEffect(() => {
    // فقط للاشتراك في التحديثات الخارجية
    // لا تستخدم setState هنا إلا في callbacks
  }, [key]);

  const updateState = useCallback(
    (updateValue) => {
      setState((prevValue) => {
        const newValue = {
          ...prevValue,
          ...updateValue,
        };
        setStorage(key, newValue);
        return newValue;
      });
    },
    [key],
  );

  const update = useCallback(
    (name, updateValue) => {
      updateState({
        [name]: updateValue,
      });
    },
    [updateState],
  );

  const reset = useCallback(() => {
    removeStorage(key);
    setState(initialState);
  }, [initialState, key]);

  return {
    state,
    update,
    reset,
  };
}
// ----------------------------------------------------------------------

export const getStorage = (key) => {
  let value = null;

  try {
    const result = window.localStorage.getItem(key);

    if (result) {
      value = JSON.parse(result);
    }
  } catch (error) {
    console.error(error);
  }

  return value;
};

export const setStorage = (key, value) => {
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.error(error);
  }
};

export const removeStorage = (key) => {
  try {
    window.localStorage.removeItem(key);
  } catch (error) {
    console.error(error);
  }
};
