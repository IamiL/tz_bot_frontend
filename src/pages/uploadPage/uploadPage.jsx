import React, {useState, useEffect} from 'react';
import "../../App.css"
import {AlertCircle, Upload, Check, X, Clock} from "lucide-react";
import axios from "axios";
import {GetHostname} from "../../hostname.js";
import {useBoundStore} from "../../store/index.js";
import {useNavigate} from "react-router-dom";

function UploadPage() {
    const navigate = useNavigate();
    const [error, setError] = useState('');
    const [isDragging, setIsDragging] = useState(false);
    const [file, setFile] = useState(null);
    const [isScanning, setIsScanning] = useState(false);
    const [inspectionLimit, setInspectionLimit] = useState({
        status: 'loading',
        inspections_left: null,
        time_until_reset: null,
        error_type: null
    });
    
    const addTechSpec = useBoundStore((state) => state.addTechSpec);

    const formatTimeUntilReset = (timeString) => {
        if (!timeString) return '';
        
        const [hours, minutes] = timeString.split(':').map(Number);
        const totalMinutes = hours * 60 + minutes;
        
        if (totalMinutes >= 60) {
            const hoursLeft = Math.floor(totalMinutes / 60);
            return `${hoursLeft} ${hoursLeft === 1 ? 'час' : hoursLeft < 5 ? 'часа' : 'часов'}`;
        } else {
            return `${totalMinutes} ${totalMinutes === 1 ? 'минуту' : totalMinutes < 5 ? 'минуты' : 'минут'}`;
        }
    };

    useEffect(() => {
        const checkInspectionLimit = async () => {
            try {
                const response = await axios.get(`${GetHostname()}/api/users/inspection-limit`, {
                    withCredentials: true
                });
                
                setInspectionLimit({
                    status: response.data.status,
                    inspections_left: response.data.inspections_left || null,
                    time_until_reset: response.data.time_until_reset || null,
                    error_type: null
                });
            } catch (error) {
                console.error('Ошибка при проверке лимита:', error);
                setInspectionLimit({
                    status: 'error',
                    inspections_left: null,
                    time_until_reset: null,
                    error_type: error.response?.status === 500 ? 'server' : 'unknown'
                });
            }
        };

        checkInspectionLimit();
    }, []);

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

            // Добавляем новое ТЗ в store со статусом "in_progress"
            if (response.data && response.data.id) {
                addTechSpec({
                    id: response.data.id,
                    name: response.data.name,
                    created_at: response.data.created_at
                });
                setIsScanning(false);
                navigate(`/technical-specifications/${response.data.id}`);
            }

            // setDocText(response.data.text);
            //
            // // Обрабатываем invalid_errors с полной информацией
            // const processedInvalidErrors = (response.data.invalid_errors || []).map(error => ({
            //     // Сохраняем все поля из нового API формата
            //     numeric_id: error.numeric_id,
            //     id: error.id,
            //     group_id: error.group_id,
            //     error_code: error.error_code,
            //     quote: error.quote,
            //     analysis: error.analysis,
            //     critique: error.critique,
            //     verification: error.verification,
            //     suggested_fix: error.suggested_fix,
            //     rationale: error.rationale,
            //     original_quote: error.original_quote,
            //     quote_lines: error.quote_lines,
            //     until_the_end_of_sentence: error.until_the_end_of_sentence,
            //     start_line_number: error.start_line_number,
            //     end_line_number: error.end_line_number
            // }));
            //
            // setInvalidErrors(processedInvalidErrors);
            //
            // // Обрабатываем missing_errors с полной информацией
            // const processedMissingErrors = (response.data.missing_errors || []).map(error => ({
            //     // Сохраняем все поля из нового API формата для missing ошибок
            //     id: error.id,
            //     id_str: error.id_str,
            //     group_id: error.group_id,
            //     error_code: error.error_code,
            //     analysis: error.analysis,
            //     critique: error.critique,
            //     verification: error.verification,
            //     suggested_fix: error.suggested_fix,
            //     rationale: error.rationale
            // }));
            //
            // setMissingErrors(processedMissingErrors);
            // setDownloadUrl("https://docs.timuroid.ru/docs/" + response.data.doc_id + ".docx");
            //
            // setIsScanning(false);
            // setScanComplete(true);

            return response.data;
        } catch (error) {
            console.error('Ошибка при загрузке файла:', error);
            // setIsScanning(false);
            throw error;
        }
    };

    if (inspectionLimit.status === 'loading') {
        return (
            <div className="upload-section-wrapper">
                <div className="upload-section" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '400px' }}>
                    <span className="loader" style={{ width: '48px', height: '48px', marginBottom: '16px' }} aria-hidden="true"></span>
                    <p style={{ color: '#666', fontSize: '16px' }}>Проверка лимита проверок...</p>
                </div>
            </div>
        );
    }

    if (inspectionLimit.status === 'limit_exhausted') {
        return (
            <div className="upload-section-wrapper">
                <div className="upload-section" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '400px' }}>
                    <div style={{ 
                        background: 'var(--surface-elevated)', 
                        border: '1px solid var(--border-default)', 
                        borderRadius: 'var(--radius-lg)', 
                        padding: 'var(--space-8)', 
                        textAlign: 'center',
                        maxWidth: '400px',
                        boxShadow: 'var(--elevation-2)'
                    }}>
                        <Clock size={48} style={{ color: 'var(--text-secondary)', marginBottom: 'var(--space-4)' }} />
                        <h2 style={{ 
                            color: 'var(--text-primary)', 
                            marginBottom: 'var(--space-3)', 
                            fontSize: '18px',
                            fontWeight: '600',
                            margin: '0 0 var(--space-3) 0'
                        }}>
                            Лимит проверок исчерпан
                        </h2>
                        <p style={{ 
                            color: 'var(--text-secondary)', 
                            marginBottom: 'var(--space-4)',
                            fontSize: '14px',
                            lineHeight: '1.5',
                            margin: '0 0 var(--space-4) 0'
                        }}>
                            На сегодня вы исчерпали лимит проверок документов.
                        </p>
                        {inspectionLimit.time_until_reset && (
                            <p className="upload-hint" style={{ margin: 0 }}>
                                Новые проверки будут доступны через {formatTimeUntilReset(inspectionLimit.time_until_reset)}
                            </p>
                        )}
                    </div>
                </div>
            </div>
        );
    }

    if (inspectionLimit.status === 'error') {
        return (
            <div className="upload-section-wrapper">
                <div className="upload-section" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '400px' }}>
                    <div style={{ 
                        background: 'var(--surface-elevated)', 
                        border: '1px solid var(--border-default)', 
                        borderRadius: 'var(--radius-lg)', 
                        padding: 'var(--space-8)', 
                        textAlign: 'center',
                        maxWidth: '400px',
                        boxShadow: 'var(--elevation-2)'
                    }}>
                        <AlertCircle size={48} style={{ color: 'var(--text-secondary)', marginBottom: 'var(--space-4)' }} />
                        <h2 style={{ 
                            color: 'var(--text-primary)', 
                            marginBottom: 'var(--space-3)', 
                            fontSize: '18px',
                            fontWeight: '600',
                            margin: '0 0 var(--space-3) 0'
                        }}>
                            Сервис временно недоступен
                        </h2>
                        <p className="upload-hint" style={{ margin: 0 }}>
                            Попробуйте обновить страницу или повторить попытку позже.
                        </p>
                    </div>
                </div>
            </div>
        );
    }

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

            {inspectionLimit.status === 'success' && inspectionLimit.inspections_left && (
                <p className="upload-hint" style={{ marginTop: 'var(--space-4)', textAlign: 'center' }}>
                    У вас ещё осталось {inspectionLimit.inspections_left} проверок на сегодня
                </p>
            )}
        </div>
        </div>
    );
}

export default UploadPage;