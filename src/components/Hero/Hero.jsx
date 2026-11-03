import styles from './Hero.module.css'

function Hero() {
  return (
    <section aria-labelledby="hero-title" className={styles.hero}>
      <div className={styles.inner}>
        <h1 id="hero-title" className={styles.title}>Câmbio com contexto.</h1>
        <p className={styles.text}>Converta, veja o histórico e exporte os dados, sem planilha.</p>
        <span className={styles.sourceBadge}>
          <span className={styles.sourceDot} aria-hidden="true" />
          Fonte: BCE via Frankfurter · cotação de 23/10/2026
        </span>
      </div>
    </section>
  )
}

export default Hero
