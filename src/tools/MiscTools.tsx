import { useMemo, useState } from "react";
import { useApp } from "../context/AppContext";
import { parseLocaleNumber, toEnglishDigits } from "../lib/format";

function useCopy() {
  const { showToast } = useApp();
  return async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      showToast("با موفقیت کپی شد.", "success");
    } catch {
      showToast("امکان کپی وجود ندارد.", "error");
    }
  };
}

/* ---------------- ابزار رنگ ---------------- */
function hexToRgb(hex: string): [number, number, number] | null {
  const clean = hex.replace("#", "").trim();
  const full = clean.length === 3 ? clean.split("").map((c) => c + c).join("") : clean;
  if (!/^[0-9a-fA-F]{6}$/.test(full)) return null;
  const r = parseInt(full.slice(0, 2), 16);
  const g = parseInt(full.slice(2, 4), 16);
  const b = parseInt(full.slice(4, 6), 16);
  return [r, g, b];
}

function rgbToHex(r: number, g: number, b: number): string {
  const toHex = (n: number) => Math.max(0, Math.min(255, Math.round(n))).toString(16).padStart(2, "0");
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`.toUpperCase();
}

function rgbToHsl(r: number, g: number, b: number): [number, number, number] {
  r /= 255;
  g /= 255;
  b /= 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0;
  let s = 0;
  const l = (max + min) / 2;
  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r:
        h = (g - b) / d + (g < b ? 6 : 0);
        break;
      case g:
        h = (b - r) / d + 2;
        break;
      default:
        h = (r - g) / d + 4;
    }
    h /= 6;
  }
  return [Math.round(h * 360), Math.round(s * 100), Math.round(l * 100)];
}

export function ColorTool() {
  const copy = useCopy();
  const { showToast } = useApp();
  const [hex, setHex] = useState("#2563EB");
  const [rgbText, setRgbText] = useState({ r: "37", g: "99", b: "235" });

  const rgb = hexToRgb(hex);
  const hsl = rgb ? rgbToHsl(...rgb) : null;

  const applyRgb = () => {
    const r = parseLocaleNumber(rgbText.r);
    const g = parseLocaleNumber(rgbText.g);
    const b = parseLocaleNumber(rgbText.b);
    if ([r, g, b].some((v) => isNaN(v) || v < 0 || v > 255)) {
      showToast("لطفاً مقدار معتبر وارد کنید.", "error");
      return;
    }
    setHex(rgbToHex(r, g, b));
  };

  return (
    <div>
      <div className="card">
        <h3 className="card-title">انتخاب رنگ</h3>
        <div className="color-preview" style={{ background: rgb ? hex : "#e2e8f0" }} />
        <input
          className="color-input-native"
          type="color"
          value={rgb ? hex : "#000000"}
          onChange={(e) => {
            setHex(e.target.value.toUpperCase());
            const nr = hexToRgb(e.target.value);
            if (nr) setRgbText({ r: String(nr[0]), g: String(nr[1]), b: String(nr[2]) });
          }}
          aria-label="انتخابگر رنگ"
        />
        <div className="field" style={{ marginTop: 14 }}>
          <label htmlFor="hexInput">کد HEX</label>
          <input
            id="hexInput"
            className="input"
            type="text"
            value={hex}
            onChange={(e) => {
              const v = e.target.value;
              setHex(v);
              const nr = hexToRgb(v);
              if (nr) setRgbText({ r: String(nr[0]), g: String(nr[1]), b: String(nr[2]) });
            }}
            placeholder="#2563EB"
            style={{ direction: "ltr", textAlign: "left" }}
          />
        </div>
        {!rgb && <p className="error-text">کد رنگ واردشده صحیح نیست.</p>}

        <div className="divider" />
        <h3 className="card-title">تبدیل RGB به HEX</h3>
        <div className="row">
          <div className="field">
            <label htmlFor="rr">قرمز (R)</label>
            <input id="rr" className="input" type="text" inputMode="numeric" value={rgbText.r} onChange={(e) => setRgbText((s) => ({ ...s, r: toEnglishDigits(e.target.value) }))} />
          </div>
          <div className="field">
            <label htmlFor="gg">سبز (G)</label>
            <input id="gg" className="input" type="text" inputMode="numeric" value={rgbText.g} onChange={(e) => setRgbText((s) => ({ ...s, g: toEnglishDigits(e.target.value) }))} />
          </div>
        </div>
        <div className="field">
          <label htmlFor="bb">آبی (B)</label>
          <input id="bb" className="input" type="text" inputMode="numeric" value={rgbText.b} onChange={(e) => setRgbText((s) => ({ ...s, b: toEnglishDigits(e.target.value) }))} />
        </div>
        <div className="btn-row">
          <button className="btn btn-primary" onClick={applyRgb}>
            تبدیل به HEX
          </button>
        </div>
      </div>

      {rgb && hsl && (
        <div className="result-card">
          <div className="copy-field">
            <span className="code">{hex}</span>
            <button onClick={() => copy(hex)} aria-label="کپی کد HEX">
              کپی
            </button>
          </div>
          <div className="copy-field">
            <span className="code">rgb({rgb[0]}, {rgb[1]}, {rgb[2]})</span>
            <button onClick={() => copy(`rgb(${rgb[0]}, ${rgb[1]}, ${rgb[2]})`)} aria-label="کپی کد RGB">
              کپی
            </button>
          </div>
          <div className="copy-field">
            <span className="code">hsl({hsl[0]}, {hsl[1]}%, {hsl[2]}%)</span>
            <button onClick={() => copy(`hsl(${hsl[0]}, ${hsl[1]}%, ${hsl[2]}%)`)} aria-label="کپی کد HSL">
              کپی
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

/* ---------------- شمارش متن ---------------- */
export function TextCounterTool() {
  const { fmt, showToast } = useApp();
  const [text, setText] = useState("");
  const copy = useCopy();

  const stats = useMemo(() => {
    const characters = text.length;
    const spaces = (text.match(/ /g) || []).length;
    const charactersNoSpaces = characters - (text.match(/\s/g) || []).length;
    const words = text.trim() ? text.trim().split(/\s+/).length : 0;
    const lines = text ? text.split(/\n/).length : 0;
    const paragraphs = text.trim() ? text.trim().split(/\n\s*\n/).filter((p) => p.trim()).length : 0;
    return { characters, words, lines, paragraphs, spaces, charactersNoSpaces };
  }, [text]);

  return (
    <div>
      <div className="card">
        <h3 className="card-title">متن خود را وارد کنید</h3>
        <div className="field">
          <textarea
            className="input"
            placeholder="متن خود را وارد کنید..."
            value={text}
            onChange={(e) => setText(e.target.value)}
            style={{ minHeight: 180 }}
          />
        </div>
        <div className="btn-row">
          <button
            className="btn btn-primary"
            onClick={async () => {
              if (!text) {
                showToast("لطفاً مقدار معتبر وارد کنید.", "error");
                return;
              }
              await copy(text);
            }}
          >
            کپی متن
          </button>
          <button className="btn btn-ghost" onClick={() => setText("")}>
            پاک کردن
          </button>
        </div>
      </div>

      <div className="result-card">
        <div className="result-row">
          <span className="label">تعداد حروف</span>
          <span className="value">{fmt(stats.characters)}</span>
        </div>
        <div className="result-row">
          <span className="label">تعداد کلمات</span>
          <span className="value">{fmt(stats.words)}</span>
        </div>
        <div className="result-row">
          <span className="label">تعداد خطوط</span>
          <span className="value">{fmt(stats.lines)}</span>
        </div>
        <div className="result-row">
          <span className="label">تعداد پاراگراف‌ها</span>
          <span className="value">{fmt(stats.paragraphs)}</span>
        </div>
        <div className="result-row">
          <span className="label">تعداد فاصله‌ها</span>
          <span className="value">{fmt(stats.spaces)}</span>
        </div>
        <div className="result-row">
          <span className="label">تعداد کاراکترها بدون فاصله</span>
          <span className="value">{fmt(stats.charactersNoSpaces)}</span>
        </div>
      </div>
    </div>
  );
}

/* ---------------- زمان دانلود ---------------- */
type SizeUnit = "KB" | "MB" | "GB";
type SpeedUnit = "Mbps" | "MB/s";

function formatDuration(seconds: number): string {
  if (!isFinite(seconds)) return "—";
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);
  const parts: string[] = [];
  if (h > 0) parts.push(`${h} ساعت`);
  if (m > 0) parts.push(`${m} دقیقه`);
  if (s > 0 || parts.length === 0) parts.push(`${s} ثانیه`);
  return parts.join(" و ");
}

export function DownloadTimeTool() {
  const [size, setSize] = useState("");
  const [sizeUnit, setSizeUnit] = useState<SizeUnit>("GB");
  const [speed, setSpeed] = useState("");
  const [speedUnit, setSpeedUnit] = useState<SpeedUnit>("Mbps");

  const sizeVal = parseLocaleNumber(size);
  const speedVal = parseLocaleNumber(speed);
  const valid = size !== "" && speed !== "" && !isNaN(sizeVal) && !isNaN(speedVal) && sizeVal > 0 && speedVal > 0;

  const sizeInBytes = valid ? sizeVal * (sizeUnit === "KB" ? 1024 : sizeUnit === "MB" ? 1024 ** 2 : 1024 ** 3) : 0;
  const speedInBytesPerSec = valid ? (speedUnit === "Mbps" ? (speedVal * 1_000_000) / 8 : speedVal * 1024 * 1024) : 0;
  const seconds = valid ? sizeInBytes / speedInBytesPerSec : 0;

  return (
    <div>
      <div className="card">
        <h3 className="card-title">مشخصات فایل و اینترنت</h3>
        <div className="field">
          <label htmlFor="fileSize">حجم فایل</label>
          <div className="row">
            <input id="fileSize" className="input" type="text" inputMode="decimal" placeholder="مثلاً ۲" value={size} onChange={(e) => setSize(toEnglishDigits(e.target.value))} />
            <select className="input" value={sizeUnit} onChange={(e) => setSizeUnit(e.target.value as SizeUnit)}>
              <option value="KB">KB</option>
              <option value="MB">MB</option>
              <option value="GB">GB</option>
            </select>
          </div>
        </div>
        <div className="field">
          <label htmlFor="speed">سرعت اینترنت</label>
          <div className="row">
            <input id="speed" className="input" type="text" inputMode="decimal" placeholder="مثلاً ۲۰" value={speed} onChange={(e) => setSpeed(toEnglishDigits(e.target.value))} />
            <select className="input" value={speedUnit} onChange={(e) => setSpeedUnit(e.target.value as SpeedUnit)}>
              <option value="Mbps">Mbps</option>
              <option value="MB/s">MB/s</option>
            </select>
          </div>
        </div>
        {(size !== "" || speed !== "") && !valid && <p className="error-text">لطفاً مقدار معتبر وارد کنید.</p>}
        <div className="btn-row">
          <button
            className="btn btn-ghost"
            onClick={() => {
              setSize("");
              setSpeed("");
            }}
          >
            پاک کردن
          </button>
        </div>
      </div>

      {valid && (
        <div className="result-card">
          <div className="result-hero">
            <div className="big-number">{formatDuration(seconds)}</div>
            <div className="sub">زمان تقریبی دانلود</div>
          </div>
          <p className="hint-text">زمان واقعی دانلود ممکن است به شرایط شبکه بستگی داشته باشد.</p>
        </div>
      )}
    </div>
  );
}

/* ---------------- تولید رمز عبور ---------------- */
const CHAR_SETS = {
  upper: "ABCDEFGHIJKLMNOPQRSTUVWXYZ",
  lower: "abcdefghijklmnopqrstuvwxyz",
  numbers: "0123456789",
  symbols: "!@#$%^&*()_+-=[]{}|;:,.<>?",
};

export function PasswordGeneratorTool() {
  const { showToast, fmt } = useApp();
  const copy = useCopy();
  const [length, setLength] = useState(16);
  const [opts, setOpts] = useState({ upper: true, lower: true, numbers: true, symbols: false });
  const [password, setPassword] = useState("");

  const generate = () => {
    const pool = Object.entries(opts)
      .filter(([, enabled]) => enabled)
      .map(([key]) => CHAR_SETS[key as keyof typeof CHAR_SETS])
      .join("");

    if (!pool) {
      showToast("لطفاً اطلاعات لازم را کامل وارد کنید.", "error");
      return;
    }

    const values = new Uint32Array(length);
    crypto.getRandomValues(values);
    let result = "";
    for (let i = 0; i < length; i++) {
      result += pool[values[i] % pool.length];
    }
    setPassword(result);
  };

  const strength = useMemo(() => {
    if (!password) return null;
    let variety = 0;
    if (/[A-Z]/.test(password)) variety += 1;
    if (/[a-z]/.test(password)) variety += 1;
    if (/[0-9]/.test(password)) variety += 1;
    if (/[^A-Za-z0-9]/.test(password)) variety += 1;

    let score = variety + (password.length >= 12 ? 1 : 0) + (password.length >= 20 ? 1 : 0);
    if (score <= 2) return { label: "ضعیف", cls: "badge-danger" };
    if (score <= 3) return { label: "متوسط", cls: "badge-warning" };
    if (score <= 5) return { label: "قوی", cls: "badge-success" };
    return { label: "بسیار قوی", cls: "badge-success" };
  }, [password]);

  return (
    <div>
      <div className="card">
        <h3 className="card-title">تنظیمات رمز عبور</h3>
        <div className="field">
          <label htmlFor="length">
            طول رمز عبور: {fmt(length)}
          </label>
          <input
            id="length"
            type="range"
            min={8}
            max={64}
            value={length}
            onChange={(e) => setLength(Number(e.target.value))}
            style={{ width: "100%", accentColor: "var(--color-primary)" }}
          />
        </div>

        <label className="checkbox-row">
          <input type="checkbox" checked={opts.upper} onChange={(e) => setOpts((o) => ({ ...o, upper: e.target.checked }))} />
          حروف بزرگ
        </label>
        <label className="checkbox-row">
          <input type="checkbox" checked={opts.lower} onChange={(e) => setOpts((o) => ({ ...o, lower: e.target.checked }))} />
          حروف کوچک
        </label>
        <label className="checkbox-row">
          <input type="checkbox" checked={opts.numbers} onChange={(e) => setOpts((o) => ({ ...o, numbers: e.target.checked }))} />
          اعداد
        </label>
        <label className="checkbox-row">
          <input type="checkbox" checked={opts.symbols} onChange={(e) => setOpts((o) => ({ ...o, symbols: e.target.checked }))} />
          نمادها
        </label>

        <div className="btn-row">
          <button className="btn btn-primary" onClick={generate}>
            ساخت رمز عبور
          </button>
          <button
            className="btn btn-ghost"
            onClick={() => {
              setPassword("");
            }}
          >
            پاک کردن
          </button>
        </div>
      </div>

      {password && (
        <div className="result-card">
          <div className="copy-field">
            <span className="code">{password}</span>
            <button onClick={() => copy(password)} aria-label="کپی رمز عبور">
              کپی رمز
            </button>
          </div>
          {strength && (
            <div style={{ textAlign: "center", marginTop: 10 }}>
              <span className={`badge ${strength.cls}`}>قدرت رمز: {strength.label}</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
