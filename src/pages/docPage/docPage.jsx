import React, {useCallback, useEffect, useRef, useState} from 'react';
import {Eye} from "lucide-react";
import {Errors} from "../../mockDoc/mockErrors.js";
import {MockDoc} from "../../mockDoc/mockDoc.js";
import "../../App.css"

export function DocPage({docText, docErrors}) {
    const [isMobile, setIsMobile] = useState(false);
    const [isTablet, setIsTablet] = useState(false);
    const [hoveredError, setHoveredError] = useState(null);
    const [selectedComment, setSelectedComment] = useState(null);
    const [hoveredComment, setHoveredComment] = useState(null);
    const [tooltipData, setTooltipData] = useState(null);
    const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });

    // Refs для синхронизации скролла
    const documentRef = useRef(null);
    const documentViewportRef = useRef(null);
    const scrollSyncEnabled = useRef(true);
    const commentsRef = useRef(null);

    const mockCommentsIncorrectSpelling = docErrors;

    // Моковые данные документа с улучшенной структурой
    const mockDocument = docText;

    // Определение цвета границы для типа комментария
    const getCommentBorderColor = (type) => {
        switch(type) {
            case 'error': return 'var(--brand-primary)';
            case 'warning': return 'var(--brand-hover)';
            case 'info': return 'var(--text-secondary)';
            default: return 'var(--border-default)';
        }
    };

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

    // Обновление видимых комментариев
    const updateVisibleComments = useCallback((documentViewport) => {
        const viewportTop = documentViewport.scrollTop;
        const viewportBottom = viewportTop + documentViewport.clientHeight;

        const visibleSections = [];
        const sections = documentViewport.querySelectorAll('[data-section]');

        sections.forEach(section => {
            // const rect = section.getBoundingClientRect();
            const sectionTop = section.offsetTop;
            const sectionBottom = sectionTop + section.offsetHeight;

            if (sectionBottom >= viewportTop && sectionTop <= viewportBottom) {
                visibleSections.push(parseInt(section.dataset.section));
            }
        });

        // Можно использовать для дополнительной логики
    }, []);

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

    // Hover эффекты
    const handleErrorHover = useCallback((commentId, isHovering) => {
        setHoveredError(isHovering ? commentId : null);
        setHoveredComment(isHovering ? commentId : null);
    }, []);

    const handleCommentHover = useCallback((commentId, isHovering) => {
        setHoveredComment(isHovering ? commentId : null);
        setHoveredError(isHovering ? commentId : null);
    }, []);

    // Обработчик клика на ошибку в мобильной версии
    const handleErrorClick = useCallback((e, commentId) => {
        e.stopPropagation();
        if (isMobile) {
            const comment = mockCommentsIncorrectSpelling.find(c => c.id === commentId);
            const rect = e.target.getBoundingClientRect();
            setTooltipData(comment);
            setTooltipPosition({
                x: rect.left + rect.width / 2,
                y: rect.top
            });
        }
    }, [isMobile]);

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
        <div className="results-layout">
            {/* Панель документа */}
            <main className="document-panel" role="main" aria-label="Документ">
                <div
                    className="document-viewport"
                    ref={documentViewportRef}
                    onScroll={handleDocumentScroll}
                >
                    <div className="word-document">
                        <div
                            className="word-page"
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
                        <Eye
                            size={24}
                            aria-hidden="true"
                        />
                        Найденные ошибки
                    </h3>

                    {/*<div*/}
                    {/*        className="accordion-section open"*/}
                    {/*        id="incorrectSection"*/}
                    {/*>*/}

                    {/*    <button*/}
                    {/*            className="accordion-header"*/}
                    {/*            onClick="toggleAccordion('incorrectSection')"*/}
                    {/*    >*/}
                    {/*        <span>Некорректное написание (18)</span>*/}
                    {/*        <span className="accordion-icon">▼</span>*/}
                    {/*    </button>*/}
                    <div
                        className="comments-list"
                        ref={commentsRef}
                        onScroll={handleCommentsScroll}
                    >
                        {mockCommentsIncorrectSpelling.map((comment) => (
                            <div
                                key={comment.id}
                                data-comment={comment.id}
                                className={`comment-card ${selectedComment === comment.id ? 'active' : ''} ${hoveredComment === comment.id ? 'hovered' : ''}`}
                                style={{color: getCommentBorderColor(comment.type)}}
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
                    {/*</div>*/}

                    {/*<div*/}
                    {/*        className="accordion-section"*/}
                    {/*        id="missingSection"*/}
                    {/*>*/}
                    {/*    <button*/}
                    {/*            className="accordion-header"*/}
                    {/*            onClick="toggleAccordion('missingSection')"*/}
                    {/*    >*/}
                    {/*        <span>Отсутствуют (14)</span>*/}
                    {/*        <span className="accordion-icon">▼</span>*/}
                    {/*    </button>*/}
                    {/*    <div*/}
                    {/*            className="accordion-content"*/}
                    {/*            id="missingComments"*/}
                    {/*    >*/}

                    {/*    </div>*/}
                    {/*</div>*/}
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
    );
}

export default DocPage;