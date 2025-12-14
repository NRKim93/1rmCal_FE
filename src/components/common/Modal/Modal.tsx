"use client";
import React from 'react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  width?: string;
  zIndex?: number;
  showCloseButton?: boolean;
  overlayClassName?: string;
  contentClassName?: string;
}

export default function Modal({
  isOpen,
  onClose,
  children,
  width = '400px',
  zIndex = 1000,
  showCloseButton = true,
  overlayClassName = '',
  contentClassName = '',
}: ModalProps) {
  if (!isOpen) return null;

  return (
    <div
      className={[
        'fixed inset-0 flex items-center justify-center bg-black/70',
        overlayClassName,
      ]
        .filter(Boolean)
        .join(' ')}
      style={{ zIndex }}
      onClick={onClose}
    >
      <div
        className={[
          'relative max-h-[90vh] max-w-[90vw] overflow-auto rounded-[10px] bg-white px-[50px] py-10 text-center',
          contentClassName,
        ]
          .filter(Boolean)
          .join(' ')}
        style={{ width }}
        onClick={(e) => e.stopPropagation()}
      >
        {showCloseButton && (
          <button
            className="absolute right-2.5 top-2.5 flex h-[30px] w-[30px] items-center justify-center bg-transparent p-0 text-[1.5em] leading-none text-transparent hover:text-transparent after:absolute after:inset-0 after:flex after:items-center after:justify-center after:content-['×'] after:text-[#333] hover:after:text-black"
            onClick={onClose}
            type="button"
            aria-label="Close"
          >
            ×
          </button>
        )}
        {children}
      </div>
    </div>
  );
}
