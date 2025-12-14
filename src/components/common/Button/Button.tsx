"use client";
import React from 'react';

export type ButtonVariant = 'primary' | 'secondary' | 'naver' | 'outline' | 'danger';
export type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  fullWidth?: boolean;
  children: React.ReactNode;
}

export default function Button({
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  children,
  className = '',
  disabled = false,
  ...props
}: ButtonProps) {
  const baseClasses =
    'inline-flex items-center justify-center whitespace-nowrap text-center font-medium font-[inherit] rounded-[6px] transition-all duration-200 ease-out';

  const variantClasses: Record<ButtonVariant, string> = {
    primary: 'bg-[#87CEEB] text-white enabled:hover:bg-[#6BB8D8]',
    secondary: 'bg-white text-[#333] border border-[#333]',
    naver: 'bg-[#1EC800] text-white enabled:hover:bg-[#17A800]',
    outline: 'text-[#333] border border-[#ddd] enabled:hover:bg-gray-200 enabled:hover:border-[#bbb]',
    danger: 'bg-[#ff4444] text-white enabled:hover:bg-[#cc0000]',
  };

  const sizeClasses: Record<ButtonSize, string> = {
    sm: 'px-4 py-2 text-sm',
    md: 'px-5 py-2.5 text-base',
    lg: 'px-[25px] py-3 text-[1.1rem]',
  };

  const classNames = [
    baseClasses,
    variantClasses[variant],
    sizeClasses[size],
    fullWidth ? 'w-full' : '',
    'disabled:opacity-60 disabled:cursor-not-allowed',
    className
  ].filter(Boolean).join(' ');

  return (
    <button
      className={classNames}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  );
}
