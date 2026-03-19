import styles from 'pages/app/home.module.scss';

export function ProcessingOverlay() {
    return (
        <div className={styles.processingOverlay}>
            <div className={styles.spinner} />
            <div className={styles.processingText}>
                <span className={styles.processingTitle}>Идёт обработка</span>
                <span className={styles.processingSub}>
                    Сервер собирает единый PDF из списка изображений.
                </span>
            </div>
        </div>
    );
}
