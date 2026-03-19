import styles from 'pages/app/home.module.scss';

type TopBarProps = {
    onPickFiles: () => void;
    hasFiles: boolean;
    onReset: () => void;
    disabled?: boolean;
};

export function TopBar({
    onPickFiles,
    hasFiles,
    onReset,
    disabled = false,
}: TopBarProps) {
    return (
        <header className={styles.topBar}>
            <div className={styles.brand}>
                <span className={styles.brandDot} />
                <span className={styles.brandText}>OCR to PDF</span>
            </div>

            <div className={styles.topActions}>
                <button
                    type="button"
                    className={styles.ghostButton}
                    onClick={onPickFiles}
                    disabled={disabled}
                >
                    Добавить файлы
                </button>

                {hasFiles && (
                    <button
                        type="button"
                        className={styles.resetButton}
                        onClick={onReset}
                        disabled={disabled}
                    >
                        Сбросить всё
                    </button>
                )}
            </div>
        </header>
    );
}
