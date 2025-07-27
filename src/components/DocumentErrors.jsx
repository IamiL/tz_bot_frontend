import React from 'react';

const DocumentErrors = ({ errors }) => {
    return (
        <div
            className="comments-list"
            style={{ maxHeight: '100%', overflow: 'auto' }}
        >
            {errors.map((error, index) => (
                <div
                    key={error.id || index}
                    style={{
                        padding: '12px',
                        marginBottom: '8px',
                        border: '2px solid #e0e0e0',
                        borderRadius: '8px',
                        backgroundColor: '#fafafa',
                        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
                    }}
                >
                    <div style={{
                        fontWeight: 'bold',
                        color: '#d32f2f',
                        marginBottom: '4px'
                    }}>
                        {error.title}
                    </div>
                    <div style={{
                        fontSize: '14px',
                        color: '#666',
                        lineHeight: '1.4'
                    }}>
                        {error.description}
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