import {
    useEffect,
    useRef,
    useState,
    type ChangeEvent,
    type DragEvent,
} from 'react';
import { pdfjs } from 'react-pdf';

import styles from './home.module.scss';
import { useUsersOcrPdfOcrToPdf } from 'shared/api/generated/ocr/ocr';
import { useToast } from 'shared/lib/useToast';
import type { AppStage, UploadItem } from 'features/ocr-upload/types';
import {
    createUploadItem,
    getErrorMessage,
    revokeUploadItems,
    validateFile,
} from 'features/ocr-upload/lib/files';
import { ErrorState } from 'features/ocr-upload/components/ErrorState';
import { HeroDropzone } from 'features/ocr-upload/components/HeroDropzone';
import { PdfViewer } from 'features/ocr-upload/components/PdfViewer';
import { PreviewList } from 'features/ocr-upload/components/PreviewList';
import { TopBar } from 'features/ocr-upload/components/TopBar';

pdfjs.GlobalWorkerOptions.workerSrc = new URL(
    'pdfjs-dist/build/pdf.worker.min.mjs',
    import.meta.url,
).toString();

const ACCEPT_ATTR =
    '.png,.jpg,.jpeg,.webp,.heic,.heif,image/png,image/jpeg,image/webp,image/heic,image/heif';

export default function AppPage() {
    const inputRef = useRef<HTMLInputElement | null>(null);
    const { addToast } = useToast();

    const [stage, setStage] = useState<AppStage>('idle');
    const [isDragging, setIsDragging] = useState(false);
    const [isPreviewDragging, setIsPreviewDragging] = useState(false);
    const [items, setItems] = useState<UploadItem[]>([]);
    const [pdfUrl, setPdfUrl] = useState<string | null>(null);
    const [errorMessage, setErrorMessage] = useState('');

    const ocrToPdfMutation = useUsersOcrPdfOcrToPdf({
        request: {
            responseType: 'blob',
        },
    });

    useEffect(() => {
        return () => {
            revokeUploadItems(items);

            if (pdfUrl) {
                URL.revokeObjectURL(pdfUrl);
            }
        };
    }, [items, pdfUrl]);

    const openFileDialog = () => {
        inputRef.current?.click();
    };

    const resetAll = () => {
        revokeUploadItems(items);

        if (pdfUrl) {
            URL.revokeObjectURL(pdfUrl);
        }

        setItems([]);
        setPdfUrl(null);
        setErrorMessage('');
        setStage('idle');
        setIsDragging(false);
        setIsPreviewDragging(false);
        ocrToPdfMutation.reset();

        if (inputRef.current) {
            inputRef.current.value = '';
        }
    };

    const appendFiles = (filesList: FileList | File[] | null) => {
        if (!filesList || filesList.length === 0) {
            return;
        }

        const files = Array.from(filesList);
        const nextValidItems: UploadItem[] = [];
        let invalidCount = 0;

        files.forEach((file) => {
            const validationError = validateFile(file);

            if (validationError) {
                invalidCount += 1;
                return;
            }

            nextValidItems.push(createUploadItem(file));
        });

        if (nextValidItems.length > 0) {
            setItems((prev) => {
                const next = [...prev, ...nextValidItems];
                setStage('preview');
                return next;
            });

            addToast({
                message:
                    nextValidItems.length === 1
                        ? 'Файл добавлен'
                        : `Добавлено файлов: ${nextValidItems.length}`,
                type: 'success',
                duration: 2000,
            });
        }

        if (invalidCount > 0) {
            addToast({
                message:
                    invalidCount === 1
                        ? 'Один файл пропущен из-за формата или размера'
                        : `Пропущено файлов: ${invalidCount}`,
                type: 'error',
                duration: 2600,
            });
        }
    };

    const handleInputChange = (event: ChangeEvent<HTMLInputElement>) => {
        appendFiles(event.target.files);

        if (inputRef.current) {
            inputRef.current.value = '';
        }
    };

    const handleHeroDragEnter = (event: DragEvent<HTMLDivElement>) => {
        event.preventDefault();
        event.stopPropagation();
        setIsDragging(true);
    };

    const handleHeroDragOver = (event: DragEvent<HTMLDivElement>) => {
        event.preventDefault();
        event.stopPropagation();
        setIsDragging(true);
    };

    const handleHeroDragLeave = (event: DragEvent<HTMLDivElement>) => {
        event.preventDefault();
        event.stopPropagation();

        if (event.currentTarget === event.target) {
            setIsDragging(false);
        }
    };

    const handleHeroDrop = (event: DragEvent<HTMLDivElement>) => {
        event.preventDefault();
        event.stopPropagation();
        setIsDragging(false);

        appendFiles(event.dataTransfer.files);
    };

    const handlePreviewDragEnter = (event: DragEvent<HTMLDivElement>) => {
        event.preventDefault();
        event.stopPropagation();
        setIsPreviewDragging(true);
    };

    const handlePreviewDragOver = (event: DragEvent<HTMLDivElement>) => {
        event.preventDefault();
        event.stopPropagation();
        setIsPreviewDragging(true);
    };

    const handlePreviewDragLeave = (event: DragEvent<HTMLDivElement>) => {
        event.preventDefault();
        event.stopPropagation();

        if (event.currentTarget === event.target) {
            setIsPreviewDragging(false);
        }
    };

    const handlePreviewDrop = (event: DragEvent<HTMLDivElement>) => {
        event.preventDefault();
        event.stopPropagation();
        setIsPreviewDragging(false);

        appendFiles(event.dataTransfer.files);
    };

    const handleRemove = (id: string) => {
        setItems((prev) => {
            const target = prev.find((item) => item.id === id);

            if (target) {
                URL.revokeObjectURL(target.previewUrl);
            }

            const next = prev.filter((item) => item.id !== id);

            if (next.length === 0) {
                setStage('idle');
            }

            return next;
        });

        addToast({
            message: 'Файл удалён из списка',
            type: 'info',
            duration: 1800,
        });
    };

    const handleReorder = (nextItems: UploadItem[]) => {
        setItems(nextItems);
    };

    const handleSubmit = async () => {
        if (items.length === 0) {
            addToast({
                message: 'Сначала добавь изображения',
                type: 'error',
                duration: 2000,
            });
            return;
        }

        setStage('processing');
        setErrorMessage('');

        try {
            const blob = await ocrToPdfMutation.mutateAsync({
                data: {
                    files: items.map((item) => item.file),
                },
            });

            if (pdfUrl) {
                URL.revokeObjectURL(pdfUrl);
            }

            const nextPdfUrl = URL.createObjectURL(blob);

            setPdfUrl(nextPdfUrl);
            setStage('pdf');

            addToast({
                message: 'PDF успешно собран',
                type: 'success',
                duration: 2200,
            });
        } catch (error) {
            const message = getErrorMessage(error);
            setErrorMessage(message);
            setStage('error');

            addToast({
                message: 'Не удалось собрать PDF',
                type: 'error',
                duration: 2400,
            });
        }
    };

    const outputFileName =
        items.length === 1
            ? items[0].file.name
            : `document-${items.length}-pages`;

    return (
        <div className={styles.container}>
            <input
                ref={inputRef}
                type="file"
                multiple
                accept={ACCEPT_ATTR}
                className={styles.fileInput}
                onChange={handleInputChange}
            />

            <TopBar
                onPickFiles={openFileDialog}
                hasFiles={items.length > 0 || Boolean(pdfUrl)}
                onReset={resetAll}
                disabled={stage === 'processing'}
            />

            <main className={styles.main}>
                <div
                    className={`${styles.dropLayer} ${
                        isDragging ? styles.dropLayerActive : ''
                    }`}
                />

                {stage === 'idle' && (
                    <HeroDropzone
                        isDragging={isDragging}
                        onDrop={handleHeroDrop}
                        onDragEnter={handleHeroDragEnter}
                        onDragOver={handleHeroDragOver}
                        onDragLeave={handleHeroDragLeave}
                        onPickFiles={openFileDialog}
                    />
                )}

                {(stage === 'preview' || stage === 'processing') &&
                    items.length > 0 && (
                        <PreviewList
                            items={items}
                            isProcessing={stage === 'processing'}
                            isDraggingOver={isPreviewDragging}
                            onSubmit={handleSubmit}
                            onAddMore={openFileDialog}
                            onRemove={handleRemove}
                            onReorder={handleReorder}
                            onDrop={handlePreviewDrop}
                            onDragEnter={handlePreviewDragEnter}
                            onDragOver={handlePreviewDragOver}
                            onDragLeave={handlePreviewDragLeave}
                        />
                    )}

                {stage === 'pdf' && pdfUrl && (
                    <PdfViewer
                        pdfUrl={pdfUrl}
                        fileName={outputFileName}
                        onReset={resetAll}
                    />
                )}

                {stage === 'error' && (
                    <ErrorState message={errorMessage} onReset={resetAll} />
                )}
            </main>
        </div>
    );
}
