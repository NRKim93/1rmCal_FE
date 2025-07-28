"use client";
import styles from './page.module.css';
import { useState } from "react";
import LoginModal from "../components/LoginModal";

export default function HomePage() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>THE GYM</h1>
      <button className={styles.button} onClick={() => setIsModalOpen(true)}>
        Let's Train
      </button>

      {isModalOpen && <LoginModal onClose={() => setIsModalOpen(false)} />}
    </div>
  );
}
