import { lazy, Suspense } from 'react';
import { Route, Routes } from 'react-router-dom';

import { PageRoutes } from './routes';
import AppPage from 'pages/app';
import { ProtectedRoute } from 'features/auth/components/ProtectedRoute';
import { GuestRoute } from 'features/auth/components/GuestRoute';

const NotFoundPage = lazy(() => import('pages/not-found'));
const LoginPage = lazy(() => import('pages/login'));
const RegisterPage = lazy(() => import('pages/register'));

export function AppRouter() {
    return (
        <Suspense fallback={null}>
            <Routes>
                <Route element={<GuestRoute />}>
                    <Route path={PageRoutes.login} element={<LoginPage />} />
                    <Route path={PageRoutes.register} element={<RegisterPage />} />
                </Route>

                <Route element={<ProtectedRoute />}>
                    <Route path={PageRoutes.app} element={<AppPage />} />
                </Route>

                <Route path={PageRoutes.notFound} element={<NotFoundPage />} />
            </Routes>
        </Suspense>
    );
}