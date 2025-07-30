import React, { useState } from 'react';
import SocialLoginModal from '../SocialLoginModal/SocialLoginModal';
import styles from './css/LoginModal.module.css';

interface LoginModalProps {
  onClose: () => void;
}

export default function LoginModal({ onClose }: LoginModalProps) {
  const [isSocialModalOpen, setIsSocialModalOpen] = useState(false);
  const [socialModalMode, setSocialModalMode] = useState<'signup' | 'login'>('signup');

  const handleSignInClick = () => {
    setSocialModalMode('signup');
    setIsSocialModalOpen(true);
  };

  const handleLogInClick = () => {
    setSocialModalMode('login');
    setIsSocialModalOpen(true);
  };

  return (
    <div className={styles['login-modal__overlay']}>
      <div className={styles['login-modal__content']}>
        <h2 className={styles['login-modal__title']}>THE GYM</h2>
        <button className={styles['login-modal__primary-btn']} onClick={handleLogInClick}>Log in</button>
        <p className={styles['login-modal__text']}>처음이신가요?</p>
        <button className={styles['login-modal__secondary-btn']} onClick={handleSignInClick}>
          Sign in
        </button>
        <button className={styles['login-modal__close-btn']} onClick={onClose}>×</button>
      </div>
      {isSocialModalOpen && (
        <SocialLoginModal onClose={() => setIsSocialModalOpen(false)} mode={socialModalMode} />
      )}
    </div>
  );
} 