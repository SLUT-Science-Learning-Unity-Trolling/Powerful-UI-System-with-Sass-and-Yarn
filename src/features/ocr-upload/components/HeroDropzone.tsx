import type { DragEvent } from 'react';

import styles from 'pages/app/home.module.scss';

type HeroDropzoneProps = {
    isDragging: boolean;
    onDrop: (event: DragEvent<HTMLDivElement>) => void;
    onDragEnter: (event: DragEvent<HTMLDivElement>) => void;
    onDragOver: (event: DragEvent<HTMLDivElement>) => void;
    onDragLeave: (event: DragEvent<HTMLDivElement>) => void;
    onPickFiles: () => void;
};

export function HeroDropzone({
    isDragging,
    onDrop,
    onDragEnter,
    onDragOver,
    onDragLeave,
    onPickFiles,
}: HeroDropzoneProps) {
    return (
        <section className={styles.hero}>
            <div
                className={`${styles.dropZone} ${isDragging ? styles.dragging : ''}`}
                onClick={onPickFiles}
                onDrop={onDrop}
                onDragEnter={onDragEnter}
                onDragOver={onDragOver}
                onDragLeave={onDragLeave}
                role="button"
                tabIndex={0}
                onKeyDown={(event) => {
                    if (event.key === 'Enter' || event.key === ' ') {
                        event.preventDefault();
                        onPickFiles();
                    }
                }}
            >
                <div className={styles.dropIcon}>📦</div>
                <h1 className={styles.heroTitle}>
                    Загрузи изображения — получи один PDF
                </h1>
                <p className={styles.heroText}>
                    Перетащи несколько изображений сюда или{' '}
                    <span className={styles.heroHint}>
                        выбери файлы вручную
                    </span>
                    . Порядок страниц можно будет изменить перед отправкой.
                </p>

                <div className={styles.miniNote}>
                    <span>Поддержка:</span>
                    <span>PNG / JPG / JPEG / WEBP / HEIC / HEIF</span>
                </div>
            </div>
        </section>
    );
}
