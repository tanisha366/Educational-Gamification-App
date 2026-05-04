// src/components/rewards/BadgeUnlockModal.jsx
import { useEffect, useState, useRef, useCallback } from "react";
import BadgeIcon from "./BadgeIcon";
import { useToast } from "../../context/ToastContext";
import { RARITY } from "../../mocks/badgeMock";

/* ── 8 light rays burst outward ── */
function Rays({ active, color }) {
  return (
    <>
      <style>{`
        @keyframes rayOut { 0%{transform:rotate(var(--ra)) scaleY(0);opacity:0} 25%{opacity:.55} 100%{transform:rotate(var(--ra)) scaleY(1);opacity:0} }
      `}</style>
      <div style={{position:"absolute",inset:0,display:"flex",alignItems:"center",justifyContent:"center",pointerEvents:"none",zIndex:1}}>
        {Array.from({length:8},(_,i)=>(
          <div key={i} style={{position:"absolute",width:2,height:"45%",bottom:"50%",left:"calc(50% - 1px)",
            transformOrigin:"bottom center","--ra":`${i*45}deg`,
            background:`linear-gradient(to top,${color}99,transparent)`,
            animation:active?`rayOut 0.7s ease-out ${0.8+i*.015}s both`:"none",borderRadius:999}}/>
        ))}
      </div>
    </>
  );
}

/* ── CSS confetti fallback ── */
function CSSConfetti({ active }) {
  const items = Array.from({length:28},(_,i)=>({
    id:i, x:4+Math.random()*92, delay:Math.random()*1.3, dur:2+Math.random()*2.2,
    size:5+Math.random()*9, color:["#6C63FF","#FFD700","#3B82F6","#8B5CF6","#22c55e"][i%5],
    rot:Math.random()*360, wob:(Math.random()-.5)*55,
  }));
  if (!active) return null;
  return (
    <>
      <style>{`@keyframes cFall{0%{transform:translateY(-18px) rotate(0deg)}100%{transform:translateY(680px) rotate(var(--r)) translateX(var(--w))}}`}</style>
      {items.map(c=>(
        <div key={c.id} style={{position:"fixed",left:`${c.x}%`,top:0,width:c.size,height:c.size*.45,
          background:c.color,borderRadius:2,opacity:.85,"--r":`${c.rot}deg`,"--w":`${c.wob}px`,
          animation:`cFall ${c.dur}s ease-in ${c.delay}s both`,pointerEvents:"none",zIndex:10002}}/>
      ))}
    </>
  );
}

export default function BadgeUnlockModal({ badge, onClose }) {
  const { showToast } = useToast();
  // Phase: 0=hidden 1=overlay 2=badge-bounce 3=rays 4=text+confetti
  const [phase, setPhase]   = useState(0);
  const [gone,  setGone]    = useState(false);
  const timers = useRef([]);

  const clear = () => timers.current.forEach(clearTimeout);

  useEffect(() => {
    if (!badge) return;
    setPhase(0); setGone(false);
    const add = (fn, ms) => { const t = setTimeout(fn, ms); timers.current.push(t); };
    add(()=>setPhase(1),  20);    // overlay in
    add(()=>setPhase(2),  300);   // badge bounces
    add(()=>setPhase(3),  800);   // rays burst
    add(()=>setPhase(4),  1200);  // text + confetti
    add(()=>{ if(window.confetti) window.confetti({particleCount:150,spread:70,origin:{y:.6},colors:["#FFD700","#8B5CF6","#3B82F6"]}); }, 1300);
    add(()=>dismiss(),    4000);  // auto-dismiss
    return clear;
  }, [badge]);

  useEffect(() => { if (phase===4) showToast(`${badge?.name} badge unlocked!`, "badge"); }, [phase]);

  const dismiss = useCallback(() => {
    if (gone) return; setGone(true); clear();
    setPhase(0); setTimeout(()=>{ onClose?.(); window.dispatchEvent(new Event("badge:dismissed")); }, 320);
  }, [gone, onClose]);

  if (!badge) return null;
  const r = RARITY[badge.rarity] ?? RARITY.common;

  return (
    <>
      <style>{`
        @keyframes mOvIn    { from{opacity:0}     to{opacity:1} }
        @keyframes mOvOut   { from{opacity:1}     to{opacity:0} }
        @keyframes mCardIn  { 0%{transform:scale(0) rotate(-10deg);opacity:0} 65%{transform:scale(1.22) rotate(4deg)} 80%{transform:scale(.96)} 100%{transform:scale(1);opacity:1} }
        @keyframes mCardOut { from{transform:scale(1);opacity:1} to{transform:scale(.78) translateY(24px);opacity:0} }
        @keyframes mTextIn  { from{opacity:0;transform:translateY(14px)} to{opacity:1;transform:translateY(0)} }
        @keyframes mGlowRing{ 0%,100%{box-shadow:0 0 24px var(--rc)66} 50%{box-shadow:0 0 56px var(--rc)aa,0 0 100px var(--rc)33} }
        @keyframes mPrisma  { 0%{background-position:0% 50%} 100%{background-position:300% 50%} }
        @keyframes mBtnPulse{ 0%,100%{box-shadow:0 4px 20px rgba(108,99,255,.35)} 50%{box-shadow:0 8px 40px rgba(108,99,255,.6)} }
      `}</style>

      <CSSConfetti active={phase>=4}/>

      {/* Overlay */}
      <div onClick={dismiss}
        style={{position:"fixed",inset:0,zIndex:10000,
          background:"rgba(0,0,0,0.15)",backdropFilter:"blur(14px)",
          display:"flex",alignItems:"center",justifyContent:"center",padding:20,
          animation:phase>=1?"mOvIn .28s ease forwards":"mOvOut .3s ease forwards",
          opacity:phase>=1?1:0}}>

        {/* Card */}
        <div onClick={e=>e.stopPropagation()}
          style={{
            background:"linear-gradient(160deg,#ffffff 0%,#f9f9ff 60%,#f0f8ff 100%)",
            border:`1px solid ${r.strokeHex}22`,borderRadius:28,
            padding:"44px 36px",maxWidth:440,width:"100%",textAlign:"center",
            position:"relative",overflow:"hidden",
            boxShadow:`0 20px 60px rgba(0,0,0,0.08),0 0 0 1px rgba(108,99,255,0.1),0 0 40px ${r.glowHex}33`,
            animation:phase>=2?"mCardIn .6s cubic-bezier(0.34,1.56,0.64,1) forwards":"mCardOut .3s ease-in forwards",
            opacity:phase>=2?1:0,
          }}>

          {/* Prismatic top bar */}
          <div style={{position:"absolute",top:0,left:0,right:0,height:3,
            background:"linear-gradient(90deg,#6C63FF,#8B5CF6,#3B82F6,#F59E0B,#22c55e,#6C63FF)",
            backgroundSize:"300% auto",animation:"mPrisma 3.5s linear infinite"}}/>

          <Rays active={phase>=3} color={r.strokeHex}/>

          {/* Close */}
          <button onClick={dismiss}
            style={{position:"absolute",top:14,right:14,background:"rgba(108,99,255,0.08)",
              border:"1px solid rgba(108,99,255,0.2)",borderRadius:8,color:"#6b7280",
              cursor:"pointer",padding:7,display:"flex",transition:"all .2s"}}
            onMouseEnter={e=>{e.currentTarget.style.background="rgba(108,99,255,0.15)";e.currentTarget.style.color="#1e1b4b";}}
            onMouseLeave={e=>{e.currentTarget.style.background="rgba(108,99,255,0.08)";e.currentTarget.style.color="#6b7280";}}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>

          {/* Eyebrow */}
          <div style={{fontSize:10,fontWeight:800,letterSpacing:"0.22em",textTransform:"uppercase",
            fontFamily:"'DM Mono',monospace",color:r.strokeHex,marginBottom:8,
            textShadow:`0 0 8px ${r.strokeHex}22`,position:"relative",zIndex:2}}>
            ✦ New Badge Unlocked ✦
          </div>

          {/* Badge with glow ring */}
          <div style={{display:"flex",justifyContent:"center",margin:"20px 0 24px",position:"relative",zIndex:2,
            "--rc":r.strokeHex,animation:phase>=3?"mGlowRing 2s ease-in-out infinite":"none",
            borderRadius:"50%",padding:14,
            background:`radial-gradient(circle,${r.glowHex} 0%,transparent 65%)`}}>
            <BadgeIcon badge={badge} size={96} earned animated/>
          </div>

          {/* Text appears at phase 4 */}
          {phase>=4 && <>
            <h2 style={{color:"#1e1b4b",fontSize:24,fontWeight:900,fontFamily:"'DM Sans',sans-serif",
              letterSpacing:"-0.02em",marginBottom:8,
              animation:"mTextIn .5s ease both",textShadow:`0 0 8px ${r.glowHex}22`,position:"relative",zIndex:2}}>
              {badge.name}
            </h2>
            <p style={{color:"#6b7280",fontSize:13,lineHeight:1.65,fontFamily:"'DM Sans',sans-serif",
              margin:"0 auto 22px",maxWidth:320,animation:"mTextIn .5s ease .07s both",position:"relative",zIndex:2}}>
              {badge.description}
            </p>
            <div style={{display:"inline-flex",alignItems:"center",gap:8,
              background:"rgba(255,215,0,0.07)",border:"1px solid rgba(255,215,0,0.22)",
              borderRadius:999,padding:"9px 22px",marginBottom:26,
              animation:"mTextIn .5s ease .14s both",position:"relative",zIndex:2}}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#FFD700" strokeWidth="2.5" strokeLinecap="round"><polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26"/></svg>
              <span style={{color:"#FFD700",fontSize:16,fontWeight:900,fontFamily:"'DM Mono',monospace"}}>+{badge.xpReward} XP</span>
            </div>
            <button onClick={dismiss}
              style={{width:"100%",padding:"14px",background:"linear-gradient(135deg,#6C63FF,#4f46e5)",
                border:"none",borderRadius:14,color:"#fff",fontSize:15,fontWeight:800,
                fontFamily:"'DM Sans',sans-serif",cursor:"pointer",letterSpacing:".02em",
                boxShadow:"0 4px 20px rgba(108,99,255,.4),inset 0 1px 0 rgba(255,255,255,.18)",
                animation:"mBtnPulse 2.5s ease-in-out 1s infinite",transition:"all .25s ease",
                position:"relative",zIndex:2}}
              onMouseEnter={e=>{e.currentTarget.style.transform="translateY(-3px)";e.currentTarget.style.boxShadow="0 10px 36px rgba(108,99,255,.6)";}}
              onMouseLeave={e=>{e.currentTarget.style.transform="";e.currentTarget.style.boxShadow="";}}>
              Awesome! Continue →
            </button>
            <div style={{marginTop:10,color:"#9ca3af",fontSize:11,fontFamily:"'DM Mono',monospace",position:"relative",zIndex:2}}>
              Tap anywhere or wait to dismiss
            </div>
          </>}
        </div>
      </div>
    </>
  );
}

// For Nimrit to call from quiz result page:
export function triggerBadgeUnlock(badge) {
  window.dispatchEvent(new CustomEvent("badge:unlock", { detail: badge }));
}
export function triggerBadgeUnlockQueue(badgeArr = []) {
  let i = 0;
  const next = () => { if (i < badgeArr.length) { triggerBadgeUnlock(badgeArr[i++]); window.addEventListener("badge:dismissed", next, { once: true }); } };
  next();
}