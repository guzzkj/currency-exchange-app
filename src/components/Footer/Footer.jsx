import styles from './Footer.module.css'

function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={styles.inner}>
        <p>Dados: Banco Central Europeu via Frankfurter API · atualizados em dias úteis</p>
        <div className={styles.links}>
          <a href="https://github.com/guzzkj/currency-exchange-app" target="_blank" rel="noopener noreferrer">GitHub</a>
          <a href="#">Sobre o projeto</a>
        </div>
      </div>
    </footer>
  )
}

export default Footer
