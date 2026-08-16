import type { ReactNode } from "react";
import { useApp } from "../context/AppContext";
import type { ToolMeta } from "../lib/toolsData";

interface ToolShellProps {
  tool: ToolMeta;
  onBack: () => void;
  children: ReactNode;
}

export default function ToolShell({ tool, onBack, children }: ToolShellProps) {
  const { isFavorite, toggleFavorite } = useApp();
  const fav = isFavorite(tool.id);

  return (
    <div>
      <div className="tool-page-header">
        <button className="back-btn" onClick={onBack} aria-label="بازگشت">
          ←
        </button>
        <div className="tool-icon-lg" aria-hidden="true">
          {tool.icon}
        </div>
        <div className="titles">
          <h2>{tool.name}</h2>
          <p>{tool.description}</p>
        </div>
        <button
          className={`fav-toggle ${fav ? "active" : ""}`}
          onClick={() => toggleFavorite(tool.id)}
          aria-label={fav ? "حذف از علاقه‌مندی‌ها" : "افزودن به علاقه‌مندی‌ها"}
          aria-pressed={fav}
        >
          {fav ? "★" : "☆"}
        </button>
      </div>
      {children}
    </div>
  );
}
