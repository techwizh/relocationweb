"use client";

import type { ReactNode } from "react";

type MotionSectionProps = {
  children: ReactNode;
  className?: string;
  delay?: number;
};

export function MotionFadeUp({ children, className = "", delay = 0 }: MotionSectionProps) {
  return (
    <div
      className={`motion-fade-up ${className}`}
      style={{ animationDelay: `${delay}ms` }}
    >
      {children}
    </div>
  );
}

export function MotionFloat({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <div className={`motion-float ${className}`}>{children}</div>;
}

export function MotionGlowOrb({ className = "" }: { className?: string }) {
  return <div className={`motion-glow-orb ${className}`} aria-hidden />;
}
