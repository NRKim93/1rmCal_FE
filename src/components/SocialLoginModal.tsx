import React from 'react';

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
    <div style={modalStyles.overlay}>
      <div style={modalStyles.modalContent}>
        <h6 style={modalStyles.title}>다음으로 THE GYM에 로그인</h6>
        <button style={modalStyles.naverButton} onClick={handleNaverLogin}>
          Naver로 가입하기 
        </button>
        <button style={modalStyles.closeButton} onClick={onClose}>×</button>
      </div>
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
    zIndex: 2000, // LoginModal보다 위에 표시되도록 zIndex를 높임
  },
  modalContent: {
    backgroundColor: 'white',
    padding: '40px 50px',
    borderRadius: '10px',
    textAlign: 'center' as 'center',
    position: 'relative' as 'relative',
    width: '350px',
  },
  title: {
    fontSize: '1.8em',
    fontWeight: 900,
    marginBottom: '25px',
  },
  naverButton: {
    padding: '12px 20px',
    fontSize: '1.1em',
    fontWeight: 'bold',
    backgroundColor: '#1EC800', // 네이버 그린 색상
    color: 'white',
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer',
    width: '100%',
    marginBottom: '15px',
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