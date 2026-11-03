import styles from './App.module.css'
import logo from './assets/brand/lastro-logo-horizontal.svg'

function App() {
  return (
    <main className={styles.app}>
      <img src={logo} alt="Lastro" className={styles.logo} />
      <p className={styles.tagline}>Conversor e análise de moedas</p>
    </main>
  )
}

export default App
