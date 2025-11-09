"use client";
import React from 'react';
import styles from './Modal.module.css';

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
      className={`${styles.overlay} ${overlayClassName}`}
      style={{ zIndex }}
      onClick={onClose}
    >
      <div
        className={`${styles.content} ${contentClassName}`}
        style={{ width }}
        onClick={(e) => e.stopPropagation()}
      >
        {showCloseButton && (
          <button className={styles.closeBtn} onClick={onClose}>
            ×
          </button>
        )}
        {children}
      </div>
    </div>
  );
}
