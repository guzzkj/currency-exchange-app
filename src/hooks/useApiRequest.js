import { useCallback, useEffect, useEffectEvent, useState } from 'react'

const EMPTY_RESULT = { key: null, data: null, error: null }

// 'loading' until the stored result belongs to the current request.
export function getStatus(result, key) {
  if (result.key !== key) return 'loading'
  return result.error ? 'error' : 'success'
}

// Generic API request with loading, error, cancellation and retry.
//
// `key` identifies the request: it must change whenever any input of
// `request` changes (e.g. "EUR/BRL/30D"). The effect runs only when the key
// (or the retry attempt) changes, so a re-render alone never refetches.
// `request(signal)` returns a Promise; `signal` cancels it (AbortController).
export function useApiRequest(key, request) {
  const [result, setResult] = useState(EMPTY_RESULT)
  const [attempt, setAttempt] = useState(0)
  const requestKey = `${key}#${attempt}`

  // Effect Event: always calls the latest `request` without making it a
  // dependency (a new function is created on every render).
  const runRequest = useEffectEvent((signal) => request(signal))

  useEffect(() => {
    const controller = new AbortController()
    runRequest(controller.signal)
      .then((data) => {
        if (!controller.signal.aborted) setResult({ key: requestKey, data, error: null })
      })
      .catch((error) => {
        // A cancelled request is not an error: a newer one is already on the way.
        if (!controller.signal.aborted) setResult({ key: requestKey, data: null, error })
      })
    // Cleanup: a new key cancels the old request, so a late answer never
    // overwrites the current one.
    return () => controller.abort()
  }, [requestKey])

  // "Tentar de novo": a new attempt changes the key and runs the effect again.
  const retry = useCallback(() => setAttempt((current) => current + 1), [])

  const status = getStatus(result, requestKey)
  return {
    status,
    data: status === 'success' ? result.data : null,
    error: status === 'error' ? result.error : null,
    retry,
  }
}
