// src/components/rewards/XPBar.jsx
// Full version: level circle, level name, animated XP bar, X/Y XP text
// Mini version (variant="mini"): for Navbar
// Level-up detection → gold flash overlay, new level title flies in, 2s auto-dismiss
import { useEffect, useRef, useState } from "react";
import { getLevelInfo, getLevelMotivation } from "../../utils/levels";

function LevelUpOverlay({ name, onDone }) {
  useEffect(() => { const t = setTimeout(onDone, 2200); return () => clearTimeout(t); }, []);
  return (
    <>
      <style>{`
        @keyframes luBg  { 0%{opacity:0}20%{opacity:1}80%{opacity:1}100%{opacity:0} }
        @keyframes luTxt { 0%{opacity:0;transform:scale(.6) translateY(24px)}40%{opacity:1;transform:scale(1.08)}60%{transform:scale(1)}80%{opacity:1}100%{opacity:0;transform:translateY(-14px)} }
      `}</style>
      <div style={{
        position:"fixed", inset:0, zIndex:10500, pointerEvents:"none",
        background:"rgba(255,215,0,0.07)", animation:"luBg 2.2s ease forwards",
        display:"flex", alignItems:"center", justifyContent:"center",
      }}>
        <div style={{ textAlign:"center", animation:"luTxt 2.2s ease forwards" }}>
          <div style={{ color:"#9ca3af", fontSize:11, fontWeight:700, letterSpacing:"0.22em", textTransform:"uppercase", fontFamily:"'DM Mono',monospace", marginBottom:8 }}>
            LEVEL UP!
          </div>
          <div style={{ fontSize:46, fontWeight:900, color:"#b45309", fontFamily:"'DM Sans',sans-serif", letterSpacing:"-0.03em", textShadow:"0 0 40px rgba(180,83,9,0.35)" }}>
            {name}
          </div>
          <div style={{ color:"#9ca3af", fontSize:13, fontFamily:"'DM Sans',sans-serif", marginTop:8 }}>
            You reached a new rank ✦
          </div>
        </div>
      </div>
    </>
  );
}

export default function XPBar({ totalPoints = 0, variant = "full" }) {
  const [pct,    setPct]    = useState(0);
  const [xpDisp, setXpDisp] = useState(0);
  const [flash,  setFlash]  = useState(false);
  const [hov,    setHov]    = useState(false);
  const [luName, setLuName] = useState("");
  const [showLU, setShowLU] = useState(false);
  const prevLevel = useRef(null);
  const raf       = useRef(null);
  const info      = getLevelInfo(totalPoints);

  // Level-up detection
  useEffect(() => {
    if (prevLevel.current !== null && info.level > prevLevel.current) {
      setLuName(info.levelName);
      setShowLU(true);
    }
    prevLevel.current = info.level;
  }, [info.level, info.levelName]);

  // Animate bar fill (1s CSS transition equivalent via RAF for smoothness)
  useEffect(() => {
    setFlash(true);
    setTimeout(() => setFlash(false), 900);
    const dur = 1200, s = performance.now();
    const tick = (now) => {
      const t = Math.min((now - s) / dur, 1), e = 1 - Math.pow(1 - t, 4);
      setPct(Math.round(e * info.percentage));
      setXpDisp(Math.round(e * totalPoints));
      if (t < 1) raf.current = requestAnimationFrame(tick);
    };
    raf.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf.current);
  }, [totalPoints, info.percentage]);

  // Mini variant for Navbar
  if (variant === "mini") return (
    <div style={{ display:"flex", alignItems:"center", gap:8 }}>
      <div style={{
        width:26, height:26, borderRadius:8,
        background:"linear-gradient(135deg,#6C63FF,#4f46e5)",
        display:"flex", alignItems:"center", justifyContent:"center",
        fontSize:11, fontWeight:900, color:"#fff",
        fontFamily:"'DM Mono',monospace",
        boxShadow:"0 2px 10px rgba(108,99,255,0.4)", flexShrink:0,
      }}>
        {info.level}
      </div>
      <div style={{ width:80, height:4, background:"rgba(108,99,255,0.15)", borderRadius:999, overflow:"hidden" }}>
        <div style={{ height:"100%", width:`${pct}%`, background:"linear-gradient(90deg,#6C63FF,#8B5CF6)", borderRadius:999, transition:"width 1s ease" }}/>
      </div>
      <span style={{ color:"#6C63FF", fontSize:11, fontWeight:700, fontFamily:"'DM Mono',monospace" }}>{info.levelName}</span>
    </div>
  );

  // Full version
  return (
    <>
      <style>{`
        @keyframes xpShim   { 0%{background-position:-200% center} 100%{background-position:200% center} }
        @keyframes xpFlash  { 0%{opacity:0} 25%{opacity:1} 100%{opacity:0} }
        @keyframes xpScan   { 0%{top:0px} 100%{top:100%} }
        @keyframes xpLvlPop { 0%{transform:scale(1)} 45%{transform:scale(1.22)} 100%{transform:scale(1)} }
        .xpbar-card { transition:transform 0.3s ease, box-shadow 0.3s ease; }
        .xpbar-card:hover { transform:translateY(-4px) !important; box-shadow:0 16px 48px rgba(108,99,255,0.14) !important; }
      `}</style>

      {showLU && <LevelUpOverlay name={luName} onDone={() => setShowLU(false)}/>}

      <div
        className="xpbar-card"
        style={{
          background:"rgba(255,255,255,0.92)",
          backdropFilter:"blur(24px)",
          border:`1px solid ${flash ? "rgba(108,99,255,0.4)" : "rgba(108,99,255,0.14)"}`,
          borderRadius:20, padding:"22px 26px",
          position:"relative", overflow:"hidden",
          boxShadow: flash
            ? "0 8px 40px rgba(108,99,255,0.16),0 0 0 3px rgba(108,99,255,0.07)"
            : "0 4px 24px rgba(0,0,0,0.07),0 1px 0 rgba(255,255,255,0.9) inset",
          transition:"border-color 0.4s, box-shadow 0.4s",
        }}
        onMouseEnter={() => setHov(true)}
        onMouseLeave={() => setHov(false)}
      >
        {/* Flash overlay */}
        {flash && <div style={{position:"absolute",inset:0,background:"rgba(108,99,255,0.04)",animation:"xpFlash 0.9s ease forwards",pointerEvents:"none",borderRadius:20}}/>}

        {/* Subtle moving scan line */}
        <div style={{position:"absolute",left:0,right:0,height:1,background:"linear-gradient(90deg,transparent,rgba(108,99,255,0.12),transparent)",animation:"xpScan 5s linear infinite",pointerEvents:"none"}}/>

        {/* Top row: level badge + name / XP count */}
        <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:16 }}>
          <div style={{ display:"flex", alignItems:"center", gap:12 }}>
            {/* Level circle */}
            <div style={{
              width:52, height:52, borderRadius:"50%",
              background:"linear-gradient(135deg,#6C63FF,#4f46e5)",
              display:"flex", alignItems:"center", justifyContent:"center",
              fontSize:19, fontWeight:900, color:"#fff",
              fontFamily:"'DM Mono',monospace",
              boxShadow:"0 4px 18px rgba(108,99,255,0.45),inset 0 1px 0 rgba(255,255,255,0.25)",
              animation: flash ? "xpLvlPop 0.5s ease" : "none",
              flexShrink:0,
            }}>
              {info.level}
            </div>
            <div>
              <div style={{ color:"#1e1b4b", fontSize:17, fontWeight:800, fontFamily:"'DM Sans',sans-serif", letterSpacing:"-0.01em" }}>
                {info.levelName}
              </div>
              <div style={{ color:"#6C63FF", fontSize:11, fontWeight:700, textTransform:"uppercase", letterSpacing:"0.1em", fontFamily:"'DM Mono',monospace" }}>
                Level {info.level} {info.icon}
              </div>
            </div>
          </div>

          <div style={{ textAlign:"right" }}>
            <div style={{
              color:"#b45309", fontSize:22, fontWeight:900,
              fontFamily:"'DM Mono',monospace", letterSpacing:"-0.03em",
              textShadow: hov ? "0 0 16px rgba(180,83,9,0.3)" : "none",
              transition:"text-shadow 0.3s",
            }}>
              {xpDisp.toLocaleString()}
            </div>
            <div style={{ color:"#9ca3af", fontSize:11, fontFamily:"'DM Sans',sans-serif" }}>
              {info.isMaxLevel ? "MAX LEVEL" : `/ ${info.xpNeeded.toLocaleString()} XP`}
            </div>
          </div>
        </div>

        {/* XP fill bar */}
        <div style={{
          height:11, background:"rgba(108,99,255,0.09)", borderRadius:999,
          border:"1px solid rgba(108,99,255,0.1)", overflow:"hidden", position:"relative",
        }}>
          {/* Milestone ticks at 25/50/75% */}
          {[25, 50, 75].map(m => (
            <div key={m} style={{
              position:"absolute", left:`${m}%`, top:0, bottom:0, width:1,
              background: pct >= m ? "rgba(108,99,255,0.35)" : "rgba(108,99,255,0.1)",
              zIndex:2,
            }}/>
          ))}
          {/* Fill */}
          <div style={{
            height:"100%", width:`${pct}%`, borderRadius:999,
            background:"linear-gradient(90deg,#4f46e5 0%,#6C63FF 45%,#a855f7 78%,#d97706 100%)",
            backgroundSize:"200% auto", animation:"xpShim 2.5s linear infinite",
            boxShadow:"0 0 12px rgba(108,99,255,0.5)", transition:"width 0.12s linear",
            position:"relative",
          }}>
            {/* Leading glow dot */}
            <div style={{
              position:"absolute", right:0, top:"50%",
              transform:"translate(50%,-50%)",
              width:11, height:11, borderRadius:"50%",
              background:"#d97706",
              boxShadow:"0 0 12px #d97706,0 0 24px #d9770677",
            }}/>
          </div>
        </div>

        {/* Footer: motivation + next level */}
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginTop:10 }}>
          <span style={{ color:"#9ca3af", fontSize:12, fontFamily:"'DM Sans',sans-serif", fontStyle:"italic" }}>
            {getLevelMotivation(info.percentage)}
          </span>
          <span style={{ color:"#6C63FF", fontSize:11, fontWeight:700, fontFamily:"'DM Mono',monospace" }}>
            {info.isMaxLevel ? "MAX" : `${pct}% → ${info.nextLevelName}`}
          </span>
        </div>
      </div>
    </>
  );
}