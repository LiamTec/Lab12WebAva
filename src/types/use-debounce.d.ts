declare module 'use-debounce' {
  /**
   * Devuelve el valor debounced como tupla [debouncedValue]
   * Ejemplo: const [debounced] = useDebounce(value, 300)
   */
  export function useDebounce<T>(value: T, delay?: number): [T];

  /**
   * Devuelve una versión debounced de la función y un cancelador
   * Ejemplo: const [debouncedFn, cancel] = useDebouncedCallback(fn, 300)
   */
  export function useDebouncedCallback<T extends (...args: any[]) => any>(
    fn: T,
    delay?: number
  ): [(...args: Parameters<T>) => void, () => void];

  const _default: {
    useDebounce: typeof useDebounce;
    useDebouncedCallback: typeof useDebouncedCallback;
  };

  export default _default;
}
