"use client";

import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";

export default function PageLoader({ label = "Loading..." }: { label?: string }) {
  return (
    <div className="flex flex-col items-center justify-center h-[60vh] gap-5">
      <div className="relative w-16 h-16 flex items-center justify-center">
        <motion.div
          animate={{ scale: [1, 1.25, 1], opacity: [0.35, 0.7, 0.35] }}
          transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
          className="absolute inset-0 rounded-2xl bg-gradient-to-br from-accent to-accent2 blur-xl"
        />
        <motion.span
          animate={{ rotate: 360 }}
          transition={{ duration: 2.4, repeat: Infinity, ease: "linear" }}
          className="relative flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-accent to-accent2 shadow-glow"
        >
          <motion.span
            animate={{ scale: [1, 1.15, 1] }}
            transition={{ duration: 1.2, repeat: Infinity, ease: "easeInOut" }}
          >
            <Sparkles size={26} className="text-bg" />
          </motion.span>
        </motion.span>
      </div>
      <motion.p
        animate={{ opacity: [0.4, 1, 0.4] }}
        transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}
        className="text-sm text-slate-400"
      >
        {label}
      </motion.p>
    </div>
  );
}
