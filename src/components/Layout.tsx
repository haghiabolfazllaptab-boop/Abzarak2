import type { ReactNode } from "react";
import { useApp } from "../context/AppContext";

export type ViewKey = "home" | "favorites" | "settings";

interface LayoutProps {
  view: ViewKey;
  onNavigate: (view: ViewKey) => void;
  children: ReactNode;
}

const navItems: { key: ViewKey; label: string; icon: string }[] = [
  { key: "home", label: "خانه", icon: "🏠" },
  { key: "favorites", label: "علاقه‌مندی‌ها", icon: "⭐" },
  { key: "settings", label: "تنظیمات", icon: "⚙️" },
];

export default function Layout({ view, onNavigate, children }: LayoutProps) {
  const { toast } = useApp();

  return (
    <div className="app-shell">
      <header className="app-header">
        <div className="app-header-inner">
          <div className="brand">
            <span className="brand-logo" aria-hidden="true">
              🧰
            </span>
            <span>ابزارک</span>
          </div>
          <nav className="top-nav" aria-label="ناوبری اصلی">
            {navItems.map((item) => (
              <button
                key={item.key}
                className={view === item.key ? "active" : ""}
                onClick={() => onNavigate(item.key)}
                aria-current={view === item.key ? "page" : undefined}
              >
                {item.label}
              </button>
            ))}
          </nav>
        </div>
      </header>

      <main className="main-content">{children}</main>

      <footer className="app-footer">
        ابزارک — ابزارهای کاربردی، همیشه در دسترس
      </footer>

      <nav className="bottom-nav" aria-label="ناوبری پایین صفحه">
        {navItems.map((item) => (
          <button
            key={item.key}
            className={view === item.key ? "active" : ""}
            onClick={() => onNavigate(item.key)}
            aria-current={view === item.key ? "page" : undefined}
          >
            <span className="nav-icon" aria-hidden="true">
              {item.icon}
            </span>
            <span>{item.label}</span>
          </button>
        ))}
      </nav>

      {toast && (
        <div className="toast-wrap" role="status" aria-live="polite">
          <div className={`toast ${toast.type}`}>
            <span aria-hidden="true">{toast.type === "success" ? "✅" : toast.type === "error" ? "⚠️" : "ℹ️"}</span>
            <span>{toast.message}</span>
          </div>
        </div>
      )}
    </div>
  );
}
