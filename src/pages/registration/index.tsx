import { useState } from 'react'
import { motion } from 'framer-motion'
import ValidatedInput from 'widgets/validatedInput'
import { emailValidator, passwordValidator } from 'utils/validators'
import { useToast } from 'utils/useToast'
import styles from './registration.module.scss'

export default function RegisterPage() {
  const [login, setLogin] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const { addToast } = useToast()

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    console.log('Register:', { login, email, password })
    
    addToast({
      message: 'Регистрация успешна!',
      type: 'success',
      duration: 3000,
    })
  }

  return (
    <div className={styles.container}>
      <motion.div
        className={styles.registerCard}
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4 }}
      >
        <h1 className={styles.title}>Регистрация</h1>

        <form className={styles.form} onSubmit={handleSubmit}>
          <ValidatedInput
            placeholder="Логин"
            value={login}
            onChange={setLogin}
          />

          <ValidatedInput
            placeholder="Почта"
            value={email}
            onChange={setEmail}
            validator={emailValidator}
            type="email"
          />

          <ValidatedInput
            placeholder="Пароль"
            value={password}
            onChange={setPassword}
            validator={passwordValidator}
            type="password"
          />

          <button type="submit" className={styles.submitButton}>
            Зарегистрироваться
          </button>
        </form>
      </motion.div>
    </div>
  )
}
