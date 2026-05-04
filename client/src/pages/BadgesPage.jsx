// src/pages/BadgesPage.jsx
import { useState, useMemo, useEffect, useRef } from "react";
import { badges, MOCK_USER, RARITY } from "../mocks/badgeMock";
import BadgeCard from "../components/rewards/BadgeCard";
import BadgeUnlockModal from "../components/rewards/BadgeUnlockModal";
import XPBar from "../components/rewards/XPBar";
import StreakTracker from "../components/rewards/StreakTracker";
import { ToastContainer } from "../components/rewards/Toast";
import { ToastProvider, useToast } from "../context/ToastContext";

/* ════════════════ ANIMATED BACKGROUND CANVAS ════════════════ */
function MysticBG() {
  const ref = useRef(null);
  useEffect(() => {
    const cv = ref.current, ctx = cv.getContext("2d");
    let W, H, raf, t = 0;
    const resize = () => { W = cv.width = window.innerWidth; H = cv.height = window.innerHeight; };
    resize();
    window.addEventListener("resize", resize);

    const HEX = 36, HW = HEX * 2, HH = Math.sqrt(3) * HEX;
    const hex = (cx, cy, s) => {
      ctx.beginPath();
      for (let i = 0; i < 6; i++) {
        const a = (Math.PI / 3) * i - Math.PI / 6;
        i === 0 ? ctx.moveTo(cx + s * Math.cos(a), cy + s * Math.sin(a))
                : ctx.lineTo(cx + s * Math.cos(a), cy + s * Math.sin(a));
      }
      ctx.closePath();
    };

    const AURORAS = [
      { r: 108, g: 99,  b: 255, ph: 0   },
      { r: 139, g: 92,  b: 246, ph: 1.3 },
      { r: 59,  g: 130, b: 246, ph: 2.6 },
      { r: 245, g: 158, b: 11,  ph: 3.9 },
    ];
    const ORBS = [
      { cx: .10, cy: .15, ra: 260, r: 108, g: 99,  b: 255, sp: .28, ph: 0   },
      { cx: .88, cy: .12, ra: 200, r: 139, g: 92,  b: 246, sp: .38, ph: 1.5 },
      { cx: .82, cy: .80, ra: 220, r: 59,  g: 130, b: 246, sp: .22, ph: 3   },
      { cx: .04, cy: .85, ra: 180, r: 245, g: 158, b: 11,  sp: .32, ph: 4.5 },
    ];
    const RUNE_CHARS = ["⬡","◈","⟡","✦","⬢","◇","⊕","⋈"];
    const runes = Array.from({ length: 14 }, (_, i) => ({
      x: Math.random() * 100, y: Math.random() * 100,
      vx: (Math.random() - .5) * .007, vy: -.005 - Math.random() * .007,
      rune: RUNE_CHARS[i % RUNE_CHARS.length], size: 10 + Math.random() * 12,
      alpha: .03 + Math.random() * .06, ph: Math.random() * Math.PI * 2,
      sp: .3 + Math.random() * .45,
    }));

    const draw = () => {
      t += .007; ctx.clearRect(0, 0, W, H);
      AURORAS.forEach(a => {
        const bY = H * (.1 + AURORAS.indexOf(a) * .24) + Math.sin(t * .45 + a.ph) * H * .05;
        const gr = ctx.createLinearGradient(0, bY - 70, 0, bY + 70);
        gr.addColorStop(0, `rgba(${a.r},${a.g},${a.b},0)`);
        gr.addColorStop(.5, `rgba(${a.r},${a.g},${a.b},0.042)`);
        gr.addColorStop(1, `rgba(${a.r},${a.g},${a.b},0)`);
        ctx.fillStyle = gr; ctx.beginPath();
        ctx.moveTo(0, bY + Math.sin(t * .6) * 22);
        for (let s = 0; s <= 10; s++) ctx.lineTo((s / 10) * W, bY + Math.sin(t * .6 + s * .8) * 18 + Math.sin(t * 1.1 + s * 1.3) * 10);
        ctx.lineTo(W, bY + 70); ctx.lineTo(0, bY + 70); ctx.closePath(); ctx.fill();
      });
      const cols = Math.ceil(W / (HW * .75)) + 2, rows = Math.ceil(H / HH) + 2;
      for (let col = -1; col < cols; col++) {
        for (let row = -1; row < rows; row++) {
          const cx = col * HW * .75, cy = row * HH + (col % 2 === 0 ? 0 : HH / 2);
          const dist = Math.sqrt((cx - W / 2) ** 2 + (cy - H / 2) ** 2);
          const pulse = Math.sin(t * 1.1 - dist * .006) * .5 + .5;
          hex(cx, cy, HEX - 2);
          ctx.strokeStyle = `rgba(108,99,255,${.016 + pulse * .038})`; ctx.lineWidth = .65; ctx.stroke();
          if (Math.sin(t * .35 + col * 1.7 + row * 2.3) > .97) { ctx.fillStyle = `rgba(108,99,255,${.022 + pulse * .038})`; ctx.fill(); }
        }
      }
      ORBS.forEach(o => {
        const ox = W * o.cx + Math.sin(t * o.sp + o.ph) * 52, oy = H * o.cy + Math.cos(t * o.sp * .7 + o.ph) * 36;
        const gr = ctx.createRadialGradient(ox, oy, 0, ox, oy, o.ra);
        gr.addColorStop(0, `rgba(${o.r},${o.g},${o.b},0.055)`);
        gr.addColorStop(1, `rgba(${o.r},${o.g},${o.b},0)`);
        ctx.fillStyle = gr; ctx.beginPath(); ctx.arc(ox, oy, o.ra, 0, Math.PI * 2); ctx.fill();
      });
      runes.forEach(r => {
        const rx = (r.x / 100) * W, ry = (r.y / 100) * H, w = Math.sin(t * r.sp + r.ph) * 7;
        const a = r.alpha * (.5 + Math.sin(t * r.sp * 1.4 + r.ph) * .5);
        ctx.save(); ctx.globalAlpha = a; ctx.fillStyle = "rgba(108,99,255,1)";
        ctx.font = `${r.size}px serif`; ctx.textAlign = "center";
        ctx.fillText(r.rune, rx + w, ry + w * .5); ctx.restore();
        r.x += r.vx * 100; r.y += r.vy * 100;
        if (r.y < -5) { r.y = 105; r.x = Math.random() * 100; }
        if (r.x < -5 || r.x > 105) r.vx *= -1;
      });
      raf = requestAnimationFrame(draw);
    };
    draw();
    return () => { cancelAnimationFrame(raf); window.removeEventListener("resize", resize); };
  }, []);
  return <canvas ref={ref} style={{ position: "fixed", inset: 0, width: "100%", height: "100%", pointerEvents: "none", zIndex: 0 }} />;
}

/* ════════ COUNT-UP ANIMATION ════════ */
function CountUp({ to, dur = 950, delay = 0 }) {
  const [v, setV] = useState(0);
  useEffect(() => {
    const t = setTimeout(() => {
      const s = performance.now();
      const tick = (now) => {
        const p = Math.min((now - s) / dur, 1), e = 1 - Math.pow(1 - p, 3);
        setV(Math.round(e * to));
        if (p < 1) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    }, delay);
    return () => clearTimeout(t);
  }, [to, dur, delay]);
  return <>{v.toLocaleString()}</>;
}

/* ════════ ROTATING WORD CYCLER ════════ */
function Cycle({ words }) {
  const [idx, setIdx] = useState(0);
  const [vis, setVis] = useState(true);
  useEffect(() => {
    const id = setInterval(() => {
      setVis(false);
      setTimeout(() => { setIdx(i => (i + 1) % words.length); setVis(true); }, 360);
    }, 2100);
    return () => clearInterval(id);
  }, []);
  return (
    <span style={{
      display: "inline-block", opacity: vis ? 1 : 0,
      transform: vis ? "translateY(0)" : "translateY(-8px)",
      transition: "all 0.32s ease",
      color: "#6C63FF", fontFamily: "'DM Mono',monospace",
    }}>
      {words[idx]}
    </span>
  );
}

/* ════════ NEXT BADGE PROGRESS SECTION ════════ */
function NextBadgeSection({ badges }) {
  const next = badges
    .filter(b => !b.earned && b.total > 0)
    .map(b => ({ ...b, pct: b.progress / b.total }))
    .sort((a, b) => b.pct - a.pct)[0];
  if (!next) return null;

  const r   = RARITY[next.rarity] ?? RARITY.common;
  const pct = Math.min(100, Math.round((next.progress / next.total) * 100));

  return (
    <div
      style={{
        background: "rgba(255,255,255,0.92)",
        backdropFilter: "blur(24px)",
        border: `1px solid ${r.strokeHex}22`,
        borderRadius: 20, padding: "20px 24px",
        boxShadow: "0 4px 24px rgba(0,0,0,0.07),0 1px 0 rgba(255,255,255,0.9) inset",
        animation: "sIn 0.6s ease 0.2s both",
        transition: "all .3s ease",
        cursor: "pointer",
      }}
      onMouseEnter={e => {
        e.currentTarget.style.boxShadow = `0 12px 48px rgba(0,0,0,0.12),0 1px 0 rgba(255,255,255,0.9) inset,0 0 24px ${r.glowHex}`;
        e.currentTarget.style.transform = "translateY(-2px)";
        e.currentTarget.style.borderColor = `${r.strokeHex}44`;
      }}
      onMouseLeave={e => {
        e.currentTarget.style.boxShadow = `0 4px 24px rgba(0,0,0,0.07),0 1px 0 rgba(255,255,255,0.9) inset`;
        e.currentTarget.style.transform = "translateY(0)";
        e.currentTarget.style.borderColor = `${r.strokeHex}22`;
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
        <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#6C63FF", boxShadow: "0 0 8px rgba(108,99,255,0.5)", animation: "db 1.5s ease-in-out infinite" }} />
        <span style={{ color: "#6C63FF", fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.16em", fontFamily: "'DM Mono',monospace" }}>
          Next Goal — Closest to Unlock
        </span>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 16, flexWrap: "wrap" }}>
        <div style={{
          width: 56, height: 56, borderRadius: 14,
          background: `${r.strokeHex}10`, border: `1.5px solid ${r.strokeHex}28`,
          display: "flex", alignItems: "center", justifyContent: "center",
          boxShadow: `0 0 16px ${r.glowHex}`, flexShrink: 0,
        }}>
          <span style={{ color: r.strokeHex, fontSize: 22, fontWeight: 900, fontFamily: "'DM Mono',monospace" }}>?</span>
        </div>
        <div style={{ flex: 1, minWidth: 180 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 5 }}>
            <div>
              <div style={{ color: "#1e1b4b", fontSize: 15, fontWeight: 800, fontFamily: "'DM Sans',sans-serif" }}>{next.name}</div>
              <div style={{ color: "#9ca3af", fontSize: 12, fontFamily: "'DM Sans',sans-serif" }}>{next.unlockCondition}</div>
            </div>
            <span style={{ color: r.strokeHex, fontSize: 14, fontWeight: 900, fontFamily: "'DM Mono',monospace" }}>
              {next.progress}/{next.total}
            </span>
          </div>
          <div style={{ height: 7, background: "rgba(0,0,0,0.07)", borderRadius: 999, overflow: "hidden", border: "1px solid rgba(0,0,0,0.04)" }}>
            <div style={{
              height: "100%", width: `${pct}%`, borderRadius: 999,
              background: `linear-gradient(90deg,${r.strokeHex},${r.strokeHex}cc)`,
              boxShadow: `0 0 10px ${r.glowHex}`,
              transition: "width 1.3s cubic-bezier(0.34,1.56,0.64,1)",
            }} />
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", marginTop: 4 }}>
            <span style={{ color: "#9ca3af", fontSize: 10, fontFamily: "'DM Mono',monospace" }}>{pct}% complete</span>
            <span style={{ color: "#b45309", fontSize: 10, fontFamily: "'DM Mono',monospace", fontWeight: 700 }}>+{next.xpReward} XP on unlock</span>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ════════════════════════════ MAIN PAGE ════════════════════════════ */
function Inner() {
  const { showToast } = useToast();
  const [tab,      setTab]      = useState("all");
  const [simBadge, setSimBadge] = useState(null);
  const [selBadge, setSelBadge] = useState(null);
  const [pageIn,   setPageIn]   = useState(false);
  useEffect(() => { setTimeout(() => setPageIn(true), 80); }, []);

  useEffect(() => {
    const h = e => setSimBadge(e.detail);
    window.addEventListener("badge:unlock", h);
    return () => window.removeEventListener("badge:unlock", h);
  }, []);

  const earnedCount = badges.filter(b => b.earned).length;
  const TABS = [
    { key: "all",    label: "All",    count: badges.length },
    { key: "earned", label: "Earned", count: earnedCount },
    { key: "locked", label: "Locked", count: badges.length - earnedCount },
  ];
  const filtered = useMemo(() =>
    tab === "earned" ? badges.filter(b => b.earned) :
    tab === "locked" ? badges.filter(b => !b.earned) :
    badges,
  [tab]);

  const handleSim = () => {
    const locked = badges.filter(b => !b.earned);
    setSimBadge(locked[Math.floor(Math.random() * locked.length)] || badges[0]);
  };
  const testToasts = () => {
    showToast("Quiz saved successfully!", "success");
    setTimeout(() => showToast("Points earned", "points", { points: 75 }), 600);
    setTimeout(() => showToast("New streak:", "streak", { streak: MOCK_USER.streakDays }), 1200);
    setTimeout(() => showToast("Badge Unlocked! Quiz Master", "badge"), 1800);
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@600;700;800;900&family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=Space+Grotesk:wght@500;700&family=IBM+Plex+Mono:wght@400;500;600&family=DM+Sans:wght@400;500;600;700;800&family=DM+Mono:wght@400;500;600;700&display=swap');
        *, *::before, *::after { box-sizing:border-box; margin:0; padding:0; }
        html, body, #root { min-height:100vh; background:#eef4fa; }
        body { overflow-x: hidden; }
        ::-webkit-scrollbar { width:5px; }
        ::-webkit-scrollbar-track { background:#e8e8f8; }
        ::-webkit-scrollbar-thumb { background:linear-gradient(#6C63FF,#8B5CF6); border-radius:999px; }

        @keyframes pageIn  { from{opacity:0;transform:translateY(14px)} to{opacity:1;transform:translateY(0)} }
        @keyframes heroA   { from{opacity:0;transform:translateY(-24px) scale(.88)} to{opacity:1;transform:translateY(0) scale(1)} }
        @keyframes heroB   { from{opacity:0;transform:translateY(-14px)} to{opacity:1;transform:translateY(0)} }
        @keyframes eyeIn   { from{opacity:0;transform:translateX(-18px)} to{opacity:1;transform:translateX(0)} }
        @keyframes fadeUp  { from{opacity:0;transform:translateY(14px)} to{opacity:1;transform:translateY(0)} }
        @keyframes gradSh  { 0%,100%{background-position:0% 50%} 50%{background-position:200% 50%} }
        @keyframes db      { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:.3;transform:scale(.55)} }
        @keyframes sIn     { from{opacity:0;transform:translateY(20px)} to{opacity:1;transform:translateY(0)} }
        @keyframes divLine { from{width:0;opacity:0} to{width:100%;opacity:1} }
        @keyframes cGrid   { from{opacity:0;transform:translateY(26px) rotateX(5deg)} to{opacity:1;transform:translateY(0) rotateX(0)} }
        @keyframes prisma  { 0%{background-position:0% 50%} 100%{background-position:300% 50%} }
        @keyframes tabPop  { 0%{transform:scale(1)} 45%{transform:scale(1.08)} 100%{transform:scale(1)} }
        @keyframes statIn  { from{opacity:0;transform:translateY(16px) scale(.93)} to{opacity:1;transform:translateY(0) scale(1)} }
        @keyframes scan    { 0%{top:-1px;opacity:.5} 100%{top:100%;opacity:.5} }
        @keyframes titleFloat { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-4px)} }
        @keyframes titlePulse { 0%,100%{text-shadow:0 1px 0 rgba(255,255,255,0.75),0 8px 26px rgba(37,99,235,0.25)} 50%{text-shadow:0 1px 0 rgba(255,255,255,0.82),0 12px 34px rgba(37,99,235,0.42)} }
        @keyframes titleGlow { 0%,100%{text-shadow:0 0 12px rgba(37,99,235,0.2)} 50%{text-shadow:0 0 20px rgba(14,165,233,0.38)} }
        @keyframes titleFlow { 0%{background-position:0% 50%} 100%{background-position:220% 50%} }

        .tab-btn {
          padding:9px 20px; border-radius:999px;
          border:1px solid rgba(0,0,0,0.08); background:rgba(255,255,255,0.7);
          color:#4b5563; font-size:13px; font-family:'Space Grotesk',sans-serif; font-weight:700;
          cursor:pointer; transition:all .25s cubic-bezier(0.34,1.56,0.64,1);
          display:flex; align-items:center; gap:7px; backdrop-filter:blur(8px);
        }
        .tab-btn:hover {
          color:#6C63FF; border-color:rgba(108,99,255,0.3);
          transform:translateY(-2px); background:rgba(255,255,255,0.92);
          box-shadow:0 4px 14px rgba(108,99,255,0.1);
        }
        .tab-btn.active {
          background:rgba(108,99,255,0.09); border-color:rgba(108,99,255,0.4);
          color:#4338ca; box-shadow:0 0 0 3px rgba(108,99,255,0.08);
          animation:tabPop .3s ease;
        }
        .tab-count {
          display:inline-flex; align-items:center; justify-content:center;
          min-width:20px; height:18px; padding:0 6px; border-radius:999px;
          background:rgba(108,99,255,0.1); color:#6C63FF;
          font-size:10px; font-weight:800; font-family:'IBM Plex Mono',monospace;
        }
        .tab-btn.active .tab-count { background:rgba(108,99,255,0.2); }

        .stat-item { transition:all .3s cubic-bezier(0.34,1.56,0.64,1); }
        .stat-item:hover { transform:translateY(-4px) scale(1.02) !important; box-shadow:0 12px 32px rgba(0,0,0,0.08) !important; }

        .sim-btn {
          display:inline-flex; align-items:center; gap:9px;
          padding:12px 22px; border-radius:14px;
          background:rgba(180,83,9,0.08); border:1px solid rgba(180,83,9,0.22);
          color:#b45309; font-size:13px; font-weight:800; font-family:'DM Sans',sans-serif;
          cursor:pointer; transition:all .25s cubic-bezier(0.34,1.56,0.64,1);
          backdrop-filter:blur(8px);
        }
        .sim-btn:hover { transform:translateY(-2px); box-shadow:0 8px 20px rgba(180,83,9,0.12); border-color:rgba(180,83,9,0.35); background:rgba(180,83,9,0.12); }

        .sdiv  { display:flex; align-items:center; gap:14px; margin:28px 0 16px; }
        .sline { flex:1; height:1px; background:linear-gradient(90deg,rgba(108,99,255,0.15),transparent); animation:divLine .8s ease .3s both; }

        .cgrid-item { animation:cGrid .5s cubic-bezier(0.34,1.2,0.64,1) both; transform-origin:center bottom; }

        /* ── KEY FIX: equal height badge cards ── */
        .badge-grid {
          display: grid;
          grid-template-columns: repeat(4, minmax(0, 1fr));
          gap: 14px;
          grid-auto-rows: 1fr;
          align-items: stretch;
        }

        .hero-title {
          font-size: clamp(36px, 6vw, 72px);
          margin: 0 0 18px;
          line-height: 0.95;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          font-weight: 800;
          font-family: 'Orbitron', sans-serif;
          color: #1e1b4b;
          text-shadow: 0 1px 0 rgba(255,255,255,0.75), 0 8px 26px rgba(37,99,235,0.25);
          animation: heroA .7s cubic-bezier(0.34,1.56,0.64,1) both, titleFloat 3.6s ease-in-out 0.8s infinite, titlePulse 2.8s ease-in-out 0.8s infinite;
          display: inline-block;
          white-space: nowrap;
          text-align: left;
        }
        .hero-title .hero-my,
        .hero-title .hero-badges {
          display: inline;
        }
        .hero-title .hero-my {
          color: #1e1b4b;
          margin-right: 12px;
        }
        .hero-title .hero-badges {
          background: linear-gradient(90deg,#0f172a 0%,#1e3a8a 36%,#1d4ed8 54%,#1e40af 72%,#0f172a 100%);
          background-size: 220% auto;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          color: #1d4ed8;
          text-shadow: 0 0 16px rgba(37,99,235,0.24);
          animation: titleGlow 2.4s ease-in-out infinite, titleFlow 6.5s linear infinite;
        }

        .page-shell {
          max-width: 1180px;
          margin: 0 auto;
          padding-inline: clamp(14px, 2.4vw, 26px);
        }

        @media (max-width:1024px) {
          .badge-grid { grid-template-columns: repeat(3, minmax(0, 1fr)) !important; }
        }
        @media (max-width:768px) {
          .hero-row { flex-direction:column !important; }
          .hero-side { width:100%; align-items:flex-start !important; }
          .stats-grid { grid-template-columns:repeat(2,1fr) !important; }
          .progress-grid { grid-template-columns:1fr !important; }
          .badge-grid { grid-template-columns: repeat(2, minmax(0, 1fr)) !important; }
          .sdiv { margin: 22px 0 14px !important; }
        }
        @media (max-width:640px) {
          .tab-wrap { overflow-x:auto; padding-bottom:6px; }
          .tab-wrap::-webkit-scrollbar { height:4px; }
          .tab-wrap::-webkit-scrollbar-thumb { border-radius:999px; background:rgba(108,99,255,0.35); }
          .tab-btn { padding:8px 14px; font-size:12px; }
          .tab-count { min-width:18px; }
          .badge-grid { grid-template-columns: 1fr !important; }
        }
        @media (max-width:480px) {
          .stats-grid { grid-template-columns:1fr 1fr !important; }
          .sim-btn { width:100%; justify-content:center; }
        }
      `}</style>

      <MysticBG />
      <div style={{ position: "fixed", inset: 0, zIndex: 0, pointerEvents: "none", background: "radial-gradient(circle at 10% 10%,rgba(14,165,233,0.11),transparent 30%),radial-gradient(circle at 88% 18%,rgba(16,185,129,0.08),transparent 32%),radial-gradient(circle at 82% 82%,rgba(217,119,6,0.09),transparent 34%),linear-gradient(160deg,#eef4fa 0%,#f9fcff 42%,#fffaf2 100%)" }} />

      <div style={{
        minHeight: "100vh", color: "#1e1b4b", fontFamily: "'Plus Jakarta Sans',sans-serif",
        position: "relative", zIndex: 1, paddingBottom: 32,
        opacity: pageIn ? 1 : 0, transform: pageIn ? "translateY(0)" : "translateY(12px)",
        transition: "opacity .5s ease, transform .5s ease",
      }}>

        {/* ══════════════ HEADER ══════════════ */}
        <div style={{
          position: "relative", overflow: "hidden",
          background: "linear-gradient(180deg,#ffffff 0%,#f9f9ff 100%)",
          borderBottom: "1px solid rgba(108,99,255,0.08)",
        }}>
          <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 3, background: "linear-gradient(90deg,#6C63FF,#8B5CF6,#3B82F6,#F59E0B,#22c55e,#6C63FF)", backgroundSize: "300% auto", animation: "prisma 4s linear infinite" }} />
          <div style={{ position: "absolute", left: 0, right: 0, height: 1, background: "linear-gradient(90deg,transparent,rgba(108,99,255,0.08),transparent)", animation: "scan 6s ease-in-out infinite", pointerEvents: "none" }} />

          <div className="page-shell" style={{ paddingTop: "clamp(28px,4vw,46px)", paddingBottom: "clamp(24px,3vw,34px)", position: "relative", zIndex: 1 }}>

            {/* Breadcrumb */}
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 24, fontSize: 12, fontFamily: "'IBM Plex Mono',monospace", flexWrap: "wrap" }}>
              {["Dashboard", "Rewards", "My Achievements"].map((s, i, a) => (
                <span key={s} style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <span style={{
                    color: i === a.length - 1 ? "#6C63FF" : "#6b7280",
                    fontWeight: i === a.length - 1 ? 700 : 400, cursor: "pointer", transition: "color .2s",
                  }}
                    onMouseEnter={e => { if (i < a.length - 1) e.target.style.color = "#4338ca"; }}
                    onMouseLeave={e => { if (i < a.length - 1) e.target.style.color = "#6b7280"; }}>
                    {s}
                  </span>
                  {i < a.length - 1 && <span style={{ color: "#6b7280" }}>›</span>}
                </span>
              ))}
            </div>

            {/* Hero row */}
            <div className="hero-row" style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", flexWrap: "wrap", gap: 24, marginBottom: 34 }}>
              <div style={{ flex: 1, minWidth: 280 }}>
                <div style={{
                  display: "inline-flex", alignItems: "center", gap: 8,
                  background: "rgba(108,99,255,0.08)", border: "1px solid rgba(108,99,255,0.2)",
                  borderRadius: 999, padding: "5px 14px", marginBottom: 18,
                  animation: "eyeIn .6s ease both", backdropFilter: "blur(8px)",
                }}>
                  <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#6C63FF", boxShadow: "0 0 8px rgba(108,99,255,0.4)", animation: "db 1.5s ease-in-out infinite" }} />
                  <span style={{ color: "#0f766e", fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.15em", fontFamily: "'IBM Plex Mono',monospace" }}>
                    Dynamic Gamification · Rewards
                  </span>
                </div>

                <h1 className="hero-title">
                  <span className="hero-my">MY</span><span className="hero-badges">BADGES</span>
                </h1>

                <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 14 }}>
                  <div style={{ height: 1, width: 42, background: "linear-gradient(90deg,transparent,#6C63FF)" }} />
                  <span style={{ fontSize: 12, fontWeight: 800, letterSpacing: "0.18em", fontFamily: "'IBM Plex Mono',monospace" }}>
                    <Cycle words={["CONQUER.", "COLLECT.", "ASCEND.", "LEGEND."]} />
                  </span>
                  <div style={{ height: 1, flex: 1, background: "linear-gradient(90deg,#6C63FF,transparent)" }} />
                </div>

                <p style={{ color: "#475569", fontSize: 14, fontFamily: "'Plus Jakarta Sans',sans-serif", lineHeight: 1.65, maxWidth: 500, animation: "fadeUp .6s ease .3s both" }}>
                  <span style={{ color: "#22c55e", fontWeight: 800, fontFamily: "'DM Mono',monospace" }}>{earnedCount}</span>
                  {" / "}{badges.length} badges earned — <span style={{ color: "#6C63FF" }}>keep pushing your limits.</span>
                </p>
              </div>

              <div className="hero-side" style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 12, animation: "fadeUp .6s ease .4s both" }}>
                <div style={{ background: "rgba(108,99,255,0.06)", backdropFilter: "blur(20px)", border: "1px solid rgba(108,99,255,0.15)", borderRadius: 16, padding: "14px 22px", textAlign: "right", boxShadow: "0 2px 12px rgba(0,0,0,0.06)" }}>
                  <div style={{ color: "#D97706", fontSize: 30, fontWeight: 900, fontFamily: "'IBM Plex Mono',monospace", letterSpacing: "-0.04em", lineHeight: 1, textShadow: "0 1px 2px rgba(217,119,6,0.1)" }}>
                    <CountUp to={MOCK_USER.totalPoints} dur={1400} />
                  </div>
                  <div style={{ color: "#6b7280", fontSize: 10, textTransform: "uppercase", letterSpacing: "0.12em", fontFamily: "'IBM Plex Mono',monospace" }}>Total XP</div>
                </div>
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap", justifyContent: "flex-end", width: "100%" }}>
                  <button className="sim-btn" onClick={handleSim}>
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polygon points="5,3 19,12 5,21" /></svg>
                    Simulate Unlock
                  </button>
                  <button onClick={testToasts}
                    style={{ padding: "12px 16px", borderRadius: 12, background: "rgba(108,99,255,0.08)", border: "1px solid rgba(108,99,255,0.2)", color: "#6C63FF", fontSize: 12, fontWeight: 700, fontFamily: "'IBM Plex Mono',monospace", cursor: "pointer", transition: "all .2s", backdropFilter: "blur(8px)" }}
                    onMouseEnter={e => { e.currentTarget.style.background = "rgba(108,99,255,0.14)"; }}
                    onMouseLeave={e => { e.currentTarget.style.background = "rgba(108,99,255,0.08)"; }}>
                    Test Toasts
                  </button>
                </div>
              </div>
            </div>

            {/* Stats row */}
            <div className="stats-grid" style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 12, marginBottom: 20 }}>
              {[
                { label: "Earned",   value: earnedCount,               color: "#16a34a", delay: 0   },
                { label: "Locked",   value: badges.length - earnedCount, color: "#6C63FF", delay: 80  },
                { label: "Streak",   value: MOCK_USER.streakDays,      color: "#ea580c", delay: 160 },
                { label: "Total XP", value: MOCK_USER.totalPoints,     color: "#b45309", delay: 240 },
              ].map(s => (
                <div key={s.label} className="stat-item"
                  style={{ background: "rgba(255,255,255,0.6)", backdropFilter: "blur(16px)", border: `1px solid ${s.color}18`, borderRadius: 16, padding: "18px 20px", boxShadow: `0 2px 8px rgba(0,0,0,0.05),0 0 1px ${s.color}10`, animation: `statIn .6s cubic-bezier(0.34,1.56,0.64,1) ${s.delay}ms both` }}>
                  <div style={{ color: s.color, fontSize: 28, fontWeight: 900, fontFamily: "'IBM Plex Mono',monospace", letterSpacing: "-0.04em", lineHeight: 1, marginBottom: 4, textShadow: `0 0 1px ${s.color}22` }}>
                    <CountUp to={s.value} delay={s.delay} />
                  </div>
                  <div style={{ color: "#6b7280", fontSize: 11, textTransform: "uppercase", letterSpacing: "0.1em", fontFamily: "'Plus Jakarta Sans',sans-serif" }}>{s.label}</div>
                </div>
              ))}
            </div>

            {/* Tab bar */}
            <div className="tab-wrap" style={{ display: "flex", gap: 8, paddingBottom: 1 }}>
              {TABS.map(tb => (
                <button key={tb.key} className={`tab-btn${tab === tb.key ? " active" : ""}`} onClick={() => setTab(tb.key)}>
                  {tb.label}<span className="tab-count">{tb.count}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* ══════════════ CONTENT AREA ══════════════ */}
        <div className="page-shell" style={{ paddingTop: "20px", paddingBottom: "30px" }}>

          {/* Progress */}
          <div className="sdiv">
            <span style={{ color: "#6C63FF", fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.16em", fontFamily: "'DM Mono',monospace", whiteSpace: "nowrap" }}>◈ Progress</span>
            <div className="sline" />
          </div>
          <div className="progress-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, animation: "sIn .6s ease .1s both" }}>
            <XPBar totalPoints={MOCK_USER.totalPoints} />
            <StreakTracker streakDays={MOCK_USER.streakDays} />
          </div>

          {/* Next Badge */}
          <div className="sdiv" style={{ marginTop: 24 }}>
            <span style={{ color: "#b45309", fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.16em", fontFamily: "'DM Mono',monospace", whiteSpace: "nowrap" }}>◈ Next Goal</span>
            <div className="sline" style={{ background: "linear-gradient(90deg,rgba(180,83,9,0.22),transparent)" }} />
          </div>
          <NextBadgeSection badges={badges} />

          {/* Badge Collection */}
          <div className="sdiv" style={{ marginTop: 24 }}>
            <span style={{ color: "#8B5CF6", fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.16em", fontFamily: "'DM Mono',monospace", whiteSpace: "nowrap" }}>◈ Badge Collection</span>
            <div className="sline" style={{ background: "linear-gradient(90deg,rgba(139,92,246,0.22),transparent)" }} />
          </div>

          {tab === "locked" && (
            <div style={{
              background: "rgba(108,99,255,0.06)", border: "1px solid rgba(108,99,255,0.14)",
              borderRadius: 12, padding: "12px 18px", marginBottom: 18,
              color: "#6b7280", fontSize: 13, fontFamily: "'DM Sans',sans-serif",
              display: "flex", alignItems: "center", gap: 8,
            }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#6C63FF" strokeWidth="2.5" strokeLinecap="round">
                <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
              Hover over any locked badge to reveal the <strong style={{ color: "#6C63FF" }}> exact unlock condition</strong>.
            </div>
          )}

          {/* ── BADGE GRID: key fix is className="badge-grid" ── */}
          {filtered.length > 0 ? (
            <div className="badge-grid">
              {filtered.map((b, i) => (
                <div
                  key={b.id}
                  className="cgrid-item"
                  style={{
                    animationDelay: `${i * 0.06}s`,
                    // stretch each wrapper to fill the grid row height
                    display: "flex",
                    flexDirection: "column",
                  }}
                >
                  <BadgeCard badge={b} onSelect={setSelBadge} />
                </div>
              ))}
            </div>
          ) : (
            <div style={{ textAlign: "center", padding: "80px 20px" }}>
              <div style={{ color: "#9ca3af", fontSize: 17, fontWeight: 700, fontFamily: "'DM Mono',monospace", marginBottom: 8 }}>Nothing here yet</div>
              <div style={{ color: "#b4a3b7", fontSize: 13 }}>Keep learning to unlock badges!</div>
            </div>
          )}
        </div>
      </div>

      {simBadge && <BadgeUnlockModal badge={simBadge} onClose={() => { setSimBadge(null); window.dispatchEvent(new Event("badge:dismissed")); }} />}
      {selBadge && <BadgeUnlockModal badge={selBadge} onClose={() => setSelBadge(null)} />}
      <ToastContainer />
    </>
  );
}

export default function BadgesPage() {
  return <ToastProvider><Inner /></ToastProvider>;
}