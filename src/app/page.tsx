"use client";
import { useState } from "react";
import LoginModal from "@/app/auth/(components)/LoginModal/LoginModal";

export default function HomePage() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-100">
      <h1 className="mb-8 text-6xl font-black">THE GYM</h1>
      <button
        type="button"
        className="cursor-pointer rounded border border-gray-800 bg-white px-8 py-4 text-lg hover:bg-gray-50"
        onClick={() => setIsModalOpen(true)}
      >
        Let's Train
      </button>

      {isModalOpen && <LoginModal onClose={() => setIsModalOpen(false)} />}
    </div>
  );
}
