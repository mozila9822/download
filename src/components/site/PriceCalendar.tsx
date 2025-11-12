"use client";
import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";

type DayPrice = { date: string; price: number };

type Props = {
  originCode?: string;
  destinationCode?: string;
  cabin?: "economy" | "premium" | "business";
  month?: Date;
  onPickDate?: (date: Date) => void;
};

export default function PriceCalendar({ originCode, destinationCode, cabin = "economy", month, onPickDate }: Props) {
  const [currentMonth, setCurrentMonth] = useState<Date>(month ?? new Date());
  const [loading, setLoading] = useState(false);
  const [days, setDays] = useState<DayPrice[]>([]);
  const [currency, setCurrency] = useState<string>("GBP");

  const ym = useMemo(() => {
    const y = currentMonth.getFullYear();
    const m = String(currentMonth.getMonth() + 1).padStart(2, "0");
    return `${y}-${m}`;
  }, [currentMonth]);

  useEffect(() => {
    if (!originCode || !destinationCode) {
      setDays([]);
      return;
    }
    const controller = new AbortController();
    setLoading(true);
    fetch(`/api/flights/price-calendar?origin=${originCode}&destination=${destinationCode}&month=${ym}&cabin=${cabin}`, { signal: controller.signal })
      .then((r) => r.json())
      .then((data) => {
        setDays(Array.isArray(data?.days) ? data.days : []);
        setCurrency(data?.currency || "GBP");
      })
      .catch((e) => {
        if (e?.name !== "AbortError") console.error("price calendar fetch failed", e);
      })
      .finally(() => setLoading(false));
    return () => controller.abort();
  }, [originCode, destinationCode, ym, cabin]);

  const firstDayOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1);
  const startWeekday = firstDayOfMonth.getDay();
  const weeks: Array<Array<DayPrice | null>> = [];
  const totalDays = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0).getDate();
  let idx = 0;
  for (let w = 0; w < 6; w++) {
    const row: Array<DayPrice | null> = [];
    for (let d = 0; d < 7; d++) {
      const dayNum = w * 7 + d - startWeekday + 1;
      if (dayNum < 1 || dayNum > totalDays) row.push(null);
      else row.push(days.find((dp) => Number(dp.date.split("-")[2]) === dayNum) || null);
    }
    weeks.push(row);
    idx += 7;
  }

  const best = useMemo(() => {
    return days.length ? days.reduce((a, b) => (a.price < b.price ? a : b)) : null;
  }, [days]);

  const nextMonth = () => {
    const d = new Date(currentMonth);
    d.setMonth(d.getMonth() + 1);
    setCurrentMonth(d);
  };
  const prevMonth = () => {
    const d = new Date(currentMonth);
    d.setMonth(d.getMonth() - 1);
    setCurrentMonth(d);
  };

  return (
    <div className="rounded-2xl bg-white/10 backdrop-blur px-4 py-4">
      <div className="flex items-center justify-between mb-3">
        <div>
          <div className="text-sm text-white/80">Price Calendar</div>
          <div className="text-lg font-semibold">
            {currentMonth.toLocaleString(undefined, { month: "long" })} {currentMonth.getFullYear()}
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="bg-white/10 border-white/20 text-white" onClick={prevMonth} disabled={loading}>Prev</Button>
          <Button variant="outline" className="bg-white/10 border-white/20 text-white" onClick={nextMonth} disabled={loading}>Next</Button>
        </div>
      </div>
      {!originCode || !destinationCode ? (
        <div className="text-sm text-white/70">Select origin and destination to see live prices.</div>
      ) : loading ? (
        <div className="text-sm text-white/70">Loading prices…</div>
      ) : (
        <div className="grid grid-cols-7 gap-2">
          {["Sun","Mon","Tue","Wed","Thu","Fri","Sat"].map((d) => (
            <div key={d} className="text-xs text-white/60 text-center">{d}</div>
          ))}
          {weeks.map((row, i) => (
            <>
              {row.map((cell, j) => (
                <button
                  key={`${i}-${j}`}
                  disabled={!cell}
                  onClick={() => {
                    if (!cell) return;
                    const dt = new Date(cell.date);
                    onPickDate?.(dt);
                  }}
                  className={`rounded-md px-2 py-2 text-left border ${cell ? "bg-white/10 border-white/20 hover:bg-white/20" : "border-transparent"} ${best && cell && cell.price === best.price ? "ring-2 ring-pink-400" : ""}`}
                >
                  {cell ? (
                    <div>
                      <div className="text-xs text-white/80">{Number(cell.date.split("-")[2])}</div>
                      <div className="text-sm font-medium">{currency} {cell.price}</div>
                    </div>
                  ) : (
                    <div />
                  )}
                </button>
              ))}
            </>
          ))}
        </div>
      )}
    </div>
  );
}
