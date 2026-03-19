import { Navigate, Outlet, useLocation } from 'react-router-dom';

import { useMe } from '../hooks/useAuth';
import { PageRoutes } from 'core/router/routes';

export function ProtectedRoute() {
    const location = useLocation();
    const { data, isLoading, isFetching, isError } = useMe(true);

    if (isLoading || isFetching) {
        return null;
    }

    if (isError || !data) {
        return (
            <Navigate
                to={PageRoutes.login}
                replace
                state={{ from: location.pathname }}
            />
        );
    }

    return <Outlet />;
}