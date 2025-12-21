import React, { useState } from 'react'
import styles from './validatedInput.module.scss'

interface InputProps {
  label?: string
  placeholder: string
  value: string
  onChange: (value: string) => void
  validator?: (value: string) => string
  type?: string
  className?: string
  hideErrorMessage?: boolean
}

const ValidatedInput: React.FC<InputProps> = ({
  placeholder,
  value,
  onChange,
  validator,
  type = 'text',
  className = '',
  hideErrorMessage = false,
}) => {
  const [error, setError] = useState<string>('')

  const validate = (inputValue: string) => {
    if (validator) {
      const errorMsg = validator(inputValue)
      setError(errorMsg)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value
    onChange(newValue)
    validate(newValue)
  }

  return (
    <div className={`${styles.validatedInput} ${className}`}>
      <input
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={handleChange}
        onBlur={() => validate(value)}
        className={`${styles.inputField} ${error ? styles.inputError : ''}`}
      />

      {!hideErrorMessage && error && (
        <span className={styles.errorMessage}>{error}</span>
      )}
    </div>
  )
}

export default ValidatedInput
