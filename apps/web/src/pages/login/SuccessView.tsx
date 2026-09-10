import { useEffect, useRef } from 'react'
import gsap from 'gsap'

/// How long the progress bar takes to fill before continuing on its own.
const AUTO_CONTINUE_S = 2.4

/**
 * What replaces the form once the user is signed in: a checkmark that draws
 * itself, the headline, and a progress bar that continues into the app when it
 * fills. The CONTINUE button skips the wait.
 *
 * This only mounts when sign-in has succeeded, so mounting *is* the trigger —
 * which is why the `prevSuccessRef` the old inline version needed to detect the
 * false → true edge is gone.
 */
export default function SuccessView({
  isReturning,
  onContinue,
}: {
  isReturning: boolean
  onContinue: () => void
}) {
  const markRef = useRef<HTMLDivElement>(null)
  const ringRef = useRef<HTMLDivElement>(null)
  const checkPathRef = useRef<SVGPathElement>(null)
  const headRef = useRef<HTMLDivElement>(null)
  const subRef = useRef<HTMLDivElement>(null)
  const ctaRef = useRef<HTMLButtonElement>(null)
  const progressRef = useRef<HTMLDivElement>(null)

  // Held in a ref so restarting the animation never depends on the identity of
  // the callback the parent passes in.
  const onContinueRef = useRef(onContinue)
  useEffect(() => {
    onContinueRef.current = onContinue
  })

  useEffect(() => {
    const path = checkPathRef.current
    if (path) {
      // Hide the tick by offsetting its dash by its own length, then animate
      // the offset to zero so it appears to be drawn.
      const len = path.getTotalLength()
      gsap.set(path, { strokeDasharray: len, strokeDashoffset: len })
    }

    const tl = gsap
      .timeline()
      .fromTo(
        markRef.current,
        { scale: 0, opacity: 0 },
        { scale: 1, opacity: 1, duration: 0.35, ease: 'power2.out' },
      )
      .to(
        path,
        { strokeDashoffset: 0, duration: 0.35, ease: 'power2.out' },
        0.1,
      )
      .to(
        ringRef.current,
        { scale: 1.4, opacity: 0, duration: 0.6, ease: 'power2.out' },
        0.25,
      )
      .fromTo(
        headRef.current,
        { opacity: 0, y: 6 },
        { opacity: 1, y: 0, duration: 0.3, ease: 'power2.out' },
        0.3,
      )
      .fromTo(
        subRef.current,
        { opacity: 0, y: 6 },
        { opacity: 1, y: 0, duration: 0.3, ease: 'power2.out' },
        0.38,
      )
      .fromTo(
        ctaRef.current,
        { opacity: 0, y: 6 },
        { opacity: 1, y: 0, duration: 0.3, ease: 'power2.out' },
        0.46,
      )

    const bar = gsap.fromTo(
      progressRef.current,
      { width: '0%' },
      {
        width: '100%',
        duration: AUTO_CONTINUE_S,
        ease: 'none',
        delay: 0.5,
        onComplete: () => onContinueRef.current(),
      },
    )

    return () => {
      tl.kill()
      bar.kill()
    }
  }, [])

  return (
    <div className="success-view">
      <div className="success-mark" ref={markRef}>
        <div className="success-ring" ref={ringRef} />
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
          <path
            ref={checkPathRef}
            d="M5 12.5L10 17.5L19 7"
            stroke="#FAF8F3"
            strokeWidth="2.4"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>

      <div className="success-headline" ref={headRef}>
        {isReturning ? 'You’re in' : 'Account created'}
      </div>
      <div className="success-sub" ref={subRef}>
        {isReturning
          ? 'Good to see you again.'
          : 'Welcome to Keel — let’s set things up.'}
      </div>

      {/* A real button, not a div with role="button": the previous version had
          no key handler, so Enter and Space did nothing. */}
      <button
        type="button"
        className="success-cta"
        ref={ctaRef}
        onClick={onContinue}
      >
        CONTINUE &rarr;
      </button>

      <div className="success-track">
        <div className="success-progress" ref={progressRef} />
      </div>
    </div>
  )
}
