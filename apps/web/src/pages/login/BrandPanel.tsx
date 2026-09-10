import { useEffect, useRef, useState } from 'react'
import gsap from 'gsap'
import LogoMark from '../../components/LogoMark'

const QUOTES = [
  {
    text: 'You do not rise to the level of your goals. You fall to the level of your systems.',
    author: 'JAMES CLEAR',
  },
  {
    text: 'Small habits, compounded, build the life you want.',
    author: 'A KEEL MEMBER',
  },
  { text: 'What gets scheduled gets done.', author: 'KEEL' },
]

/// How long each quote stays before the next fades in.
const QUOTE_MS = 7000

const MOTE_COUNT = 48

/**
 * The dark left half of the sign-in screen: logo, a rotating quote, a tagline,
 * and a drift of pale motes behind them.
 *
 * It shares no state with the form beside it — it only needs to start its
 * entrance at the same moment — so it owns its own three animations rather
 * than threading five refs and a quote index back up into Login.
 */
export default function BrandPanel() {
  const [quoteIndex, setQuoteIndex] = useState(0)

  const canvasRef = useRef<HTMLCanvasElement>(null)
  const logoMarkRef = useRef<SVGSVGElement>(null)
  const logoRef = useRef<HTMLDivElement>(null)
  const quoteRef = useRef<HTMLDivElement>(null)
  const tagRef = useRef<HTMLDivElement>(null)

  // Entrance, then the logo breathes on a loop.
  useEffect(() => {
    const tl = gsap
      .timeline()
      .fromTo(
        logoRef.current,
        { opacity: 0, y: -6 },
        { opacity: 1, y: 0, duration: 0.4, ease: 'power2.out' },
        0,
      )
      .fromTo(
        quoteRef.current,
        { opacity: 0, y: 10 },
        { opacity: 1, y: 0, duration: 0.5, ease: 'power2.out' },
        0.1,
      )
      .fromTo(
        tagRef.current,
        { opacity: 0 },
        { opacity: 1, duration: 0.4, ease: 'power2.out' },
        0.3,
      )

    const idleTween = gsap.to(logoMarkRef.current, {
      scale: 1.06,
      duration: 2.6,
      ease: 'sine.inOut',
      repeat: -1,
      yoyo: true,
      transformOrigin: '50% 50%',
    })

    return () => {
      tl.kill()
      idleTween.kill()
    }
  }, [])

  // Motes drifting up the panel.
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    let raf = 0
    let t = 0
    // x/y are 0–1 of the panel, so a resize needs no recalculation.
    // s is rise speed, a is base opacity, ph offsets each mote's sway and
    // twinkle so they do not pulse in unison.
    const motes = Array.from({ length: MOTE_COUNT }, () => ({
      x: Math.random(),
      y: Math.random(),
      r: Math.random() * 1.8 + 0.6,
      s: Math.random() * 0.0009 + 0.0003,
      a: Math.random() * 0.28 + 0.08,
      ph: Math.random() * 6.28,
    }))

    const loop = () => {
      raf = requestAnimationFrame(loop)
      const panel = canvas.parentElement
      if (!panel) return

      const w = panel.clientWidth
      const h = panel.clientHeight
      const dpr = window.devicePixelRatio || 1
      if (canvas.width !== w * dpr || canvas.height !== h * dpr) {
        canvas.width = w * dpr
        canvas.height = h * dpr
      }

      const ctx = canvas.getContext('2d')
      if (!ctx) return
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      ctx.clearRect(0, 0, w, h)

      t += 0.016
      for (const p of motes) {
        p.y -= p.s
        // Off the top: drop it back below the bottom in a new column.
        if (p.y < -0.02) {
          p.y = 1.02
          p.x = Math.random()
        }
        const x = (p.x + Math.sin(t * 0.4 + p.ph) * 0.012) * w
        ctx.beginPath()
        ctx.arc(x, p.y * h, p.r, 0, Math.PI * 2)
        // --canvas, written out because a 2D context cannot read a CSS var.
        ctx.fillStyle = `rgba(237,234,227,${p.a * (0.7 + 0.3 * Math.sin(t * 1.5 + p.ph))})`
        ctx.fill()
      }
    }

    loop()
    return () => cancelAnimationFrame(raf)
  }, [])

  // Fade the quote out, swap the text, fade it back in.
  useEffect(() => {
    const id = setInterval(() => {
      const el = quoteRef.current
      if (!el) return
      gsap.to(el, {
        opacity: 0,
        duration: 0.35,
        ease: 'power2.in',
        onComplete: () => {
          setQuoteIndex((i) => (i + 1) % QUOTES.length)
          // Wait for the new text to paint before fading in, or the swap shows.
          requestAnimationFrame(() =>
            gsap.to(el, { opacity: 1, duration: 0.4, ease: 'power2.out' }),
          )
        },
      })
    }, QUOTE_MS)
    return () => clearInterval(id)
  }, [])

  const quote = QUOTES[quoteIndex]

  return (
    <div className="brand-panel">
      <canvas className="brand-canvas" ref={canvasRef} aria-hidden="true" />

      <div className="brand-logo" ref={logoRef}>
        <LogoMark
          ref={logoMarkRef}
          className="logo-mark"
          size={25}
          strokeColor="#FAF8F3"
        />
        <div className="logo-word">KEEL</div>
      </div>

      <div className="brand-quote" ref={quoteRef}>
        <div className="quote-text">&ldquo;{quote.text}&rdquo;</div>
        <div className="quote-author">&mdash; {quote.author}</div>
      </div>

      <div className="brand-tag" ref={tagRef}>
        A CALM PLACE FOR TODOS, ROUTINES, GOALS &amp; MONEY
      </div>
    </div>
  )
}
