import React from 'react';
import './SocialLoginModal.css';

interface SocialLoginModalProps {
  onClose: () => void;
}

export default function SocialLoginModal({ onClose }: SocialLoginModalProps) {
  const handleNaverLogin = () => {
    const client_id = process.env.NEXT_PUBLIC_NAVER_CLIENT_ID;
    const redirect_uri = process.env.NEXT_PUBLIC_NAVER_REDIRECT_URI;
    const state = Math.random().toString(36).substring(2);
    const url = `https://nid.naver.com/oauth2.0/authorize?response_type=code&client_id=${client_id}&redirect_uri=${redirect_uri}&state=${state}`;
    window.location.href = url;
  };

  return (
    <div className="social-login-modal__overlay">
      <div className="social-login-modal__content">
        <h6 className="social-login-modal__title">다음으로 THE GYM에 로그인</h6>
        <button className="social-login-modal__naver-btn" onClick={handleNaverLogin}>
          Naver로 가입하기 
        </button>
        <button className="social-login-modal__close-btn" onClick={onClose}>×</button>
      </div>
    </div>
  );
} 