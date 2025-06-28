import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Upload, AlertCircle, X, Check, Eye } from 'lucide-react';
import {MockDoc} from "./mockDoc/mockDoc.js";

const TechTaskChecker = () => {
    const [commentsIncorrectSpellingisOpen, setCommentsIncorrectSpellingisOpen] = useState(false);

    return (
            <div className="app-container" data-theme={scanComplete ? 'light' : 'dark'}>
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
                )}
            </div>
    );
};

export default TechTaskChecker;