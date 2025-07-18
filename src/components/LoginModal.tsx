import React, { useState } from 'react';
import SocialLoginModal from './SocialLoginModal';

interface LoginModalProps {
  onClose: () => void;
}

export default function LoginModal({ onClose }: LoginModalProps) {
  const [isSocialModalOpen, setIsSocialModalOpen] = useState(false);

  const handleSignInClick = () => {
    setIsSocialModalOpen(true);
  };

  return (
    <div style={modalStyles.overlay}>
      <div style={modalStyles.modalContent}>
        <h2 style={modalStyles.title}>THE GYM</h2>
        <button style={modalStyles.primaryButton}>Log in</button>
        <p style={modalStyles.text}>처음이신가요?</p>
        <button style={modalStyles.secondaryButton} onClick={handleSignInClick}>
          Sign in
        </button>
        <button style={modalStyles.closeButton} onClick={onClose}>×</button>
      </div>

      {isSocialModalOpen && (
        <SocialLoginModal onClose={() => setIsSocialModalOpen(false)} />
      )}
    </div>
  );
}

const modalStyles = {
  overlay: {
    position: 'fixed' as 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  modalContent: {
    backgroundColor: 'white',
    padding: '43px 65px',
    borderRadius: '10px',
    textAlign: 'center' as 'center',
    position: 'relative' as 'relative',
    width: '430px',
  },
  title: {
    fontSize: '2.5em',
    fontWeight: 900,
    marginBottom: '20px',
  },
  primaryButton: {
    padding: '12px 25px',
    fontSize: '1.1em',
    fontWeight: 'bold',
    backgroundColor: '#87CEEB',
    color: 'white',
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer',
    width: '100%',
    marginBottom: '15px',
  },
  secondaryButton: {
    padding: '10px 20px',
    fontSize: '1em',
    border: '1px solid #333',
    borderRadius: '5px',
    background: 'white',
    cursor: 'pointer',
    width: '100%',
  },
  text: {
    fontSize: '0.9em',
    color: '#555',
    margin: '20px 0 10px 0',
  },
  closeButton: {
    position: 'absolute' as 'absolute',
    top: '10px',
    right: '10px',
    background: 'none',
    border: 'none',
    fontSize: '1.5em',
    cursor: 'pointer',
    color: '#333',
  },
}; 