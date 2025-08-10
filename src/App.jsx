import React, { useEffect } from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import AuthenticatedRoutes from './components/routing/AuthenticatedRoutes.jsx';
import UnauthenticatedRoutes from './components/routing/UnauthenticatedRoutes.jsx';
import { useAuthState, useAuthActions } from './store/index.js';

function App() {
    const { isAuthenticated, isLoading } = useAuthState();
    const { checkAuth } = useAuthActions();

    // Проверка авторизации при запуске приложения
    useEffect(() => {
        checkAuth();
    }, [checkAuth]);

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