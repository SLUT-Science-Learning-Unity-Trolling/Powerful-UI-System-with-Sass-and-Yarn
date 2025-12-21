/* eslint-disable @typescript-eslint/no-misused-promises */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Document, Page, pdfjs } from 'react-pdf'
import { useToast } from 'utils/useToast'
import rat from 'shared/ui/img/rat.gif'
import styles from './home.module.scss'

import 'react-pdf/dist/Page/AnnotationLayer.css'
import 'react-pdf/dist/Page/TextLayer.css'

pdfjs.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.js`

export default function HomePage() {
  const [selectedImage, setSelectedImage] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [pdfUrl, setPdfUrl] = useState<string | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [isDragging, setIsDragging] = useState(false)
  const [numPages, setNumPages] = useState<number>(0)
  const [pageNumber, setPageNumber] = useState<number>(1)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { addToast } = useToast()

  const handleFileSelect = (file: File) => {
    if (!file.type.startsWith('image/')) {
      addToast({
        message: 'Пожалуйста, выберите изображение',
        type: 'error',
        duration: 3000,
      })
      return
    }

    setSelectedImage(file)
    const reader = new FileReader()
    reader.onload = (e) => {
      setImagePreview(e.target?.result as string)
    }
    reader.readAsDataURL(file)
    setPdfUrl(null)
    setPageNumber(1)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)

    const file = e.dataTransfer.files[0]
    if (file) handleFileSelect(file)
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = () => {
    setIsDragging(false)
  }

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) handleFileSelect(file)
  }

  const handleUpload = async () => {
    if (!selectedImage) return

    setIsProcessing(true)

    const formData = new FormData()
    formData.append('image', selectedImage)

    try {
      // const response = await fetch('/api/process-image', {
      //   method: 'POST',
      //   body: formData,
      // })
      // const blob = await response.blob()
      // const url = URL.createObjectURL(blob)
      // setPdfUrl(url)

      await new Promise((resolve) => setTimeout(resolve, 3000))

      setPdfUrl(
        'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf'
      )

      addToast({
        message: 'PDF готов к скачиванию!',
        type: 'success',
        duration: 3000,
      })
    } catch (error) {
      addToast({
        message: 'Ошибка обработки изображения',
        type: 'error',
        duration: 3000,
      })
    } finally {
      setIsProcessing(false)
    }
  }

  const handleDownload = () => {
    if (!pdfUrl) return

    const link = document.createElement('a')
    link.href = pdfUrl
    link.download = 'processed-document.pdf'
    link.click()

    addToast({
      message: 'PDF загружен!',
      type: 'success',
      duration: 2000,
    })
  }

  const handleReset = () => {
    setSelectedImage(null)
    setImagePreview(null)
    setPdfUrl(null)
    setPageNumber(1)
    setNumPages(0)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const onDocumentLoadSuccess = ({ numPages }: { numPages: number }) => {
    setNumPages(numPages)
    setPageNumber(1)
  }

  const changePage = (offset: number) => {
    setPageNumber((prevPageNumber) => prevPageNumber + offset)
  }

  const previousPage = () => {
    changePage(-1)
  }

  const nextPage = () => {
    changePage(1)
  }

  return (
    <div className={styles.container}>
      <aside className={styles.sidebar}>
        <h2 className={styles.sidebarTitle}>Загрузка</h2>

        <div className={styles.uploadSection}>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileInputChange}
            className={styles.fileInput}
            id="fileInput"
          />

          <label
            htmlFor="fileInput"
            className={`${styles.uploadZone} ${isDragging ? styles.dragging : ''}`}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
          >
            <div className={styles.uploadIcon}>📁</div>
            <p className={styles.uploadText}>
              {isDragging
                ? 'Отпустите файл'
                : 'Перетащите изображение или кликните'}
            </p>
            <p className={styles.uploadHint}>PNG, JPG до 10MB</p>
          </label>

          {selectedImage && (
            <motion.div
              className={styles.fileInfo}
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <div className={styles.fileName}>📷 {selectedImage.name}</div>
              <div className={styles.fileSize}>
                {(selectedImage.size / 1024 / 1024).toFixed(2)} MB
              </div>
            </motion.div>
          )}
        </div>

        <div className={styles.actions}>
          <button
            className={styles.processButton}
            onClick={handleUpload}
            disabled={!selectedImage || isProcessing}
          >
            {isProcessing ? 'Обработка...' : 'Обработать'}
          </button>

          {pdfUrl && (
            <motion.button
              className={styles.downloadButton}
              onClick={handleDownload}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
            >
              📥 Скачать PDF
            </motion.button>
          )}

          {(selectedImage || pdfUrl) && (
            <button className={styles.resetButton} onClick={handleReset}>
              Очистить
            </button>
          )}
        </div>
      </aside>

      <main className={styles.mainContent}>
        <AnimatePresence mode="wait">
          {!imagePreview && !pdfUrl && (
            <motion.div
              key="empty"
              className={styles.emptyState}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <img src={rat} alt="Rat" className={styles.ratGif} />
              <h3 className={styles.emptyTitle}>Где PDF?</h3>
              <p className={styles.emptyText}>
                PDF появится здесь, как только вы загрузите изображение
                <br />
                и нажмёте кнопку &quot;Обработать&quot;
                <br />
                <br />
                <span className={styles.emptyHint}>
                  Пока можете полюбоваться на эту крысу 🐀
                </span>
              </p>
            </motion.div>
          )}

          {imagePreview && !pdfUrl && (
            <motion.div
              key="preview"
              className={styles.previewContainer}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
            >
              <h3 className={styles.previewTitle}>Предпросмотр изображения</h3>
              <div className={styles.imageWrapper}>
                <img
                  src={imagePreview}
                  alt="Preview"
                  className={styles.previewImage}
                />
              </div>
              {isProcessing && (
                <div className={styles.processingOverlay}>
                  <div className={styles.spinner}></div>
                  <p>Обрабатываем изображение...</p>
                </div>
              )}
            </motion.div>
          )}

          {pdfUrl && (
            <motion.div
              key="pdf"
              className={styles.pdfContainer}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
            >
              <div className={styles.pdfHeader}>
                <h3 className={styles.previewTitle}>PDF готов!</h3>
                {numPages > 0 && (
                  <div className={styles.pdfControls}>
                    <button
                      onClick={previousPage}
                      disabled={pageNumber <= 1}
                      className={styles.pdfNavButton}
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
                    >
                      →
                    </button>
                  </div>
                )}
              </div>
              <div className={styles.pdfViewerWrapper}>
                <Document
                  file={pdfUrl}
                  onLoadSuccess={onDocumentLoadSuccess}
                  className={styles.pdfDocument}
                  loading={
                    <div className={styles.pdfLoading}>
                      <div className={styles.spinner}></div>
                      <p>Загружаем PDF...</p>
                    </div>
                  }
                  error={
                    <div className={styles.pdfError}>
                      <p>Ошибка загрузки PDF</p>
                      <button
                        onClick={handleDownload}
                        className={styles.downloadFallback}
                      >
                        Скачать PDF напрямую
                      </button>
                    </div>
                  }
                >
                  <Page
                    pageNumber={pageNumber}
                    className={styles.pdfPage}
                    width={850}
                  />
                </Document>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  )
}
