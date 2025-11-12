"use client";
import { motion } from "framer-motion";
import { Plane } from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

type Props = {
  size?: number;
  className?: string;
};

export default function AnimatedGlobeOrbit({ size = 240, className }: Props) {
  const [tiltX, setTiltX] = useState(0);
  const [tiltY, setTiltY] = useState(0);
  const [isCoarse, setIsCoarse] = useState(false);

  useEffect(() => {
    try {
      setIsCoarse(window.matchMedia && window.matchMedia("(pointer: coarse)").matches);
    } catch {}
  }, []);

  const handlePointerMove = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    if (isCoarse) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const nx = ((e.clientX - rect.left) / rect.width) * 2 - 1; // -1..1
    const ny = ((e.clientY - rect.top) / rect.height) * 2 - 1; // -1..1
    setTiltY(-nx * 10);
    setTiltX(ny * 10);
  }, [isCoarse]);

  const handlePointerLeave = useCallback(() => {
    setTiltX(0);
    setTiltY(0);
  }, []);

  // City lights intensity based on local time
  const baseCityLight = useMemo(() => {
    const hour = new Date().getHours();
    if (hour >= 20 || hour <= 5) return 0.35; // night
    if (hour >= 18 || hour <= 7) return 0.22; // dusk/dawn
    return 0.08; // daytime
  }, []);

  const [cityLightBase, setCityLightBase] = useState(baseCityLight);
  useEffect(() => {
    const id = setInterval(() => {
      const hour = new Date().getHours();
      const val = hour >= 20 || hour <= 5 ? 0.35 : hour >= 18 || hour <= 7 ? 0.22 : 0.08;
      setCityLightBase(val);
    }, 60_000);
    return () => clearInterval(id);
  }, []);

  // SSR-safe gate: randomization and flyovers only after mount
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  // Accent colors tied to theme (dark vs light)
  const [accentHexes, setAccentHexes] = useState<string[]>(["#22d3ee", "#f59e0b", "#14b8a6", "#0ea5e9"]);
  useEffect(() => {
    if (!mounted) return;
    try {
      const isDark = document.documentElement.classList.contains("dark") || window.matchMedia?.("(prefers-color-scheme: dark)").matches;
      const palette = isDark
        ? ["#22d3ee", "#f59e0b", "#14b8a6", "#0ea5e9"] // cyan, amber, teal, blue
        : ["#0ea5e9", "#f59e0b", "#22d3ee", "#14b8a6"]; // blue, amber, cyan, teal
      setAccentHexes(palette);
    } catch {
      // no-op
    }
  }, [mounted]);

  function clamp(n: number, min: number, max: number) {
    return Math.max(min, Math.min(max, n));
  }

  function hexToRgba(hex: string, alpha: number) {
    const h = hex.replace('#','');
    const r = parseInt(h.substring(0,2), 16);
    const g = parseInt(h.substring(2,4), 16);
    const b = parseInt(h.substring(4,6), 16);
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  }

  // Hover gating: increase flyover frequency when hovered
  const [isHovering, setIsHovering] = useState(false);

  // Flyovers across great-circle-like arcs
  type Flyover = { id: number; path: string; duration: number; startDelay: number; planeSize: number; accent: string; tilt: string; longHaul?: boolean; trailWidth?: number };
  const [flyovers, setFlyovers] = useState<Flyover[]>([]);
  const flyoversRef = useRef<Flyover[]>([]);
  useEffect(() => { flyoversRef.current = flyovers; }, [flyovers]);

  // Target concurrent planes: 6 or 7 per session
  const [baseFleet, setBaseFleet] = useState<number>(7);
  useEffect(() => { setBaseFleet(Math.random() < 0.5 ? 6 : 7); }, []);

  function computeArcPath(long?: boolean): { path: string; tilt: string } {
    // Define an elliptical arc across the globe face
    const cx = size / 2;
    const cy = size / 2;
    const r = (size / 2) - 18; // slightly inset
    const rx = r;
    const ry = r * (0.75 + Math.random() * 0.22); // squash for spherical feel
    const rot = Math.floor(Math.random() * 180); // degrees
    const startAng = Math.random() * Math.PI * 2;
    const sweep = long ? (Math.PI * (1.8 + Math.random() * 0.15)) : (Math.PI * (1.2 + Math.random() * 0.8));
    const endAng = startAng + sweep;
    const x1 = cx + rx * Math.cos(startAng);
    const y1 = cy + ry * Math.sin(startAng);
    const x2 = cx + rx * Math.cos(endAng);
    const y2 = cy + ry * Math.sin(endAng);
    const path = `M ${x1.toFixed(2)} ${y1.toFixed(2)} A ${rx.toFixed(2)} ${ry.toFixed(2)} ${rot} 0 1 ${x2.toFixed(2)} ${y2.toFixed(2)}`;
    const tiltX = -10 + Math.random() * 20;
    const tiltY = -15 + Math.random() * 30;
    const tilt = `rotateX(${tiltX.toFixed(1)}deg) rotateY(${tiltY.toFixed(1)}deg)`;
    return { path, tilt };
  }

  useEffect(() => {
    if (!mounted) return;
    const spawnOne = () => {
      const isLong = Math.random() < 0.18; // rare long-haul
      const { path, tilt } = computeArcPath(isLong);
      const accent = accentHexes[Math.floor(Math.random() * accentHexes.length)];
      const f: Flyover = {
        id: Date.now() + Math.floor(Math.random() * 10000),
        path,
        duration: isLong ? (12 + Math.random() * 8) : (8 + Math.random() * 6),
        startDelay: Math.random() * 2,
        planeSize: 18 + Math.random() * 10,
        accent,
        tilt,
        longHaul: isLong,
        trailWidth: isLong ? 3.5 : 2,
      };
      setFlyovers(prev => [...prev, f]);
      // Remove after completion
      setTimeout(() => {
        setFlyovers(prev => prev.filter(x => x.id !== f.id));
      }, (f.startDelay + f.duration + 0.4) * 1000);
    };
    const replenish = () => {
      const desired = isHovering ? baseFleet + 1 : baseFleet; // small bump on hover
      const deficit = desired - flyoversRef.current.length;
      if (deficit > 0) {
        for (let i = 0; i < deficit; i++) spawnOne();
      }
    };
    // Initial fill to target
    replenish();
    // Maintain target count; faster checks on hover
    const interval = setInterval(replenish, isHovering ? 3000 : 5000);
    return () => clearInterval(interval);
  }, [mounted, accentHexes, size, isHovering]);

  return (
    <motion.div
      className={`relative mx-auto ${className ?? ""}`}
      style={{ width: size, height: size, perspective: 800 }}
      aria-label="Animated globe with a plane orbiting"
      onPointerMove={handlePointerMove}
      onPointerLeave={handlePointerLeave}
      onPointerEnter={() => setIsHovering(true)}
      onTouchStart={() => setIsHovering(true)}
      onTouchEnd={() => setIsHovering(false)}
      onFocus={() => setIsHovering(true)}
      onBlur={() => setIsHovering(false)}
      animate={{ rotateX: tiltX, rotateY: tiltY }}
      transition={{ type: "spring", stiffness: 120, damping: 14 }}
    >
      {/* Aurora glow ring behind */}
      <motion.div
        className="absolute -inset-3 rounded-full blur-2xl"
        style={{
          background:
            "conic-gradient(from 0deg, rgba(14,165,233,0.18), rgba(245,158,11,0.16), rgba(14,165,233,0.18), rgba(245,158,11,0.16))",
        }}
        animate={{ rotate: 360 }}
        transition={{ duration: 28, repeat: Infinity, ease: "linear" }}
      />

      {/* Globe base */}
      <div className="absolute inset-0 rounded-full overflow-hidden">
        {/* Ocean color */}
        <div className="absolute inset-0 rounded-full bg-gradient-to-br from-sky-500/40 via-sky-500/40 to-orange-500/40" />
        {/* Atmosphere rim light */}
        <div className="absolute inset-0 rounded-full bg-[radial-gradient(circle_at_30%_30%,rgba(255,255,255,0.28),transparent_60%),radial-gradient(circle_at_70%_70%,rgba(255,255,255,0.18),transparent_70%)]" />
        {/* Gloss highlight */}
        <div className="absolute -top-3 -left-3 w-1/2 h-1/2 rounded-full bg-white/10 blur-xl" />
        {/* Subtle border */}
        <div className="absolute inset-0 rounded-full border border-white/15" />
        {/* Latitude/Longitude hints */}
        <div className="absolute inset-8 rounded-full border-dashed border-t border-white/20" />
        <div className="absolute inset-12 rounded-full border-dashed border-t border-white/15" />
      </div>

      {/* City lights overlay (pulsing, stronger at night) */}
      <motion.div
        className="absolute inset-0 rounded-full overflow-hidden pointer-events-none"
        animate={{ opacity: [cityLightBase * 0.85, cityLightBase * 1.15, cityLightBase * 0.85] }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        style={{ opacity: cityLightBase }}
      >
        <div
          className="absolute inset-0 rounded-full"
          style={{
            backgroundImage: "radial-gradient(rgba(255,255,255,0.35) 1px, transparent 2px)",
            backgroundSize: "24px 24px",
            filter: "blur(0.6px)",
            mixBlendMode: "screen",
          }}
        />
      </motion.div>

      {/* Cloud bands */}
      <motion.div
        className="absolute inset-0 rounded-full overflow-hidden"
        animate={{ rotate: -360 }}
        transition={{ duration: 60, repeat: Infinity, ease: "linear" }}
        style={{ transformOrigin: "50% 50%" }}
      >
        <div className="absolute inset-0 rounded-full">
          <div className="absolute left-1/4 top-1/3 w-1/2 h-8 bg-white/10 blur-xl rounded-full" />
          <div className="absolute left-1/3 top-2/3 w-2/3 h-10 bg-white/8 blur-2xl rounded-full" />
        </div>
      </motion.div>

      {/* All planes travel along arcs — no circular orbits */}

      {/* Occasional flyovers across great-circle-like arcs */}
      {mounted && flyovers.map(f => (
        <div key={`flyover-${f.id}`} className="absolute inset-0" style={{ transform: f.tilt }}>
          {/* Optional faint path glow */}
          <svg className="absolute inset-0" width={size} height={size} style={{ pointerEvents: 'none' }}>
            <path d={f.path} stroke={hexToRgba(f.accent, 0.12)} strokeWidth={1.5} fill="none" />
          </svg>
          {/* Plane moving along the arc using CSS motion path */}
          <motion.div
            className="absolute"
            initial={{ offsetDistance: '0%' }}
            animate={{ offsetDistance: ['0%','40%','70%','100%'] }}
            transition={{ duration: f.duration, delay: f.startDelay, times: [0, 0.4, 0.7, 1], ease: ['easeOut','easeInOut','easeIn'] }}
            style={{
              offsetPath: `path('${f.path}')`,
              offsetRotate: 'auto',
              transform: 'translate(-50%, -50%)',
            } as any}
          >
            {/* Trail behind flyover plane */}
            <div className="absolute -left-16 -top-1 w-16 rounded-full blur-sm" style={{ height: f.trailWidth ?? 2, background: `linear-gradient(to left, ${hexToRgba(f.accent, 0.55)}, ${hexToRgba(f.accent, 0.18)}, transparent)` }} />
            <Plane className="text-white" size={f.planeSize} style={{ filter: `drop-shadow(0 2px 6px ${hexToRgba(f.accent, 0.55)})` }} />
          </motion.div>
        </div>
      ))}
    </motion.div>
  );
}
