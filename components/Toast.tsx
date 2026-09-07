"use client";

import { createContext, useCallback, useContext, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { CheckCircle2, XCircle, Info } from "lucide-react";

type ToastType = "success" | "error" | "info";
type ToastItem = { id: number; message: string; type: ToastType };

const ToastContext = createContext<{ push: (message: string, type?: ToastType) => void } | null>(null);

let idCounter = 0;

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const push = useCallback((message: string, type: ToastType = "success") => {
    const id = ++idCounter;
    setToasts((t) => [...t, { id, message, type }]);
    setTimeout(() => {
      setToasts((t) => t.filter((x) => x.id !== id));
    }, 3200);
  }, []);

  return (
    <ToastContext.Provider value={{ push }}>
      {children}
      <div className="fixed top-5 left-1/2 -translate-x-1/2 z-[100] flex flex-col gap-2 items-center pointer-events-none">
        <AnimatePresence>
          {toasts.map((t) => (
            <motion.div
              key={t.id}
              layout
              initial={{ opacity: 0, y: -20, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -16, scale: 0.9, transition: { duration: 0.2 } }}
              transition={{ type: "spring", stiffness: 320, damping: 26 }}
              className={`pointer-events-auto glass rounded-xl px-4 py-3 flex items-center gap-2.5 shadow-lg border max-w-xs ${
                t.type === "success" ? "border-good/40" : t.type === "error" ? "border-red-500/40" : "border-accent2/40"
              }`}
            >
              {t.type === "success" && <CheckCircle2 size={16} className="text-good shrink-0" />}
              {t.type === "error" && <XCircle size={16} className="text-red-400 shrink-0" />}
              {t.type === "info" && <Info size={16} className="text-accent2 shrink-0" />}
              <span className="text-xs text-slate-200 leading-snug">{t.message}</span>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used within <ToastProvider>");
  return {
    success: (msg: string) => ctx.push(msg, "success"),
    error: (msg: string) => ctx.push(msg, "error"),
    info: (msg: string) => ctx.push(msg, "info"),
  };
}
