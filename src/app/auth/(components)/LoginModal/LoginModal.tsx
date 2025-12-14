"use client";
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import SocialLoginModal from '../SocialLoginModal/SocialLoginModal';
import { Modal } from '@/components/common/Modal';
import { Button } from '@/components/common/Button';

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
    <>
      <Modal isOpen={true} onClose={onClose} width="430px" zIndex={1000}>
        <div className="flex flex-col p-0">
          <h2 className="mb-5 text-center text-4xl font-black">THE GYM</h2>

          <Button
            variant="primary"
            size="lg"
            fullWidth
            onClick={handleLogInClick}
            className="mb-4"
          >
            Log in
          </Button>

          <p className="mb-2 mt-5 text-center text-sm text-gray-600">처음이신가요?</p>

          <Button
            variant="secondary"
            size="md"
            fullWidth
            onClick={handleSignInClick}
          >
            Sign in
          </Button>

          <p className="mb-2 mt-5 text-center text-sm text-gray-600">비회원 이용 가능 기능</p>

          <Button
            variant="secondary"
            size="md"
            fullWidth
            onClick={handleNonLoginClick}
          >
            1RM 측정
          </Button>
        </div>
      </Modal>

      {isSocialModalOpen && (
        <SocialLoginModal onClose={() => setIsSocialModalOpen(false)} mode={socialModalMode} />
      )}
    </>
  );
}
