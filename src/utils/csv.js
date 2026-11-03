// RN13: ";" separator, UTF-8 with BOM (Excel opens accents right),
// columns data;origem;destino;cotacao, dates as AAAA-MM-DD.

export const CSV_BOM = String.fromCharCode(0xfeff)
export const CSV_HEADER = ['data', 'origem', 'destino', 'cotacao']

const SEPARATOR = ';'
const LINE_BREAK = '\r\n'

// Excel in pt-BR reads "5,4321" as a number when the separator is ";".
const formatCsvRate = (rate) => rate.toFixed(4).replace('.', ',')

export function toCsv(records) {
  const lines = records.map((record) =>
    [record.date, record.base, record.quote, formatCsvRate(record.rate)].join(SEPARATOR),
  )
  return CSV_BOM + [CSV_HEADER.join(SEPARATOR), ...lines].join(LINE_BREAK) + LINE_BREAK
}

// RN14: cotacoes_{ORIGEM}-{DESTINO}_{dataInicial}_{dataFinal}.csv,
// using the range of the filtered records (whatever the table order).
// RN15: no records → no file (null).
export function getCsvFileName(base, quote, records) {
  if (records.length === 0) return null
  const dates = records.map((record) => record.date).sort()
  return `cotacoes_${base}-${quote}_${dates[0]}_${dates[dates.length - 1]}.csv`
}
