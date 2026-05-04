// src/components/rewards/BadgeIcon.jsx
// Hexagonal shield: M12 2 L22 7 L22 17 L12 22 L2 17 L2 7 Z
// Inner icons: inline SVG paths only — no icon libraries
// Sizes: sm=32 md=64 lg=96
// Uses CSS vars from tokens.css

import { useState } from "react";
import { RARITY } from "../../mocks/badgeMock";

const SIZES = { sm: 32, md: 64, lg: 96 };

/* ── All 6 inner icons as pure SVG paths ── */
function InnerIcon({ name, color, size }) {
  const s = size * 0.40;
  const base = { fill: "none", stroke: color, strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: Math.max(1.2, size * 0.028) };
  const icons = {
    star:      <svg width={s} height={s} viewBox="0 0 24 24"><polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26" {...base} fill={color+"22"}/></svg>,
    lightning: <svg width={s} height={s} viewBox="0 0 24 24"><polygon points="13,2 3,14 12,14 11,22 21,10 12,10" {...base} fill={color+"22"}/></svg>,
    flame:     <svg width={s} height={s} viewBox="0 0 24 24"><path d="M12 2c0 0-5 5-5 11 0 2.76 2.24 5 5 5s5-2.24 5-5c0-3-2-5-2-5 0 0-1 3-3 3s-2-3-2-3S8 10 8 12" {...base} fill={color+"22"}/><circle cx="12" cy="19" r="2" fill={color} stroke="none"/></svg>,
    crown:     <svg width={s} height={s} viewBox="0 0 24 24"><path d="M2 19h20M2 19l3-8 5 5 2-10 2 10 5-5 3 8" {...base} fill={color+"18"}/></svg>,
    book:      <svg width={s} height={s} viewBox="0 0 24 24"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" {...base}/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" {...base} fill={color+"18"}/></svg>,
    moon:      <svg width={s} height={s} viewBox="0 0 24 24"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" {...base} fill={color+"22"}/></svg>,
  };
  return icons[name] || icons.star;
}

export default function BadgeIcon({ badge, size = "md", earned = true, animated = true }) {
  const [hov, setHov] = useState(false);
  const px = typeof size === "number" ? size : (SIZES[size] ?? 64);
  const r = RARITY[badge?.rarity] ?? RARITY.common;
  const strokeHex = r.strokeHex;
  const glowHex   = r.glowHex;

  // Shimmer dash length for stroke-dashoffset animation
  const dash = Math.round(px * 1.2);

  return (
    <>
      <style>{`
        @keyframes biOrbitCW  { to { transform: rotate(360deg);  } }
        @keyframes biOrbitCCW { to { transform: rotate(-360deg); } }
        @keyframes biFloat    { 0%,100%{transform:translateY(0)} 50%{transform:translateY(${-px*.055}px)} }
        @keyframes biGlow     { 0%,100%{opacity:.4;transform:scale(1)} 50%{opacity:.85;transform:scale(1.1)} }
        @keyframes biShimmer  { 0%{stroke-dashoffset:0} 100%{stroke-dashoffset:-${dash*4}px} }
        @keyframes biShimSweep{ 0%{transform:translateX(-120%) rotate(35deg)} 100%{transform:translateX(300%) rotate(35deg)} }
      `}</style>
      <div
        style={{
          position:"relative", width:px, height:px, flexShrink:0,
          filter: earned ? "none" : "grayscale(1)",
          opacity: earned ? 1 : 0.45,
          animation: earned && animated ? `biFloat ${3.2 + px*.015}s ease-in-out infinite` : "none",
          cursor: "default",
        }}
        onMouseEnter={() => setHov(true)}
        onMouseLeave={() => setHov(false)}
      >
        {/* Ambient glow */}
        {earned && (
          <div style={{position:"absolute",inset:-px*.35,borderRadius:"50%",pointerEvents:"none",
            background:`radial-gradient(circle,${glowHex} 0%,transparent 65%)`,
            animation:"biGlow 2.8s ease-in-out infinite"}}/>
        )}

        {/* Legendary outer orbit */}
        {earned && badge?.rarity==="legendary" && (
          <div style={{position:"absolute",inset:-px*.13,borderRadius:"50%",
            borderTop:`${Math.max(1,px*.018)}px solid ${strokeHex}88`,
            borderRight:`${Math.max(1,px*.018)}px solid ${strokeHex}44`,
            borderBottom:"1.5px solid transparent",borderLeft:"1.5px solid transparent",
            animation:"biOrbitCW 3s linear infinite"}}/>
        )}
        {/* Epic/Legendary dashed ring */}
        {earned && (badge?.rarity==="legendary"||badge?.rarity==="epic") && (
          <div style={{position:"absolute",inset:-px*.07,borderRadius:"50%",
            border:`${Math.max(1,px*.014)}px dashed ${strokeHex}33`,
            animation:"biOrbitCCW 7s linear infinite"}}/>
        )}

        {/* Main hex shield SVG */}
        <svg
          width={px} height={px} viewBox="0 0 24 24"
          style={{
            display:"block", overflow:"visible",
            transform: hov && earned ? "scale(1.12)" : "scale(1)",
            transition:"transform 0.35s cubic-bezier(0.34,1.56,0.64,1)",
            filter: hov && earned ? `drop-shadow(0 0 ${px*.15}px ${strokeHex})` : "none",
          }}
        >
          <defs>
            <linearGradient id={`hg_${badge?.id}`} x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor={strokeHex} stopOpacity="0.22"/>
              <stop offset="100%" stopColor={strokeHex} stopOpacity="0.04"/>
            </linearGradient>
          </defs>

          {/* Hex fill */}
          <path d="M12 2 L22 7 L22 17 L12 22 L2 17 L2 7 Z" fill={earned?`url(#hg_${badge?.id})`:"rgba(255,255,255,0.03)"} stroke="none"/>

          {/* Top shine */}
          <path d="M4.5 7.8 Q12 4.5 19.5 7.8" fill="rgba(255,255,255,0.06)" stroke="none"/>

          {/* Static hex stroke */}
          <path d="M12 2 L22 7 L22 17 L12 22 L2 17 L2 7 Z"
            fill="none" stroke={earned?strokeHex:"#3D3D5C"} strokeWidth={earned?(hov?1.3:0.9):0.7} strokeLinejoin="round"/>

          {/* Animated shimmer stroke (earned only) */}
          {earned && animated && (
            <path d="M12 2 L22 7 L22 17 L12 22 L2 17 L2 7 Z"
              fill="none" stroke={strokeHex} strokeWidth="1.8" strokeLinejoin="round"
              strokeDasharray={`${dash} ${dash*3}`}
              style={{animation:`biShimmer ${badge?.rarity==="legendary"?"1.8s":badge?.rarity==="epic"?"2.2s":"2.8s"} linear infinite`,
                filter:`drop-shadow(0 0 2px ${strokeHex})`}}/>
          )}
        </svg>

        {/* Inner icon, centered */}
        <div style={{position:"absolute",inset:0,display:"flex",alignItems:"center",justifyContent:"center",paddingTop:px*.04}}>
          <InnerIcon name={badge?.icon||"star"} color={earned?strokeHex:"#3D3D5C"} size={px}/>
        </div>

        {/* Shimmer sweep on hover */}
        {hov && earned && (
          <div style={{position:"absolute",inset:0,pointerEvents:"none",overflow:"hidden",borderRadius:"4px"}}>
            <div style={{position:"absolute",inset:0,background:`linear-gradient(35deg,transparent 30%,${strokeHex}33 50%,transparent 70%)`,
              animation:"biShimSweep 0.6s ease forwards"}}/>
          </div>
        )}

        {/* Lock overlay for unearned */}
        {!earned && (
          <div style={{position:"absolute",bottom:px*.06,right:px*.06,
            width:px*.28+6,height:px*.28+6,borderRadius:"50%",
            background:"rgba(15,14,23,0.9)",border:"1px solid rgba(255,255,255,0.1)",
            display:"flex",alignItems:"center",justifyContent:"center",
            boxShadow:"0 2px 8px rgba(0,0,0,0.5)"}}>
            <svg width={px*.24} height={px*.24} viewBox="0 0 24 24" fill="none" stroke="#3D3D5C" strokeWidth="2.5" strokeLinecap="round">
              <rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>
            </svg>
          </div>
        )}
      </div>
    </>
  );
}