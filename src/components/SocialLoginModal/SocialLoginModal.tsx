import React from 'react';
import styles from './css/SocialLoginModal.module.css';

interface SocialLoginModalProps {
  onClose: () => void;
  mode?: 'signup' | 'login';
}

export default function SocialLoginModal({ onClose, mode = 'signup' }: SocialLoginModalProps) {
  const handleNaverLogin = () => {
    const client_id = process.env.NEXT_PUBLIC_NAVER_CLIENT_ID;
    let redirect_uri = process.env.NEXT_PUBLIC_NAVER_REDIRECT_URI ?? '';
    const state = Math.random().toString(36).substring(2);
    // mode 파라미터 추가
    if (redirect_uri) {
      const urlObj = new URL(redirect_uri);
      urlObj.searchParams.set('mode', mode);
      redirect_uri = urlObj.toString();
    }
    const url = `https://nid.naver.com/oauth2.0/authorize?response_type=code&client_id=${client_id}&redirect_uri=${encodeURIComponent(redirect_uri)}&state=${state}`;
    window.location.href = url;
  };

  return (
    <div className={styles['social-login-modal__overlay']}>
      <div className={styles['social-login-modal__content']}>
        <h6 className={styles['social-login-modal__title']}>
          {mode === 'login' ? '다음으로 THE GYM에 로그인' : '다음으로 THE GYM에 가입하기'}
        </h6>
        <button className={styles['social-login-modal__naver-btn']} onClick={handleNaverLogin}>
          {mode === 'login' ? 'Naver로 로그인' : 'Naver로 가입하기'}
        </button>
        <button className={styles['social-login-modal__close-btn']} onClick={onClose}>×</button>
      </div>
    </div>
  );
} 