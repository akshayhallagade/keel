/// Media query for the OS-level "reduce motion" setting.
export const REDUCED_MOTION = '(prefers-reduced-motion: reduce)'

/// The other half of the pair, for gsap.matchMedia(): everything animates
/// normally unless the visitor has asked it not to. "no-preference" is the
/// right query rather than negating the one above — a browser that supports
/// neither matches neither, and animating by default is the safer fallback.
export const FULL_MOTION = '(prefers-reduced-motion: no-preference)'

/**
 * True when the visitor has asked their OS to reduce motion.
 *
 * For GSAP, prefer `gsap.matchMedia()` with the constants above — it reverts
 * whatever it set when the query stops matching. This is for the things GSAP
 * does not drive: requestAnimationFrame loops, canvas, and plain timers.
 */
export const prefersReducedMotion = () =>
  typeof window !== 'undefined' &&
  typeof window.matchMedia === 'function' &&
  window.matchMedia(REDUCED_MOTION).matches
