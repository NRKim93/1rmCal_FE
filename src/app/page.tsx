"use client";
import { useState } from "react";
import LoginModal from "../components/LoginModal";

export default function HomePage() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <div style={styles.container}>
      <h1 style={styles.title}>THE GYM</h1>
      <button style={styles.button} onClick={() => setIsModalOpen(true)}>
        Let's Train
      </button>

      {isModalOpen && <LoginModal onClose={() => setIsModalOpen(false)} />}
    </div>
  );
}

const styles: { [key: string]: React.CSSProperties } = {
  container: {
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    minHeight: "100vh",
    backgroundColor: "#f0f0f0",
  },
  title: {
    fontSize: "4em",
    fontWeight: 900,
    marginBottom: "2em",
  },
  button: {
    padding: "1em 2em",
    fontSize: "1.2em",
    border: "1px solid #333",
    borderRadius: "5px",
    background: "white",
    cursor: "pointer",
  },
};
