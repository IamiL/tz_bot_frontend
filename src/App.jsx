import React, { useEffect } from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import AuthenticatedRoutes from './components/routing/AuthenticatedRoutes.jsx';
import UnauthenticatedRoutes from './components/routing/UnauthenticatedRoutes.jsx';
import useAuthStore from './store/index.js';

function App() {
    const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
    const isLoading = useAuthStore((state) => state.isLoading);
    const checkAuth = useAuthStore((state) => state.checkAuth);

    console.log('[App] Render - isAuthenticated:', isAuthenticated, 'isLoading:', isLoading);

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
                    <AuthenticatedRoutes />
                ) : (
                    <UnauthenticatedRoutes />
                )}
            </div>
        </Router>
    );
}

export default App;