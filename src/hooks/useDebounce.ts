import { useState, useEffect } from 'react';

function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    // Configura un temporizador que se ejecutará después del 'delay'
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    // Función de limpieza: se ejecuta si el 'value' cambia antes de que termine el temporizador.
    // Cancela el temporizador pendiente, evitando que se ejecute la actualización.
    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]); // El efecto se vuelve a ejecutar solo si el valor o el retraso cambian

  return debouncedValue;
}

export default useDebounce;