import React, { useState } from 'react';
import SocialLoginModal from './SocialLoginModal';
import './LoginModal.css';

interface LoginModalProps {
  onClose: () => void;
}

export default function LoginModal({ onClose }: LoginModalProps) {
  const [isSocialModalOpen, setIsSocialModalOpen] = useState(false);

  const handleSignInClick = () => {
    setIsSocialModalOpen(true);
  };

  return (
    <div className="login-modal__overlay">
      <div className="login-modal__content">
        <h2 className="login-modal__title">THE GYM</h2>
        <button className="login-modal__primary-btn">Log in</button>
        <p className="login-modal__text">처음이신가요?</p>
        <button className="login-modal__secondary-btn" onClick={handleSignInClick}>
          Sign in
        </button>
        <button className="login-modal__close-btn" onClick={onClose}>×</button>
      </div>
      {isSocialModalOpen && (
        <SocialLoginModal onClose={() => setIsSocialModalOpen(false)} />
      )}
    </div>
  );
} 