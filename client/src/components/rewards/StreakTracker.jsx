// src/components/rewards/StreakTracker.jsx
import { useState, useEffect } from "react";

const DAY_LABELS = ["Mon","Tue","Wed","Thu","Fri","Sat","Sun"];
const getMsg = d =>
  d === 0 ? "Start your streak today!"
  : d === 1 ? "Day 1 — the hardest step is done."
  : d < 4  ? "Building momentum..."
  : d < 7  ? `${d} days strong — almost a full week!`
  : d < 14 ? "One week warrior. Unstoppable."
  : d < 30 ? `${d}-day streak. Pure dedication.`
  : "Absolute legend.";

// Inline SVG flame — no emoji
function FlameIcon({ active, size = 20 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
      style={{ filter: active ? `drop-shadow(0 0 ${size * 0.3}px #f97316)` : "none", display:"block" }}>
      <path
        d="M12 2c0 0-5 5-5 11 0 2.76 2.24 5 5 5s5-2.24 5-5c0-3-2-5-2-5 0 0-1 3-3 3s-2-3-2-3S8 10 8 12"
        fill={active ? "rgba(253,186,116,0.4)" : "none"}
        stroke={active ? "#ea580c" : "#cbd5e1"}
        strokeWidth="1.5" strokeLinecap="round"
      />
      <path
        d="M12 22C9.79 22 8 20.21 8 18c0-1.5 1-3 2-4 0 1.1.9 2 2 2s2-.9 2-2c1 1 2 2.5 2 4 0 2.21-1.79 4-4 4z"
        fill={active ? "#fb923c" : "none"}
      />
    </svg>
  );
}

export default function StreakTracker({ streakDays = 0 }) {
  const [ripple,  setRipple]  = useState(null);
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setTimeout(() => setMounted(true), 120); }, []);

  const onFire = streakDays >= 3;
  const today  = new Date();
  const days   = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(today);
    d.setDate(today.getDate() - (6 - i));
    return {
      label:   DAY_LABELS[d.getDay() === 0 ? 6 : d.getDay() - 1],
      active:  (6 - i) < streakDays,
      isToday: i === 6,
    };
  });

  return (
    <>
      <style>{`
        @keyframes stFlame { 0%,100%{transform:scale(1) rotate(-3deg)} 50%{transform:scale(1.2) rotate(3deg)} }
        @keyframes stNum   { 0%{transform:scale(.5);opacity:0} 65%{transform:scale(1.15)} 100%{transform:scale(1);opacity:1} }
        @keyframes stDot   { from{transform:scale(0) rotate(-45deg);opacity:0} to{transform:scale(1);opacity:1} }
        @keyframes stRip   { 0%{width:0;height:0;opacity:.35} 100%{width:90px;height:90px;opacity:0} }
        @keyframes stIn    { from{opacity:0;transform:translateY(14px)} to{opacity:1;transform:translateY(0)} }
        .stcard { transition:transform 0.3s ease, box-shadow 0.3s ease; }
        .stcard:hover { transform:translateY(-4px) !important; box-shadow:0 16px 48px rgba(234,88,12,0.1) !important; }
        .stday:hover .std { transform:scale(1.16) !important; }
      `}</style>

      {/* Screen ripple effect on day click */}
      {ripple && (
        <div style={{
          position:"fixed", left:ripple.x, top:ripple.y, transform:"translate(-50%,-50%)",
          zIndex:9998, pointerEvents:"none", width:0, height:0, borderRadius:"50%",
          background:"rgba(251,146,60,0.25)", animation:"stRip 0.7s ease-out forwards",
        }}/>
      )}

      <div
        className="stcard"
        style={{
          background:"rgba(255,255,255,0.92)",
          backdropFilter:"blur(24px)",
          border:`1px solid ${onFire ? "rgba(234,88,12,0.22)" : "rgba(0,0,0,0.07)"}`,
          borderRadius:20, padding:"22px 24px",
          boxShadow: onFire
            ? "0 4px 28px rgba(234,88,12,0.08),0 1px 0 rgba(255,255,255,0.9) inset"
            : "0 4px 24px rgba(0,0,0,0.07),0 1px 0 rgba(255,255,255,0.9) inset",
          animation: mounted ? "stIn 0.5s ease both" : "none",
          position:"relative", overflow:"hidden",
        }}
      >
        {/* Warm ember bg glow (when on fire) */}
        {onFire && (
          <div style={{
            position:"absolute", bottom:-24, right:-24, width:140, height:140,
            borderRadius:"50%",
            background:"radial-gradient(circle,rgba(251,146,60,0.1) 0%,transparent 65%)",
            pointerEvents:"none",
          }}/>
        )}

        {/* Header row */}
        <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:18 }}>
          <div style={{ display:"flex", alignItems:"center", gap:10 }}>
            <div style={{ animation: onFire ? "stFlame 1.4s ease-in-out infinite" : "none" }}>
              <FlameIcon active={streakDays > 0} size={28}/>
            </div>
            <div>
              <div style={{ color:"#1e1b4b", fontSize:15, fontWeight:800, fontFamily:"'DM Sans',sans-serif" }}>
                Daily Streak
              </div>
              <div style={{ color:"#9ca3af", fontSize:12, fontFamily:"'DM Sans',sans-serif" }}>
                {getMsg(streakDays)}
              </div>
            </div>
          </div>

          {/* Big streak number */}
          <div style={{ textAlign:"right" }}>
            <div style={{
              fontSize:36, fontWeight:900, fontFamily:"'DM Mono',monospace",
              lineHeight:1, letterSpacing:"-0.04em",
              color: streakDays > 0 ? (onFire ? "#ea580c" : "#6C63FF") : "#e2e8f0",
              textShadow: onFire ? "0 0 24px rgba(234,88,12,0.4)" : "none",
              animation: streakDays > 0 ? "stNum 0.6s cubic-bezier(0.34,1.56,0.64,1) both" : "none",
            }}>
              {streakDays}
            </div>
            <div style={{ color:"#d1d5db", fontSize:10, textTransform:"uppercase", letterSpacing:"0.08em", fontFamily:"'DM Sans',sans-serif" }}>
              {streakDays === 1 ? "day" : "days"}
            </div>
          </div>
        </div>

        {/* 7-day dot grid */}
        <div style={{ display:"flex", gap:6 }}>
          {days.map((day, i) => (
            <div
              key={i}
              className="stday"
              style={{ flex:1, display:"flex", flexDirection:"column", alignItems:"center", gap:5, cursor:"pointer" }}
              onClick={e => {
                const r = e.currentTarget.getBoundingClientRect();
                setRipple({ x: r.left + r.width/2, y: r.top + r.height/2 });
                setTimeout(() => setRipple(null), 700);
              }}
            >
              <div
                className="std"
                style={{
                  width:"100%", maxWidth:36, aspectRatio:"1", borderRadius:10,
                  background: day.active
                    ? "linear-gradient(135deg,rgba(234,88,12,0.2),rgba(251,146,60,0.15))"
                    : day.isToday ? "rgba(108,99,255,0.08)" : "rgba(0,0,0,0.04)",
                  border: day.isToday
                    ? `2px solid ${day.active ? "#ea580c" : "#6C63FF"}`
                    : `1px solid ${day.active ? "rgba(234,88,12,0.35)" : "rgba(0,0,0,0.07)"}`,
                  display:"flex", alignItems:"center", justifyContent:"center",
                  boxShadow: day.active ? "0 0 12px rgba(234,88,12,0.25)" : "none",
                  transition:"transform 0.25s cubic-bezier(0.34,1.56,0.64,1)",
                  animation: day.active ? `stDot 0.4s cubic-bezier(0.34,1.56,0.64,1) ${i * 0.06}s both` : "none",
                }}
              >
                {day.active
                  ? <FlameIcon active size={14}/>
                  : <div style={{ width:5, height:5, borderRadius:"50%", background: day.isToday ? "#6C63FF" : "rgba(0,0,0,0.12)" }}/>
                }
              </div>
              <span style={{
                fontSize:9, fontFamily:"'DM Mono',monospace", textTransform:"uppercase",
                color: day.isToday ? "#6C63FF" : day.active ? "#ea580c" : "#d1d5db",
                fontWeight: day.isToday ? 700 : 400,
              }}>
                {day.label}
              </span>
            </div>
          ))}
        </div>

        {/* Milestone progress bar */}
        {streakDays > 0 && (
          <div style={{ marginTop:14, paddingTop:12, borderTop:"1px solid rgba(0,0,0,0.06)" }}>
            <div style={{ display:"flex", justifyContent:"space-between", marginBottom:6 }}>
              <span style={{ color:"#9ca3af", fontSize:11, fontFamily:"'DM Sans',sans-serif" }}>Next milestone</span>
              <span style={{ color: onFire ? "#ea580c" : "#6C63FF", fontSize:11, fontFamily:"'DM Mono',monospace", fontWeight:600 }}>
                {streakDays < 7  ? `${7  - streakDays}d to Week Warrior`
                : streakDays < 30 ? `${30 - streakDays}d to Month Master`
                : "Legendary!"}
              </span>
            </div>
            <div style={{ height:5, background:"rgba(0,0,0,0.06)", borderRadius:999, overflow:"hidden" }}>
              <div style={{
                height:"100%", borderRadius:999,
                width:`${Math.min(100, (streakDays / (streakDays < 7 ? 7 : 30)) * 100)}%`,
                background:"linear-gradient(90deg,#fb923c,#ea580c)",
                boxShadow:"0 0 8px rgba(234,88,12,0.4)",
                transition:"width 1.2s cubic-bezier(0.34,1.56,0.64,1)",
              }}/>
            </div>
          </div>
        )}
      </div>
    </>
  );
}