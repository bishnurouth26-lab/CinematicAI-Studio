/**
 * Creator OS - Cinematic Design System
 * Defines reusable primitives for styling, motion, and interaction.
 */

// 1. Core Framer Motion Presets
export const motionPresets = {
  fadeUp: {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -20 },
    transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] }
  },
  scaleIn: {
    initial: { opacity: 0, scale: 0.95, filter: 'blur(10px)' },
    animate: { opacity: 1, scale: 1, filter: 'blur(0px)' },
    exit: { opacity: 0, scale: 1.05, filter: 'blur(10px)' },
    transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] }
  },
  slideInRight: {
    initial: { opacity: 0, x: 20 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -20 },
    transition: { duration: 0.4, ease: [0.16, 1, 0.3, 1] }
  }
};

// 2. Class Name Tokens (Tailwind)
export const designTokens = {
  glassCard: "bg-white/[0.02] border border-white/[0.05] rounded-3xl backdrop-blur-xl shadow-[0_4px_30px_rgba(0,0,0,0.1)]",
  glassCardHover: "hover:bg-white/[0.04] hover:border-white/[0.1] hover:-translate-y-1 transition-all duration-500",
  primaryButton: "px-6 py-3 bg-white text-obsidian rounded-full font-bold hover:bg-white/90 transition-all shadow-[0_0_20px_rgba(255,255,255,0.2)]",
  secondaryButton: "px-6 py-3 bg-white/10 text-white rounded-full font-medium hover:bg-white/20 border border-white/10 transition-all",
  dangerButton: "px-6 py-3 bg-red-500/10 text-red-400 rounded-full font-medium hover:bg-red-500/20 border border-red-500/20 transition-all",
  textHeading: "font-display text-white tracking-wide",
  textBodyLg: "font-sans text-white/80 leading-relaxed",
  textBodySm: "font-sans text-sm text-white/60 leading-relaxed",
  textMicro: "font-mono text-[10px] uppercase tracking-[0.2em] text-white/40",
  inputField: "w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-white/30 focus:outline-none focus:ring-1 focus:ring-cyan-glow/50 transition-all"
};

// 3. Staggered Animation Wrapper Hook Setup
export const createStagger = (delayAmount: number = 0.05) => ({
  initial: "initial",
  animate: "animate",
  exit: "exit",
  variants: {
    animate: {
      transition: {
        staggerChildren: delayAmount
      }
    }
  }
});
