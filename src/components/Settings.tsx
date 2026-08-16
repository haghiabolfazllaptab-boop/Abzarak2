import { useApp } from "../context/AppContext";
import type { ThemeMode, NumberFormatMode } from "../lib/storage";

export default function Settings() {
  const { settings, updateSettings, resetSettings, showToast } = useApp();

  const themeOptions: { key: ThemeMode; label: string }[] = [
    { key: "light", label: "روشن" },
    { key: "dark", label: "تیره" },
    { key: "auto", label: "خودکار" },
  ];

  const numberOptions: { key: NumberFormatMode; label: string }[] = [
    { key: "fa", label: "فارسی" },
    { key: "en", label: "انگلیسی" },
  ];

  return (
    <div>
      <div className="section-title">
        <span aria-hidden="true">⚙️</span> تنظیمات
      </div>

      <div className="card">
        <div className="settings-group">
          <div className="settings-group-title">تم</div>
          <div className="option-list" role="radiogroup" aria-label="تم برنامه">
            {themeOptions.map((opt) => (
              <label className="option-item" key={opt.key}>
                {opt.label}
                <input
                  type="radio"
                  name="theme"
                  checked={settings.theme === opt.key}
                  onChange={() => updateSettings({ theme: opt.key })}
                />
              </label>
            ))}
          </div>
        </div>

        <div className="settings-group">
          <div className="settings-group-title">نمایش اعداد</div>
          <div className="option-list" role="radiogroup" aria-label="نمایش اعداد">
            {numberOptions.map((opt) => (
              <label className="option-item" key={opt.key}>
                {opt.label}
                <input
                  type="radio"
                  name="numberFormat"
                  checked={settings.numberFormat === opt.key}
                  onChange={() => updateSettings({ numberFormat: opt.key })}
                />
              </label>
            ))}
          </div>
        </div>

        <div className="settings-group">
          <div className="settings-group-title">واحد پول پیش‌فرض</div>
          <div className="option-list">
            <label className="option-item">
              تومان
              <input type="radio" name="currency" checked readOnly />
            </label>
          </div>
        </div>

        <button
          className="btn btn-danger btn-block"
          onClick={() => {
            resetSettings();
            showToast("تنظیمات به حالت پیش‌فرض بازگشت.", "success");
          }}
        >
          بازنشانی تنظیمات
        </button>
      </div>

      <p className="hint-text" style={{ textAlign: "center" }}>
        تمام اطلاعات شما فقط روی همین دستگاه ذخیره می‌شود و به هیچ سروری ارسال نمی‌گردد.
      </p>
    </div>
  );
}
