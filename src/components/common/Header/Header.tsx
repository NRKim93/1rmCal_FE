"use client";

import React from "react";
import { Button } from "@/components/common/Button";

export interface HeaderProps {
  children?: React.ReactNode;
  onBack?: () => void;
  backLabel?: React.ReactNode;
  left?: React.ReactNode;
  right?: React.ReactNode;
  className?: string;
}

export default function Header({
  children,
  onBack,
  backLabel = "뒤로 가기",
  left,
  right,
  className = "",
}: HeaderProps) {
  if (children) {
    return <header className={className}>{children}</header>;
  }

  return (
    <header
      className={[
        "flex items-center justify-between border-b border-gray-200 bg-white px-5 py-4",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      <div className="min-w-0">{left}</div>
      {right ??
        (onBack ? (
          <Button variant="outline" size="sm" onClick={onBack}>
            {backLabel}
          </Button>
        ) : null)}
    </header>
  );
}
