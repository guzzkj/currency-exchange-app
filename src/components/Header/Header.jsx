import styles from './Header.module.css'
import coin from '../../assets/brand/lastro-coin-icon.svg'

function Header() {
  return (
    <header className={styles.header}>
      <div className={styles.inner}>
        <a href="#" className={styles.brand} aria-label="Lastro">
          <img src={coin} alt="" width="32" height="32" />
          <span className={styles.brandName}>lastro</span>
        </a>
        <nav aria-label="Seções" className={styles.nav}>
          <a href="#conversor" className={styles.navLink}>Conversor</a>
          <a href="#historico" className={styles.navLink}>Histórico</a>
          <a href="#dados" className={styles.navLink}>Dados</a>
        </nav>
      </div>
    </header>
  )
}

export default Header
