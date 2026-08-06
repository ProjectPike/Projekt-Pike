import { useEffect, useState } from "react";

function readStoredValue(key, fallbackValue) {
  try {
    const storedValue = window.localStorage.getItem(key);
    return storedValue === null ? fallbackValue : JSON.parse(storedValue);
  } catch {
    return fallbackValue;
  }
}

function useLocalStorage(key, fallbackValue) {
  const [value, setValue] = useState(() => readStoredValue(key, fallbackValue));

  useEffect(() => {
    window.localStorage.setItem(key, JSON.stringify(value));
  }, [key, value]);

  return [value, setValue];
}

export default useLocalStorage;
