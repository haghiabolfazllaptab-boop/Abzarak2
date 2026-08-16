import { useMemo, useState } from "react";
import { useApp } from "../context/AppContext";
import { categories, tools, type CategoryKey, getToolById } from "../lib/toolsData";

interface HomeProps {
  onOpenTool: (id: string) => void;
}

export default function Home({ onOpenTool }: HomeProps) {
  const { favorites, toggleFavorite, recentTools } = useApp();
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<CategoryKey>("all");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return tools.filter((t) => {
      const matchesCategory = category === "all" || t.category === category;
      const matchesQuery =
        !q ||
        t.name.toLowerCase().includes(q) ||
        t.description.toLowerCase().includes(q) ||
        categories.find((c) => c.key === t.category)?.label.toLowerCase().includes(q);
      return matchesCategory && matchesQuery;
    });
  }, [query, category]);

  const recentToolMetas = recentTools.map((id) => getToolById(id)).filter(Boolean);

  return (
    <div>
      <div className="hero">
        <h1>همه ابزارهای کاربردی در یک جا</h1>
        <p>محاسبه، تبدیل، بررسی و مدیریت اطلاعات روزمره؛ سریع و ساده.</p>
      </div>

      <div className="search-box">
        <input
          type="search"
          placeholder="جستجوی ابزار..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          aria-label="جستجوی ابزار"
        />
        <span className="search-icon" aria-hidden="true">
          🔍
        </span>
      </div>

      <div className="category-filters" role="tablist" aria-label="دسته‌بندی ابزارها">
        {categories.map((c) => (
          <button
            key={c.key}
            className={`category-chip ${category === c.key ? "active" : ""}`}
            onClick={() => setCategory(c.key)}
            role="tab"
            aria-selected={category === c.key}
          >
            {c.label}
          </button>
        ))}
      </div>

      {!query && recentToolMetas.length > 0 && (
        <>
          <div className="section-title">
            <span aria-hidden="true">🕒</span> آخرین ابزارهای استفاده‌شده
          </div>
          <div className="recent-row">
            {recentToolMetas.map((t) => (
              <button key={t!.id} className="recent-chip" onClick={() => onOpenTool(t!.id)}>
                <span aria-hidden="true">{t!.icon}</span>
                <span>{t!.name}</span>
              </button>
            ))}
          </div>
        </>
      )}

      <div className="section-title">
        <span aria-hidden="true">🧰</span> ابزارها
      </div>

      {filtered.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon" aria-hidden="true">
            🔎
          </div>
          <p>ابزاری پیدا نشد.</p>
        </div>
      ) : (
        <div className="tools-grid">
          {filtered.map((tool) => {
            const fav = favorites.includes(tool.id);
            return (
              <div key={tool.id} className="tool-card" onClick={() => onOpenTool(tool.id)} role="button" tabIndex={0}
                onKeyDown={(e) => { if (e.key === "Enter") onOpenTool(tool.id); }}
              >
                <button
                  className={`fav-btn ${fav ? "active" : ""}`}
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleFavorite(tool.id);
                  }}
                  aria-label={fav ? "حذف از علاقه‌مندی‌ها" : "افزودن به علاقه‌مندی‌ها"}
                  aria-pressed={fav}
                >
                  {fav ? "★" : "☆"}
                </button>
                <div className="tool-icon" aria-hidden="true">
                  {tool.icon}
                </div>
                <h3>{tool.name}</h3>
                <p>{tool.description}</p>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
