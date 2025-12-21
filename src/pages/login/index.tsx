import ValidatedInput from 'widgets/validatedInput'
import styles from './login.module.scss'
import { useState } from 'react'
import { passwordValidator } from 'utils/validators'

export default function LoginPage() {
  const [email, setEmail] = useState('')

  return (
    <div className={styles.container}>
      <ValidatedInput
        placeholder="Почта"
        value={email}
        onChange={setEmail}
        validator={passwordValidator}
        hideErrorMessage={true}
      />
    </div>
  )
}
