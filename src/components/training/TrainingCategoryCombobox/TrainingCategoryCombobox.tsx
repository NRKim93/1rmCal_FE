"use client";

import {
  KeyboardEvent,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
} from "react";
import { useAutoComplete } from "@/hooks/useAutocomplete";
import type { AutoCompleteItem } from "@/lib/types/training";

interface TrainingCategoryComboboxProps {
  value: number;
  onChange: (category: AutoCompleteItem | null) => void;
  disabled?: boolean;
}

const inputClass =
  "w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 pr-10 text-sm text-slate-900 outline-none focus:border-sky-400 focus:ring-2 focus:ring-sky-100 disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-400";

function displayName(item: AutoCompleteItem) {
  return item.trainingDisplayName || item.trainingName;
}

export function TrainingCategoryCombobox({
  value,
  onChange,
  disabled = false,
}: TrainingCategoryComboboxProps) {
  const listboxId = useId();
  const containerRef = useRef<HTMLDivElement>(null);
  const [isOpen, setIsOpen] = useState(false);
  const {
    query,
    setQuery,
    results,
    items,
    activeIndex,
    setActiveIndex,
    getActiveItem,
    onKeyDown,
    isLoading,
    isError,
  } = useAutoComplete({ limit: 8 });

  const selectedItem = useMemo(
    () => items.find((item) => item.seq === value),
    [items, value],
  );

  useEffect(() => {
    if (selectedItem) {
      setQuery(displayName(selectedItem));
    }
  }, [selectedItem, setQuery]);

  const restoreSelectedValue = () => {
    setQuery(selectedItem ? displayName(selectedItem) : "");
    setIsOpen(false);
  };

  const selectItem = (item: AutoCompleteItem) => {
    onChange(item);
    setQuery(displayName(item));
    setIsOpen(false);
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter") {
      event.preventDefault();
      if (!isOpen) {
        setIsOpen(true);
        return;
      }

      const activeItem = getActiveItem();
      if (activeItem) {
        selectItem(activeItem);
      }
      return;
    }

    if (event.key === "Escape") {
      event.preventDefault();
      restoreSelectedValue();
      return;
    }

    if (event.key === "ArrowDown" || event.key === "ArrowUp") {
      setIsOpen(true);
    }
    onKeyDown(event);
  };

  const showResults = isOpen && !disabled;

  return (
    <div
      ref={containerRef}
      className="relative"
      onBlur={(event) => {
        if (!containerRef.current?.contains(event.relatedTarget)) {
          restoreSelectedValue();
        }
      }}
    >
      <input
        type="text"
        role="combobox"
        aria-autocomplete="list"
        aria-expanded={showResults}
        aria-controls={listboxId}
        aria-activedescendant={
          showResults && results[activeIndex]
            ? `${listboxId}-option-${results[activeIndex].seq}`
            : undefined
        }
        value={query}
        disabled={disabled || isLoading}
        placeholder={isLoading ? "운동 목록을 불러오는 중..." : "운동명, 영문 코드 또는 초성으로 검색"}
        className={inputClass}
        onFocus={(event) => {
          setIsOpen(true);
          event.currentTarget.select();
        }}
        onChange={(event) => {
          setQuery(event.target.value);
          if (!selectedItem || event.target.value !== displayName(selectedItem)) {
            onChange(null);
          }
          setIsOpen(true);
        }}
        onKeyDown={handleKeyDown}
      />
      <span
        aria-hidden="true"
        className={`pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 transition-transform ${
          showResults ? "rotate-180" : ""
        }`}
      >
        ▼
      </span>

      {showResults && (
        <div className="absolute z-30 mt-1 w-full overflow-hidden rounded-lg border border-slate-200 bg-white shadow-lg">
          {isError ? (
            <p className="px-3 py-3 text-sm text-red-600">운동 목록을 불러오지 못했습니다.</p>
          ) : results.length === 0 ? (
            <p className="px-3 py-3 text-sm text-slate-500">검색 결과가 없습니다.</p>
          ) : (
            <ul id={listboxId} role="listbox" className="max-h-64 overflow-y-auto py-1">
              {results.map((item, index) => {
                const isActive = index === activeIndex;
                const isSelected = item.seq === value;

                return (
                  <li
                    id={`${listboxId}-option-${item.seq}`}
                    key={item.seq}
                    role="option"
                    aria-selected={isSelected}
                    className={`cursor-pointer px-3 py-2 text-sm ${
                      isActive ? "bg-sky-50 text-sky-900" : "text-slate-700"
                    }`}
                    onMouseEnter={() => setActiveIndex(index)}
                    onMouseDown={(event) => event.preventDefault()}
                    onClick={() => selectItem(item)}
                  >
                    <span className="font-semibold">{displayName(item)}</span>
                    {item.trainingName !== displayName(item) && (
                      <span className="ml-2 text-xs text-slate-400">{item.trainingName}</span>
                    )}
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
