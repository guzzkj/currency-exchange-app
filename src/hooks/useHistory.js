import { getHistory } from '../services/frankfurterApi'
import { useApiRequest } from './useApiRequest'

// Records of the period (RN07), used by the chart and the table.
// Fetches again when the pair or the period changes.
export function useHistory(base, quote, period) {
  return useApiRequest(`${base}/${quote}/${period}`, (signal) => getHistory(base, quote, period, { signal }))
}
