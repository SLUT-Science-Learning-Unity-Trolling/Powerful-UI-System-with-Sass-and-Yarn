/* eslint-disable @typescript-eslint/no-misused-promises */
import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';

import styles from '../auth/auth.module.scss';
import { useLogin } from 'features/auth/hooks/useAuth';
import { getAuthErrorMessage } from 'features/auth/lib/getAuthErrorMessage';
import { useToast } from 'shared/lib/useToast';
import { PageRoutes } from 'core/router/routes';

export default function LoginPage() {
    const navigate = useNavigate();
    const location = useLocation();
    const { addToast } = useToast();

    const loginMutation = useLogin();

    const [identifier, setIdentifier] = useState('');
    const [password, setPassword] = useState('');

    const from =
        (location.state as { from?: string } | null)?.from ?? PageRoutes.app;

    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        try {
            await loginMutation.mutateAsync({
                identifier,
                password,
            });

            addToast({
                message: 'Вход выполнен',
                type: 'success',
                duration: 2000,
            });

            navigate(from, { replace: true });
        } catch (error) {
            addToast({
                message: getAuthErrorMessage(error, 'Не удалось войти'),
                type: 'error',
                duration: 2500,
            });
        }
    };

    return (
        <div className={styles.authPage}>
            <div className={styles.authCard}>
                <h1 className={styles.title}>Вход</h1>
                <p className={styles.subtitle}>
                    Войди, чтобы работать с OCR и PDF
                </p>

                <form className={styles.form} onSubmit={handleSubmit}>
                    <label className={styles.field}>
                        <span className={styles.label}>Email или username</span>
                        <input
                            className={styles.input}
                            value={identifier}
                            onChange={(event) =>
                                setIdentifier(event.target.value)
                            }
                            placeholder="user@example.com"
                            autoComplete="username"
                            required
                        />
                    </label>

                    <label className={styles.field}>
                        <span className={styles.label}>Пароль</span>
                        <input
                            className={styles.input}
                            type="password"
                            value={password}
                            onChange={(event) =>
                                setPassword(event.target.value)
                            }
                            placeholder="••••••••"
                            autoComplete="current-password"
                            required
                        />
                    </label>

                    <button
                        type="submit"
                        className={styles.submitButton}
                        disabled={loginMutation.isPending}
                    >
                        {loginMutation.isPending ? 'Входим...' : 'Войти'}
                    </button>
                </form>

                <p className={styles.footerText}>
                    Нет аккаунта?{' '}
                    <Link className={styles.link} to={PageRoutes.register}>
                        Зарегистрироваться
                    </Link>
                </p>
            </div>
        </div>
    );
}
