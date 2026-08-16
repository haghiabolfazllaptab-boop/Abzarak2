import { useEffect, useState } from "react";
import { useApp } from "../context/AppContext";
import { evaluateExpression, CalcError } from "../lib/calculator";
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

/* ---------------- ماشین حساب ---------------- */
const calcButtons = [
  ["C", "⌫", "%", "÷"],
  ["7", "8", "9", "×"],
  ["4", "5", "6", "−"],
  ["1", "2", "3", "+"],
  ["(", "0", ")", "."],
];

export function CalculatorTool() {
  const { fmt } = useApp();
  const [expr, setExpr] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [history, setHistory] = useState<{ expr: string; result: string }[]>([]);
  const [justEvaluated, setJustEvaluated] = useState(false);

  const press = (key: string) => {
    setError(null);
    if (key === "C") {
      setExpr("");
      setJustEvaluated(false);
      return;
    }
    if (key === "⌫") {
      setExpr((e) => e.slice(0, -1));
      setJustEvaluated(false);
      return;
    }
    if (key === "=") {
      try {
        const result = evaluateExpression(expr.replace(/−/g, "-"));
        const display = fmt(result, result % 1 === 0 ? 0 : 6);
        setHistory((h) => [{ expr, result: display }, ...h].slice(0, 20));
        setExpr(String(result));
        setJustEvaluated(true);
      } catch (e) {
        setError(e instanceof CalcError ? e.message : "این مقدار قابل محاسبه نیست.");
      }
      return;
    }
    setExpr((e) => {
      const base = justEvaluated && /[0-9.]/.test(key) ? "" : e;
      setJustEvaluated(false);
      return base + key;
    });
  };

  useEffect(() => {
    const handler = (ev: KeyboardEvent) => {
      if (/[0-9.+\-*/%()]/.test(ev.key)) {
        press(ev.key === "*" ? "×" : ev.key === "/" ? "÷" : ev.key === "-" ? "−" : ev.key);
      } else if (ev.key === "Enter") {
        press("=");
      } else if (ev.key === "Backspace") {
        press("⌫");
      } else if (ev.key === "Escape") {
        press("C");
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [expr, justEvaluated]);

  return (
    <div>
      <div className="card">
        <div className="calc-display">
          <div className="expr">{expr ? expr.replace(/-/g, "−") : "\u00A0"}</div>
          <div className="value">{expr ? expr.replace(/-/g, "−") : "۰"}</div>
        </div>
        {error && <p className="error-text">{error}</p>}
        <div className="calc-grid">
          {calcButtons.flat().map((key) => (
            <button
              key={key}
              className={`calc-btn ${"÷×−+%".includes(key) ? "op" : ""} ${key === "C" ? "danger" : ""}`}
              onClick={() => press(key)}
            >
              {key}
            </button>
          ))}
          <button className="calc-btn equal" style={{ gridColumn: "span 4" }} onClick={() => press("=")}>
            =
          </button>
        </div>

        {history.length > 0 && (
          <div className="calc-history">
            <div className="settings-group-title">تاریخچه</div>
            {history.map((h, idx) => (
              <div className="calc-history-item" key={idx}>
                <span>{h.expr}</span>
                <span>{h.result}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

/* ---------------- محاسبه تخفیف ---------------- */
export function DiscountTool() {
  const { fmt, settings } = useApp();
  const copy = useCopy();
  const [price, setPrice] = useState("");
  const [percent, setPercent] = useState("");

  const p = parseLocaleNumber(price);
  const d = parseLocaleNumber(percent);
  const valid = price !== "" && percent !== "" && !isNaN(p) && !isNaN(d) && p >= 0 && d >= 0 && d <= 100;

  const discountAmount = valid ? (p * d) / 100 : 0;
  const finalPrice = valid ? p - discountAmount : 0;

  return (
    <div>
      <div className="card">
        <h3 className="card-title">اطلاعات قیمت</h3>
        <div className="field">
          <label htmlFor="price">قیمت اصلی ({settings.currency})</label>
          <input
            id="price"
            className="input"
            type="text"
            inputMode="decimal"
            placeholder="مثلاً ۲۰۰۰۰۰۰"
            value={price}
            onChange={(e) => setPrice(toEnglishDigits(e.target.value))}
          />
        </div>
        <div className="field">
          <label htmlFor="percent">درصد تخفیف</label>
          <input
            id="percent"
            className="input"
            type="text"
            inputMode="decimal"
            placeholder="مثلاً ۲۵"
            value={percent}
            onChange={(e) => setPercent(toEnglishDigits(e.target.value))}
          />
        </div>
        {!valid && (price !== "" || percent !== "") && <p className="error-text">لطفاً مقدار معتبر وارد کنید.</p>}
        <div className="btn-row">
          <button
            className="btn btn-ghost"
            onClick={() => {
              setPrice("");
              setPercent("");
            }}
          >
            پاک کردن
          </button>
        </div>
      </div>

      {valid && (
        <div className="result-card">
          <div className="result-row">
            <span className="label">مقدار تخفیف</span>
            <span className="value">
              {fmt(discountAmount)} {settings.currency}
            </span>
          </div>
          <div className="result-row">
            <span className="label">قیمت نهایی</span>
            <span className="value">
              {fmt(finalPrice)} {settings.currency}
            </span>
          </div>
          <div className="btn-row">
            <button
              className="btn btn-primary"
              onClick={() => copy(`مقدار تخفیف: ${fmt(discountAmount)} ${settings.currency}\nقیمت نهایی: ${fmt(finalPrice)} ${settings.currency}`)}
            >
              کپی نتیجه
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

/* ---------------- محاسبه شاخص توده بدنی ---------------- */
export function BmiTool() {
  const { fmt } = useApp();
  const [weight, setWeight] = useState("");
  const [height, setHeight] = useState("");

  const w = parseLocaleNumber(weight);
  const h = parseLocaleNumber(height);
  const valid = weight !== "" && height !== "" && !isNaN(w) && !isNaN(h) && w > 0 && h > 0;
  const hm = h / 100;
  const bmi = valid ? w / (hm * hm) : 0;

  let category = "";
  let badgeClass = "badge-info";
  if (valid) {
    if (bmi < 18.5) {
      category = "کمبود وزن";
      badgeClass = "badge-info";
    } else if (bmi < 25) {
      category = "محدوده نرمال";
      badgeClass = "badge-success";
    } else if (bmi < 30) {
      category = "اضافه وزن";
      badgeClass = "badge-warning";
    } else {
      category = "چاقی";
      badgeClass = "badge-danger";
    }
  }

  return (
    <div>
      <div className="card">
        <h3 className="card-title">اطلاعات بدنی</h3>
        <div className="row">
          <div className="field">
            <label htmlFor="weight">وزن (کیلوگرم)</label>
            <input
              id="weight"
              className="input"
              type="text"
              inputMode="decimal"
              placeholder="مثلاً ۷۰"
              value={weight}
              onChange={(e) => setWeight(toEnglishDigits(e.target.value))}
            />
          </div>
          <div className="field">
            <label htmlFor="height">قد (سانتی‌متر)</label>
            <input
              id="height"
              className="input"
              type="text"
              inputMode="decimal"
              placeholder="مثلاً ۱۷۵"
              value={height}
              onChange={(e) => setHeight(toEnglishDigits(e.target.value))}
            />
          </div>
        </div>
        {!valid && (weight !== "" || height !== "") && <p className="error-text">لطفاً مقدار معتبر وارد کنید.</p>}
        <div className="btn-row">
          <button
            className="btn btn-ghost"
            onClick={() => {
              setWeight("");
              setHeight("");
            }}
          >
            بازنشانی
          </button>
        </div>
      </div>

      {valid && (
        <div className="result-card">
          <div className="result-hero">
            <div className="big-number">{fmt(bmi, 1)}</div>
            <div className="sub">
              <span className={`badge ${badgeClass}`}>{category}</span>
            </div>
          </div>
          <p className="hint-text">این نتیجه صرفاً برای اطلاع عمومی است و جایگزین نظر متخصص نیست.</p>
        </div>
      )}
    </div>
  );
}

/* ---------------- محاسبه درصد ---------------- */
type PercentMode = "ratio" | "amount" | "increase" | "decrease";

const percentModes: { key: PercentMode; label: string; xLabel: string; yLabel: string }[] = [
  { key: "ratio", label: "X چند درصد Y است؟", xLabel: "X", yLabel: "Y" },
  { key: "amount", label: "X درصد از Y چقدر است؟", xLabel: "X (درصد)", yLabel: "Y" },
  { key: "increase", label: "Y با X درصد افزایش چقدر می‌شود؟", xLabel: "X (درصد افزایش)", yLabel: "Y" },
  { key: "decrease", label: "Y با X درصد کاهش چقدر می‌شود؟", xLabel: "X (درصد کاهش)", yLabel: "Y" },
];

export function PercentageTool() {
  const { fmt } = useApp();
  const [mode, setMode] = useState<PercentMode>("ratio");
  const [x, setX] = useState("");
  const [y, setY] = useState("");

  const xv = parseLocaleNumber(x);
  const yv = parseLocaleNumber(y);
  const valid = x !== "" && y !== "" && !isNaN(xv) && !isNaN(yv);
  const cfg = percentModes.find((m) => m.key === mode)!;

  let result = 0;
  let suffix = "";
  if (valid) {
    if (mode === "ratio") {
      if (yv === 0) {
        result = NaN;
      } else {
        result = (xv / yv) * 100;
        suffix = "٪";
      }
    } else if (mode === "amount") {
      result = (xv / 100) * yv;
    } else if (mode === "increase") {
      result = yv * (1 + xv / 100);
    } else {
      result = yv * (1 - xv / 100);
    }
  }
  const divByZero = mode === "ratio" && yv === 0 && valid;

  return (
    <div>
      <div className="card">
        <h3 className="card-title">نوع محاسبه</h3>
        <div className="chips">
          {percentModes.map((m) => (
            <button key={m.key} className={`chip-btn ${mode === m.key ? "active" : ""}`} onClick={() => setMode(m.key)}>
              {m.label}
            </button>
          ))}
        </div>
        <div className="divider" />
        <div className="row">
          <div className="field">
            <label htmlFor="xval">{cfg.xLabel}</label>
            <input id="xval" className="input" type="text" inputMode="decimal" value={x} onChange={(e) => setX(toEnglishDigits(e.target.value))} />
          </div>
          <div className="field">
            <label htmlFor="yval">{cfg.yLabel}</label>
            <input id="yval" className="input" type="text" inputMode="decimal" value={y} onChange={(e) => setY(toEnglishDigits(e.target.value))} />
          </div>
        </div>
        {divByZero && <p className="error-text">امکان تقسیم بر صفر وجود ندارد.</p>}
        {!valid && (x !== "" || y !== "") && <p className="error-text">لطفاً مقدار معتبر وارد کنید.</p>}
        <div className="btn-row">
          <button
            className="btn btn-ghost"
            onClick={() => {
              setX("");
              setY("");
            }}
          >
            پاک کردن
          </button>
        </div>
      </div>

      {valid && !divByZero && (
        <div className="result-card">
          <div className="result-hero">
            <div className="big-number">
              {fmt(result, 2)}
              {suffix}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ---------------- محاسبه اقساط ---------------- */
export function InstallmentTool() {
  const { fmt, settings } = useApp();
  const [total, setTotal] = useState("");
  const [down, setDown] = useState("");
  const [count, setCount] = useState("");
  const [rate, setRate] = useState("");

  const t = parseLocaleNumber(total);
  const d = parseLocaleNumber(down);
  const c = parseLocaleNumber(count);
  const r = parseLocaleNumber(rate);
  const valid = [total, down, count, rate].every((v) => v !== "") && [t, d, c, r].every((v) => !isNaN(v)) && c > 0 && t >= 0 && d >= 0 && d <= t;

  const principal = valid ? t - d : 0;
  const interest = valid ? (principal * r) / 100 : 0;
  const totalPayment = valid ? principal + interest : 0;
  const monthly = valid ? totalPayment / c : 0;

  return (
    <div>
      <div className="card">
        <h3 className="card-title">اطلاعات تسهیلات</h3>
        <div className="row">
          <div className="field">
            <label htmlFor="total">مبلغ کل ({settings.currency})</label>
            <input id="total" className="input" type="text" inputMode="decimal" value={total} onChange={(e) => setTotal(toEnglishDigits(e.target.value))} />
          </div>
          <div className="field">
            <label htmlFor="down">پیش‌پرداخت ({settings.currency})</label>
            <input id="down" className="input" type="text" inputMode="decimal" value={down} onChange={(e) => setDown(toEnglishDigits(e.target.value))} />
          </div>
        </div>
        <div className="row">
          <div className="field">
            <label htmlFor="count">تعداد اقساط</label>
            <input id="count" className="input" type="text" inputMode="decimal" value={count} onChange={(e) => setCount(toEnglishDigits(e.target.value))} />
          </div>
          <div className="field">
            <label htmlFor="rate">درصد سود</label>
            <input id="rate" className="input" type="text" inputMode="decimal" value={rate} onChange={(e) => setRate(toEnglishDigits(e.target.value))} />
          </div>
        </div>
        {!valid && [total, down, count, rate].some((v) => v !== "") && <p className="error-text">لطفاً اطلاعات لازم را کامل وارد کنید.</p>}
        <div className="btn-row">
          <button
            className="btn btn-ghost"
            onClick={() => {
              setTotal("");
              setDown("");
              setCount("");
              setRate("");
            }}
          >
            پاک کردن
          </button>
        </div>
      </div>

      {valid && (
        <div className="result-card">
          <div className="result-row">
            <span className="label">مبلغ باقی‌مانده</span>
            <span className="value">
              {fmt(principal)} {settings.currency}
            </span>
          </div>
          <div className="result-row">
            <span className="label">مبلغ تقریبی هر قسط</span>
            <span className="value">
              {fmt(monthly)} {settings.currency}
            </span>
          </div>
          <div className="result-row">
            <span className="label">مجموع پرداخت</span>
            <span className="value">
              {fmt(totalPayment)} {settings.currency}
            </span>
          </div>
          <p className="hint-text">این محاسبه یک تخمین ساده است و فرمول دقیق تسهیلات بانکی را شبیه‌سازی نمی‌کند.</p>
        </div>
      )}
    </div>
  );
}

/* ---------------- محاسبه میانگین ---------------- */
export function AverageTool() {
  const { fmt } = useApp();
  const [text, setText] = useState("");

  const numbers = toEnglishDigits(text)
    .split(/[\s,،\n]+/)
    .map((s) => s.trim())
    .filter(Boolean)
    .map(Number)
    .filter((n) => !isNaN(n));

  const hasInput = text.trim().length > 0;
  const valid = numbers.length > 0;
  const avg = valid ? numbers.reduce((a, b) => a + b, 0) / numbers.length : 0;
  const max = valid ? Math.max(...numbers) : 0;
  const min = valid ? Math.min(...numbers) : 0;

  return (
    <div>
      <div className="card">
        <h3 className="card-title">اعداد را وارد کنید</h3>
        <div className="field">
          <label htmlFor="numbers">اعداد (با فاصله، ویرگول یا خط جدید جدا کنید)</label>
          <textarea
            id="numbers"
            className="input"
            placeholder={"مثلاً:\n۱۸\n۱۷٫۵\n۲۰\n۱۵"}
            value={text}
            onChange={(e) => setText(e.target.value)}
          />
        </div>
        {hasInput && !valid && <p className="error-text">لطفاً مقدار معتبر وارد کنید.</p>}
        <div className="btn-row">
          <button className="btn btn-ghost" onClick={() => setText("")}>
            پاک کردن
          </button>
        </div>
      </div>

      {valid && (
        <div className="result-card">
          <div className="result-row">
            <span className="label">میانگین</span>
            <span className="value">{fmt(avg, 2)}</span>
          </div>
          <div className="result-row">
            <span className="label">بیشترین مقدار</span>
            <span className="value">{fmt(max, 2)}</span>
          </div>
          <div className="result-row">
            <span className="label">کمترین مقدار</span>
            <span className="value">{fmt(min, 2)}</span>
          </div>
          <div className="result-row">
            <span className="label">تعداد اعداد</span>
            <span className="value">{fmt(numbers.length)}</span>
          </div>
        </div>
      )}
    </div>
  );
}
