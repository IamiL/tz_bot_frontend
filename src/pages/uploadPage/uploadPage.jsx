import React, {useState} from 'react';
import "../../App.css"
import {AlertCircle, Upload, Check, X} from "lucide-react";
import axios from "axios";
import {GetHostname} from "../../hostname.js";

function UploadPage({setScanComplete,setCssStyles, setDocText, setInvalidErrors, setMissingErrors, setDownloadUrl}) {
    const [error, setError] = useState('');
    const [isDragging, setIsDragging] = useState(false);
    const [file, setFile] = useState(null);
    const [isScanning, setIsScanning] = useState(false);

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

    // Сканирование документа
    const handleScan = async () => {
        setIsScanning(true);
        // await new Promise(resolve => setTimeout(resolve, 2000));

        try {
            const formData = new FormData();
            formData.append('file', file);

            const response = await axios.post(`${GetHostname()}/api/tz`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
                withCredentials: true,
            });

            setDocText(response.data.text);
            
            // Обрабатываем invalid_errors с полной информацией
            const processedInvalidErrors = (response.data.invalid_errors || []).map(error => ({
                // Сохраняем все поля из нового API формата
                numeric_id: error.numeric_id,
                id: error.id,
                group_id: error.group_id,
                error_code: error.error_code,
                quote: error.quote,
                analysis: error.analysis,
                critique: error.critique,
                verification: error.verification,
                suggested_fix: error.suggested_fix,
                rationale: error.rationale,
                original_quote: error.original_quote,
                quote_lines: error.quote_lines,
                until_the_end_of_sentence: error.until_the_end_of_sentence,
                start_line_number: error.start_line_number,
                end_line_number: error.end_line_number
            }));
            
            setInvalidErrors(processedInvalidErrors);
            
            // Обрабатываем missing_errors с полной информацией
            const processedMissingErrors = (response.data.missing_errors || []).map(error => ({
                // Сохраняем все поля из нового API формата для missing ошибок
                id: error.id,
                id_str: error.id_str,
                group_id: error.group_id,
                error_code: error.error_code,
                analysis: error.analysis,
                critique: error.critique,
                verification: error.verification,
                suggested_fix: error.suggested_fix,
                rationale: error.rationale
            }));
            
            setMissingErrors(processedMissingErrors);
            setDownloadUrl("https://docs.timuroid.ru/docs/" + response.data.doc_id + ".docx");

            setIsScanning(false);
            setScanComplete(true);

            return response.data;
        } catch (error) {
            console.error('Ошибка при загрузке файла:', error);
            setIsScanning(false);
            throw error;
        }
    };

    return (
        <div className="upload-section-wrapper">
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
        </div>
    );
}

export default UploadPage;