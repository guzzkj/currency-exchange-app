// The 8 history periods required by the briefing.
// `unit` + `amount` define how far back from today each period goes (RN07).
export const PERIODS = [
  { key: '7D', label: '7D', longLabel: '7 dias', unit: 'day', amount: 7 },
  { key: '15D', label: '15D', longLabel: '15 dias', unit: 'day', amount: 15 },
  { key: '30D', label: '30D', longLabel: '30 dias', unit: 'day', amount: 30 },
  { key: '3M', label: '3M', longLabel: '3 meses', unit: 'month', amount: 3 },
  { key: '6M', label: '6M', longLabel: '6 meses', unit: 'month', amount: 6 },
  { key: '1A', label: '1A', longLabel: '1 ano', unit: 'year', amount: 1 },
  { key: '5A', label: '5A', longLabel: '5 anos', unit: 'year', amount: 5 },
  { key: '10A', label: '10A', longLabel: '10 anos', unit: 'year', amount: 10 },
]
