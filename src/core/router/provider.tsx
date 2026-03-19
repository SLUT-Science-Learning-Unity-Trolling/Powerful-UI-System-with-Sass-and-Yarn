import type { ReactNode } from 'react';
import { BrowserRouter } from 'react-router-dom';

interface Props {
    children: ReactNode;
}

export function AppRouterProvider({ children }: Props) {
    return (
        <BrowserRouter
            future={{
                v7_startTransition: true,
                v7_relativeSplatPath: true,
            }}
        >
            {children}
        </BrowserRouter>
    );
}
