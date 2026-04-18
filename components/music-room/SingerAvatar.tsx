"use client";

import { AnimatePresence, motion } from "motion/react";

type SingerAvatarState = "idle" | "singing" | "excited";

type SingerAvatarProps = {
  state: SingerAvatarState;
  beatLevel: number;
};

export function SingerAvatar({ state, beatLevel }: SingerAvatarProps) {
  const isActive = state === "singing" || state === "excited";
  const mouthHeight = state === "excited" ? [4, 14, 6] : isActive ? [2, 10, 3] : 2;
  const bodyLift = state === "excited" ? [0, -16, 0] : isActive ? [0, -10, 0] : [0, -4, 0];
  const bodyRotate = state === "excited" ? [0, 4, -4, 0] : isActive ? [0, 2, -2, 0] : 0;
  const armSwing = isActive ? [0, -8 - beatLevel * 2, 0, 8 + beatLevel * 2, 0] : 0;
  const headSway = isActive ? [0, 3, -3, 0] : 0;

  return (
    <div className="relative flex flex-col items-center justify-center">
      <div className="absolute bottom-4 size-56 rounded-full bg-primary/20 blur-2xl" />

      <motion.div
        className="relative z-10 flex h-64 w-48 flex-col items-center justify-end"
        animate={{ y: bodyLift, rotate: bodyRotate }}
        transition={{
          repeat: Number.POSITIVE_INFINITY,
          duration: state === "excited" ? 0.7 : isActive ? 0.9 : 3,
          ease: "easeInOut",
        }}
      >
        <motion.div
          className="relative z-20 mb-[-10px] h-24 w-24 rounded-full bg-secondary shadow-inner"
          animate={{ rotate: headSway }}
          transition={{ repeat: Number.POSITIVE_INFINITY, duration: 1.6, ease: "easeInOut" }}
        >
          <div className="absolute left-4 top-9 h-4 w-3 rounded-full bg-foreground" />
          <div className="absolute right-4 top-9 h-4 w-3 rounded-full bg-foreground" />
          <div className="absolute left-2 top-14 h-2 w-4 rounded-full bg-primary/40 blur-sm" />
          <div className="absolute right-2 top-14 h-2 w-4 rounded-full bg-primary/40 blur-sm" />
          <motion.div
            className="absolute left-1/2 top-14 w-4 -translate-x-1/2 rounded-b-full bg-foreground"
            animate={{ height: mouthHeight }}
            transition={{ repeat: Number.POSITIVE_INFINITY, duration: state === "excited" ? 0.25 : 0.35 }}
          />
          <div className="absolute left-1/2 top-2 h-12 w-28 -translate-x-1/2 rounded-t-full border-t-4 border-primary" />
        </motion.div>

        <div className="relative z-10 h-28 w-20 overflow-hidden rounded-t-3xl bg-primary">
          <div className="absolute left-1/2 top-4 h-8 w-8 -translate-x-1/2 rounded-full bg-white/20" />
        </div>

        <motion.div
          className="absolute left-[22px] top-[94px] h-10 w-6 rounded-full bg-primary"
          animate={{ rotate: armSwing, x: isActive ? [-2, 0, -2] : 0 }}
          style={{ originY: 0 }}
          transition={{ repeat: Number.POSITIVE_INFINITY, duration: 1, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute right-[22px] top-[94px] h-10 w-6 rounded-full bg-primary"
          animate={{ rotate: Array.isArray(armSwing) ? armSwing.map((value) => value * -1) : 0, x: isActive ? [2, 0, 2] : 0 }}
          style={{ originY: 0 }}
          transition={{ repeat: Number.POSITIVE_INFINITY, duration: 1, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute bottom-0 left-[66px] h-12 w-4 rounded-full bg-primary/80"
          animate={{ rotate: isActive ? [-8, 0, 8, 0] : 0 }}
          style={{ originY: 0 }}
          transition={{ repeat: Number.POSITIVE_INFINITY, duration: 1.2, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute bottom-0 right-[66px] h-12 w-4 rounded-full bg-primary/80"
          animate={{ rotate: isActive ? [8, 0, -8, 0] : 0 }}
          style={{ originY: 0 }}
          transition={{ repeat: Number.POSITIVE_INFINITY, duration: 1.2, ease: "easeInOut" }}
        />

        <AnimatePresence>
          {isActive ? (
            <motion.div
              key={state}
              className="absolute -right-10 -top-6 text-primary"
              initial={{ opacity: 0, y: 12, scale: 0.6 }}
              animate={{ opacity: [0, 1, 0], y: -40, scale: 1, rotate: 10 }}
              exit={{ opacity: 0 }}
              transition={{ repeat: Number.POSITIVE_INFINITY, duration: 2 }}
            >
              <span className="text-2xl">♪</span>
            </motion.div>
          ) : null}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
