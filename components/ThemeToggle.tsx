"use client";

import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { Sun, Moon } from "lucide-react";

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
  }, []);

  if (!mounted) {
    return null; // or a skeleton/placeholder to prevent hydration mismatch
  }

  return (
    <button
      onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
      className="flex items-center cursor-pointer gap-2 rounded-full px-4 py-2 text-xs font-medium backdrop-blur-md transition-all border border-border bg-surface/60 hover:bg-surface dark:border-white/10 dark:bg-white/10 dark:hover:bg-white/20 text-foreground"
    >
      {theme === "dark" ? (
        <>
          <Sun size={14} />
          <span>Light Mode</span>
        </>
      ) : (
        <>
          <Moon size={14} />
          <span>Dark Mode</span>
        </>
      )}
    </button>
  );
}
