import { useMemo, useState } from 'react';
import { Document, Page } from 'react-pdf';

import styles from 'pages/app/home.module.scss';

type PdfViewerProps = {
    pdfUrl: string;
    fileName: string;
    onReset: () => void;
};

export function PdfViewer({ pdfUrl, fileName, onReset }: PdfViewerProps) {
    const [numPages, setNumPages] = useState(0);
    const [pageNumber, setPageNumber] = useState(1);

    const downloadName = useMemo(() => {
        const dotIndex = fileName.lastIndexOf('.');
        const baseName = dotIndex > 0 ? fileName.slice(0, dotIndex) : fileName;

        return `${baseName}.pdf`;
    }, [fileName]);

    return (
        <section className={styles.pdfStage}>
            <div className={styles.pdfShell}>
                <div className={styles.pdfToolbar}>
                    <div className={styles.pdfTitle}>
                        <span className={styles.okDot} />
                        <span>PDF готов</span>
                    </div>

                    <div className={styles.pdfTools}>
                        <div className={styles.pager}>
                            <button
                                type="button"
                                className={styles.pdfNavButton}
                                onClick={() =>
                                    setPageNumber((prev) =>
                                        Math.max(prev - 1, 1),
                                    )
                                }
                                disabled={pageNumber <= 1}
                            >
                                ‹
                            </button>

                            <span className={styles.pageInfo}>
                                {pageNumber} / {numPages || 1}
                            </span>

                            <button
                                type="button"
                                className={styles.pdfNavButton}
                                onClick={() =>
                                    setPageNumber((prev) =>
                                        Math.min(prev + 1, numPages || 1),
                                    )
                                }
                                disabled={!numPages || pageNumber >= numPages}
                            >
                                ›
                            </button>
                        </div>

                        <a
                            href={pdfUrl}
                            download={downloadName}
                            className={styles.ghostButton}
                        >
                            Скачать PDF
                        </a>

                        <button
                            type="button"
                            className={styles.resetButton}
                            onClick={onReset}
                        >
                            Новый набор
                        </button>
                    </div>
                </div>

                <div className={styles.pdfViewport}>
                    <div className={styles.pdfDocument}>
                        <Document
                            file={pdfUrl}
                            loading={
                                <div className={styles.pdfLoading}>
                                    <div className={styles.spinner} />
                                    <p>Загружаем PDF...</p>
                                </div>
                            }
                            error={
                                <div className={styles.pdfError}>
                                    <p>Не удалось открыть PDF.</p>
                                </div>
                            }
                            onLoadSuccess={({ numPages: loadedPages }) => {
                                setNumPages(loadedPages);
                                setPageNumber(1);
                            }}
                        >
                            <div className={styles.pdfPage}>
                                <Page
                                    pageNumber={pageNumber}
                                    renderTextLayer={false}
                                    renderAnnotationLayer={false}
                                />
                            </div>
                        </Document>
                    </div>
                </div>
            </div>
        </section>
    );
}
