import { motion, Reorder } from 'framer-motion';
import { useMemo, useState, type DragEvent } from 'react';

import styles from 'pages/app/home.module.scss';
import type { UploadItem } from '../types';
import { formatFileSize } from '../lib/files';
import { ProcessingOverlay } from './ProcessingOverlay';

type PreviewListProps = {
    items: UploadItem[];
    isProcessing: boolean;
    isDraggingOver?: boolean;
    onSubmit: () => Promise<void>;
    onAddMore: () => void;
    onRemove: (id: string) => void;
    onReorder: (items: UploadItem[]) => void;
    onDrop: (event: DragEvent<HTMLDivElement>) => void;
    onDragEnter: (event: DragEvent<HTMLDivElement>) => void;
    onDragOver: (event: DragEvent<HTMLDivElement>) => void;
    onDragLeave: (event: DragEvent<HTMLDivElement>) => void;
};

export function PreviewList({
    items,
    isProcessing,
    isDraggingOver = false,
    onSubmit,
    onRemove,
    onReorder,
    onDrop,
    onDragEnter,
    onDragOver,
    onDragLeave,
}: PreviewListProps) {
    const [hoveredId, setHoveredId] = useState<string | null>(null);

    const totalSize = items.reduce((acc, item) => acc + item.file.size, 0);

    const hoveredItem = useMemo(
        () => items.find((item) => item.id === hoveredId) ?? null,
        [items, hoveredId],
    );

    return (
        <section className={styles.previewStage}>
            <div className={styles.card}>
                <div className={styles.cardHeader}>
                    <div>
                        <h2 className={styles.cardTitle}>
                            Файлы готовы к обработке
                        </h2>

                        <p className={styles.cardSub}>
                            <span className={styles.fileBadge}>
                                {items.length}{' '}
                                {items.length === 1 ? 'файл' : 'файлов'}
                            </span>
                            <span className={styles.dotSep}>•</span>
                            <span className={styles.muted}>
                                {formatFileSize(totalSize)}
                            </span>
                        </p>
                    </div>

                    <div className={styles.cardHeaderActions}>
                        <button
                            type="button"
                            className={styles.primaryButton}
                            onClick={() => {
                                void onSubmit();
                            }}
                            disabled={isProcessing || items.length === 0}
                        >
                            {isProcessing ? 'Обрабатываем...' : 'Собрать PDF'}
                        </button>
                    </div>
                </div>

                <div
                    className={styles.previewBody}
                    onDrop={onDrop}
                    onDragEnter={onDragEnter}
                    onDragOver={onDragOver}
                    onDragLeave={onDragLeave}
                >
                    <div
                        className={`${styles.previewDropLayer} ${
                            isDraggingOver ? styles.previewDropLayerActive : ''
                        }`}
                    >
                        <span className={styles.previewDropText}>
                            Отпусти файлы, чтобы добавить их в список
                        </span>
                    </div>

                    <div className={styles.previewContent}>
                        <Reorder.Group
                            axis="y"
                            values={items}
                            onReorder={onReorder}
                            className={styles.previewList}
                        >
                            {items.map((item, index) => (
                                <Reorder.Item
                                    key={item.id}
                                    value={item}
                                    className={styles.previewListItem}
                                    whileDrag={{ scale: 1.01 }}
                                >
                                    <motion.button
                                        layout
                                        type="button"
                                        className={styles.previewThumbWrap}
                                        onMouseEnter={() =>
                                            setHoveredId(item.id)
                                        }
                                        onMouseLeave={() => {
                                            setHoveredId((current) =>
                                                current === item.id
                                                    ? null
                                                    : current,
                                            );
                                        }}
                                        onFocus={() => setHoveredId(item.id)}
                                        onBlur={() => {
                                            setHoveredId((current) =>
                                                current === item.id
                                                    ? null
                                                    : current,
                                            );
                                        }}
                                        onClick={() => {
                                            setHoveredId((current) =>
                                                current === item.id
                                                    ? null
                                                    : item.id,
                                            );
                                        }}
                                        aria-label={`Предпросмотр ${item.file.name}`}
                                    >
                                        <img
                                            src={item.previewUrl}
                                            alt={item.file.name}
                                            className={styles.previewThumb}
                                        />
                                    </motion.button>

                                    <div className={styles.previewMeta}>
                                        <div className={styles.previewIndex}>
                                            {index + 1}
                                        </div>

                                        <div
                                            className={styles.previewTextBlock}
                                        >
                                            <p className={styles.previewName}>
                                                {item.file.name}
                                            </p>
                                            <p className={styles.previewInfo}>
                                                {formatFileSize(item.file.size)}
                                            </p>
                                        </div>
                                    </div>

                                    <div className={styles.previewItemActions}>
                                        <button
                                            type="button"
                                            className={styles.resetButton}
                                            onClick={() => onRemove(item.id)}
                                            disabled={isProcessing}
                                        >
                                            Удалить
                                        </button>
                                    </div>
                                </Reorder.Item>
                            ))}
                        </Reorder.Group>

                        <div className={styles.hoverPreviewPane}>
                            {hoveredItem ? (
                                <motion.div
                                    key={hoveredItem.id}
                                    className={styles.hoverPreviewCard}
                                    initial={{ opacity: 0, y: 8, scale: 0.98 }}
                                    animate={{ opacity: 1, y: 0, scale: 1 }}
                                    transition={{ duration: 0.18 }}
                                >
                                    <div
                                        className={styles.hoverPreviewImageWrap}
                                    >
                                        <img
                                            src={hoveredItem.previewUrl}
                                            alt={hoveredItem.file.name}
                                            className={styles.hoverPreviewImage}
                                        />
                                    </div>

                                    <div className={styles.hoverPreviewMeta}>
                                        <p className={styles.hoverPreviewName}>
                                            {hoveredItem.file.name}
                                        </p>
                                        <p className={styles.hoverPreviewInfo}>
                                            {formatFileSize(
                                                hoveredItem.file.size,
                                            )}
                                        </p>
                                    </div>
                                </motion.div>
                            ) : (
                                <div className={styles.hoverPreviewEmpty}>
                                    Наведи на миниатюру, чтобы посмотреть
                                    изображение
                                </div>
                            )}
                        </div>
                    </div>

                    {isProcessing && <ProcessingOverlay />}
                </div>

                <div className={styles.cardFooter}>
                    <span className={styles.footerHint}>
                        Перетаскивай карточки, чтобы менять порядок страниц.
                        Сюда же можно докидывать новые файлы drag and drop.
                    </span>
                </div>
            </div>
        </section>
    );
}
