import { PageRoutes } from 'app/lib/routes'
import { lazy } from 'react'
import { Route, Routes } from 'react-router-dom'
import 'shared/config/fonts/fonts.scss'
import 'shared/config/global.scss'

const LoginPage = lazy(() => import('./login'))
const SearchPage = lazy(() => import('./search'))
const NotFoundPage = lazy(() => import('./not-found'))

export default function Routing() {
  return (
    <Routes>
      <Route path={`${PageRoutes.login}`} element={<LoginPage />} />
      <Route path={`${PageRoutes.search}`} element={<SearchPage />} />
      <Route path={`${PageRoutes.notFound}`} element={<NotFoundPage />} />
    </Routes>
  )
}
