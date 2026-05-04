// src/context/ToastContext.jsx
import { createContext, useContext, useState, useCallback, useRef } from "react";
const Ctx = createContext(null);
let _id = 0;
export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);
  const timers = useRef({});
  const remove = useCallback((id) => {
    setToasts(p => p.map(t => t.id === id ? { ...t, exiting: true } : t));
    setTimeout(() => { setToasts(p => p.filter(t => t.id !== id)); delete timers.current[id]; }, 420);
  }, []);
  const showToast = useCallback((message, type = "info", opts = {}) => {
    const id = ++_id;
    setToasts(p => [...p, { id, message, type, exiting: false, ...opts }]);
    timers.current[id] = setTimeout(() => remove(id), opts.duration || 3500);
    return id;
  }, [remove]);
  const dismissToast = useCallback((id) => {
    clearTimeout(timers.current[id]); delete timers.current[id]; remove(id);
  }, [remove]);
  return <Ctx.Provider value={{ toasts, showToast, dismissToast }}>{children}</Ctx.Provider>;
}
export const useToast = () => { const c = useContext(Ctx); if (!c) throw new Error("Need ToastProvider"); return c; };
export default Ctx;