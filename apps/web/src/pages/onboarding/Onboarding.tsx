import { useEffect, useRef, useState } from 'react'
import gsap from 'gsap'
import type { User } from '@keel/types'
import LogoMark from '../../components/LogoMark'
import type { UpdateProfileInput } from '@keel/validation'
import { updateMe } from '../../api/users'
import { FULL_MOTION, prefersReducedMotion } from '../../lib/motion'
import './Onboarding.css'

interface Question {
  id: string
  kicker: string
  headline: string
  sub: string
  options: string[]
}

const QUESTIONS: Question[] = [
  {
    id: 'role',
    kicker: 'ABOUT YOU',
    headline: 'What best describes you right now?',
    sub: 'Keel bends around your life, not the other way around.',
    options: [
      'Working professional',
      'Student',
      'Homemaker',
      'Freelancer / self-employed',
      'Retired',
      'Between jobs',
    ],
  },
  {
    id: 'living',
    kicker: 'ABOUT YOU',
    headline: 'What’s your living situation?',
    sub: 'This helps us suggest the right routines and shared expenses.',
    options: [
      'Living alone',
      'With family',
      'With roommates',
      'With partner / spouse',
    ],
  },
  {
    id: 'money',
    kicker: 'MONEY',
    headline: 'How would you describe your money habits?',
    sub: 'No judgment — we’ll match the level of detail to you.',
    options: [
      'I track every rupee',
      'I check in occasionally',
      'I just want a big-picture view',
      'I’m just getting started with tracking',
    ],
  },
  {
    id: 'invest',
    kicker: 'MONEY',
    headline: 'Do you invest currently?',
    sub: 'We’ll shape the money view around where you are today.',
    options: [
      'Yes, actively (stocks, mutual funds, etc.)',
      'Just PF / basic savings',
      'Not yet, but interested',
      'Not something I track',
    ],
  },
  {
    id: 'organized',
    kicker: 'ROUTINES & TASKS',
    headline: 'How organized do you feel about your routines and tasks?',
    sub: 'Honest answers make better defaults.',
    options: [
      'Pretty on top of things',
      'Somewhere in between',
      'Honestly, kind of scattered',
      'Just want to start fresh',
    ],
  },
  {
    id: 'hobbies',
    kicker: 'INTERESTS',
    headline: 'What kind of hobbies or interests do you want to track?',
    sub: 'Keel can hold the fun parts of life too.',
    options: [
      'Reading',
      'Fitness / wellness',
      'Creative pursuits',
      'Multiple things',
      'Not really into hobby-tracking',
    ],
  },
  {
    id: 'reminders',
    kicker: 'NOTIFICATIONS',
    headline: 'How do you like to be reminded of things?',
    sub: 'We default to quiet. You choose how quiet.',
    options: [
      'Frequent nudges',
      'One daily summary',
      'Only when something’s urgent',
      'I’ll check the app myself',
    ],
  },
  {
    id: 'goal',
    kicker: 'YOUR GOAL',
    headline: 'What’s your biggest goal with Keel right now?',
    sub: 'One thing to point the keel at — you can change it anytime.',
    options: [
      'Get my finances in order',
      'Stay on top of daily life',
      'Build better habits',
      'Just explore and see what fits',
    ],
  },
]

/// Question ids in QUESTIONS map to the user columns the API expects.
const FIELD_FOR_QUESTION: Record<string, keyof UpdateProfileInput> = {
  role: 'occupation',
  living: 'livingSituation',
  money: 'moneyHabits',
  invest: 'investing',
  organized: 'organization',
  hobbies: 'hobbyInterest',
  reminders: 'reminderStyle',
  goal: 'primaryGoal',
}

interface OnboardingProps {
  onComplete?: (user: User) => void
}

export default function Onboarding({ onComplete }: OnboardingProps) {
  const [step, setStep] = useState(1)
  const [answers, setAnswers] = useState<Record<string, string>>({})
  const [saving, setSaving] = useState(false)

  const wipeRef = useRef<HTMLDivElement>(null)
  const bodyRef = useRef<HTMLDivElement>(null)
  const kickerRef = useRef<HTMLDivElement>(null)
  const headlineRef = useRef<HTMLDivElement>(null)
  const subRef = useRef<HTMLDivElement>(null)
  const optionsRef = useRef<HTMLDivElement>(null)
  const nextBtnRef = useRef<HTMLButtonElement>(null)
  const prevStepRef = useRef(1)

  const question = QUESTIONS[step - 1]
  const picked = answers[question.id]

  // Entrance and question-to-question transitions. Both are decoration: the
  // question is readable either way, so reduced motion skips them and the
  // elements render where they belong.
  useEffect(() => {
    const mm = gsap.matchMedia()
    mm.add(FULL_MOTION, () => {
      const tl = gsap
        .timeline()
        .fromTo(
          kickerRef.current,
          { opacity: 0, y: 8 },
          { opacity: 1, y: 0, duration: 0.35, ease: 'power2.out' },
          0,
        )
        .fromTo(
          headlineRef.current,
          { opacity: 0, y: 10 },
          { opacity: 1, y: 0, duration: 0.4, ease: 'power2.out' },
          0.08,
        )
        .fromTo(
          subRef.current,
          { opacity: 0, y: 10 },
          { opacity: 1, y: 0, duration: 0.4, ease: 'power2.out' },
          0.15,
        )
        .fromTo(
          optionsRef.current ? Array.from(optionsRef.current.children) : [],
          { opacity: 0, y: 12 },
          {
            opacity: 1,
            y: 0,
            duration: 0.35,
            ease: 'power2.out',
            stagger: 0.05,
          },
          0.22,
        )
      return () => {
        tl.kill()
      }
    })
    return () => mm.revert()
  }, [])

  useEffect(() => {
    const prev = prevStepRef.current
    if (prev !== step && !prefersReducedMotion()) {
      const dir = step > prev ? 1 : -1
      gsap.fromTo(
        bodyRef.current,
        { opacity: 0, x: dir * 20 },
        { opacity: 1, x: 0, duration: 0.3, ease: 'power2.out' },
      )
      requestAnimationFrame(() => {
        gsap.fromTo(
          optionsRef.current ? Array.from(optionsRef.current.children) : [],
          { opacity: 0, y: 10 },
          {
            opacity: 1,
            y: 0,
            duration: 0.3,
            ease: 'power2.out',
            stagger: 0.04,
          },
        )
      })
    }
    prevStepRef.current = step
  }, [step])

  const [saveError, setSaveError] = useState('')

  const finish = () => {
    if (saving) return
    setSaving(true)
    setSaveError('')

    const payload: UpdateProfileInput = { completeOnboarding: true }
    for (const [questionId, value] of Object.entries(answers)) {
      const field = FIELD_FOR_QUESTION[questionId]
      if (field) payload[field] = value as never
    }

    updateMe(payload)
      .then(runFinishAnimation)
      .catch(() => {
        // Keep the user on the last question rather than dropping them into a
        // half-onboarded home screen.
        setSaveError('Could not save your answers. Check your connection.')
      })
      .finally(() => setSaving(false))
  }

  /// Covers the handoff into the app. The wipe is decoration but the `call` at
  /// the end is not — skipping the timeline outright would strand the user on
  /// the last question after their answers had already saved.
  const runFinishAnimation = (user: User) => {
    if (prefersReducedMotion()) {
      gsap.set(wipeRef.current, { opacity: 1, pointerEvents: 'auto' })
      onComplete?.(user)
      return
    }

    gsap
      .timeline()
      .to(nextBtnRef.current, {
        scale: 0.96,
        duration: 0.08,
        yoyo: true,
        repeat: 1,
        ease: 'power1.inOut',
      })
      .to(wipeRef.current, {
        opacity: 1,
        pointerEvents: 'auto',
        duration: 0.4,
        ease: 'power2.in',
      })
      .call(() => onComplete?.(user))
  }

  const back = () => {
    if (step > 1) setStep((s) => s - 1)
  }

  const skip = () => finish()

  const next = () => {
    if (!picked) return
    if (step < QUESTIONS.length) setStep((s) => s + 1)
    else finish()
  }

  const pick = (title: string) => {
    setAnswers((prev) => ({ ...prev, [question.id]: title }))
  }

  return (
    <div className="onboarding-page">
      <div className="ob-wipe" ref={wipeRef} />

      <div className="ob-header">
        <div className="ob-brand">
          <LogoMark size={22} />
          <div className="ob-brand-word">KEEL</div>
        </div>
        <div className="ob-step-label">
          QUESTION 0{step} / {QUESTIONS.length}
        </div>
      </div>

      <div className="ob-progress">
        {QUESTIONS.map((q, i) => (
          <div
            key={q.id}
            className="ob-progress-seg"
            style={{ background: i < step ? '#C64F3B' : '#E5E0D6' }}
          />
        ))}
      </div>

      <div className="ob-main">
        <div className="ob-body" ref={bodyRef}>
          <div className="ob-kicker" ref={kickerRef}>
            {question.kicker}
          </div>
          <div className="ob-headline" ref={headlineRef}>
            {question.headline}
          </div>
          <div className="ob-sub" ref={subRef}>
            {question.sub}
          </div>

          <div className="ob-options" ref={optionsRef}>
            {question.options.map((title) => {
              const selected = picked === title
              return (
                <button
                  type="button"
                  key={title}
                  className={`ob-option${selected ? ' is-selected' : ''}`}
                  onClick={() => pick(title)}
                >
                  <div className="ob-option-radio">
                    <div className="ob-option-dot" />
                  </div>
                  <div className="ob-option-title">{title}</div>
                </button>
              )
            })}
          </div>

          {saveError && (
            <div
              role="alert"
              style={{
                color: '#C64F3B',
                font: '500 11px "IBM Plex Mono",monospace',
                letterSpacing: '.06em',
                marginBottom: 12,
              }}
            >
              {saveError}
            </div>
          )}

          <div className="ob-nav">
            <button
              type="button"
              className="ob-back"
              onClick={back}
              style={{
                opacity: step === 1 ? 0 : 1,
                pointerEvents: step === 1 ? 'none' : 'auto',
              }}
            >
              &larr; BACK
            </button>
            <div className="ob-nav-right">
              <button type="button" className="ob-skip" onClick={skip}>
                SKIP
              </button>
              <button
                type="button"
                className="ob-next"
                ref={nextBtnRef}
                onClick={next}
                disabled={saving}
                style={{ opacity: picked && !saving ? 1 : 0.5 }}
              >
                {saving
                  ? 'SAVING…'
                  : step === QUESTIONS.length
                    ? 'ENTER KEEL →'
                    : 'CONTINUE →'}
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="ob-footnote">
        YOU CAN CHANGE ALL OF THIS LATER IN SETTINGS
      </div>
    </div>
  )
}
