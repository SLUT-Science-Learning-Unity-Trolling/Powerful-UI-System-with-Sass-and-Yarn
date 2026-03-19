import { Navigate, Outlet } from 'react-router-dom';

import { useMe } from '../hooks/useAuth';
import { PageRoutes } from 'core/router/routes';

export function GuestRoute() {
    const { data, isLoading, isFetching, isError } = useMe(true);

    if (isLoading || isFetching) {
        return null;
    }

    if (isError) {
        return <Outlet />;
    }

    if (data) {
        return <Navigate to={PageRoutes.app} replace />;
    }

    return <Outlet />;
}