import { useMemo, useState, startTransition } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import ValidatedInput from 'widgets/validatedInput'
import { emailValidator, passwordValidator } from 'utils/validators'
import { useToast } from 'utils/useToast'
import styles from './registration.module.scss'
import { api } from 'shared/api/client'

type Step = 'form' | 'success'

function getErrorMessage(): string {
  return 'Ошибка регистрации'
}

export default function RegisterPage() {
  const navigate = useNavigate()
  const { addToast } = useToast()

  const [step, setStep] = useState<Step>('form')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const [login, setLogin] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [repeatPassword, setRepeatPassword] = useState('')

  const [errors, setErrors] = useState({
    login: '',
    email: '',
    password: '',
    repeat: '',
  })

  const formError =
    errors.login || errors.email || errors.password || errors.repeat

  const canSubmit = useMemo(() => {
    if (!login.trim()) return false
    if (!email.trim()) return false
    if (!password) return false
    if (password !== repeatPassword) return false
    return true
  }, [login, email, password, repeatPassword])

  const goLogin = () => {
    startTransition(() => {
      navigate('/login', {
        replace: true,
        state: { identifier: login || email },
      })
    })
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (isSubmitting || !canSubmit) return

    void (async () => {
      setIsSubmitting(true)
      try {
        await api.createUser({
          username: login.trim(),
          email: email.trim(),
          password,
          repeat_password: repeatPassword,
        })

        addToast({
          message: 'Аккаунт создан. Теперь нужно войти.',
          type: 'success',
          duration: 2500,
        })

        setStep('success')
      } catch {
        const msg = getErrorMessage()

        setPassword('')
        setRepeatPassword('')

        addToast({
          message: msg,
          type: 'error',
          duration: 3000,
        })
      } finally {
        setIsSubmitting(false)
      }
    })()
  }

  const handleBackToForm = () => {
    setStep('form')
  }

  return (
    <div className={styles.container}>
      <motion.div
        className={styles.registerCard}
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.35 }}
      >
        <div className={styles.header}>
          <h1 className={styles.title}>
            {step === 'success' ? 'Готово' : 'Регистрация'}
          </h1>
          <p className={styles.subTitle}>
            {step === 'success'
              ? 'Аккаунт создан. Осталось войти.'
              : 'Создай аккаунт, чтобы генерировать PDF.'}
          </p>
        </div>

        <AnimatePresence mode="wait">
          {step === 'form' && (
            <motion.form
              key="form"
              className={styles.form}
              onSubmit={handleSubmit}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.25 }}
            >
              <ValidatedInput
                placeholder="Логин"
                value={login}
                onChange={setLogin}
                validator={(v) =>
                  v.length >= 3 ? '' : 'Логин короче 3 символов'
                }
                hideErrorMessage
                onErrorChange={(e) => setErrors((p) => ({ ...p, login: e }))}
              />

              <ValidatedInput
                placeholder="Почта"
                value={email}
                onChange={setEmail}
                validator={emailValidator}
                type="email"
                hideErrorMessage
                onErrorChange={(e) => setErrors((p) => ({ ...p, email: e }))}
              />

              <ValidatedInput
                placeholder="Пароль"
                value={password}
                onChange={setPassword}
                validator={passwordValidator}
                type="password"
                hideErrorMessage
                onErrorChange={(e) => setErrors((p) => ({ ...p, password: e }))}
              />

              <ValidatedInput
                placeholder="Повтор пароля"
                value={repeatPassword}
                onChange={setRepeatPassword}
                validator={(v) => (v === password ? '' : 'Пароли не совпадают')}
                type="password"
                hideErrorMessage
                onErrorChange={(e) => setErrors((p) => ({ ...p, repeat: e }))}
              />

              {formError && <div className={styles.formError}>{formError}</div>}

              <button
                type="submit"
                className={styles.submitButton}
                disabled={!canSubmit || isSubmitting}
              >
                {isSubmitting ? 'Создаём...' : 'Зарегистрироваться'}
              </button>

              <button
                type="button"
                className={styles.loginButton}
                onClick={goLogin}
                disabled={isSubmitting}
              >
                Уже есть аккаунт?
              </button>
            </motion.form>
          )}

          {step === 'success' && (
            <motion.div
              key="success"
              className={styles.success}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.25 }}
            >
              <div className={styles.successBadge}>
                <span className={styles.dot} />
                Аккаунт создан
              </div>

              <div className={styles.successText}>
                Теперь войдите с вашими данными, чтобы продолжить.
              </div>

              <div className={styles.successActions}>
                <button className={styles.submitButton} onClick={goLogin}>
                  Перейти к входу
                </button>
                <button
                  className={styles.ghostButton}
                  onClick={handleBackToForm}
                >
                  Назад
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  )
}
