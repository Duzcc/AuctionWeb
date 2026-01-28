import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';

/**
 * Reusable Modal Component
 * Features: backdrop, ESC to close, animation, custom sizes
 */
export default function Modal({
    isOpen,
    onClose,
    title,
    children,
    size = 'medium',
    closeOnBackdrop = true,
    closeOnEsc = true,
    footer
}) {
    useEffect(() => {
        if (!isOpen) return;

        // Lock body scroll when modal is open
        document.body.style.overflow = 'hidden';

        // ESC key handler
        const handleEsc = (e) => {
            if (e.key === 'Escape' && closeOnEsc) {
                onClose();
            }
        };

        if (closeOnEsc) {
            document.addEventListener('keydown', handleEsc);
        }

        return () => {
            document.body.style.overflow = '';
            document.removeEventListener('keydown', handleEsc);
        };
    }, [isOpen, onClose, closeOnEsc]);

    if (!isOpen) return null;

    const sizeClasses = {
        small: 'max-w-md',
        medium: 'max-w-2xl',
        large: 'max-w-4xl',
        xl: 'max-w-6xl',
        full: 'max-w-7xl'
    };

    const handleBackdropClick = (e) => {
        if (e.target === e.currentTarget && closeOnBackdrop) {
            onClose();
        }
    };

    return createPortal(
        <div
            className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black bg-opacity-50 backdrop-blur-sm animate-fadeIn"
            onClick={handleBackdropClick}
        >
            <div className={`bg-white rounded-2xl shadow-2xl ${sizeClasses[size]} w-full max-h-[90vh] overflow-hidden transform animate-scaleIn`}>

                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-gray-200">
                    <h2 className="text-2xl font-bold text-gray-900">{title}</h2>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-600 transition-colors"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <line x1="18" y1="6" x2="6" y2="18"></line>
                            <line x1="6" y1="6" x2="18" y2="18"></line>
                        </svg>
                    </button>
                </div>

                {/* Body */}
                <div className="p-6 overflow-y-auto max-h-[calc(90vh-180px)]">
                    {children}
                </div>

                {/* Footer */}
                {footer && (
                    <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-200 bg-gray-50">
                        {footer}
                    </div>
                )}
            </div>
        </div>,
        document.body
    );
}

// Confirm Modal Helper
export function ConfirmModal({ isOpen, onClose, onConfirm, title = 'Xác nhận', message }) {
    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title={title}
            size="small"
            footer={
                <>
                    <button
                        onClick={onClose}
                        className="px-6 py-2.5 bg-gray-200 text-gray-700 font-semibold rounded-lg hover:bg-gray-300 transition-all"
                    >
                        Hủy
                    </button>
                    <button
                        onClick={() => {
                            onConfirm();
                            onClose();
                        }}
                        className="px-6 py-2.5 bg-gradient-to-r from-[#AA8C3C] to-[#8B7530] text-white font-semibold rounded-lg hover:shadow-lg transition-all"
                    >
                        Xác nhận
                    </button>
                </>
            }
        >
            <p className="text-gray-700">{message}</p>
        </Modal>
    );
}
