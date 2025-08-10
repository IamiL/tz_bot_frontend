import React, { useState, useEffect, useRef, useCallback } from 'react';
import {Eye} from "lucide-react";
import DocumentErrors from "../../components/DocumentErrors.jsx";
import ErrorModal from "../../components/ErrorModal.jsx";

const DocPage2 = ({document, invalidErrors, missingErrors, downloadUrl, cssStyles}) => {
    // Мок данных - массив ошибок
    // const mockErrors = Array.from({ length: 50 }, (_, i) => ({
    //     id: i + 1,
    //     title: `Ошибка ${i + 1}`,
    //     description: `Описание ошибки ${i + 1}. Это подробное описание того, что не так в документе и как это исправить.`
    // }));

    // Мок HTML документа с встроенными span-ами для ошибок
    // const createMockDocument = () => {
    //     const paragraphs = [];
    //     let errorIndex = 0;
    //
    //     for (let i = 0; i < 30; i++) {
    //         let content = `<p>Это параграф номер ${i + 1}. `;
    //
    //         // Добавляем обычный текст
    //         content += 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. ';
    //
    //         // Вставляем ошибки случайным образом
    //         if (Math.random() > 0.4 && errorIndex < mockErrors.length) {
    //             errorIndex++;
    //             content += `<span error-id="${errorIndex}">Текст с ошибкой ${errorIndex}</span> `;
    //         }
    //
    //         content += 'Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. ';
    //
    //         if (Math.random() > 0.6 && errorIndex < mockErrors.length) {
    //             errorIndex++;
    //             content += `<span error-id="${errorIndex}">Еще один текст с ошибкой ${errorIndex}</span> `;
    //         }
    //
    //         content += 'Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.</p>';
    //
    //         // Добавляем заголовки
    //         if (i % 5 === 4) {
    //             content += `<h2>Заголовок раздела ${Math.floor(i / 5) + 1}</h2>`;
    //             if (errorIndex < mockErrors.length) {
    //                 errorIndex++;
    //                 content += `<p>Параграф после заголовка с <span error-id="${errorIndex}">ошибкой в заголовочной секции ${errorIndex}</span>.</p>`;
    //             }
    //         }
    //
    //         // Добавляем списки
    //         if (i % 8 === 7) {
    //             content += '<ul>';
    //             for (let j = 0; j < 3; j++) {
    //                 content += `<li>Элемент списка ${j + 1}`;
    //                 if (j === 1 && errorIndex < mockErrors.length) {
    //                     errorIndex++;
    //                     content += ` с <span error-id="${errorIndex}">ошибкой ${errorIndex}</span>`;
    //                 }
    //                 content += '</li>';
    //             }
    //             content += '</ul>';
    //         }
    //
    //         paragraphs.push(content);
    //     }
    //
    //     return paragraphs.join('');
    // };

    const [hoveredErrorId, setHoveredErrorId] = useState(null);
    const [isMobile, setIsMobile] = useState(false);
    const [isTablet, setIsTablet] = useState(false);
    const [activeTab, setActiveTab] = useState('text-errors');
    const [selectedError, setSelectedError] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const documentRef = useRef(null);
    const errorsRef = useRef(null);
    const isDocumentScrolling = useRef(false);
    const isErrorsScrolling = useRef(false);
    const documentScrollTimeout = useRef(null);
    const errorsScrollTimeout = useRef(null);
    const styleElementRef = useRef(null);

    // Функция для получения всех элементов с ошибками в документе
    const getErrorElements = useCallback(() => {
        if (!documentRef.current) return [];
        return Array.from(documentRef.current.querySelectorAll('[error-id]'));
    }, []);

    // Функция для получения видимых ошибок в viewport
    const getVisibleErrors = useCallback((container, elements) => {
        if (!container || !elements.length) return [];

        const containerRect = container.getBoundingClientRect();
        const visibleElements = [];

        elements.forEach(element => {
            const rect = element.getBoundingClientRect();
            const relativeTop = rect.top - containerRect.top;
            const relativeBottom = rect.bottom - containerRect.top;

            // Элемент видим, если он пересекается с viewport контейнера
            if (relativeBottom > 0 && relativeTop < containerRect.height) {
                visibleElements.push({
                    element,
                    errorId: parseInt(element.getAttribute('error-id')),
                    relativeTop
                });
            }
        });

        return visibleElements.sort((a, b) => a.relativeTop - b.relativeTop);
    }, []);

    // Синхронизация скролла ошибок при скролле документа
    const handleDocumentScroll = useCallback(() => {
        if (isDocumentScrolling.current) return;

        // Очищаем предыдущий таймаут
        if (documentScrollTimeout.current) {
            clearTimeout(documentScrollTimeout.current);
        }

        // Устанавливаем флаг, что происходит пользовательский скролл документа
        isErrorsScrolling.current = true;

        const errorElements = getErrorElements();
        const visibleErrors = getVisibleErrors(documentRef.current, errorElements);

        if (visibleErrors.length > 0 && errorsRef.current) {
            const firstVisibleErrorId = visibleErrors[0].errorId;
            const errorItemElement = errorsRef.current.querySelector(`[data-error-id="${firstVisibleErrorId}"]`);

            if (errorItemElement) {
                const containerRect = errorsRef.current.getBoundingClientRect();
                const elementRect = errorItemElement.getBoundingClientRect();
                const scrollTop = errorsRef.current.scrollTop;
                const targetScrollTop = scrollTop + (elementRect.top - containerRect.top) - 20;

                errorsRef.current.scrollTo({
                    top: targetScrollTop,
                    behavior: 'smooth'
                });
            }
        }

        // Сбрасываем флаг через небольшую задержку
        documentScrollTimeout.current = setTimeout(() => {
            isErrorsScrolling.current = false;
        }, 150);
    }, [getErrorElements, getVisibleErrors]);

    // Синхронизация скролла документа при скролле ошибок
    const handleErrorsScroll = useCallback(() => {
        if (isErrorsScrolling.current) return;

        // Очищаем предыдущий таймаут
        if (errorsScrollTimeout.current) {
            clearTimeout(errorsScrollTimeout.current);
        }

        // Устанавливаем флаг, что происходит пользовательский скролл ошибок
        isDocumentScrolling.current = true;

        if (!errorsRef.current) return;

        const containerRect = errorsRef.current.getBoundingClientRect();
        const errorItems = Array.from(errorsRef.current.children);

        // Находим первую видимую ошибку
        let firstVisibleErrorId = null;
        for (const item of errorItems) {
            const rect = item.getBoundingClientRect();
            const relativeTop = rect.top - containerRect.top;

            if (relativeTop >= 0 && relativeTop < containerRect.height) {
                firstVisibleErrorId = parseInt(item.getAttribute('data-error-id'));
                break;
            }
        }

        if (firstVisibleErrorId && documentRef.current) {
            const errorElement = documentRef.current.querySelector(`[error-id="${firstVisibleErrorId}"]`);
            if (errorElement) {
                const docContainerRect = documentRef.current.getBoundingClientRect();
                const errorRect = errorElement.getBoundingClientRect();
                const scrollTop = documentRef.current.scrollTop;
                const targetScrollTop = scrollTop + (errorRect.top - docContainerRect.top) - 20;

                documentRef.current.scrollTo({
                    top: targetScrollTop,
                    behavior: 'smooth'
                });
            }
        }

        // Сбрасываем флаг через небольшую задержку
        errorsScrollTimeout.current = setTimeout(() => {
            isDocumentScrolling.current = false;
        }, 150);
    }, []);


    // Создание HTML контента с обработчиками событий
    const createDocumentHTML = useCallback(() => {
        if (!document || typeof document !== 'string') {
            return '';
        }
        let html = document;

        // Добавляем базовые стили для выделения ошибок
        html = html.replace(
            /<span error-id="(\d+)">(.*?)<\/span>/g,
            `<span error-id="$1" class="error-text" style="background-color: #ffcdd2; padding: 2px 4px; border-radius: 4px; cursor: pointer; transition: all 0.3s ease; border: 1px solid #ef9a9a; position: relative;">$2</span>`
        );

        return html;
    }, [document]);

    // Обработка клика по ошибке для открытия модалки
    const handleErrorClick = useCallback((errorId) => {
        // Ищем среди invalid ошибок
        const invalidError = invalidErrors.find(err => err.numeric_id === errorId || err.id === errorId);
        if (invalidError) {
            setSelectedError(invalidError);
            setIsModalOpen(true);
        }
    }, [invalidErrors]);

    // Обработка клика по missing ошибке для открытия модалки
    const handleMissingErrorClick = useCallback((error) => {
        setSelectedError(error);
        setIsModalOpen(true);
    }, []);

    // Закрытие модалки
    const handleCloseModal = useCallback(() => {
        setIsModalOpen(false);
        setSelectedError(null);
    }, []);

    // Обновление стилей элементов при ховере
    useEffect(() => {
        if (!documentRef.current) return;

        // Небольшая задержка чтобы дождаться обновления DOM после dangerouslySetInnerHTML
        const timeout = setTimeout(() => {
            if (!documentRef.current) return;
            
            const errorElements = documentRef.current.querySelectorAll('[error-id]');
            errorElements.forEach(element => {
                const errorId = parseInt(element.getAttribute('error-id'));
                const isHovered = hoveredErrorId === errorId;

                if (isHovered) {
                    // Стили при ховере
                    element.style.backgroundColor = '#f44336';
                    element.style.color = 'white';
                    element.style.boxShadow = '0 2px 8px rgba(244, 67, 54, 0.4)';
                    element.style.transform = 'scale(1.02)';
                    element.style.borderColor = '#d32f2f';
                    element.style.zIndex = '10';
                } else {
                    // Обычные стили
                    element.style.backgroundColor = '#ffcdd2';
                    element.style.color = 'inherit';
                    element.style.boxShadow = 'none';
                    element.style.transform = 'scale(1)';
                    element.style.borderColor = '#ef9a9a';
                    element.style.zIndex = 'auto';
                }
            });
        }, 0);

        return () => clearTimeout(timeout);
    }, [hoveredErrorId, document]); // Добавляем document в deps чтобы перезапустить при изменении контента

    useEffect(() => {
        const documentContainer = documentRef.current;
        const errorsContainer = errorsRef.current;

        if (documentContainer) {
            documentContainer.addEventListener('scroll', handleDocumentScroll);
        }

        if (errorsContainer) {
            errorsContainer.addEventListener('scroll', handleErrorsScroll);
        }

        return () => {
            if (documentContainer) {
                documentContainer.removeEventListener('scroll', handleDocumentScroll);
            }
            if (errorsContainer) {
                errorsContainer.removeEventListener('scroll', handleErrorsScroll);
            }
        };
    }, [handleDocumentScroll, handleErrorsScroll]);

    // Обработка ховера и кликов на элементах с ошибками через делегирование событий
    useEffect(() => {
        const handleMouseOver = (e) => {
            const errorElement = e.target.closest('[error-id]');
            if (errorElement) {
                const errorId = errorElement.getAttribute('error-id');
                if (errorId) {
                    setHoveredErrorId(parseInt(errorId));
                }
            }
        };

        const handleMouseOut = (e) => {
            const errorElement = e.target.closest('[error-id]');
            if (errorElement) {
                // Проверяем, что мышь действительно покинула элемент с ошибкой
                if (!errorElement.contains(e.relatedTarget)) {
                    setHoveredErrorId(null);
                }
            }
        };

        const handleClick = (e) => {
            const errorElement = e.target.closest('[error-id]');
            if (errorElement) {
                const errorId = errorElement.getAttribute('error-id');
                if (errorId) {
                    handleErrorClick(parseInt(errorId));
                }
            }
        };

        const documentContainer = documentRef.current;
        if (documentContainer) {
            // Небольшая задержка чтобы дождаться обновления DOM после dangerouslySetInnerHTML
            const timeout = setTimeout(() => {
                if (documentContainer) {
                    documentContainer.addEventListener('mouseover', handleMouseOver);
                    documentContainer.addEventListener('mouseout', handleMouseOut);
                    documentContainer.addEventListener('click', handleClick);
                }
            }, 0);

            return () => {
                clearTimeout(timeout);
                if (documentContainer) {
                    documentContainer.removeEventListener('mouseover', handleMouseOver);
                    documentContainer.removeEventListener('mouseout', handleMouseOut);
                    documentContainer.removeEventListener('click', handleClick);
                }
            };
        }
    }, [document, handleErrorClick]); // Добавляем document и handleErrorClick в deps

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

    // Применение CSS стилей от сервера
    useEffect(() => {
        if (cssStyles) {
            // Удаляем предыдущий style элемент, если он есть
            if (styleElementRef.current) {
                document.head.removeChild(styleElementRef.current);
            }

            // Создаем новый style элемент
            const styleElement = document.createElement('style');
            styleElement.type = 'text/css';
            styleElement.innerHTML = cssStyles;
            
            // Добавляем уникальный id для идентификации
            styleElement.id = 'server-document-styles';
            
            // Добавляем в head
            document.head.appendChild(styleElement);
            styleElementRef.current = styleElement;
        }

        // Cleanup функция для удаления стилей при размонтировании компонента
        return () => {
            if (styleElementRef.current) {
                document.head.removeChild(styleElementRef.current);
                styleElementRef.current = null;
            }
        };
    }, [cssStyles]);

    return (
        // <div style={{
        //     display: 'flex',
        //     height: '100vh',
        //     fontFamily: 'Arial, sans-serif',
        //     backgroundColor: '#f5f5f5'
        // }}>
        <div className="results-layout">
            {/* Блок документа */}
            <main  className="document-panel" role="main" aria-label="Документ">
                <div
                    ref={documentRef}
                    className="document-viewport"
                >
                    <div className="word-document">
                    <div className="word-page" dangerouslySetInnerHTML={{ __html: createDocumentHTML() }}/>
                    </div>
                </div>
            </main>

            {/* Блок ошибок */}

            {!isMobile && (
            <div className="comments-panel">
                {/*<h2 className="comments-header">*/}
                {/*    <Eye*/}
                {/*        size={24}*/}
                {/*        aria-hidden="true"*/}
                {/*    />*/}
                {/*    Найденные ошибки*/}
                {/*</h2>*/}
                
                {/* Переключатель между типами ошибок */}
                <div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '8px',
                    marginBottom: '16px'
                }}>
                    <button
                        onClick={() => setActiveTab('text-errors')}
                        style={{
                            padding: '12px 16px',
                            border: `2px solid ${activeTab === 'text-errors' ? '#d32f2f' : '#e0e0e0'}`,
                            borderRadius: '8px',
                            backgroundColor: activeTab === 'text-errors' ? '#d32f2f' : '#ffffff',
                            color: activeTab === 'text-errors' ? 'white' : '#666',
                            cursor: 'pointer',
                            fontWeight: activeTab === 'text-errors' ? 'bold' : 'normal',
                            transition: 'all 0.3s ease',
                            fontSize: '14px',
                            boxShadow: activeTab === 'text-errors' ? '0 2px 4px rgba(211, 47, 47, 0.3)' : '0 1px 3px rgba(0, 0, 0, 0.1)'
                        }}
                    >
                        Ошибки в тексте
                    </button>
                    <button
                        onClick={() => setActiveTab('document-errors')}
                        style={{
                            padding: '12px 16px',
                            border: `2px solid ${activeTab === 'document-errors' ? '#d32f2f' : '#e0e0e0'}`,
                            borderRadius: '8px',
                            backgroundColor: activeTab === 'document-errors' ? '#d32f2f' : '#ffffff',
                            color: activeTab === 'document-errors' ? 'white' : '#666',
                            cursor: 'pointer',
                            fontWeight: activeTab === 'document-errors' ? 'bold' : 'normal',
                            transition: 'all 0.3s ease',
                            fontSize: '14px',
                            boxShadow: activeTab === 'document-errors' ? '0 2px 4px rgba(211, 47, 47, 0.3)' : '0 1px 3px rgba(0, 0, 0, 0.1)'
                        }}
                    >
                        Ошибки документа
                    </button>
                </div>

                {/* Ошибки в тексте */}
                {activeTab === 'text-errors' && (
                    <div
                        className="comments-list"
                        ref={errorsRef}
                    >
                        {invalidErrors.map((error) => (
                            <div
                                key={error.id}
                                data-error-id={error.numeric_id || error.id}
                                onMouseEnter={() => setHoveredErrorId(error.numeric_id || error.id)}
                                onMouseLeave={() => setHoveredErrorId(null)}
                                onClick={() => handleErrorClick(error.numeric_id || error.id)}
                                style={{
                                    padding: '12px',
                                    marginBottom: '8px',
                                    border: `2px solid ${hoveredErrorId === (error.numeric_id || error.id) ? '#f44336' : '#e0e0e0'}`,
                                    borderRadius: '8px',
                                    cursor: 'pointer',
                                    backgroundColor: hoveredErrorId === (error.numeric_id || error.id) ? '#ffebee' : '#fafafa',
                                    transition: 'all 0.3s ease',
                                    transform: hoveredErrorId === (error.numeric_id || error.id) ? 'translateX(5px) scale(1.02)' : 'translateX(0) scale(1)',
                                    boxShadow: hoveredErrorId === (error.numeric_id || error.id)
                                        ? '0 4px 12px rgba(244, 67, 54, 0.3)'
                                        : '0 1px 3px rgba(0, 0, 0, 0.1)'
                                }}
                            >
                                <div style={{
                                    fontWeight: 'bold',
                                    color: '#d32f2f',
                                    marginBottom: '4px'
                                }}>
                                    ошибка {error.error_code} id={error.numeric_id || error.id}
                                </div>
                                <div style={{
                                    fontSize: '14px',
                                    color: '#666',
                                    lineHeight: '1.4'
                                }}>
                                    группа {error.group_id}<br/>
                                    {error.suggested_fix}
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Ошибки документа */}
                {activeTab === 'document-errors' && (
                    <DocumentErrors 
                        errors={missingErrors || []} 
                        onErrorClick={handleMissingErrorClick}
                    />
                )}

                {/* Кнопка скачивания документа */
                    <div style={{ marginTop: '16px', borderTop: '1px solid #e0e0e0', paddingTop: '16px' }}>
                        <a
                            href={downloadUrl}
                            download
                            style={{
                                display: 'block',
                                width: '100%',
                                padding: '12px 16px',
                                backgroundColor: '#ff9800',
                                color: 'white',
                                textDecoration: 'none',
                                borderRadius: '8px',
                                textAlign: 'center',
                                fontWeight: 'bold',
                                fontSize: '14px',
                                border: 'none',
                                cursor: 'pointer',
                                transition: 'all 0.3s ease',
                                boxShadow: '0 2px 4px rgba(255, 152, 0, 0.3)',
                                boxSizing: 'border-box'
                            }}
                            onMouseEnter={(e) => {
                                e.target.style.backgroundColor = '#f57c00';
                                e.target.style.transform = 'translateY(-1px)';
                                e.target.style.boxShadow = '0 4px 8px rgba(255, 152, 0, 0.4)';
                            }}
                            onMouseLeave={(e) => {
                                e.target.style.backgroundColor = '#ff9800';
                                e.target.style.transform = 'translateY(0)';
                                e.target.style.boxShadow = '0 2px 4px rgba(255, 152, 0, 0.3)';
                            }}
                        >
                            Скачать документ
                        </a>
                    </div>
                }
            </div>)}
            
            {/* Модалка с детальной информацией об ошибке */}
            <ErrorModal 
                isOpen={isModalOpen} 
                onClose={handleCloseModal} 
                error={selectedError} 
            />
        </div>
    );
};

export default DocPage2;