import React, { useState } from 'react';

const DocumentErrors = ({ errors, onErrorClick }) => {
    const [hoveredErrorId, setHoveredErrorId] = useState(null);

    return (
        <div
            className="comments-list"
            style={{ maxHeight: '100%', overflow: 'auto' }}
        >
            {errors.map((error, index) => (
                <div
                    key={error.id || index}
                    onMouseEnter={() => setHoveredErrorId(error.id || error.id_str)}
                    onMouseLeave={() => setHoveredErrorId(null)}
                    onClick={() => onErrorClick && onErrorClick(error)}
                    style={{
                        padding: '12px',
                        marginBottom: '8px',
                        border: `2px solid ${hoveredErrorId === (error.id || error.id_str) ? '#f44336' : '#e0e0e0'}`,
                        borderRadius: '8px',
                        backgroundColor: hoveredErrorId === (error.id || error.id_str) ? '#ffebee' : '#fafafa',
                        boxShadow: hoveredErrorId === (error.id || error.id_str)
                            ? '0 4px 12px rgba(244, 67, 54, 0.3)'
                            : '0 1px 3px rgba(0, 0, 0, 0.1)',
                        cursor: onErrorClick ? 'pointer' : 'default',
                        transition: 'all 0.3s ease',
                        transform: hoveredErrorId === (error.id || error.id_str) ? 'translateX(5px) scale(1.02)' : 'translateX(0) scale(1)'
                    }}
                >
                    <div style={{
                        fontWeight: 'bold',
                        color: '#d32f2f',
                        marginBottom: '4px'
                    }}>
                        ошибка {error.error_code} id={error.id || error.id_str}
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
            {(!errors || errors.length === 0) && (
                <div style={{
                    padding: '20px',
                    textAlign: 'center',
                    color: '#666',
                    fontStyle: 'italic'
                }}>
                    Ошибки документа не найдены
                </div>
            )}
        </div>
    );
};

export default DocumentErrors;