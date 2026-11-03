import { getCurrencies } from '../services/frankfurterApi'
import { useApiRequest } from './useApiRequest'

// Currency list for the selectors: loaded once, when the app opens.
export function useCurrencies() {
  return useApiRequest('currencies', (signal) => getCurrencies({ signal }))
}
