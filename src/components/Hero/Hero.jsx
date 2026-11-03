import styles from './Hero.module.css'
import { formatDate } from '../../utils/format'

function Hero({ rateDate }) {

  return (
    <section aria-labelledby="hero-title" className={styles.hero}>
      <div className={styles.inner}>
        <h1 id="hero-title" className={styles.title}>Câmbio com contexto.</h1>
        <p className={styles.text}>Converta, veja o histórico e exporte os dados, sem planilha.</p>
        <span className={styles.sourceBadge}>
          <span className={styles.sourceDot} aria-hidden="true" />
          Fonte: BCE via Frankfurter{rateDate && ` · cotação de ${formatDate(rateDate)}`}
        </span>
      </div>
    </section>
  )
}

export default Hero
