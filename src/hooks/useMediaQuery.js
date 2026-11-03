import { useSyncExternalStore } from 'react'

// true while the CSS media query matches (e.g. '(max-width: 639px)').
// useSyncExternalStore reads the browser value without useEffect + useState.
export function useMediaQuery(query) {
  return useSyncExternalStore(
    (onChange) => {
      const list = window.matchMedia(query)
      list.addEventListener('change', onChange)
      return () => list.removeEventListener('change', onChange)
    },
    () => window.matchMedia(query).matches,
    () => false,
  )
}
