import { createRoot } from 'react-dom/client';
import Core from 'core';
import 'shared/assets/fonts/fonts.scss';
import 'shared/config/global.scss';

createRoot(document.getElementById('root')!).render(<Core />);

const removeLoader = () => {
    const loader = document.getElementById('initial-loader');
    if (loader) {
        setTimeout(() => {
            loader.style.opacity = '0';
            setTimeout(() => loader.remove(), 350);
        }, 150);
    }
};

if (document.readyState === 'complete') {
    removeLoader();
} else {
    window.addEventListener('load', removeLoader);
}
