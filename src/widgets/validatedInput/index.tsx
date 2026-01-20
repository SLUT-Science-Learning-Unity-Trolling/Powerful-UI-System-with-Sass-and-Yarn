import React, { useEffect, useMemo, useState } from 'react'
import styles from './validatedInput.module.scss'

interface InputProps {
  label?: string
  placeholder: string
  value: string
  onChange: (value: string) => void
  validator?: (value: string) => string | null
  onErrorChange?: (error: string) => void
  type?: string
  className?: string
  hideErrorMessage?: boolean
}

const normalizeError = (x: string | null | undefined) => (x ?? '').trim()

const ValidatedInput: React.FC<InputProps> = ({
  placeholder,
  value,
  onChange,
  validator,
  onErrorChange,
  type = 'text',
  className = '',
  hideErrorMessage = false,
}) => {
  const [error, setError] = useState<string>('')

  const runValidate = (nextValue: string) => {
    if (!validator) {
      if (error !== '') setError('')
      if (onErrorChange) onErrorChange('')
      return
    }

    const msg = normalizeError(validator(nextValue))
    setError(msg)
    if (onErrorChange) onErrorChange(msg)
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value
    onChange(newValue)
    runValidate(newValue)
  }

  useEffect(() => {
    runValidate(value)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value])

  const inputClass = useMemo(() => {
    return `${styles.inputField} ${error ? styles.inputError : ''}`
  }, [error])

  return (
    <div className={`${styles.validatedInput} ${className}`}>
      <input
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={handleChange}
        onBlur={() => runValidate(value)}
        className={inputClass}
      />

      {!hideErrorMessage && error && (
        <span className={styles.errorMessage}>{error}</span>
      )}
    </div>
  )
}

export default ValidatedInput
