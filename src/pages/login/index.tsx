import { useState } from 'react'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import ValidatedInput from 'widgets/validatedInput'
import { passwordValidator } from 'utils/validators'
import { useToast } from 'utils/useToast'
import { api } from 'shared/api/client'
import { ApiError } from 'shared/api/errors'
import styles from './login.module.scss'
import { useAuth } from 'app/lib/AuthProvider'

export default function LoginPage() {
  const [login, setLogin] = useState('')
  const [password, setPassword] = useState('')
  const [rememberMe, setRememberMe] = useState(true)
  const [isLoading, setIsLoading] = useState(false)

  const { addToast } = useToast()
  const navigate = useNavigate()

  const auth = useAuth()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (isLoading) return

    const identifier = login.trim()
    if (!identifier || !password) {
      addToast({
        message: 'Введите логин и пароль',
        type: 'warning',
        duration: 2500,
      })
      return
    }

    setIsLoading(true)
    try {
      await api.login({ identifier, password })

      addToast({
        message: 'Успешный вход',
        type: 'success',
        duration: 2000,
      })

      await auth.refresh()

      navigate('/', { replace: true })
    } catch (e) {
      setPassword('')

      if (e instanceof ApiError) {
        const msg =
          e.payload?.detail ||
          (e.status === 401 || e.status === 403
            ? 'Неверный логин или пароль'
            : e.message)

        addToast({
          message: msg,
          type: 'error',
          duration: 3500,
        })
        return
      }

      addToast({
        message: 'Ошибка сети/сервера',
        type: 'error',
        duration: 3500,
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleRegister = () => {
    navigate('/reg', { replace: true })
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

        <form
          className={styles.form}
          onSubmit={(e) => {
            void handleSubmit(e)
          }}
        >
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
              disabled={isLoading}
            />
            <span className={styles.checkboxText}>Запомнить меня</span>
          </label>

          <div className={styles.actions}>
            <button
              type="submit"
              className={styles.submitButton}
              disabled={isLoading}
            >
              {isLoading ? 'Входим…' : 'Войти'}
            </button>

            <button
              type="button"
              className={styles.reg}
              onClick={handleRegister}
              disabled={isLoading}
            >
              Нет аккаунта?
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  )
}
