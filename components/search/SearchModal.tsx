"use client";

import * as React from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";
import { SearchBarSticky } from "./SearchBarSticky";
import type { SearchQueryState } from "./SearchFormState";

type Props = {
  open: boolean;
  onClose: () => void;
  state: SearchQueryState;
  onPatch: (patch: Partial<SearchQueryState>) => void;
  onSubmit: () => void;
};

export function SearchModal({ open, onClose, state, onPatch, onSubmit }: Props) {
  const panelRef = React.useRef<HTMLDivElement>(null);
  const [touchStartY, setTouchStartY] = React.useState<number | null>(null);

  const handleSubmit = () => {
    onSubmit();
    onClose();
  };

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) onClose();
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStartY(e.touches[0].clientY);
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartY == null) return;
    const endY = e.changedTouches[0].clientY;
    const delta = endY - touchStartY;
    if (delta > 60) onClose();
    setTouchStartY(null);
  };

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 md:hidden"
      aria-modal="true"
      aria-label="Изменить параметры поиска"
      role="dialog"
    >
      {/* Overlay */}
      <div
        className="absolute inset-0 bg-black/50 transition-opacity"
        onClick={handleOverlayClick}
        aria-hidden
      />

      {/* Bottom sheet */}
        <div
          ref={panelRef}
          className={cn(
            "absolute left-0 right-0 bottom-0 max-h-[90vh] overflow-y-auto",
            "bg-[#F9FAFB] rounded-t-2xl shadow-xl",
            "flex flex-col pb-[env(safe-area-inset-bottom)]",
            "animate-in slide-in-from-bottom duration-300"
          )}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        {/* Drag handle (visual + swipe hint) */}
        <div className="flex justify-center pt-3 pb-1">
          <div className="w-10 h-1 rounded-full bg-gray-300" aria-hidden />
        </div>

        {/* Header: title + close */}
        <div className="flex items-center justify-between px-4 pb-2">
          <h2 className="text-lg font-semibold text-[#0F172A]">Параметры поиска</h2>
          <button
            type="button"
            onClick={onClose}
            className="flex items-center justify-center h-10 w-10 rounded-full text-[#64748B] hover:bg-[#E5E7EB] hover:text-[#0F172A] transition-colors"
            aria-label="Закрыть"
          >
            <X className="size-5" aria-hidden />
          </button>
        </div>

        {/* Form (no sticky, inline in modal); close on «Найти туры» */}
        <div className="px-4 pb-6">
          <SearchBarSticky
            state={state}
            onPatch={onPatch}
            onSubmit={handleSubmit}
            sticky={false}
            submitLabel="Найти туры"
            className="!bg-transparent"
          />
        </div>
      </div>
    </div>
  );
}
