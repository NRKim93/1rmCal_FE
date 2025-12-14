"use client";
import React from 'react';
import { Modal } from '@/components/common/Modal';
import { Button } from '@/components/common/Button';

interface SocialLoginModalProps {
  onClose: () => void;
  mode?: 'signup' | 'login';
}

export default function SocialLoginModal({ onClose, mode = 'signup' }: SocialLoginModalProps) {
  const handleNaverLogin = () => {
    const client_id = process.env.NEXT_PUBLIC_NAVER_CLIENT_ID;
    let redirect_uri = process.env.NEXT_PUBLIC_NAVER_REDIRECT_URI ?? '';
    const state = Math.random().toString(36).substring(2);

    if (redirect_uri) {
      const urlObj = new URL(redirect_uri);
      urlObj.searchParams.set('mode', mode);
      redirect_uri = urlObj.toString();
    }

    const url = `https://nid.naver.com/oauth2.0/authorize?response_type=code&client_id=${client_id}&redirect_uri=${encodeURIComponent(redirect_uri)}&state=${state}`;
    window.location.href = url;
  };

  return (
    <Modal isOpen={true} onClose={onClose} width="350px" zIndex={2000}>
      <div className="flex flex-col p-0">
        <h6 className="mb-6 text-center text-3xl font-black">
          {mode === 'login' ? '다음으로 THE GYM에 로그인' : '다음으로 THE GYM에 가입하기'}
        </h6>

        <Button
          variant="naver"
          size="lg"
          fullWidth
          onClick={handleNaverLogin}
          className="mb-4"
        >
          {mode === 'login' ? 'Naver로 로그인' : 'Naver로 가입하기'}
        </Button>
      </div>
    </Modal>
  );
}
