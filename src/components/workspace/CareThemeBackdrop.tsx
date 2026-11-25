"use client";

import { useEffect, useRef } from "react";
import "./care-theme.css";

export function CareThemeBackdrop({
  variant,
}: {
  variant: "patient" | "receptionist";
}) {
  const backdropRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const handlePointerMove = (event: PointerEvent) => {
      const relativeX = event.clientX / window.innerWidth - 0.5;
      const relativeY = event.clientY / window.innerHeight - 0.5;
      const x = relativeX * 46;
      const y = relativeY * 46;
      const colorX = relativeX * 320;
      const colorY = relativeY * 240;
      backdropRef.current?.style.setProperty("--care-pointer-x", `${x}px`);
      backdropRef.current?.style.setProperty("--care-pointer-y", `${y}px`);
      backdropRef.current?.style.setProperty("--care-color-x", `${colorX}px`);
      backdropRef.current?.style.setProperty("--care-color-y", `${colorY}px`);
      backdropRef.current?.style.setProperty("--care-blue-x", `${event.clientX}px`);
      backdropRef.current?.style.setProperty("--care-blue-y", `${event.clientY}px`);
    };
    window.addEventListener("pointermove", handlePointerMove, { passive: true });
    return () => window.removeEventListener("pointermove", handlePointerMove);
  }, []);

  return (
    <div
      ref={backdropRef}
      className={`care-theme-backdrop care-theme-backdrop--${variant}`}
      aria-hidden="true"
    >
      <div className="care-theme-color-field" />
      <div className="care-theme-blue-glow" />
      <div className="care-theme-grid" />
      <div className="care-theme-orb care-theme-orb--one" />
      <div className="care-theme-orb care-theme-orb--two" />
      <div className="care-theme-orb care-theme-orb--three" />
      <div className="care-theme-pointer-glow" />
    </div>
  );
}
