import { useEffect } from "react";

/** Overflow style applied to documentElement when locking scroll. */
export function scrollLockOverflowValue(locked: boolean): "" | "hidden" {
  return locked ? "hidden" : "";
}

/** Lock document scroll (e.g. while a mobile drawer is open). */
export function setBodyScrollLock(locked: boolean): void {
  if (typeof document === "undefined") return;
  document.documentElement.style.overflow = scrollLockOverflowValue(locked);
}

export function useBodyScrollLock(locked: boolean): void {
  useEffect(() => {
    setBodyScrollLock(locked);
    return () => setBodyScrollLock(false);
  }, [locked]);
}
