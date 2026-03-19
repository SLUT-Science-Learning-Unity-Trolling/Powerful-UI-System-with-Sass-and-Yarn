/* eslint-disable @typescript-eslint/no-misused-promises */
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

import styles from '../auth/auth.module.scss';
import { useRegister } from 'features/auth/hooks/useAuth';
import { getAuthErrorMessage } from 'features/auth/lib/getAuthErrorMessage';
import { useToast } from 'shared/lib/useToast';
import { PageRoutes } from 'core/router/routes';

export default function RegisterPage() {
    const navigate = useNavigate();
    const { addToast } = useToast();

    const registerMutation = useRegister();

    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [repeatPassword, setRepeatPassword] = useState('');

    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        if (password !== repeatPassword) {
            addToast({
                message: 'Пароли не совпадают',
                type: 'error',
                duration: 2200,
            });
            return;
        }

        try {
            await registerMutation.mutateAsync({
                username,
                email,
                password,
                repeat_password: repeatPassword,
            });

            addToast({
                message: 'Аккаунт создан',
                type: 'success',
                duration: 2000,
            });

            navigate(PageRoutes.app, { replace: true });
        } catch (error) {
            addToast({
                message: getAuthErrorMessage(
                    error,
                    'Не удалось зарегистрироваться',
                ),
                type: 'error',
                duration: 2500,
            });
        }
    };

    return (
        <div className={styles.authPage}>
            <div className={styles.authCard}>
                <h1 className={styles.title}>Регистрация</h1>
                <p className={styles.subtitle}>
                    Создай аккаунт для работы с OCR
                </p>

                <form className={styles.form} onSubmit={handleSubmit}>
                    <label className={styles.field}>
                        <span className={styles.label}>Username</span>
                        <input
                            className={styles.input}
                            value={username}
                            onChange={(event) =>
                                setUsername(event.target.value)
                            }
                            placeholder="User123"
                            autoComplete="username"
                            required
                        />
                    </label>

                    <label className={styles.field}>
                        <span className={styles.label}>Email</span>
                        <input
                            className={styles.input}
                            type="email"
                            value={email}
                            onChange={(event) => setEmail(event.target.value)}
                            placeholder="user@example.com"
                            autoComplete="email"
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
                            autoComplete="new-password"
                            required
                        />
                    </label>

                    <label className={styles.field}>
                        <span className={styles.label}>Повтори пароль</span>
                        <input
                            className={styles.input}
                            type="password"
                            value={repeatPassword}
                            onChange={(event) =>
                                setRepeatPassword(event.target.value)
                            }
                            placeholder="••••••••"
                            autoComplete="new-password"
                            required
                        />
                    </label>

                    <button
                        type="submit"
                        className={styles.submitButton}
                        disabled={registerMutation.isPending}
                    >
                        {registerMutation.isPending
                            ? 'Создаём...'
                            : 'Создать аккаунт'}
                    </button>
                </form>

                <p className={styles.footerText}>
                    Уже есть аккаунт?{' '}
                    <Link className={styles.link} to={PageRoutes.login}>
                        Войти
                    </Link>
                </p>
            </div>
        </div>
    );
}
