import { useState } from 'react'
import { motion } from 'framer-motion'
import ValidatedInput from 'widgets/validatedInput'
import { passwordValidator } from 'utils/validators'
import { useToast } from 'utils/useToast'
import styles from './login.module.scss'

export default function LoginPage() {
  const [login, setLogin] = useState('')
  const [password, setPassword] = useState('')
  const [rememberMe, setRememberMe] = useState(true)
  const { addToast } = useToast()

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    console.log('Login:', { login, password, rememberMe })
  }

  const handleForgotPassword = () => {
    addToast({
      message: 'Ну удачи вспомнить',
      type: 'warning',
      duration: 3000,
    })
  }

  return (
    <div className={styles.container}>
      <motion.div
        className={styles.loginCard}
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4 }}
      >
        <h1 className={styles.title}>Вход</h1>

        <form className={styles.form} onSubmit={handleSubmit}>
          <ValidatedInput
            placeholder="Логин"
            value={login}
            onChange={setLogin}
          />

          <ValidatedInput
            placeholder="Пароль"
            value={password}
            onChange={setPassword}
            validator={passwordValidator}
            type="password"
          />

          <label className={styles.checkboxLabel}>
            <input
              type="checkbox"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              className={styles.checkbox}
            />
            <span className={styles.checkboxText}>Запомнить меня</span>
          </label>

          <div className={styles.actions}>
            <button type="submit" className={styles.submitButton}>
              Войти
            </button>
            <button
              type="button"
              className={styles.forgotPassword}
              onClick={handleForgotPassword}
            >
              Забыли пароль?
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  )
}
