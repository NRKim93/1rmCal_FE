import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import SocialLoginModal from '../SocialLoginModal/SocialLoginModal';
import styles from './css/LoginModal.module.css';

interface LoginModalProps {
  onClose: () => void;
}

export default function LoginModal({ onClose }: LoginModalProps) {
  const router = useRouter();
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

  const handleNonLoginClick = () => {
    router.push('/1rm');
    onClose();
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
        <p className={styles['login-modal__text']}>비회원 이용 가능 기능</p>
        <button className={styles['login-modal__secondary-btn']} onClick={handleNonLoginClick}>
          1RM 측정
        </button>
        <button className={styles['login-modal__close-btn']} onClick={onClose}>×</button>
      </div>
      {isSocialModalOpen && (
        <SocialLoginModal onClose={() => setIsSocialModalOpen(false)} mode={socialModalMode} />
      )}
    </div>
  );
} 