import { useMemo, useState } from "react";
import { useApp } from "../context/AppContext";
import { parseLocaleNumber, toEnglishDigits } from "../lib/format";

type CategoryKey = "length" | "weight" | "volume" | "temperature" | "speed" | "area";

interface UnitDef {
  key: string;
  label: string;
}

const unitCategories: { key: CategoryKey; label: string; units: UnitDef[] }[] = [
  {
    key: "length",
    label: "طول",
    units: [
      { key: "m", label: "متر" },
      { key: "cm", label: "سانتی‌متر" },
      { key: "km", label: "کیلومتر" },
      { key: "mm", label: "میلی‌متر" },
      { key: "inch", label: "اینچ" },
      { key: "foot", label: "فوت" },
      { key: "yard", label: "یارد" },
      { key: "mile", label: "مایل" },
    ],
  },
  {
    key: "weight",
    label: "وزن",
    units: [
      { key: "g", label: "گرم" },
      { key: "kg", label: "کیلوگرم" },
      { key: "mg", label: "میلی‌گرم" },
      { key: "ton", label: "تن" },
      { key: "lb", label: "پوند" },
      { key: "oz", label: "اونس" },
    ],
  },
  {
    key: "volume",
    label: "حجم",
    units: [
      { key: "l", label: "لیتر" },
      { key: "ml", label: "میلی‌لیتر" },
      { key: "m3", label: "متر مکعب" },
      { key: "gal", label: "گالن" },
    ],
  },
  {
    key: "temperature",
    label: "دما",
    units: [
      { key: "c", label: "سلسیوس" },
      { key: "f", label: "فارنهایت" },
      { key: "k", label: "کلوین" },
    ],
  },
  {
    key: "speed",
    label: "سرعت",
    units: [
      { key: "mps", label: "متر بر ثانیه" },
      { key: "kmph", label: "کیلومتر بر ساعت" },
      { key: "mph", label: "مایل بر ساعت" },
    ],
  },
  {
    key: "area",
    label: "مساحت",
    units: [
      { key: "sqm", label: "متر مربع" },
      { key: "sqcm", label: "سانتی‌متر مربع" },
      { key: "sqkm", label: "کیلومتر مربع" },
      { key: "hectare", label: "هکتار" },
      { key: "sqft", label: "فوت مربع" },
    ],
  },
];

const factors: Record<CategoryKey, Record<string, number>> = {
  length: { m: 1, cm: 0.01, km: 1000, mm: 0.001, inch: 0.0254, foot: 0.3048, yard: 0.9144, mile: 1609.344 },
  weight: { g: 1, kg: 1000, mg: 0.001, ton: 1000000, lb: 453.592, oz: 28.3495 },
  volume: { l: 1, ml: 0.001, m3: 1000, gal: 3.78541 },
  speed: { mps: 1, kmph: 0.277778, mph: 0.44704 },
  area: { sqm: 1, sqcm: 0.0001, sqkm: 1000000, hectare: 10000, sqft: 0.092903 },
  temperature: {},
};

function convertTemperature(value: number, from: string, to: string): number {
  let celsius: number;
  if (from === "c") celsius = value;
  else if (from === "f") celsius = ((value - 32) * 5) / 9;
  else celsius = value - 273.15;

  if (to === "c") return celsius;
  if (to === "f") return (celsius * 9) / 5 + 32;
  return celsius + 273.15;
}

export function UnitConverterTool() {
  const { fmt } = useApp();
  const [category, setCategory] = useState<CategoryKey>("length");
  const cfg = unitCategories.find((c) => c.key === category)!;
  const [fromUnit, setFromUnit] = useState(cfg.units[0].key);
  const [toUnit, setToUnit] = useState(cfg.units[1].key);
  const [value, setValue] = useState("");

  const changeCategory = (key: CategoryKey) => {
    setCategory(key);
    const newCfg = unitCategories.find((c) => c.key === key)!;
    setFromUnit(newCfg.units[0].key);
    setToUnit(newCfg.units[1].key);
  };

  const numValue = parseLocaleNumber(value);
  const valid = value !== "" && !isNaN(numValue);

  const result = useMemo(() => {
    if (!valid) return 0;
    if (category === "temperature") {
      return convertTemperature(numValue, fromUnit, toUnit);
    }
    const f = factors[category];
    return (numValue * f[fromUnit]) / f[toUnit];
  }, [valid, numValue, category, fromUnit, toUnit]);

  return (
    <div>
      <div className="card">
        <h3 className="card-title">دسته واحد</h3>
        <div className="chips">
          {unitCategories.map((c) => (
            <button key={c.key} className={`chip-btn ${category === c.key ? "active" : ""}`} onClick={() => changeCategory(c.key)}>
              {c.label}
            </button>
          ))}
        </div>
        <div className="divider" />

        <div className="field">
          <label htmlFor="convValue">مقدار</label>
          <input id="convValue" className="input" type="text" inputMode="decimal" value={value} onChange={(e) => setValue(toEnglishDigits(e.target.value))} placeholder="عدد را وارد کنید" />
        </div>

        <div className="row">
          <div className="field">
            <label htmlFor="fromUnit">از واحد</label>
            <select id="fromUnit" className="input" value={fromUnit} onChange={(e) => setFromUnit(e.target.value)}>
              {cfg.units.map((u) => (
                <option key={u.key} value={u.key}>
                  {u.label}
                </option>
              ))}
            </select>
          </div>
          <div className="field">
            <label htmlFor="toUnit">به واحد</label>
            <select id="toUnit" className="input" value={toUnit} onChange={(e) => setToUnit(e.target.value)}>
              {cfg.units.map((u) => (
                <option key={u.key} value={u.key}>
                  {u.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="btn-row">
          <button
            className="btn btn-ghost"
            onClick={() => {
              const f = fromUnit;
              setFromUnit(toUnit);
              setToUnit(f);
            }}
          >
            جابه‌جایی واحدها
          </button>
          <button className="btn btn-ghost" onClick={() => setValue("")}>
            پاک کردن
          </button>
        </div>
        {value !== "" && !valid && <p className="error-text">لطفاً مقدار معتبر وارد کنید.</p>}
      </div>

      {valid && (
        <div className="result-card">
          <div className="result-hero">
            <div className="big-number">{fmt(result, 4)}</div>
            <div className="sub">
              {cfg.units.find((u) => u.key === toUnit)?.label}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
