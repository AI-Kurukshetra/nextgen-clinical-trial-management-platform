"use client";

import { useCallback, useEffect, useState } from "react";

const STORAGE_KEY = "sidebar-collapsed";

export function useSidebar() {
  const [collapsed, setCollapsedState] = useState(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored !== null) {
        setCollapsedState(stored === "true");
      }
    } catch {
      // ignore
    }
  }, []);

  const setCollapsed = useCallback((value: boolean) => {
    setCollapsedState(value);
    try {
      localStorage.setItem(STORAGE_KEY, String(value));
    } catch {
      // ignore
    }
  }, []);

  const toggle = useCallback(() => {
    setCollapsedState((prev) => {
      const next = !prev;
      try {
        localStorage.setItem(STORAGE_KEY, String(next));
      } catch {
        // ignore
      }
      return next;
    });
  }, []);

  return { collapsed, setCollapsed, toggle };
}
