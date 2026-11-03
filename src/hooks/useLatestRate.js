import { getLatestRate } from '../services/frankfurterApi'
import { useApiRequest } from './useApiRequest'

// Latest rate of the pair, with its effective date (RN06).
// Fetches again only when the pair changes (not the amount or the period).
export function useLatestRate(base, quote) {
  return useApiRequest(`${base}/${quote}`, (signal) => getLatestRate(base, quote, { signal }))
}
