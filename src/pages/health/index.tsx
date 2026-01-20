/* eslint-disable @typescript-eslint/no-misused-promises */
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { api } from 'shared/api/client'
import { ApiError } from 'shared/api/errors'
import { useToast } from 'utils/useToast'
import styles from './health.module.scss'

type CheckKey = 'server' | 'db' | 'minio'
type CheckStatus = 'idle' | 'loading' | 'ok' | 'fail'

type CheckState = {
  key: CheckKey
  title: string
  description: string
  status: CheckStatus
  latencyMs?: number
  error?: string
  lastCheckedAt?: string
}

function nowTimeString() {
  return new Date().toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  })
}

export default function HealthPage() {
  const { addToast } = useToast()

  const [checks, setChecks] = useState<CheckState[]>([
    {
      key: 'server',
      title: 'Server',
      description: 'Доступность API и роутера',
      status: 'idle',
    },
    {
      key: 'db',
      title: 'Database',
      description: 'Подключение к базе данных',
      status: 'idle',
    },
    {
      key: 'minio',
      title: 'MinIO',
      description: 'Доступность object storage',
      status: 'idle',
    },
  ])

  const [isRunning, setIsRunning] = useState(false)

  const didAutoRunRef = useRef(false)

  useEffect(() => {
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = prev
    }
  }, [])

  const summary = useMemo(() => {
    const ok = checks.filter((c) => c.status === 'ok').length
    const fail = checks.filter((c) => c.status === 'fail').length
    const loading = checks.filter((c) => c.status === 'loading').length
    const total = checks.length
    return { ok, fail, loading, total }
  }, [checks])

  const setCheck = useCallback((key: CheckKey, patch: Partial<CheckState>) => {
    setChecks((prev) =>
      prev.map((c) => (c.key === key ? { ...c, ...patch } : c))
    )
  }, [])

  const runOne = useCallback(
    async (key: CheckKey): Promise<boolean> => {
      const start = performance.now()
      setCheck(key, { status: 'loading', error: undefined })

      try {
        if (key === 'server') await api.healthServer()
        if (key === 'db') await api.healthDb()
        if (key === 'minio') await api.healthMinio()

        const ms = Math.round(performance.now() - start)
        setCheck(key, {
          status: 'ok',
          latencyMs: ms,
          lastCheckedAt: nowTimeString(),
          error: undefined,
        })
        return true
      } catch (e) {
        const ms = Math.round(performance.now() - start)

        let msg = 'Unknown error'
        if (e instanceof ApiError)
          msg = e.payload?.detail ?? `${e.status} ${e.message}`
        else if (e instanceof Error) msg = e.message

        setCheck(key, {
          status: 'fail',
          latencyMs: ms,
          lastCheckedAt: nowTimeString(),
          error: msg,
        })
        return false
      }
    },
    [setCheck]
  )

  const runAll = useCallback(async () => {
    if (isRunning) return
    setIsRunning(true)

    try {
      const results = await Promise.all([
        runOne('server'),
        runOne('db'),
        runOne('minio'),
      ])
      const allOk = results.every(Boolean)

      addToast({
        message: allOk
          ? 'Все сервисы в порядке'
          : 'Есть проблемы в health checks',
        type: allOk ? 'success' : 'warning',
        duration: 2500,
      })
    } finally {
      setIsRunning(false)
    }
  }, [isRunning, runOne, addToast])

  useEffect(() => {
    if (didAutoRunRef.current) return
    didAutoRunRef.current = true
    void runAll()
  }, [runAll])

  return (
    <div className={styles.container}>
      <div className={styles.topBar}>
        <div className={styles.brand}>
          <span className={styles.brandDot} />
          <span className={styles.brandText}>Health</span>
          <span className={styles.brandHint}>мониторинг бэка</span>
        </div>

        <div className={styles.topActions}>
          <button
            className={styles.ghostButton}
            onClick={() => void runAll()}
            disabled={isRunning}
          >
            {isRunning ? 'Проверяем…' : 'Проверить всё'}
          </button>
        </div>
      </div>

      <main className={styles.main}>
        <motion.section
          className={styles.shell}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25 }}
        >
          <div className={styles.header}>
            <div className={styles.headerLeft}>
              <h1 className={styles.title}>Состояние сервисов</h1>
              <p className={styles.subtitle}>API / DB / MinIO</p>
            </div>

            <div className={styles.summary}>
              <div className={styles.summaryItem}>
                <span className={styles.summaryLabel}>OK</span>
                <span className={styles.summaryValueOk}>{summary.ok}</span>
              </div>
              <div className={styles.summaryItem}>
                <span className={styles.summaryLabel}>FAIL</span>
                <span className={styles.summaryValueFail}>{summary.fail}</span>
              </div>
              <div className={styles.summaryItem}>
                <span className={styles.summaryLabel}>TOTAL</span>
                <span className={styles.summaryValue}>{summary.total}</span>
              </div>
            </div>
          </div>

          <div className={styles.list}>
            <AnimatePresence initial={false}>
              {checks.map((c) => (
                <motion.div
                  key={c.key}
                  className={styles.card}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 8 }}
                  transition={{ duration: 0.2 }}
                >
                  <div className={styles.cardTop}>
                    <div className={styles.cardInfo}>
                      <div className={styles.cardTitleRow}>
                        <span className={styles.cardTitle}>{c.title}</span>
                        <span
                          className={`${styles.badge} ${styles['badge_' + c.status]}`}
                        >
                          {c.status === 'idle' && 'IDLE'}
                          {c.status === 'loading' && 'LOADING'}
                          {c.status === 'ok' && 'OK'}
                          {c.status === 'fail' && 'FAIL'}
                        </span>
                      </div>
                      <div className={styles.cardDesc}>{c.description}</div>
                    </div>

                    <div className={styles.cardMeta}>
                      <div className={styles.metaRow}>
                        <span className={styles.metaLabel}>Latency</span>
                        <span className={styles.metaValue}>
                          {c.latencyMs !== undefined
                            ? `${c.latencyMs} ms`
                            : '—'}
                        </span>
                      </div>
                      <div className={styles.metaRow}>
                        <span className={styles.metaLabel}>Last</span>
                        <span className={styles.metaValue}>
                          {c.lastCheckedAt ?? '—'}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className={styles.cardBottom}>
                    <button
                      className={styles.primaryButton}
                      onClick={() => void runOne(c.key)}
                      disabled={isRunning || c.status === 'loading'}
                    >
                      {c.status === 'loading' ? '...' : 'Проверить'}
                    </button>

                    <div className={styles.detail}>
                      {c.status === 'ok' && (
                        <span className={styles.okText}>Сервис отвечает</span>
                      )}
                      {c.status === 'fail' && (
                        <span className={styles.failText}>
                          {c.error ?? 'Ошибка'}
                        </span>
                      )}
                      {(c.status === 'idle' || c.status === 'loading') && (
                        <span className={styles.mutedText}>
                          {c.status === 'loading'
                            ? 'Ждём ответ…'
                            : 'Не проверялось'}
                        </span>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </motion.section>
      </main>
    </div>
  )
}
