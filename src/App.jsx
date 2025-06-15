import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Upload, FileText, AlertCircle, X, Check, Eye } from 'lucide-react';

const TechTaskChecker = () => {
    const [file, setFile] = useState(null);
    const [isScanning, setIsScanning] = useState(false);
    const [scanComplete, setScanComplete] = useState(false);
    const [selectedComment, setSelectedComment] = useState(null);
    const [hoveredComment, setHoveredComment] = useState(null);
    const [hoveredError, setHoveredError] = useState(null);
    const [isDragging, setIsDragging] = useState(false);
    const [error, setError] = useState('');
    const [tooltipData, setTooltipData] = useState(null);
    const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });
    const [isMobile, setIsMobile] = useState(false);
    const [isTablet, setIsTablet] = useState(false);

    // Refs для синхронизации скролла
    const documentRef = useRef(null);
    const commentsRef = useRef(null);
    const documentViewportRef = useRef(null);
    const scrollSyncEnabled = useRef(true);

    // Проверка мобильного устройства
    useEffect(() => {
        const checkDeviceType = () => {
            const width = window.innerWidth;
            setIsMobile(width <= 768);
            setIsTablet(width > 768 && width <= 1024);
        };

        checkDeviceType();
        window.addEventListener('resize', checkDeviceType);

        return () => window.removeEventListener('resize', checkDeviceType);
    }, []);

    // Моковые данные документа с улучшенной структурой
    const mockDocument = `
    <div class="word-document">
      <div class="word-page" data-page="1">
        <div class="word-header">
          <p class="word-company">ГК «УРАЛЬСКАЯ СТАЛЬ»</p>
          <p class="word-date">15 июня 2025 г.</p>
        </div>
        
        <h1 class="word-title">ТЕХНИЧЕСКОЕ ЗАДАНИЕ</h1>
        <p class="word-subtitle">на разработку системы управления производственными процессами</p>
        
        <div class="word-section" data-section="1">
          <h2 class="word-heading">1. Общие положения</h2>
          <p class="word-paragraph">Данное техническое задание определяет требования к разработке <span data-error="1" class="error-text" data-section="1">автоматизированной системе управления</span> производственными процессами металлургического комбината «Уральская Сталь».</p>
          <p class="word-paragraph">Документ является основным руководством для подрядчика при выполнении работ по созданию, внедрению и сопровождению системы.</p>
        </div>
        
        <div class="word-section" data-section="2">
          <h2 class="word-heading">2. Назначение системы</h2>
          <p class="word-paragraph">Система предназначена для <span data-error="2" class="error-text" data-section="2">оптимизации работы</span> производственных подразделений и <span data-error="3" class="error-text" data-section="2">увеличения эффективности</span> деятельности предприятия.</p>
          <p class="word-paragraph">Основные цели внедрения:</p>
          <ul class="word-list">
            <li>Автоматизация учета производственных операций</li>
            <li>Снижение времени простоя оборудования</li>
            <li>Повышение качества выпускаемой продукции</li>
          </ul>
        </div>
        
        <div class="word-section" data-section="3">
          <h2 class="word-heading">3. Требования к функциональности</h2>
          <p class="word-paragraph"><strong>3.1</strong> Система должна обеспечивать <span data-error="4" class="error-text" data-section="3">круглосуточный мониторинг</span> производственных показателей с возможностью формирования оперативных отчетов.</p>
          <p class="word-paragraph"><strong>3.2</strong> Необходимо реализовать модуль <span data-error="5" class="error-text" data-section="3">аналитики и отчетности</span> с возможностью выгрузки данных в различные форматы.</p>
          <p class="word-paragraph"><strong>3.3</strong> Требуется интеграция с существующими системами предприятия через стандартные протоколы обмена данными.</p>
        </div>
        
        <div class="word-page-break"></div>
        
        <div class="word-section" data-section="4">
          <h2 class="word-heading">4. Технические требования</h2>
          <p class="word-paragraph"><strong>4.1</strong> Система должна работать в режиме <span data-error="6" class="error-text" data-section="4">24/7</span> с допустимым временем простоя не более 0.1% в год.</p>
          <p class="word-paragraph"><strong>4.2</strong> Требования к производительности:</p>
          <table class="word-table">
            <tr>
              <th>Параметр</th>
              <th>Значение</th>
            </tr>
            <tr>
              <td>Время отклика интерфейса</td>
              <td>&lt; 2 сек</td>
            </tr>
            <tr>
              <td>Количество одновременных пользователей</td>
              <td>&gt; 500</td>
            </tr>
            <tr>
              <td>Объем обрабатываемых данных</td>
              <td>&gt; 1 ТБ/сутки</td>
            </tr>
          </table>
        </div>
      </div>
    </div>
  `;

    const mockComments = [
        {
            id: 1,
            title: "Неконкретная формулировка",
            text: "Необходимо конкретизировать тип системы управления: ERP, MES, SCADA или комплексное решение",
            type: "error",
            section: "1. Общие положения",
            position: { page: 1, section: 1 }
        },
        {
            id: 2,
            title: "Отсутствуют метрики",
            text: "Расплывчатая формулировка. Укажите конкретные метрики оптимизации: снижение затрат на X%, ускорение процессов на Y%",
            type: "warning",
            section: "2. Назначение системы",
            position: { page: 1, section: 2 }
        },
        {
            id: 3,
            title: "Нет измеримых показателей",
            text: "Требуется указать измеримые показатели эффективности: ROI, срок окупаемости, KPI",
            type: "warning",
            section: "2. Назначение системы",
            position: { page: 1, section: 2 }
        },
        {
            id: 4,
            title: "Требует уточнения",
            text: "Уточните допустимые периоды техобслуживания и регламентные работы",
            type: "info",
            section: "3. Требования к функциональности",
            position: { page: 1, section: 3 }
        },
        {
            id: 5,
            title: "Недостаточно деталей",
            text: "Детализируйте требования к форматам выгрузки данных: XLS, PDF, XML, JSON и др.",
            type: "error",
            section: "3. Требования к функциональности",
            position: { page: 1, section: 3 }
        },
        {
            id: 6,
            title: "Неполное описание SLA",
            text: "Конкретизируйте SLA: RTO, RPO, процедуры резервного копирования и восстановления",
            type: "error",
            section: "4. Технические требования",
            position: { page: 1, section: 4 }
        }
    ];

    // Синхронизация скролла между панелями
    const handleDocumentScroll = useCallback((e) => {
        if (!scrollSyncEnabled.current || isMobile || isTablet) return;

        const documentViewport = e.target;
        const commentsContainer = commentsRef.current;

        if (!commentsContainer) return;

        const scrollPercentage = documentViewport.scrollTop / (documentViewport.scrollHeight - documentViewport.clientHeight);
        const targetScrollTop = scrollPercentage * (commentsContainer.scrollHeight - commentsContainer.clientHeight);

        scrollSyncEnabled.current = false;
        commentsContainer.scrollTop = targetScrollTop;

        // Обновляем видимые комментарии
        updateVisibleComments(documentViewport);

        requestAnimationFrame(() => {
            scrollSyncEnabled.current = true;
        });
    }, [isMobile, isTablet]);

    const handleCommentsScroll = useCallback((e) => {
        if (!scrollSyncEnabled.current || isMobile || isTablet) return;

        const commentsContainer = e.target;
        const documentViewport = documentViewportRef.current;

        if (!documentViewport) return;

        const scrollPercentage = commentsContainer.scrollTop / (commentsContainer.scrollHeight - commentsContainer.clientHeight);
        const targetScrollTop = scrollPercentage * (documentViewport.scrollHeight - documentViewport.clientHeight);

        scrollSyncEnabled.current = false;
        documentViewport.scrollTop = targetScrollTop;

        requestAnimationFrame(() => {
            scrollSyncEnabled.current = true;
        });
    }, [isMobile, isTablet]);

    // Обновление видимых комментариев
    const updateVisibleComments = useCallback((documentViewport) => {
        const viewportTop = documentViewport.scrollTop;
        const viewportBottom = viewportTop + documentViewport.clientHeight;

        const visibleSections = [];
        const sections = documentViewport.querySelectorAll('[data-section]');

        sections.forEach(section => {
            const rect = section.getBoundingClientRect();
            const sectionTop = section.offsetTop;
            const sectionBottom = sectionTop + section.offsetHeight;

            if (sectionBottom >= viewportTop && sectionTop <= viewportBottom) {
                visibleSections.push(parseInt(section.dataset.section));
            }
        });

        // Можно использовать для дополнительной логики
    }, []);

    // Проверка формата файла
    const isValidFileFormat = (file) => {
        const fileName = file.name.toLowerCase();
        const validExtensions = ['.doc', '.docx'];
        const validMimeTypes = [
            'application/msword',
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
        ];

        const hasValidExtension = validExtensions.some(ext => fileName.endsWith(ext));
        const hasValidMimeType = validMimeTypes.includes(file.type);

        return hasValidExtension || hasValidMimeType;
    };

    // Форматирование размера файла
    const formatFileSize = (bytes) => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    // Обработчик загрузки файла
    const handleFileUpload = (event) => {
        const uploadedFile = event.target.files[0];
        if (uploadedFile) {
            if (!isValidFileFormat(uploadedFile)) {
                setError('Пожалуйста, загрузите файл в формате .doc или .docx');
                event.target.value = '';
                setTimeout(() => setError(''), 5000);
                return;
            }

            setFile(uploadedFile);
            setError('');
        }
    };

    // Обработчики drag and drop
    const handleDragEnter = (e) => {
        e.preventDefault();
        if (!file) {
            setIsDragging(true);
        }
    };

    const handleDragLeave = (e) => {
        e.preventDefault();
        setIsDragging(false);
    };

    const handleDrop = (e) => {
        e.preventDefault();
        setIsDragging(false);

        if (file) return;

        const droppedFile = e.dataTransfer.files[0];
        if (droppedFile) {
            if (!isValidFileFormat(droppedFile)) {
                setError('Пожалуйста, загрузите файл в формате .doc или .docx');
                setTimeout(() => setError(''), 5000);
                return;
            }

            setFile(droppedFile);
            setError('');
        }
    };

    // Сканирование документа
    const handleScan = async () => {
        setIsScanning(true);
        await new Promise(resolve => setTimeout(resolve, 2000));
        setIsScanning(false);
        setScanComplete(true);
    };

    // Прокрутка к элементу при клике на комментарий
    const scrollToError = useCallback((commentId) => {
        const errorElement = documentRef.current?.querySelector(`[data-error="${commentId}"]`);
        if (errorElement) {
            errorElement.scrollIntoView({
                behavior: 'smooth',
                block: 'center',
                inline: 'nearest'
            });
            setSelectedComment(commentId);
            setTimeout(() => setSelectedComment(null), 3000);
        }
    }, []);

    // Обработчик клика на ошибку в мобильной версии
    const handleErrorClick = useCallback((e, commentId) => {
        e.stopPropagation();
        if (isMobile) {
            const comment = mockComments.find(c => c.id === commentId);
            const rect = e.target.getBoundingClientRect();
            setTooltipData(comment);
            setTooltipPosition({
                x: rect.left + rect.width / 2,
                y: rect.top
            });
        }
    }, [isMobile]);

    // Hover эффекты
    const handleErrorHover = useCallback((commentId, isHovering) => {
        setHoveredError(isHovering ? commentId : null);
        setHoveredComment(isHovering ? commentId : null);
    }, []);

    const handleCommentHover = useCallback((commentId, isHovering) => {
        setHoveredComment(isHovering ? commentId : null);
        setHoveredError(isHovering ? commentId : null);
    }, []);

    // Скрытие tooltip при клике вне его области
    useEffect(() => {
        const handleClickOutside = () => {
            if (tooltipData) {
                setTooltipData(null);
            }
        };

        document.addEventListener('click', handleClickOutside);
        return () => document.removeEventListener('click', handleClickOutside);
    }, [tooltipData]);

    // Определение цвета границы для типа комментария
    const getCommentBorderColor = (type) => {
        switch(type) {
            case 'error': return 'var(--brand-primary)';
            case 'warning': return 'var(--brand-hover)';
            case 'info': return 'var(--text-secondary)';
            default: return 'var(--border-default)';
        }
    };

    // Добавляем глобальные функции для обработки событий
    useEffect(() => {
        window.scrollToComment = scrollToError;
        window.handleErrorClick = handleErrorClick;
        window.handleErrorHover = handleErrorHover;

        return () => {
            delete window.scrollToComment;
            delete window.handleErrorClick;
            delete window.handleErrorHover;
        };
    }, [scrollToError, handleErrorClick, handleErrorHover]);

    return (
            <div className="app-container" data-theme={scanComplete ? 'light' : 'dark'}>
                <style jsx>{`
        /* CSS-переменные дизайн-системы */
        :root {
          /* Базовая палитра */
          --clr-black: #000000;
          --clr-gray-900: #231f20;
          --clr-gray-700: #727272;
          --clr-gray-300: #bfbfbf;
          --clr-white: #ffffff;
          --clr-brand-500: #ff3c00;
          --clr-brand-400: #f37130;
          --clr-brand-600: #f0512c;
          --brand-gradient: linear-gradient(90deg, #ff3c00 0%, #f37130 50%, #f0512c 100%);
          
          /* Анимации и переходы */
          --motion-duration-fast: 150ms;
          --motion-duration-medium: 300ms;
          --motion-duration-slow: 500ms;
          --motion-ease-standard: cubic-bezier(0.4, 0, 0.2, 1);
          --motion-ease-decelerate: cubic-bezier(0.0, 0, 0.2, 1);
          --motion-ease-accelerate: cubic-bezier(0.4, 0, 1, 1);
          
          /* Отступы */
          --space-1: 4px;
          --space-2: 8px;
          --space-3: 12px;
          --space-4: 16px;
          --space-5: 20px;
          --space-6: 24px;
          --space-8: 32px;
          --space-12: 48px;
          
          /* Радиусы */
          --radius-sm: 4px;
          --radius-md: 8px;
          --radius-lg: 12px;
          --radius-cta: 24px;
        }

        /* Light Theme */
        [data-theme="light"] {
          --surface-canvas: #ffffff;
          --surface-subtle: #f9f9f9;
          --surface-elevated: #ffffff;
          --border-default: #bfbfbf;
          --text-primary: #231f20;
          --text-secondary: #727272;
          --text-inverse: #ffffff;
          --brand-primary: #ff3c00;
          --brand-hover: #f37130;
          --brand-active: #f0512c;
          --focus-ring: 0 0 0 3px rgba(255, 60, 0, 0.4);
          --elevation-1: 0 2px 4px rgba(0, 0, 0, 0.08);
          --elevation-2: 0 4px 12px rgba(0, 0, 0, 0.06);
          --elevation-3: 0 8px 24px rgba(0, 0, 0, 0.12);
        }

        /* Dark Theme */
        [data-theme="dark"] {
          --surface-canvas: #121212;
          --surface-subtle: #1e1e1f;
          --surface-elevated: #1f1f1f;
          --border-default: #2e2e2f;
          --text-primary: #f5f5f5;
          --text-secondary: #bfbfbf;
          --text-inverse: #000000;
          --brand-primary: #ff3c00;
          --brand-hover: #f37130;
          --brand-active: #f0512c;
          --focus-ring: 0 0 0 3px rgba(255, 60, 0, 0.6);
          --elevation-1: 0 2px 4px rgba(0, 0, 0, 0.6);
          --elevation-2: 0 4px 12px rgba(0, 0, 0, 0.48);
          --elevation-3: 0 8px 24px rgba(0, 0, 0, 0.64);
        }

        /* Базовые стили */
        * {
          box-sizing: border-box;
        }

        .app-container {
          min-height: 100vh;
          background: var(--surface-canvas);
          color: var(--text-primary);
          font-family: 'Inter', system-ui, sans-serif;
          transition: all var(--motion-duration-medium) var(--motion-ease-standard);
          display: flex;
          align-items: center;
          justify-content: center;
          padding: var(--space-6);
        }

        /* Секция загрузки */
        .upload-section {
          display: flex;
          flex-direction: column;
          align-items: center;
          width: 100%;
          max-width: 480px;
        }

        /* Контейнер drag-n-drop */
        .upload-container {
          background: var(--surface-elevated);
          border: 2px dashed var(--border-default);
          border-radius: var(--radius-lg);
          padding: var(--space-12);
          text-align: center;
          width: 100%;
          transition: all var(--motion-duration-medium) var(--motion-ease-standard);
          box-shadow: var(--elevation-1);
          position: relative;
          overflow: hidden;
        }

        .upload-container:not(.has-file):hover {
          border-color: var(--brand-primary);
          background: var(--surface-subtle);
          transform: translateY(-2px);
          box-shadow: var(--elevation-2);
        }

        .upload-container:not(.has-file):hover .upload-icon {
          color: var(--brand-primary);
          transform: translateY(-4px) scale(1.05);
        }

        .upload-container.dragging {
          background: var(--surface-subtle);
          border-color: var(--brand-primary);
          border-style: solid;
          transform: scale(1.02);
          box-shadow: var(--elevation-3);
        }

        .upload-container.has-file {
          border-color: var(--brand-primary);
          border-style: solid;
          background: var(--surface-subtle);
          cursor: default;
        }

        .upload-container.has-file .upload-icon {
          color: var(--brand-primary);
          animation: scaleIn var(--motion-duration-medium) var(--motion-ease-decelerate);
        }

        @keyframes scaleIn {
          from { transform: scale(0.8); opacity: 0; }
          to { transform: scale(1); opacity: 1; }
        }

        .upload-container.has-file .upload-hint {
          display: none;
        }

        /* Иконка загрузки */
        .upload-icon {
          color: var(--text-secondary);
          margin-bottom: var(--space-6);
          transition: all var(--motion-duration-medium) var(--motion-ease-standard);
        }

        .upload-container.dragging .upload-icon {
          color: var(--brand-primary);
          transform: scale(1.1) rotate(5deg);
        }

        /* Кнопка загрузки документа */
        .btn-primary {
          background: var(--brand-primary);
          color: var(--text-inverse);
          border: none;
          border-radius: var(--radius-cta);
          padding: var(--space-3) var(--space-6);
          font-size: 16px;
          font-weight: 600;
          cursor: pointer;
          transition: all var(--motion-duration-medium) var(--motion-ease-standard);
          margin-bottom: var(--space-4);
          position: relative;
          overflow: hidden;
        }

        .btn-primary:not([disabled]):hover {
          background: var(--brand-hover);
          transform: translateY(-2px);
          box-shadow: var(--elevation-2);
        }

        .btn-primary:not([disabled]):active {
          background: var(--brand-active);
          transform: translateY(0);
        }

        .btn-primary:focus-visible {
          outline: var(--focus-ring);
          outline-offset: 2px;
        }

        .btn-primary[disabled] {
          opacity: 0.4;
          cursor: not-allowed;
          transform: none !important;
          box-shadow: none !important;
        }

        /* Подсказка */
        .upload-hint {
          color: var(--text-secondary);
          font-size: 14px;
          line-height: 1.5;
        }

        /* Информация о файле */
        .file-info {
          display: flex;
          align-items: center;
          gap: var(--space-3);
          margin-top: var(--space-6);
          padding: var(--space-3) var(--space-4);
          background: var(--surface-subtle);
          border-radius: var(--radius-md);
          color: var(--text-primary);
          position: relative;
          animation: fadeInScale var(--motion-duration-medium) var(--motion-ease-decelerate);
          max-width: 100%;
        }

        @keyframes fadeInScale {
          from { opacity: 0; transform: scale(0.95) translateY(10px); }
          to { opacity: 1; transform: scale(1) translateY(0); }
        }

        .file-details {
          display: flex;
          flex-direction: column;
          gap: var(--space-1);
          flex: 1;
        }

        .file-name {
          font-weight: 500;
          color: var(--text-primary);
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
          max-width: 300px;
        }

        .file-size {
          font-size: 12px;
          color: var(--text-secondary);
        }

        /* Кнопка удаления файла */
        .remove-file-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 24px;
          height: 24px;
          border: none;
          background: transparent;
          color: var(--text-secondary);
          cursor: pointer;
          border-radius: var(--radius-sm);
          transition: all var(--motion-duration-fast) var(--motion-ease-standard);
          margin-left: var(--space-2);
        }

        .remove-file-btn:hover {
          background: var(--surface-canvas);
          color: var(--brand-primary);
          transform: scale(1.1);
        }

        .remove-file-btn:focus-visible {
          outline: var(--focus-ring);
          outline-offset: 2px;
        }

        /* Сообщение об ошибке */
        .error-message {
          display: flex;
          align-items: center;
          gap: var(--space-2);
          margin-top: var(--space-4);
          padding: var(--space-3) var(--space-4);
          background: rgba(255, 60, 0, 0.1);
          color: var(--brand-primary);
          border-radius: var(--radius-md);
          font-size: 14px;
          animation: slideIn var(--motion-duration-medium) var(--motion-ease-decelerate);
        }

        @keyframes slideIn {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }

        /* Кнопка сканирования */
        .scan-button {
          background: var(--surface-subtle);
          color: var(--text-secondary);
          border: 2px solid var(--border-default);
          border-radius: var(--radius-cta);
          padding: var(--space-4) var(--space-12);
          font-size: 16px;
          font-weight: 600;
          cursor: not-allowed;
          transition: all var(--motion-duration-medium) var(--motion-ease-standard);
          margin-top: var(--space-8);
          opacity: 0.4;
          min-width: 280px;
        }

        .scan-button.active {
          background: var(--brand-primary);
          color: var(--text-inverse);
          border-color: transparent;
          cursor: pointer;
          opacity: 1;
          animation: buttonActivate var(--motion-duration-medium) var(--motion-ease-decelerate);
        }

        @keyframes buttonActivate {
          from { transform: scale(0.98); }
          to { transform: scale(1); }
        }

        .scan-button.active:not([disabled]):hover {
          background: var(--brand-hover);
          transform: translateY(-2px);
          box-shadow: var(--elevation-2);
        }

        .scan-button.active:not([disabled]):active {
          background: var(--brand-active);
          transform: translateY(0);
        }

        .scan-button:focus-visible {
          outline: var(--focus-ring);
          outline-offset: 2px;
        }

        /* Состояние загрузки для кнопки сканирования */
        .scan-button.scanning {
          pointer-events: none;
          position: relative;
        }

        .scan-button.scanning span {
          vertical-align: middle;
        }

        .scan-button.scanning .loader {
          display: inline-block !important;
        }

        /* Макет с результатами */
        .results-layout {
          display: grid;
          grid-template-columns: 1fr 400px;
          gap: var(--space-6);
          width: 100%;
          max-width: 1600px;
          height: calc(100vh - 48px);
          opacity: 0;
          animation: fadeIn var(--motion-duration-slow) var(--motion-ease-decelerate) forwards;
        }

        /* Панель документа */
        .document-panel {
          background: var(--surface-elevated);
          border-radius: var(--radius-lg);
          box-shadow: var(--elevation-1);
          transform: translateX(-50px);
          opacity: 0;
          animation: slideFromLeft var(--motion-duration-slow) var(--motion-ease-decelerate) forwards;
          overflow: hidden;
          position: relative;
        }

        /* Контейнер документа */
        .document-viewport {
          width: 100%;
          height: 100%;
          overflow: auto;
          background: #f5f5f5;
          display: flex;
          justify-content: center;
          padding: var(--space-6) 0;
          scroll-behavior: smooth;
        }

        [data-theme="dark"] .document-viewport {
          background: #1a1a1a;
        }

        /* Word-документ */
        .word-document {
          max-width: none;
          display: flex;
          flex-direction: column;
          align-items: center;
        }

        .word-page {
          width: 210mm;
          min-height: 297mm;
          padding: 25.4mm;
          background: white;
          box-shadow: var(--elevation-2);
          font-family: 'Times New Roman', serif;
          font-size: 12pt;
          line-height: 1.5;
          color: #000;
          position: relative;
          margin-bottom: var(--space-6);
          page-break-after: always;
        }

        [data-theme="dark"] .word-page {
          background: #fafafa;
        }

        /* Word заголовки и стили */
        .word-header {
          display: flex;
          justify-content: space-between;
          margin-bottom: 2em;
          font-size: 10pt;
          color: #666;
        }

        .word-company {
          font-weight: bold;
        }

        .word-title {
          text-align: center;
          font-size: 16pt;
          font-weight: bold;
          margin: 2em 0 0.5em;
          text-transform: uppercase;
        }

        .word-subtitle {
          text-align: center;
          font-size: 14pt;
          margin-bottom: 2em;
        }

        .word-section {
          margin-bottom: 1.5em;
        }

        .word-heading {
          font-size: 14pt;
          font-weight: bold;
          margin: 1.5em 0 0.5em;
        }

        .word-paragraph {
          text-indent: 1.25cm;
          margin-bottom: 0.5em;
          text-align: justify;
        }

        .word-list {
          margin-left: 1.5cm;
          margin-bottom: 1em;
        }

        .word-list li {
          margin-bottom: 0.25em;
        }

        .word-table {
          width: 100%;
          border-collapse: collapse;
          margin: 1em 0;
          font-size: 11pt;
        }

        .word-table th,
        .word-table td {
          border: 1px solid #000;
          padding: 0.25em 0.5em;
          text-align: left;
        }

        .word-table th {
          background: #e0e0e0;
          font-weight: bold;
        }

        .word-page-break {
          page-break-after: always;
          height: 2cm;
          border-bottom: 1px dashed #ccc;
          margin: 2em 0;
          position: relative;
        }

        .word-page-break::after {
          content: 'Страница 2';
          display: block;
          text-align: center;
          color: #999;
          font-size: 10pt;
          margin-top: 0.5em;
        }

        /* Подсветка ошибок в тексте с улучшенными hover-эффектами */
        .error-text {
          background: rgba(255, 60, 0, 0.15);
          padding: 2px 4px;
          border-radius: 3px;
          border-bottom: 2px solid rgba(255, 60, 0, 0.4);
          cursor: pointer;
          transition: all var(--motion-duration-fast) var(--motion-ease-standard);
          position: relative;
          margin: 0 1px;
        }

        .error-text:hover,
        .error-text.hovered {
          background: rgba(255, 60, 0, 0.25);
          border-bottom-color: var(--brand-primary);
          transform: translateY(-1px);
          box-shadow: 0 2px 8px rgba(255, 60, 0, 0.2);
        }

        .error-text.active {
          background: rgba(255, 60, 0, 0.35);
          border-bottom-color: var(--brand-primary);
          animation: pulse var(--motion-duration-medium) var(--motion-ease-standard);
        }

        @keyframes pulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.02); }
        }

        /* Панель комментариев */
        .comments-panel {
          background: var(--surface-elevated);
          border-radius: var(--radius-lg);
          box-shadow: var(--elevation-1);
          transform: translateX(50px);
          opacity: 0;
          animation: slideFromRight var(--motion-duration-slow) var(--motion-ease-decelerate) 0.2s forwards;
          display: flex;
          flex-direction: column;
          overflow: hidden;
        }

        .comments-header {
          font-size: 18px;
          font-weight: 700;
          padding: var(--space-6) var(--space-6) var(--space-4);
          display: flex;
          align-items: center;
          gap: var(--space-2);
          color: var(--text-primary);
          border-bottom: 1px solid var(--border-default);
          position: sticky;
          top: 0;
          background: var(--surface-elevated);
          z-index: 2;
        }

        .comments-list {
          flex: 1;
          overflow-y: auto;
          padding: var(--space-4);
          scroll-behavior: smooth;
        }

        /* Карточка комментария с улучшенными hover-эффектами */
        .comment-card {
          background: var(--surface-subtle);
          border-radius: var(--radius-md);
          margin-bottom: var(--space-4);
          cursor: pointer;
          transition: all var(--motion-duration-medium) var(--motion-ease-standard);
          position: relative;
          overflow: hidden;
          transform-origin: center;
        }

        .comment-card::before {
          content: '';
          position: absolute;
          left: 0;
          top: 0;
          bottom: 0;
          width: 4px;
          background: currentColor;
          transition: all var(--motion-duration-medium) var(--motion-ease-standard);
        }

        .comment-card:hover,
        .comment-card.hovered {
          transform: translateX(-4px) scale(1.02);
          box-shadow: var(--elevation-2);
          background: var(--surface-elevated);
        }

        .comment-card:hover::before,
        .comment-card.hovered::before {
          width: 6px;
        }

        .comment-card.active {
          background: var(--surface-elevated);
          transform: scale(1.04);
          box-shadow: var(--elevation-3);
          animation: cardActivate var(--motion-duration-medium) var(--motion-ease-decelerate);
        }

        @keyframes cardActivate {
          0% { transform: scale(1); }
          50% { transform: scale(1.06); }
          100% { transform: scale(1.04); }
        }

        .comment-card.active::before {
          width: 8px;
        }

        .comment-header {
          padding: var(--space-3) var(--space-4);
          border-bottom: 1px solid var(--border-default);
        }

        .comment-title {
          font-weight: 600;
          font-size: 14px;
          color: var(--text-primary);
          margin-bottom: var(--space-1);
        }

        .comment-section {
          font-size: 12px;
          color: var(--text-secondary);
        }

        .comment-body {
          padding: var(--space-3) var(--space-4);
        }

        .comment-text {
          color: var(--text-primary);
          font-size: 14px;
          line-height: 1.6;
        }

        /* Мобильный tooltip */
        .error-tooltip {
          position: fixed;
          background: var(--surface-elevated);
          border-radius: var(--radius-md);
          padding: var(--space-4);
          box-shadow: var(--elevation-3);
          max-width: 320px;
          z-index: 1000;
          animation: tooltipIn var(--motion-duration-fast) var(--motion-ease-decelerate);
          border-left: 4px solid var(--brand-primary);
        }

        .error-tooltip::before {
          content: '';
          position: absolute;
          bottom: -8px;
          left: 50%;
          transform: translateX(-50%);
          width: 0;
          height: 0;
          border-style: solid;
          border-width: 8px 8px 0 8px;
          border-color: var(--surface-elevated) transparent transparent transparent;
        }

        @keyframes tooltipIn {
          from { opacity: 0; transform: translateY(10px) scale(0.95); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }

        .tooltip-header {
          font-weight: 600;
          font-size: 14px;
          color: var(--text-primary);
          margin-bottom: var(--space-2);
        }

        .tooltip-text {
          font-size: 13px;
          color: var(--text-primary);
          line-height: 1.5;
        }

        /* Анимации */
        @keyframes fadeIn {
          to { opacity: 1; }
        }

        @keyframes slideFromLeft {
          to { opacity: 1; transform: translateX(0); }
        }

        @keyframes slideFromRight {
          to { opacity: 1; transform: translateX(0); }
        }

        /* Загрузчик */
        .loader {
          display: inline-block;
          width: 20px;
          height: 20px;
          border: 3px solid rgba(255, 255, 255, 0.3);
          border-top-color: var(--text-inverse);
          border-radius: 50%;
          animation: spin 1s linear infinite;
          margin-right: var(--space-2);
          vertical-align: middle;
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }

        /* Адаптивность */
        @media (max-width: 1024px) {
          .results-layout {
            grid-template-columns: 1fr;
            grid-template-rows: 1fr auto;
            height: auto;
          }

          .comments-panel {
            max-height: 400px;
            transform: translateY(50px);
          }

          .word-page {
            width: 100%;
            min-width: 210mm;
            margin: 0 auto;
          }

          .document-viewport {
            overflow-x: auto;
          }

          @keyframes slideFromRight {
            to { opacity: 1; transform: translateY(0); }
          }
        }

        @media (max-width: 768px) {
          .results-layout {
            grid-template-columns: 1fr;
          }

          .comments-panel {
            display: none;
          }

          .document-panel {
            border-radius: 0;
            height: 100vh;
          }

          .document-viewport {
            padding: var(--space-4) 0;
          }

          .word-page {
            box-shadow: none;
            width: 100%;
            min-width: auto;
            max-width: 100%;
            padding: 15mm 10mm;
            transform: scale(0.85);
            transform-origin: top center;
          }

          .error-text {
            position: relative;
            -webkit-tap-highlight-color: transparent;
          }

          .error-text:active {
            background: rgba(255, 60, 0, 0.5);
          }
        }

        @media (max-width: 640px) {
          .app-container {
            padding: var(--space-4);
          }

          .upload-container {
            padding: var(--space-8) var(--space-6);
          }

          .scan-button {
            min-width: 100%;
            padding: var(--space-4) var(--space-6);
          }

          .word-page {
            padding: 10mm 8mm;
            font-size: 11pt;
            transform: scale(0.75);
          }

          .word-title {
            font-size: 14pt;
          }

          .word-subtitle {
            font-size: 12pt;
          }

          .word-heading {
            font-size: 12pt;
          }
        }

        /* Доступность - scrollbar styling */
        .document-viewport::-webkit-scrollbar,
        .comments-list::-webkit-scrollbar {
          width: 8px;
          height: 8px;
        }

        .document-viewport::-webkit-scrollbar-track,
        .comments-list::-webkit-scrollbar-track {
          background: var(--surface-subtle);
          border-radius: var(--radius-sm);
        }

        .document-viewport::-webkit-scrollbar-thumb,
        .comments-list::-webkit-scrollbar-thumb {
          background: var(--border-default);
          border-radius: var(--radius-sm);
          transition: background var(--motion-duration-fast);
        }

        .document-viewport::-webkit-scrollbar-thumb:hover,
        .comments-list::-webkit-scrollbar-thumb:hover {
          background: var(--text-secondary);
        }

        /* Доступность - focus states */
        .error-text:focus,
        .comment-card:focus {
          outline: var(--focus-ring);
          outline-offset: 2px;
        }

        /* Дополнительные состояния для hover синхронизации */
        .error-text[data-error="1"].hovered,
        .comment-card[data-comment="1"].hovered { color: var(--brand-primary); }
        .error-text[data-error="2"].hovered,
        .comment-card[data-comment="2"].hovered { color: var(--brand-hover); }
        .error-text[data-error="3"].hovered,
        .comment-card[data-comment="3"].hovered { color: var(--brand-hover); }
        .error-text[data-error="4"].hovered,
        .comment-card[data-comment="4"].hovered { color: var(--text-secondary); }
        .error-text[data-error="5"].hovered,
        .comment-card[data-comment="5"].hovered { color: var(--brand-primary); }
        .error-text[data-error="6"].hovered,
        .comment-card[data-comment="6"].hovered { color: var(--brand-primary); }
      `}</style>

                {!scanComplete ? (
                        <div className="upload-section">
                            <div
                                    className={`upload-container ${isDragging ? 'dragging' : ''} ${file ? 'has-file' : ''}`}
                                    onDrop={handleDrop}
                                    onDragOver={(e) => e.preventDefault()}
                                    onDragEnter={handleDragEnter}
                                    onDragLeave={handleDragLeave}
                            >
                                <Upload size={64} className="upload-icon" />
                                <label htmlFor="file-upload">
                                    <input
                                            id="file-upload"
                                            type="file"
                                            accept=".doc,.docx,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                                            onChange={handleFileUpload}
                                            style={{ display: 'none' }}
                                            aria-label="Выбрать файл для загрузки"
                                            disabled={file !== null}
                                    />
                                    <button
                                            className="btn-primary"
                                            onClick={() => !file && document.getElementById('file-upload').click()}
                                            type="button"
                                            aria-label="Загрузить документ"
                                            disabled={file !== null}
                                    >
                                        Загрузить документ
                                    </button>
                                </label>
                                <p className="upload-hint" style={{ display: file ? 'none' : 'block' }}>или перетащите файл сюда</p>
                                <p className="upload-hint" style={{ fontSize: '12px', marginTop: '8px', display: file ? 'none' : 'block' }}>
                                    Поддерживаются только файлы .doc и .docx
                                </p>

                                {file && (
                                        <div className="file-info" role="status" aria-live="polite">
                                            <Check size={20} style={{ color: 'var(--brand-primary)' }} />
                                            <div className="file-details">
                                                <span className="file-name" title={file.name}>{file.name}</span>
                                                <span className="file-size">{formatFileSize(file.size)}</span>
                                            </div>
                                            <button
                                                    className="remove-file-btn"
                                                    onClick={() => {
                                                        setFile(null);
                                                        setError('');
                                                    }}
                                                    aria-label="Удалить файл"
                                                    type="button"
                                            >
                                                <X size={16} />
                                            </button>
                                        </div>
                                )}

                                {error && (
                                        <div className="error-message" role="alert" aria-live="assertive">
                                            <AlertCircle size={16} />
                                            <span>{error}</span>
                                        </div>
                                )}
                            </div>

                            <button
                                    className={`scan-button ${file ? 'active' : ''} ${isScanning ? 'scanning' : ''}`}
                                    onClick={handleScan}
                                    disabled={!file || isScanning}
                                    aria-busy={isScanning}
                                    aria-label="Просканировать техническое задание"
                            >
                                {isScanning ? (
                                        <>
                                            <span className="loader" aria-hidden="true"></span>
                                            <span>Сканирование...</span>
                                        </>
                                ) : (
                                        'Просканировать техническое задание'
                                )}
                            </button>
                        </div>
                ) : (
                        <div className="results-layout">
                            {/* Панель документа */}
                            <main className="document-panel" role="main" aria-label="Документ">
                                <div
                                        className="document-viewport"
                                        ref={documentViewportRef}
                                        onScroll={handleDocumentScroll}
                                >
                                    <div
                                            className="word-document"
                                            ref={documentRef}
                                            dangerouslySetInnerHTML={{
                                                __html: mockDocument.replace(
                                                        /<span data-error="(\d+)" class="error-text"(.*?)>(.*?)<\/span>/g,
                                                        (match, id, attrs, text) => {
                                                            const commentId = parseInt(id);
                                                            const isHovered = hoveredError === commentId || hoveredComment === commentId;
                                                            const isActive = selectedComment === commentId;

                                                            return `<span 
                        data-error="${id}"
                        class="error-text ${isHovered ? 'hovered' : ''} ${isActive ? 'active' : ''}" 
                        role="button"
                        tabindex="0"
                        aria-label="Ошибка ${id}: ${text}"
                        onmouseenter="window.handleErrorHover && window.handleErrorHover(${id}, true)"
                        onmouseleave="window.handleErrorHover && window.handleErrorHover(${id}, false)"
                        onclick="window.handleErrorClick && window.handleErrorClick(event, ${id})"
                        onkeypress="if(event.key === 'Enter' || event.key === ' ') { event.preventDefault(); window.handleErrorClick && window.handleErrorClick(event, ${id}); }"
                        ${attrs}
                      >${text}</span>`;
                                                        }
                                                )
                                            }}
                                    />
                                </div>
                            </main>

                            {/* Панель комментариев - только для десктопа */}
                            {!isMobile && (
                                    <aside
                                            className="comments-panel"
                                            role="complementary"
                                            aria-label="Найденные ошибки"
                                    >
                                        <h3 className="comments-header">
                                            <Eye size={24} aria-hidden="true" />
                                            Найденные ошибки
                                        </h3>

                                        <div
                                                className="comments-list"
                                                ref={commentsRef}
                                                onScroll={handleCommentsScroll}
                                        >
                                            {mockComments.map((comment) => (
                                                    <div
                                                            key={comment.id}
                                                            data-comment={comment.id}
                                                            className={`comment-card ${selectedComment === comment.id ? 'active' : ''} ${hoveredComment === comment.id ? 'hovered' : ''}`}
                                                            style={{ color: getCommentBorderColor(comment.type) }}
                                                            onClick={() => scrollToError(comment.id)}
                                                            onMouseEnter={() => handleCommentHover(comment.id, true)}
                                                            onMouseLeave={() => handleCommentHover(comment.id, false)}
                                                            role="button"
                                                            tabIndex={0}
                                                            aria-label={`${comment.type === 'error' ? 'Ошибка' : comment.type === 'warning' ? 'Предупреждение' : 'Информация'}: ${comment.title}`}
                                                            onKeyPress={(e) => {
                                                                if (e.key === 'Enter' || e.key === ' ') {
                                                                    e.preventDefault();
                                                                    scrollToError(comment.id);
                                                                }
                                                            }}
                                                    >
                                                        <div className="comment-header">
                                                            <h4 className="comment-title">{comment.title}</h4>
                                                            <p className="comment-section">{comment.section}</p>
                                                        </div>
                                                        <div className="comment-body">
                                                            <p className="comment-text">{comment.text}</p>
                                                        </div>
                                                    </div>
                                            ))}
                                        </div>
                                    </aside>
                            )}

                            {/* Мобильный tooltip */}
                            {tooltipData && isMobile && (
                                    <div
                                            className="error-tooltip"
                                            style={{
                                                left: `${tooltipPosition.x}px`,
                                                top: `${tooltipPosition.y - 8}px`,
                                                transform: 'translate(-50%, -100%)'
                                            }}
                                            onClick={(e) => e.stopPropagation()}
                                            role="tooltip"
                                            aria-live="polite"
                                    >
                                        <h4 className="tooltip-header">{tooltipData.title}</h4>
                                        <p className="tooltip-text">{tooltipData.text}</p>
                                    </div>
                            )}
                        </div>
                )}
            </div>
    );
};

export default TechTaskChecker;