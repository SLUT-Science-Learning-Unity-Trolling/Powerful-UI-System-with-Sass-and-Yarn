/* eslint-disable @typescript-eslint/no-misused-promises */
import { useEffect, useMemo, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Document, Page, pdfjs } from 'react-pdf'
import { useToast } from 'utils/useToast'
import styles from './home.module.scss'
import mockPdfUrl from 'shared/mocks/processed.pdf?url'
import pdfWorker from 'pdfjs-dist/build/pdf.worker.min.mjs?url'

import 'react-pdf/dist/Page/AnnotationLayer.css'
import 'react-pdf/dist/Page/TextLayer.css'

pdfjs.GlobalWorkerOptions.workerSrc = pdfWorker

type Step = 'idle' | 'ready' | 'processing' | 'done'

const MAX_MB = 10

export default function HomePage() {
  const { addToast } = useToast()

  const [step, setStep] = useState<Step>('idle')
  const [isDragging, setIsDragging] = useState(false)

  const [selectedImage, setSelectedImage] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)

  const [pdfUrl, setPdfUrl] = useState<string | null>(null)
  const [numPages, setNumPages] = useState(0)
  const [pageNumber, setPageNumber] = useState(1)

  const fileInputRef = useRef<HTMLInputElement>(null)

  const pdfViewportRef = useRef<HTMLDivElement>(null)
  const [pdfWidth, setPdfWidth] = useState<number>(900)

  const readableSize = useMemo(() => {
    if (!selectedImage) return ''
    return `${(selectedImage.size / 1024 / 1024).toFixed(2)} MB`
  }, [selectedImage])

  useEffect(() => {
    const el = pdfViewportRef.current
    if (!el) return

    const ro = new ResizeObserver(() => {
      const w = el.clientWidth
      setPdfWidth(Math.max(320, Math.min(1100, w - 24)))
    })
    ro.observe(el)
    return () => ro.disconnect()
  }, [step])

  const resetAll = () => {
    setStep('idle')
    setIsDragging(false)

    setSelectedImage(null)
    setImagePreview(null)

    setPdfUrl(null)
    setNumPages(0)
    setPageNumber(1)

    if (pdfUrl?.startsWith('blob:')) URL.revokeObjectURL(pdfUrl)

    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  const validateAndSetFile = (file: File) => {
    if (!file.type.startsWith('image/')) {
      addToast({
        message: 'Пожалуйста, выберите изображение',
        type: 'error',
        duration: 3000,
      })
      return
    }

    const mb = file.size / 1024 / 1024
    if (mb > MAX_MB) {
      addToast({
        message: `Файл слишком большой (макс. ${MAX_MB}MB)`,
        type: 'error',
        duration: 3500,
      })
      return
    }

    setSelectedImage(file)
    setPdfUrl(null)
    setNumPages(0)
    setPageNumber(1)

    const reader = new FileReader()
    reader.onload = (e) => setImagePreview(e.target?.result as string)
    reader.readAsDataURL(file)

    setStep('ready')
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    const file = e.dataTransfer.files?.[0]
    if (file) validateAndSetFile(file)
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    if (step === 'processing' || step === 'done') return
    setIsDragging(true)
  }

  const handleDragLeave = () => setIsDragging(false)

  const handlePickClick = () => fileInputRef.current?.click()

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) validateAndSetFile(file)
  }

  const handleUpload = async () => {
    if (!selectedImage) return

    setStep('processing')

    const formData = new FormData()
    formData.append('image', selectedImage)

    try {
      // const resp = await fetch('/api/process-image', { method: 'POST', body: formData })
      // if (!resp.ok) throw new Error('Upload failed')
      // const blob = await resp.blob()
      // const url = URL.createObjectURL(blob)
      // setPdfUrl(url)

      await new Promise((r) => setTimeout(r, 1500))
      const resp = await fetch(mockPdfUrl)
      const blob = await resp.blob()

      const url = URL.createObjectURL(blob)
      setPdfUrl(url)

      addToast({ message: 'PDF готов!', type: 'success', duration: 2500 })
      setStep('done')
    } catch {
      addToast({
        message: 'Ошибка обработки изображения',
        type: 'error',
        duration: 3000,
      })
      setStep('ready')
    }
  }

  const handleDownload = () => {
    if (!pdfUrl) return

    const link = document.createElement('a')
    link.href = pdfUrl
    link.download = 'document.pdf'
    link.click()

    addToast({ message: 'PDF загружен!', type: 'success', duration: 2000 })
  }

  const onDocumentLoadSuccess = ({ numPages: pages }: { numPages: number }) => {
    setNumPages(pages)
    setPageNumber(1)
  }

  const previousPage = () => setPageNumber((p) => Math.max(1, p - 1))
  const nextPage = () => setPageNumber((p) => Math.min(numPages || 1, p + 1))

  return (
    <div className={styles.container}>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className={styles.fileInput}
        onChange={handleFileInputChange}
      />

      <div className={styles.topBar}>
        <div className={styles.brand}>
          <span className={styles.brandDot} />
          <span className={styles.brandText}>Image → PDF</span>
        </div>

        <div className={styles.topActions}>
          {(step === 'idle' || step === 'ready') && (
            <button
              className={styles.ghostButton}
              onClick={handlePickClick}
              disabled={step.includes('processing')}
            >
              Выбрать файл
            </button>
          )}

          {(step === 'ready' || step === 'processing') && (
            <button
              className={styles.primaryButton}
              onClick={handleUpload}
              disabled={!selectedImage || step === 'processing'}
            >
              {step === 'processing' ? 'Отправляем…' : 'Отправить'}
            </button>
          )}

          {step === 'done' && (
            <>
              <button className={styles.ghostButton} onClick={handleDownload}>
                Скачать PDF
              </button>
              <button className={styles.resetButton} onClick={resetAll}>
                Новая загрузка
              </button>
            </>
          )}
        </div>
      </div>

      <main className={styles.main}>
        <div
          className={`${styles.dropLayer} ${isDragging ? styles.dropLayerActive : ''}`}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onClick={step === 'idle' ? handlePickClick : undefined}
          role="button"
          tabIndex={0}
        />

        <AnimatePresence mode="wait">
          {step === 'idle' && (
            <motion.section
              key="idle"
              className={styles.hero}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.25 }}
            >
              <div
                className={`${styles.dropZone} ${isDragging ? styles.dragging : ''}`}
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onClick={handlePickClick}
                role="button"
                tabIndex={0}
              >
                <div className={styles.dropIcon}>📄</div>
                <h1 className={styles.heroTitle}>Загрузите картинку</h1>
                <p className={styles.heroText}>
                  Перетащите файл сюда или кликните, чтобы выбрать
                  <br />
                  <span className={styles.heroHint}>
                    PNG / JPG до {MAX_MB}MB
                  </span>
                </p>
                <div className={styles.miniNote}>
                  1 изображение → 1 PDF. Без лишних шагов.
                </div>
              </div>
            </motion.section>
          )}

          {step !== 'idle' && step !== 'done' && (
            <motion.section
              key="preview"
              className={styles.previewStage}
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              transition={{ duration: 0.25 }}
            >
              <div className={styles.card}>
                <div className={styles.cardHeader}>
                  <div>
                    <h2 className={styles.cardTitle}>Предпросмотр</h2>
                    <p className={styles.cardSub}>
                      {selectedImage ? (
                        <>
                          <span className={styles.fileBadge}>
                            📷 {selectedImage.name}
                          </span>
                          <span className={styles.dotSep}>•</span>
                          <span className={styles.muted}>{readableSize}</span>
                        </>
                      ) : (
                        <span className={styles.muted}>Выберите файл</span>
                      )}
                    </p>
                  </div>

                  <div className={styles.cardHeaderActions}>
                    <button
                      className={styles.ghostButton}
                      onClick={handlePickClick}
                      disabled={step === 'processing'}
                    >
                      Заменить
                    </button>
                    <button
                      className={styles.resetButton}
                      onClick={resetAll}
                      disabled={step === 'processing'}
                    >
                      Очистить
                    </button>
                  </div>
                </div>

                <div className={styles.previewBody}>
                  {imagePreview && (
                    <div className={styles.imageFrame}>
                      <img
                        src={imagePreview}
                        alt="Preview"
                        className={styles.previewImage}
                      />
                    </div>
                  )}

                  {step === 'processing' && (
                    <div className={styles.processingOverlay}>
                      <div className={styles.spinner} />
                      <div className={styles.processingText}>
                        <div className={styles.processingTitle}>
                          Обрабатываем…
                        </div>
                        <div className={styles.processingSub}>
                          Обычно это занимает пару секунд
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                <div className={styles.cardFooter}>
                  <button
                    className={styles.primaryButton}
                    onClick={handleUpload}
                    disabled={!selectedImage || step === 'processing'}
                  >
                    {step === 'processing'
                      ? 'Ожидаем…'
                      : 'Отправить и получить PDF'}
                  </button>
                  <div className={styles.footerHint}>
                    После готовности PDF откроется на весь экран
                  </div>
                </div>
              </div>
            </motion.section>
          )}

          {step === 'done' && pdfUrl && (
            <motion.section
              key="pdf"
              className={styles.pdfStage}
              initial={{ opacity: 0, scale: 0.985 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.985 }}
              transition={{ duration: 0.25 }}
            >
              <div className={styles.pdfShell}>
                <div className={styles.pdfToolbar}>
                  <div className={styles.pdfTitle}>
                    <span className={styles.okDot} />
                    PDF готов
                  </div>

                  <div className={styles.pdfTools}>
                    {numPages > 0 && (
                      <div className={styles.pager}>
                        <button
                          onClick={previousPage}
                          disabled={pageNumber <= 1}
                          className={styles.pdfNavButton}
                          aria-label="Previous page"
                        >
                          ←
                        </button>
                        <span className={styles.pageInfo}>
                          {pageNumber} / {numPages}
                        </span>
                        <button
                          onClick={nextPage}
                          disabled={pageNumber >= numPages}
                          className={styles.pdfNavButton}
                          aria-label="Next page"
                        >
                          →
                        </button>
                      </div>
                    )}

                    <button
                      className={styles.ghostButton}
                      onClick={handleDownload}
                    >
                      Скачать
                    </button>
                    <button className={styles.resetButton} onClick={resetAll}>
                      Новая загрузка
                    </button>
                  </div>
                </div>

                <div className={styles.pdfViewport} ref={pdfViewportRef}>
                  <Document
                    file={pdfUrl}
                    onLoadSuccess={onDocumentLoadSuccess}
                    className={styles.pdfDocument}
                    loading={
                      <div className={styles.pdfLoading}>
                        <div className={styles.spinner} />
                        <p>Загружаем PDF…</p>
                      </div>
                    }
                    error={
                      <div className={styles.pdfError}>
                        <p>Ошибка загрузки PDF</p>
                        <button
                          onClick={handleDownload}
                          className={styles.primaryButton}
                        >
                          Скачать напрямую
                        </button>
                      </div>
                    }
                  >
                    <Page
                      pageNumber={pageNumber}
                      className={styles.pdfPage}
                      width={pdfWidth}
                    />
                  </Document>
                </div>
              </div>
            </motion.section>
          )}
        </AnimatePresence>
      </main>
    </div>
  )
}
