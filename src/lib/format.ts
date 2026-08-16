export type NumberFormatMode = "fa" | "en";

const persianDigits = ["۰", "۱", "۲", "۳", "۴", "۵", "۶", "۷", "۸", "۹"];

export function toPersianDigits(input: string): string {
  return input.replace(/[0-9]/g, (d) => persianDigits[Number(d)]);
}

export function toEnglishDigits(input: string): string {
  const map: Record<string, string> = {
    "۰": "0",
    "۱": "1",
    "۲": "2",
    "۳": "3",
    "۴": "4",
    "۵": "5",
    "۶": "6",
    "۷": "7",
    "۸": "8",
    "۹": "9",
    "٠": "0",
    "١": "1",
    "٢": "2",
    "٣": "3",
    "٤": "4",
    "٥": "5",
    "٦": "6",
    "٧": "7",
    "٨": "8",
    "٩": "9",
    "٫": ".",
    "،": ",",
  };
  return input.replace(/[۰-۹٠-٩٫،]/g, (d) => map[d] ?? d);
}

export function parseLocaleNumber(input: string): number {
  const normalized = toEnglishDigits(String(input)).replace(/,/g, "").trim();
  return Number(normalized);
}

export function formatNumber(value: number, mode: NumberFormatMode, decimals = 0): string {
  if (!isFinite(value)) return "—";
  const fixed = decimals > 0 ? value.toFixed(decimals) : Math.round(value).toString();
  const [intPart, decPart] = fixed.split(".");
  const grouped = intPart.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  let result = decPart ? `${grouped}.${decPart}` : grouped;

  if (mode === "fa") {
    result = result.replace(/,/g, "٬").replace(/\./g, "٫");
    result = toPersianDigits(result);
  }
  return result;
}

export function formatDecimal(value: number, mode: NumberFormatMode, maxDecimals = 2): string {
  if (!isFinite(value)) return "—";
  const rounded = Math.round(value * Math.pow(10, maxDecimals)) / Math.pow(10, maxDecimals);
  return formatNumber(rounded, mode, rounded % 1 === 0 ? 0 : maxDecimals);
}
