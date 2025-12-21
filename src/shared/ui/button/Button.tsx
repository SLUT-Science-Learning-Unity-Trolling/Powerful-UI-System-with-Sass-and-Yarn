import styles from './Button.module.scss'

interface ButtonProps {
  label: string
  onClick?: () => void
  variant?: 'light' | 'dark' | 'light:hover' | 'dark:hover'
}

export const Button = ({ label, onClick, variant = 'light' }: ButtonProps) => {
  return (
    <button className={`${styles.button} ${styles[variant]}`} onClick={onClick}>
      {label}
    </button>
  )
}
