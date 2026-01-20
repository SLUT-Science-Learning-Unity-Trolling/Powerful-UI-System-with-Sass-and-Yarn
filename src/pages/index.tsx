import { PageRoutes } from 'app/lib/routes'
import { lazy, Suspense } from 'react'
import { Route, Routes } from 'react-router-dom'
import 'shared/config/fonts/fonts.scss'
import 'shared/config/global.scss'
import { RequireAuth, PublicOnly } from 'app/lib/routeGuards'

const HomePage = lazy(() => import('./home'))
const RegisterPage = lazy(() => import('./registration'))
const LoginPage = lazy(() => import('./login'))
const HealthPage = lazy(() => import('./health'))
const NotFoundPage = lazy(() => import('./not-found'))

export default function Routing() {
  return (
    <Suspense fallback={null}>
      <Routes>
        {/* Публичные страницы */}
        <Route element={<PublicOnly />}>
          <Route path={PageRoutes.login} element={<LoginPage />} />
          <Route path={PageRoutes.reg} element={<RegisterPage />} />
        </Route>

        {/* Приватные страницы */}
        <Route element={<RequireAuth />}>
          <Route path={PageRoutes.home} element={<HomePage />} />
          <Route path={PageRoutes.health} element={<HealthPage />} />
        </Route>

        {/* 404 */}
        <Route path={PageRoutes.notFound} element={<NotFoundPage />} />
      </Routes>
    </Suspense>
  )
}
