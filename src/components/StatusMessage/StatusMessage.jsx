import styles from './StatusMessage.module.css'
import ouriEmpty from '../../assets/mascot/ouri-empty.svg'
import ouriError from '../../assets/mascot/ouri-error.svg'

const MASCOTS = { empty: ouriEmpty, error: ouriError }

// Message for a section that has nothing to show: empty period, API error or
// no filter result. `mascot` is optional (the design shows at most one Ouri per screen).
function StatusMessage({ message, mascot, actionLabel, onAction, actionVariant = 'primary', framed = false }) {
  return (
    <div className={framed ? styles.framed : styles.box} role={mascot === 'error' ? 'alert' : 'status'}>
      {mascot && <img src={MASCOTS[mascot]} alt="" width="120" height="113" className={styles.mascot} />}
      <div className={styles.content}>
        <p className={styles.message}>{message}</p>
        {onAction && (
          <button
            type="button"
            className={actionVariant === 'primary' ? styles.primary : styles.secondary}
            onClick={onAction}
          >
            {actionLabel}
          </button>
        )}
      </div>
    </div>
  )
}

export default StatusMessage
