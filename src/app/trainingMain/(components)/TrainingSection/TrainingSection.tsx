"use client";
import React from 'react';
import { Button } from '@/components/common/Button';

interface TrainingSectionProps {
  title: string;
  buttonText: string;
  onButtonClick?: () => void;
}

export default function TrainingSection({ title, buttonText, onButtonClick }: TrainingSectionProps) {
  return (
    <section className="px-5 pb-5">
      <h2 className="mb-4 text-lg text-gray-800">{title}</h2>
      <div className="rounded-lg bg-white p-5 shadow-[0_2px_4px_rgba(0,0,0,0.1)]">
        <Button
          variant="outline"
          size="md"
          fullWidth
          onClick={onButtonClick}
          className="border-0 bg-gray-300 text-black"
        >
          {buttonText}
        </Button>
      </div>
    </section>
  );
}
