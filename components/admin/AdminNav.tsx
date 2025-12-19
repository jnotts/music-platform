"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, LogOut, Loader2 } from "lucide-react";
import { ThemeToggle } from "@/components/ThemeToggle";
import { createBrowserClient } from "@/lib/supabase/client";
import { useState } from "react";

interface AdminNavProps {
  /** Page title to display in the navbar */
  title: string;

  /** Optional icon component to display next to the title */
  icon?: React.ComponentType<{ size?: number; className?: string }>;

  /** Optional back link configuration */
  backLink?: {
    href: string;
    label: string;
  };

  /** Optional navigation links to display in the right section */
  navLinks?: Array<{
    href: string;
    label: string;
  }>;

  /** Whether to show the theme toggle (default: true) */
  showThemeToggle?: boolean;
}

/**
 * Reusable admin navigation bar component.
 * Used across all admin pages for consistent navigation and theming.
 */
export function AdminNav({
  title,
  icon: Icon,
  backLink,
  navLinks = [],
  showThemeToggle = true,
}: AdminNavProps) {
  const router = useRouter();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      const supabase = createBrowserClient();
      await supabase.auth.signOut();
      router.push("/login");
      router.refresh();
    } catch (error) {
      console.error("Logout error:", error);
      setIsLoggingOut(false);
    }
  };

  return (
    <header className="z-10 flex h-16 shrink-0 items-center justify-between border-b border-border bg-surface/50 px-6 backdrop-blur-md">
      <div className="flex items-center gap-4">
        {backLink && (
          <Link
            href={backLink.href}
            className="-ml-2 rounded-lg p-2 text-muted transition-colors hover:bg-surface-muted hover:text-foreground"
          >
            <ArrowLeft size={20} />
          </Link>
        )}
        <div className="mx-2 h-6 w-px bg-border" />
        <div className="flex items-center gap-2">
          {Icon && <Icon size={18} className="text-primary" />}
          <h1 className="hidden font-semibold tracking-tight sm:block">
            {title}
          </h1>
        </div>
      </div>
      <div className="flex items-center gap-4">
        {navLinks.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className="text-sm font-medium text-muted transition-colors hover:text-foreground"
          >
            {link.label}
          </Link>
        ))}
        {showThemeToggle && <ThemeToggle />}
        <button
          onClick={handleLogout}
          disabled={isLoggingOut}
          className="flex cursor-pointer items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-muted transition-colors hover:bg-surface-muted hover:text-foreground disabled:cursor-not-allowed disabled:opacity-50"
          title={isLoggingOut ? "Logging out..." : "Logout"}
        >
          {isLoggingOut ? (
            <Loader2 size={16} className="animate-spin" />
          ) : (
            <LogOut size={16} />
          )}
          <span className="hidden sm:inline">
            {isLoggingOut ? "Logging out..." : "Logout"}
          </span>
        </button>
      </div>
    </header>
  );
}
