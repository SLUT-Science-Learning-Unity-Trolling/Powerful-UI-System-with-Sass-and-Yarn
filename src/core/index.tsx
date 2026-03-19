import { ReactStrictModeProvider } from './providers/ReactStrictModeProvider';
import { QueryProvider } from './providers/QueryProvider';
import { ToastProvider } from './providers/ToastProvider';
import { AppRouterProvider } from './router/provider';
import { AppRouter } from './router';

export default function Core() {
    return (
        <ReactStrictModeProvider>
            <QueryProvider>
                <AppRouterProvider>
                    <ToastProvider>
                        <AppRouter />
                    </ToastProvider>
                </AppRouterProvider>
            </QueryProvider>
        </ReactStrictModeProvider>
    );
}
