"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import { Input } from "@/components/ui/input";
import type { LocationNode } from "@/lib/locations";

type Props = {
  value: string;
  onChange: (val: string) => void;
  placeholder?: string;
  className?: string;
  limit?: number;
  onSelect?: (loc: LocationNode) => void;
};

export default function LocationInputWithSuggestions({
  value,
  onChange,
  placeholder = "City or airport",
  className,
  limit = 7,
  onSelect,
}: Props) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [suggestions, setSuggestions] = useState<LocationNode[]>([]);
  const [activeIdx, setActiveIdx] = useState<number>(-1);
  const abortRef = useRef<AbortController | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  const q = useMemo(() => value.trim(), [value]);

  useEffect(() => {
    if (abortRef.current) abortRef.current.abort();
    if (q.length < 2) {
      setSuggestions([]);
      setOpen(false);
      setLoading(false);
      return;
    }

    const controller = new AbortController();
    abortRef.current = controller;
    setLoading(true);
    const timeout = setTimeout(async () => {
      try {
        const params = new URLSearchParams();
        params.set("q", q);
        params.set("limit", String(limit));
        const res = await fetch(`/api/locations?${params.toString()}`, { signal: controller.signal });
        const data: LocationNode[] = await res.json();
        setSuggestions(data);
        setOpen(data.length > 0);
        setActiveIdx(data.length > 0 ? 0 : -1);
      } catch (e) {
        if ((e as any)?.name !== "AbortError") {
          console.error("locations suggestions fetch failed", e);
        }
      } finally {
        setLoading(false);
      }
    }, 250);

    return () => {
      clearTimeout(timeout);
      controller.abort();
    };
  }, [q, limit]);

  useEffect(() => {
    const handleClickOutside = (evt: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(evt.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const displayLabel = (loc: LocationNode) => {
    const main = loc.city ? `${loc.city}, ${loc.country}` : `${loc.name}, ${loc.country}`;
    const code = loc.code ? ` (${loc.code})` : "";
    return `${main}${code}`;
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!open) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIdx((idx) => (idx + 1) % Math.max(1, suggestions.length));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIdx((idx) => (idx - 1 + Math.max(1, suggestions.length)) % Math.max(1, suggestions.length));
    } else if (e.key === "Enter") {
      e.preventDefault();
      const sel = suggestions[activeIdx];
      if (sel) {
        onChange(displayLabel(sel));
        setOpen(false);
        onSelect?.(sel);
      }
    } else if (e.key === "Escape") {
      e.preventDefault();
      setOpen(false);
    }
  };

  return (
    <div ref={containerRef} className="relative w-full">
      <Input
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onFocus={() => setOpen(suggestions.length > 0)}
        onKeyDown={handleKeyDown}
        className={className}
      />

      {open && (
        <div className="absolute left-0 right-0 mt-1 z-50 rounded-md border bg-popover text-popover-foreground shadow-md">
          <ul role="listbox" className="max-height-64 overflow-auto">
            {loading && (
              <li className="px-3 py-2 text-sm text-muted-foreground">Searching…</li>
            )}
            {!loading && suggestions.map((loc, i) => (
              <li
                key={`${loc.type}-${loc.code}-${i}`}
                role="option"
                aria-selected={i === activeIdx}
                className={`px-3 py-2 cursor-pointer text-sm ${i === activeIdx ? "bg-muted" : "hover:bg-muted/60"}`}
                onMouseEnter={() => setActiveIdx(i)}
                onMouseDown={(e) => {
                  e.preventDefault();
                  onChange(displayLabel(loc));
                  setOpen(false);
                  onSelect?.(loc);
                }}
              >
                <div className="font-medium">{loc.city ?? loc.name} ({loc.code})</div>
                <div className="text-muted-foreground">{loc.country} • {loc.type === 'airport' ? 'Airport' : 'City'}</div>
              </li>
            ))}
            {!loading && suggestions.length === 0 && (
              <li className="px-3 py-2 text-sm text-muted-foreground">No suggestions</li>
            )}
          </ul>
        </div>
      )}
    </div>
  );
}

