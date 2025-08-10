# Использование темы в приложении

## Как использовать тему в компонентах

Для работы с темой используйте хук `useTheme`:

```jsx
import React from 'react';
import { useTheme } from './components/sidebarWrapper/sidebarWrapper.jsx';
// или напрямую
// import { useTheme } from './hooks/useTheme.js';

const MyComponent = () => {
    const { theme, toggleTheme, isDark, isLight } = useTheme();

    return (
        <div>
            <p>Текущая тема: {theme}</p>
            <p>Темная тема активна: {isDark ? 'Да' : 'Нет'}</p>
            <button onClick={toggleTheme}>
                Переключить тему
            </button>
        </div>
    );
};
```

## API хука useTheme

- `theme` - текущая тема ('light' | 'dark')
- `setTheme(theme)` - устанавливает конкретную тему
- `toggleTheme()` - переключает между светлой и темной темой
- `isDark` - boolean, true если текущая тема темная
- `isLight` - boolean, true если текущая тема светлая

## Автоматическая инициализация

Тема автоматически инициализируется при создании store:
1. Сначала проверяется localStorage
2. Если сохраненной темы нет, используется системная настройка браузера
3. Тема автоматически сохраняется в localStorage при изменении

## Пример кнопки переключения темы

```jsx
import React from 'react';
import { useTheme } from './hooks/useTheme.js';

const ThemeToggle = () => {
    const { theme, toggleTheme } = useTheme();

    return (
        <button 
            onClick={toggleTheme}
            aria-label={`Переключить на ${theme === 'light' ? 'темную' : 'светлую'} тему`}
        >
            {theme === 'light' ? '🌙' : '☀️'}
        </button>
    );
};

export default ThemeToggle;
```

## Условное применение стилей

```jsx
import React from 'react';
import { useTheme } from './hooks/useTheme.js';

const ThemedComponent = () => {
    const { isDark } = useTheme();

    return (
        <div className={`my-component ${isDark ? 'dark' : 'light'}`}>
            Контент с темой
        </div>
    );
};
```