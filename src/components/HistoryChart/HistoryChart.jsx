import styles from './HistoryChart.module.css'

/* Gráfico estático com dados fictícios. A biblioteca de gráficos entra no cartão 12. */
function HistoryChart() {
  return (
    <div className={styles.panel}>
      <svg
        className={styles.chart}
        viewBox="0 0 900 320"
        role="img"
        aria-label="Cotação EUR/BRL de 24/09/2026 a 23/10/2026, de 5,3180 a 5,4321"
      >
        <g className={styles.grid}>
          <line x1="56" x2="884" y1="288" y2="288" />
          <line x1="56" x2="884" y1="197" y2="197" />
          <line x1="56" x2="884" y1="107" y2="107" />
          <line x1="56" x2="884" y1="16" y2="16" />
        </g>
        <g className={styles.axis}>
          <text x="46" y="292" textAnchor="end">5,30</text>
          <text x="46" y="201" textAnchor="end">5,38</text>
          <text x="46" y="111" textAnchor="end">5,47</text>
          <text x="46" y="20" textAnchor="end">5,55</text>
          <text x="56" y="312" textAnchor="start">24/09</text>
          <text x="253" y="312" textAnchor="middle">01/10</text>
          <text x="450" y="312" textAnchor="middle">08/10</text>
          <text x="647" y="312" textAnchor="middle">15/10</text>
          <text x="884" y="312" textAnchor="end">23/10</text>
        </g>
        <path
          className={styles.area}
          d="M56,288 L56,268 L95,262 L135,256 L174,277 L214,260 L253,242 L293,227 L332,235 L371,211 L411,191 L450,178 L490,185 L529,154 L569,125 L608,78 L647,48 L687,73 L726,103 L766,123 L805,137 L845,151 L884,144 L884,288 Z"
        />
        <polyline
          className={styles.line}
          points="56,268 95,262 135,256 174,277 214,260 253,242 293,227 332,235 371,211 411,191 450,178 490,185 529,154 569,125 608,78 647,48 687,73 726,103 766,123 805,137 845,151 884,144"
        />
        <circle className={styles.coin} cx="884" cy="144" r="4" />
      </svg>
    </div>
  )
}

export default HistoryChart
