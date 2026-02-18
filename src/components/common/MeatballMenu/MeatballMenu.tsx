"use client";

import React, { useEffect, useRef, useState } from "react";

export interface MeatballMenuItem {
  label: string;
  onClick: () => void;
  danger?: boolean;
  disabled?: boolean;
}

interface MeatballMenuProps {
  items: MeatballMenuItem[];
  buttonAriaLabel?: string;
  buttonTitle?: string;
}

export default function MeatballMenu({
  items,
  buttonAriaLabel = "More options",
  buttonTitle = "More options",
}: MeatballMenuProps) {
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;

    const handlePointerDown = (event: MouseEvent) => {
      if (!menuRef.current) return;
      if (!menuRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("keydown", handleEscape);
    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [open]);

  return (
    <div ref={menuRef} className="relative flex shrink-0 items-center gap-2">
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className="flex h-7 w-7 items-center justify-center rounded-md border border-gray-300 bg-white text-base font-bold text-gray-600 transition-colors hover:bg-gray-100"
        aria-label={buttonAriaLabel}
        aria-expanded={open}
        aria-haspopup="menu"
        title={buttonTitle}
      >
        ⋯
      </button>
      {open ? (
        <div
          className="absolute right-0 top-8 z-10 min-w-[8rem] rounded-md border border-gray-200 bg-white p-1 shadow-lg"
          role="menu"
        >
          {items.map((item) => (
            <button
              key={item.label}
              type="button"
              className={[
                "block w-full rounded px-2 py-1.5 text-left text-sm transition-colors",
                item.danger ? "text-red-600 hover:bg-red-50" : "text-gray-700 hover:bg-gray-100",
                item.disabled ? "cursor-not-allowed opacity-50" : "",
              ].join(" ")}
              role="menuitem"
              disabled={item.disabled}
              onClick={() => {
                setOpen(false);
                item.onClick();
              }}
            >
              {item.label}
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}
