import { isEqual } from 'lodash'
import { useEffect, useState } from 'react'

// modified from https://usehooks.com/useDebounce/
export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value)

  useEffect(() => {
    // Update debounced value after delay
    const handler = setTimeout(() => {
      if (!isEqual(value, debouncedValue)) {
        setDebouncedValue(value)
      }
    }, delay)

    // Cancel the timeout if value changes (also on delay change or unmount)
    // This is how we prevent debounced value from updating if value is changed ...
    // .. within the delay period. Timeout gets cleared and restarted.
    return () => {
      clearTimeout(handler)
    }
  }, [debouncedValue, value, delay])

  return debouncedValue
}

// modified from https://usehooks.com/useDebounce/
export function useCachedValue<T>(value: T): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value)

  useEffect(() => {
    if (!isEqual(value, debouncedValue)) {
      setDebouncedValue(value)
    }
  }, [debouncedValue, value])

  return debouncedValue
}