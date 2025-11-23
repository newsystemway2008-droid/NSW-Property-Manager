import { useState, useEffect, Dispatch, SetStateAction } from 'react';

// FIX: Use imported Dispatch and SetStateAction types to fix 'Cannot find namespace React' error.
function useLocalStorage<T,>(key: string, initialValue: T): [T, Dispatch<SetStateAction<T>>] {
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.error(error);
      return initialValue;
    }
  });

  // FIX: Use imported Dispatch and SetStateAction types to fix 'Cannot find namespace React' error.
  const setValue: Dispatch<SetStateAction<T>> = (value) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);
      window.localStorage.setItem(key, JSON.stringify(valueToStore));
    } catch (error) {
      console.error(error);
    }
  };
  
  useEffect(() => {
     const handleStorageChange = (e: StorageEvent) => {
        if (e.key === key) {
             try {
                setStoredValue(e.newValue ? JSON.parse(e.newValue) : initialValue);
             } catch(error) {
                console.error(error);
             }
        }
     };

     window.addEventListener('storage', handleStorageChange);

     return () => {
         window.removeEventListener('storage', handleStorageChange);
     };
  }, [key, initialValue]);

  return [storedValue, setValue];
}

export default useLocalStorage;