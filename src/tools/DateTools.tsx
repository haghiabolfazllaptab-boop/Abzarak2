import { useEffect, useRef, useState } from "react";
import { useApp } from "../context/AppContext";
import { dateToJalaali, jalaaliToDateObj, jalaaliMonthNames, jalaaliMonthLength } from "../lib/jalali";

/* ---------------- محاسبه سن ---------------- */
type CalendarType = "jalali" | "gregorian";

const currentJalaliYear = dateToJalaali(new Date()).jy;
const jalaliYears = Array.from({ length: 120 }, (_, i) => currentJalaliYear - i);

export function AgeTool() {
  const { fmt } = useApp();
  const [calType, setCalType] = useState<CalendarType>("jalali");
  const [jy, setJy] = useState(currentJalaliYear - 25);
  const [jm, setJm] = useState(1);
  const [jd, setJd] = useState(1);
  const [gDate, setGDate] = useState("");

  let birth: Date | null = null;
  if (calType === "jalali") {
    try {
      birth = jalaaliToDateObj(jy, jm, jd);
    } catch {
      birth = null;
    }
  } else if (gDate) {
    const parsed = new Date(gDate);
    birth = isNaN(parsed.getTime()) ? null : parsed;
  }

  const now = new Date();
  const valid = birth !== null && birth.getTime() <= now.getTime();

  let result: null | {
    years: number;
    months: number;
    days: number;
    totalDays: number;
    totalWeeks: number;
    totalMonths: number;
    nextBirthdayDays: number;
  } = null;

  if (valid && birth) {
    let years = now.getFullYear() - birth.getFullYear();
    let months = now.getMonth() - birth.getMonth();
    let days = now.getDate() - birth.getDate();
    if (days < 0) {
      months -= 1;
      const prevMonth = new Date(now.getFullYear(), now.getMonth(), 0);
      days += prevMonth.getDate();
    }
    if (months < 0) {
      years -= 1;
      months += 12;
    }
    const totalDays = Math.floor((now.getTime() - birth.getTime()) / (1000 * 60 * 60 * 24));
    const totalWeeks = Math.floor(totalDays / 7);
    const totalMonths = years * 12 + months;

    let nextBirthday = new Date(now.getFullYear(), birth.getMonth(), birth.getDate());
    if (nextBirthday.getTime() < now.getTime()) {
      nextBirthday = new Date(now.getFullYear() + 1, birth.getMonth(), birth.getDate());
    }
    const nextBirthdayDays = Math.ceil((nextBirthday.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

    result = { years, months, days, totalDays, totalWeeks, totalMonths, nextBirthdayDays };
  }

  return (
    <div>
      <div className="card">
        <h3 className="card-title">تاریخ تولد</h3>
        <div className="segmented" style={{ marginBottom: 14 }}>
          <button className={calType === "jalali" ? "active" : ""} onClick={() => setCalType("jalali")}>
            تاریخ شمسی
          </button>
          <button className={calType === "gregorian" ? "active" : ""} onClick={() => setCalType("gregorian")}>
            تاریخ میلادی
          </button>
        </div>

        {calType === "jalali" ? (
          <div className="select-jalali">
            <select className="input" value={jy} onChange={(e) => setJy(Number(e.target.value))} aria-label="سال">
              {jalaliYears.map((y) => (
                <option key={y} value={y}>
                  {y}
                </option>
              ))}
            </select>
            <select className="input" value={jm} onChange={(e) => setJm(Number(e.target.value))} aria-label="ماه">
              {jalaaliMonthNames.map((name, idx) => (
                <option key={name} value={idx + 1}>
                  {name}
                </option>
              ))}
            </select>
            <select className="input" value={jd} onChange={(e) => setJd(Number(e.target.value))} aria-label="روز">
              {Array.from({ length: jalaaliMonthLength(jy, jm) }, (_, i) => i + 1).map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>
          </div>
        ) : (
          <div className="field">
            <label htmlFor="gdate">تاریخ تولد (میلادی)</label>
            <input id="gdate" className="input" type="date" value={gDate} onChange={(e) => setGDate(e.target.value)} max={new Date().toISOString().slice(0, 10)} />
          </div>
        )}
        {!valid && <p className="error-text">لطفاً یک تاریخ معتبر و گذشته وارد کنید.</p>}
      </div>

      {valid && result && (
        <div className="result-card">
          <div className="result-hero">
            <div className="big-number">
              {fmt(result.years)} سال و {fmt(result.months)} ماه و {fmt(result.days)} روز
            </div>
            <div className="sub">سن شما</div>
          </div>
          <div className="result-row">
            <span className="label">تعداد روزهای زندگی</span>
            <span className="value">{fmt(result.totalDays)}</span>
          </div>
          <div className="result-row">
            <span className="label">تعداد هفته‌ها</span>
            <span className="value">{fmt(result.totalWeeks)}</span>
          </div>
          <div className="result-row">
            <span className="label">تعداد ماه‌ها</span>
            <span className="value">{fmt(result.totalMonths)}</span>
          </div>
          <div className="result-row">
            <span className="label">تا تولد بعدی</span>
            <span className="value">{fmt(result.nextBirthdayDays)} روز</span>
          </div>
        </div>
      )}
    </div>
  );
}

/* ---------------- اختلاف دو تاریخ ---------------- */
export function DateDiffTool() {
  const { fmt } = useApp();
  const [date1, setDate1] = useState("");
  const [date2, setDate2] = useState("");

  const d1 = date1 ? new Date(date1) : null;
  const d2 = date2 ? new Date(date2) : null;
  const valid = d1 && d2 && !isNaN(d1.getTime()) && !isNaN(d2.getTime());

  let diffMs = 0;
  if (valid && d1 && d2) {
    diffMs = Math.abs(d2.getTime() - d1.getTime());
  }
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  const diffWeeks = Math.floor(diffDays / 7);
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));

  return (
    <div>
      <div className="card">
        <h3 className="card-title">دو تاریخ را انتخاب کنید</h3>
        <div className="row">
          <div className="field">
            <label htmlFor="d1">تاریخ اول</label>
            <input id="d1" className="input" type="date" value={date1} onChange={(e) => setDate1(e.target.value)} />
          </div>
          <div className="field">
            <label htmlFor="d2">تاریخ دوم</label>
            <input id="d2" className="input" type="date" value={date2} onChange={(e) => setDate2(e.target.value)} />
          </div>
        </div>
        <div className="btn-row">
          <button
            className="btn btn-ghost"
            onClick={() => {
              setDate1(date2);
              setDate2(date1);
            }}
          >
            جابه‌جایی تاریخ‌ها
          </button>
          <button
            className="btn btn-ghost"
            onClick={() => {
              setDate1("");
              setDate2("");
            }}
          >
            پاک کردن
          </button>
        </div>
        {(date1 || date2) && !valid && <p className="error-text">لطفاً هر دو تاریخ را به‌درستی وارد کنید.</p>}
      </div>

      {valid && (
        <div className="result-card">
          <div className="result-hero">
            <div className="big-number">{fmt(diffDays)} روز</div>
            <div className="sub">اختلاف بین دو تاریخ</div>
          </div>
          <div className="result-row">
            <span className="label">تعداد روزها</span>
            <span className="value">{fmt(diffDays)}</span>
          </div>
          <div className="result-row">
            <span className="label">تعداد هفته‌ها</span>
            <span className="value">{fmt(diffWeeks)}</span>
          </div>
          <div className="result-row">
            <span className="label">تعداد ساعت‌ها</span>
            <span className="value">{fmt(diffHours)}</span>
          </div>
        </div>
      )}
    </div>
  );
}

/* ---------------- تایمر ---------------- */
const presets = [1, 5, 10, 25, 30, 60];

function formatClock(totalSeconds: number): string {
  const h = Math.floor(totalSeconds / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  const s = Math.floor(totalSeconds % 60);
  const pad = (n: number) => String(n).padStart(2, "0");
  return h > 0 ? `${pad(h)}:${pad(m)}:${pad(s)}` : `${pad(m)}:${pad(s)}`;
}

export function TimerTool() {
  const { showToast } = useApp();
  const [totalSeconds, setTotalSeconds] = useState(5 * 60);
  const [remaining, setRemaining] = useState(5 * 60);
  const [running, setRunning] = useState(false);
  const endTimeRef = useRef<number>(0);
  const intervalRef = useRef<number | null>(null);
  const finishedRef = useRef(false);

  useEffect(() => {
    if (running) {
      intervalRef.current = window.setInterval(() => {
        const left = Math.max(0, Math.round((endTimeRef.current - Date.now()) / 1000));
        setRemaining(left);
        if (left <= 0) {
          setRunning(false);
          if (!finishedRef.current) {
            finishedRef.current = true;
            showToast("زمان به پایان رسید.", "info");
          }
        }
      }, 250);
    }
    return () => {
      if (intervalRef.current) window.clearInterval(intervalRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [running]);

  const start = () => {
    if (remaining <= 0) return;
    finishedRef.current = false;
    endTimeRef.current = Date.now() + remaining * 1000;
    setRunning(true);
  };
  const pause = () => {
    setRunning(false);
  };
  const reset = () => {
    setRunning(false);
    setRemaining(totalSeconds);
    finishedRef.current = false;
  };
  const setPreset = (minutes: number) => {
    setRunning(false);
    setTotalSeconds(minutes * 60);
    setRemaining(minutes * 60);
    finishedRef.current = false;
  };

  return (
    <div>
      <div className="card">
        <h3 className="card-title">زمان‌های پیش‌فرض (دقیقه)</h3>
        <div className="chips">
          {presets.map((p) => (
            <button key={p} className={`chip-btn ${totalSeconds === p * 60 ? "active" : ""}`} onClick={() => setPreset(p)}>
              {p} دقیقه
            </button>
          ))}
        </div>
      </div>

      <div className="card">
        <div className="timer-display" aria-live="polite">
          {formatClock(remaining)}
        </div>
        <div className="btn-row" style={{ justifyContent: "center" }}>
          {!running ? (
            <button className="btn btn-primary" onClick={start} disabled={remaining <= 0}>
              شروع
            </button>
          ) : (
            <button className="btn btn-secondary" onClick={pause}>
              توقف
            </button>
          )}
          <button className="btn btn-ghost" onClick={reset}>
            بازنشانی
          </button>
        </div>
      </div>
    </div>
  );
}

/* ---------------- کرنومتر ---------------- */
function formatStopwatch(ms: number): string {
  const totalMs = Math.floor(ms);
  const minutes = Math.floor(totalMs / 60000);
  const seconds = Math.floor((totalMs % 60000) / 1000);
  const centis = Math.floor((totalMs % 1000) / 10);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${pad(minutes)}:${pad(seconds)}٫${pad(centis)}`;
}

export function StopwatchTool() {
  const [elapsed, setElapsed] = useState(0);
  const [running, setRunning] = useState(false);
  const [laps, setLaps] = useState<number[]>([]);
  const startRef = useRef(0);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    const tick = () => {
      setElapsed(performance.now() - startRef.current);
      rafRef.current = requestAnimationFrame(tick);
    };
    if (running) {
      rafRef.current = requestAnimationFrame(tick);
    }
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [running]);

  const start = () => {
    startRef.current = performance.now() - elapsed;
    setRunning(true);
  };
  const pause = () => {
    setRunning(false);
  };
  const reset = () => {
    setRunning(false);
    setElapsed(0);
    setLaps([]);
  };
  const lap = () => {
    setLaps((l) => [elapsed, ...l]);
  };

  return (
    <div>
      <div className="card">
        <div className="timer-display" aria-live="polite">
          {formatStopwatch(elapsed)}
        </div>
        <div className="btn-row" style={{ justifyContent: "center" }}>
          {!running ? (
            <button className="btn btn-primary" onClick={start}>
              {elapsed > 0 ? "ادامه" : "شروع"}
            </button>
          ) : (
            <button className="btn btn-secondary" onClick={pause}>
              توقف
            </button>
          )}
          <button className="btn btn-ghost" onClick={lap} disabled={!running}>
            ثبت دور
          </button>
          <button className="btn btn-ghost" onClick={reset}>
            بازنشانی
          </button>
        </div>

        {laps.length > 0 && (
          <div className="lap-list">
            {laps.map((l, idx) => (
              <div className="lap-item" key={idx}>
                <span className="lap-name">دور {laps.length - idx}</span>
                <span>{formatStopwatch(l)}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
