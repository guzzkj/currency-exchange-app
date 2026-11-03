// The 4 table orders (mobile select and filter sheet). RN09: default is the first one.
export const SORT_OPTIONS = [
  { key: 'date', direction: 'desc', label: 'Data (mais recente)' },
  { key: 'date', direction: 'asc', label: 'Data (mais antiga)' },
  { key: 'rate', direction: 'desc', label: 'Cotação (maior)' },
  { key: 'rate', direction: 'asc', label: 'Cotação (menor)' },
]

export const sortValue = (sort) => `${sort.key}-${sort.direction}`

export function parseSortValue(value) {
  const [key, direction] = value.split('-')
  return { key, direction }
}
