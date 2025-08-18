import React, { useEffect } from 'react';
import { BrowserRouter as Router, Navigate } from 'react-router-dom';
import AuthenticatedRoutes from './components/routing/AuthenticatedRoutes.jsx';
import UnauthenticatedRoutes from './components/routing/UnauthenticatedRoutes.jsx';
import ConfirmationPage from './pages/confirmationPage/ConfirmationPage.jsx';
import useAuthStore from './store/index.js';

function App() {
    const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
    const isConfirmed = useAuthStore((state) => state.isConfirmed);
    const isLoading = useAuthStore((state) => state.isLoading);
    const checkAuth = useAuthStore((state) => state.checkAuth);

    console.log('[App] Render - isAuthenticated:', isAuthenticated, 'isConfirmed:', isConfirmed, 'isLoading:', isLoading);

    // Проверка авторизации при запуске приложения
    useEffect(() => {
        console.log('[App] useEffect checkAuth triggered');
        checkAuth();
    }, []); // Пустой массив зависимостей - запускается только один раз при монтировании

    // Показать загрузочный экран пока проверяется авторизация
    if (isLoading) {
        return (
            <div style={{ 
                display: 'flex', 
                justifyContent: 'center', 
                alignItems: 'center', 
                height: '100vh',
                background: 'var(--surface-canvas, #ffffff)',
                color: 'var(--text-primary, #231f20)'
            }}>
                <div>Загрузка...</div>
            </div>
        );
    }

    return (
        <Router>
            <div className="app">
                {isAuthenticated ? (
                    isConfirmed ? (
                        <AuthenticatedRoutes />
                    ) : (
                        <ConfirmationPage />
                    )
                ) : (
                    <UnauthenticatedRoutes />
                )}
            </div>
        </Router>
    );
}

export default App;