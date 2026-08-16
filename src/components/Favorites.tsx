import { useApp } from "../context/AppContext";
import { getToolById } from "../lib/toolsData";

interface FavoritesProps {
  onOpenTool: (id: string) => void;
}

export default function Favorites({ onOpenTool }: FavoritesProps) {
  const { favorites, toggleFavorite } = useApp();
  const items = favorites.map((id) => getToolById(id)).filter(Boolean);

  return (
    <div>
      <div className="section-title">
        <span aria-hidden="true">⭐</span> ابزارهای موردعلاقه
      </div>

      {items.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon" aria-hidden="true">
            ⭐
          </div>
          <p>هنوز ابزاری به علاقه‌مندی‌ها اضافه نکرده‌اید.</p>
        </div>
      ) : (
        <div className="tools-grid">
          {items.map((tool) => (
            <div key={tool!.id} className="tool-card" onClick={() => onOpenTool(tool!.id)} role="button" tabIndex={0}
              onKeyDown={(e) => { if (e.key === "Enter") onOpenTool(tool!.id); }}
            >
              <button
                className="fav-btn active"
                onClick={(e) => {
                  e.stopPropagation();
                  toggleFavorite(tool!.id);
                }}
                aria-label="حذف از علاقه‌مندی‌ها"
                aria-pressed="true"
              >
                ★
              </button>
              <div className="tool-icon" aria-hidden="true">
                {tool!.icon}
              </div>
              <h3>{tool!.name}</h3>
              <p>{tool!.description}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
