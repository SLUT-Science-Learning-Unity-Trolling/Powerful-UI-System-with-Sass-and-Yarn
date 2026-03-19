import styles from 'pages/app/home.module.scss';

type ErrorStateProps = {
    message: string;
    onReset: () => void;
};

export function ErrorState({ message, onReset }: ErrorStateProps) {
    return (
        <section className={styles.hero}>
            <div className={styles.dropZone}>
                <div className={styles.dropIcon}>‼️</div>
                <h1 className={styles.heroTitle}>Ошибка обработки</h1>
                <p className={styles.heroText}>{message}</p>

                <div style={{ marginTop: '20px' }}>
                    <button
                        type="button"
                        className={styles.primaryButton}
                        onClick={onReset}
                    >
                        Попробовать снова
                    </button>
                </div>
            </div>
        </section>
    );
}
