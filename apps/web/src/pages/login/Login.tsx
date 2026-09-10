import { useCallback, useEffect, useRef, useState, type RefObject } from 'react'
import gsap from 'gsap'
import type { User } from '@keel/types'
import { checkEmailSchema, loginSchema, signupSchema } from '@keel/validation'
import BrandPanel from './BrandPanel'
import SuccessView from './SuccessView'
import RevealToggle from '../../components/RevealToggle'
import { checkEmail, login as loginRequest, signup } from '../../api/auth'
import { ApiError } from '../../api/client'
import './Login.css'

type Step = 'email' | 'password' | 'details'

type FieldName = 'email' | 'password' | 'name' | 'confirm'

interface ValidationError {
  field: FieldName | ''
  message: string
}

interface LoginProps {
  onAuthenticated?: (user: User) => void
}

const STRENGTH_PALETTE = ['#C64F3B', '#C0913C', '#5B7B4F']
const STRENGTH_LABELS = ['WEAK', 'OKAY', 'GOOD', 'STRONG']

const errorMessage = (e: unknown) =>
  e instanceof ApiError
    ? e.message
    : 'Could not reach the server. Check your connection and try again.'

const SIGNUP_MESSAGES: Record<FieldName, string> = {
  email: 'Enter a valid email address.',
  password: 'Password must be at least 8 characters.',
  name: 'Tell us your name.',
  confirm: 'Passwords don’t match.',
}

/// Which input to point the shake and the toast at. Zod reports issues in the
/// schema's key order, so the first one is the field the user should fix first.
/// Typed structurally rather than as ZodError so the web app does not need a
/// direct dependency on zod just to name one type.
const firstInvalidField = (error: {
  issues: ReadonlyArray<{ path: ReadonlyArray<PropertyKey> }>
}): FieldName | null => {
  const key = error.issues[0]?.path[0]
  return key === 'email' || key === 'password' || key === 'name' ? key : null
}

function passwordStrength(pw: string) {
  let score = 0
  if (pw.length >= 6) score++
  if (pw.length >= 10 && /[0-9]/.test(pw)) score++
  if (/[A-Z]/.test(pw) && /[^A-Za-z0-9]/.test(pw)) score++
  return score
}

export default function Login({ onAuthenticated }: LoginProps) {
  const [step, setStep] = useState<Step>('email')
  const [isReturning, setIsReturning] = useState(false)
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [remember, setRemember] = useState(false)
  const [error, setError] = useState<ValidationError>({
    field: '',
    message: '',
  })
  const [submitting, setSubmitting] = useState(false)
  const [dots, setDots] = useState('')
  const [success, setSuccess] = useState(false)

  const wipeRef = useRef<HTMLDivElement>(null)
  const toastRef = useRef<HTMLDivElement>(null)

  const headlineRef = useRef<HTMLDivElement>(null)
  const subheadRef = useRef<HTMLDivElement>(null)
  const fieldsRef = useRef<HTMLDivElement>(null)
  const submitBtnRef = useRef<HTMLButtonElement>(null)
  const submitPulseRef = useRef<HTMLDivElement>(null)
  const emailCheckRef = useRef<HTMLDivElement>(null)
  const emailInputRef = useRef<HTMLInputElement>(null)
  const nameInputRef = useRef<HTMLInputElement>(null)

  const emailFieldRef = useRef<HTMLDivElement>(null)
  const passwordFieldRef = useRef<HTMLDivElement>(null)
  const nameFieldRef = useRef<HTMLDivElement>(null)
  const confirmFieldRef = useRef<HTMLDivElement>(null)

  const prevStepRef = useRef<Step>('email')
  const toastTimerRef = useRef<ReturnType<typeof setTimeout> | undefined>(
    undefined,
  )
  const idleTimerRef = useRef<ReturnType<typeof setTimeout> | undefined>(
    undefined,
  )
  const dotsTimerRef = useRef<ReturnType<typeof setInterval> | undefined>(
    undefined,
  )

  const authedUserRef = useRef<User | null>(null)

  const doContinueRef = useRef(() => {})
  useEffect(() => {
    doContinueRef.current = () => {
      gsap
        .timeline()
        .to(wipeRef.current, {
          opacity: 1,
          pointerEvents: 'auto',
          duration: 0.3,
          ease: 'power2.in',
        })
        .call(() => {
          if (authedUserRef.current) onAuthenticated?.(authedUserRef.current)
        })
    }
  }, [onAuthenticated])

  const fieldRefForError: Record<
    FieldName,
    RefObject<HTMLDivElement | null>
  > = {
    email: emailFieldRef,
    password: passwordFieldRef,
    name: nameFieldRef,
    confirm: confirmFieldRef,
  }

  /// Entrance for the form side. BrandPanel runs its own timeline from the
  /// same mount, so the two halves still appear interleaved on one clock.
  useEffect(() => {
    const tl = gsap
      .timeline()
      .fromTo(
        headlineRef.current,
        { opacity: 0, y: 8 },
        { opacity: 1, y: 0, duration: 0.35, ease: 'power2.out' },
        0.18,
      )
      .fromTo(
        subheadRef.current,
        { opacity: 0, y: 8 },
        { opacity: 1, y: 0, duration: 0.35, ease: 'power2.out' },
        0.23,
      )
      .fromTo(
        fieldsRef.current ? Array.from(fieldsRef.current.children) : [],
        { opacity: 0, y: 10 },
        { opacity: 1, y: 0, duration: 0.35, ease: 'power2.out', stagger: 0.06 },
        0.3,
      )
      .fromTo(
        submitBtnRef.current,
        { opacity: 0, y: 8 },
        { opacity: 1, y: 0, duration: 0.35, ease: 'power2.out' },
        0.46,
      )

    return () => {
      tl.kill()
    }
  }, [])

  // Step transitions: slide fields, reveal email chip, focus, idle nudge
  useEffect(() => {
    const prev = prevStepRef.current
    if (prev !== step) {
      const forward = prev === 'email' && step !== 'email'
      const dir = forward ? 18 : -18

      gsap.fromTo(
        fieldsRef.current,
        { opacity: 0, x: dir },
        { opacity: 1, x: 0, duration: 0.32, ease: 'power2.out' },
      )
      gsap.fromTo(
        [headlineRef.current, subheadRef.current],
        { opacity: 0, x: dir },
        { opacity: 1, x: 0, duration: 0.3, ease: 'power2.out' },
      )

      if (forward) {
        gsap.fromTo(
          emailCheckRef.current,
          { opacity: 0, scale: 0.4 },
          {
            opacity: 1,
            scale: 1,
            duration: 0.3,
            ease: 'power2.out',
            delay: 0.1,
          },
        )
      } else if (prev !== 'email' && step === 'email') {
        setTimeout(() => emailInputRef.current?.focus(), 150)
      }

      if (step === 'details') {
        setTimeout(() => {
          if (nameInputRef.current) {
            gsap.fromTo(
              nameInputRef.current,
              { scale: 1 },
              {
                scale: 1.02,
                duration: 0.15,
                yoyo: true,
                repeat: 1,
                ease: 'power2.out',
              },
            )
          }
        }, 250)
      }

      clearTimeout(idleTimerRef.current)
      idleTimerRef.current = setTimeout(() => {
        if (step !== 'email') return
        gsap.to(submitPulseRef.current, {
          opacity: 0.3,
          scale: 1.08,
          duration: 0.8,
          ease: 'sine.inOut',
          repeat: 2,
          yoyo: true,
          repeatDelay: 0.4,
        })
      }, 3000)
    }
    prevStepRef.current = step
    return () => clearTimeout(idleTimerRef.current)
  }, [step])

  // Error toast + shake
  useEffect(() => {
    if (!error.message) return
    const target = error.field
      ? fieldRefForError[error.field].current
      : fieldsRef.current
    if (target) {
      gsap.fromTo(
        target,
        { x: 0 },
        {
          keyframes: [
            { x: -6, duration: 0.06 },
            { x: 6, duration: 0.06 },
            { x: -4, duration: 0.06 },
            { x: 0, duration: 0.06 },
          ],
        },
      )
    }
    gsap.fromTo(
      toastRef.current,
      { opacity: 0, x: 16 },
      { opacity: 1, x: 0, duration: 0.25, ease: 'power2.out' },
    )
    clearTimeout(toastTimerRef.current)
    toastTimerRef.current = setTimeout(
      () => setError({ field: '', message: '' }),
      3200,
    )
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [error])

  useEffect(
    () => () => {
      clearTimeout(toastTimerRef.current)
      clearTimeout(idleTimerRef.current)
      clearInterval(dotsTimerRef.current)
    },
    [],
  )

  /// Validity is decided by the same schemas the API validates with, so the two
  /// sides cannot drift. Only the wording is local — Zod's default messages are
  /// written for developers, not for this screen.
  const validate = useCallback((): ValidationError | null => {
    const trimmedEmail = email.trim()

    if (step === 'email') {
      return checkEmailSchema.safeParse({ email: trimmedEmail }).success
        ? null
        : { field: 'email', message: 'Enter a valid email address.' }
    }

    if (step === 'password') {
      // loginSchema, not signupSchema: an existing account may predate the
      // 8-character rule and must still be able to sign in.
      const result = loginSchema.safeParse({
        email: trimmedEmail,
        password,
      })
      if (result.success) return null
      const field = firstInvalidField(result.error) ?? 'password'
      return {
        field,
        message:
          field === 'email'
            ? 'Enter a valid email address.'
            : 'Enter your password.',
      }
    }

    const result = signupSchema.safeParse({
      email: trimmedEmail,
      password,
      name: name.trim(),
    })
    if (!result.success) {
      const field = firstInvalidField(result.error) ?? 'email'
      return { field, message: SIGNUP_MESSAGES[field] }
    }

    // The confirmation box never leaves the browser, so it is deliberately not
    // part of signupSchema and is checked here.
    if (confirm !== password) {
      return { field: 'confirm', message: 'Passwords don’t match.' }
    }
    return null
  }, [step, email, password, name, confirm])

  const backToEmail = () => {
    gsap.to(fieldsRef.current, {
      opacity: 0,
      x: -18,
      duration: 0.2,
      ease: 'power2.in',
      onComplete: () => {
        setStep('email')
        setPassword('')
        setConfirm('')
        setName('')
        setError({ field: '', message: '' })
      },
    })
  }

  const forgot = () =>
    setError({
      field: '',
      message: 'Password reset link sent — check your inbox.',
    })

  const handleSubmit = () => {
    if (submitting) return
    gsap.fromTo(
      submitBtnRef.current,
      { scale: 1 },
      {
        scale: 0.97,
        duration: 0.08,
        yoyo: true,
        repeat: 1,
        ease: 'power1.inOut',
      },
    )

    const err = validate()
    if (err) {
      setError(err)
      return
    }

    if (step === 'email') {
      gsap.fromTo(
        submitPulseRef.current,
        { opacity: 0, scale: 1 },
        { opacity: 0.2, scale: 1.04, duration: 0.4, ease: 'power2.out' },
      )
      setSubmitting(true)
      checkEmail(email.trim())
        .then((exists) => {
          setError({ field: '', message: '' })
          setStep(exists ? 'password' : 'details')
          setIsReturning(exists)
        })
        .catch((e) => setError({ field: 'email', message: errorMessage(e) }))
        .finally(() => setSubmitting(false))
      return
    }

    setError({ field: '', message: '' })
    setSubmitting(true)
    setDots('')
    let n = 0
    dotsTimerRef.current = setInterval(() => {
      n = (n + 1) % 4
      setDots('.'.repeat(n))
    }, 300)
    const request = isReturning
      ? loginRequest({ email: email.trim(), password })
      : signup({ email: email.trim(), password, name: name.trim() })

    request
      .then((session) => {
        authedUserRef.current = session.user
        setSuccess(true)
      })
      .catch((e) =>
        setError({
          field: isReturning ? 'password' : 'email',
          message: errorMessage(e),
        }),
      )
      .finally(() => {
        clearInterval(dotsTimerRef.current)
        setSubmitting(false)
      })
  }

  const strengthScore = step === 'details' ? passwordStrength(password) : 0
  const strengthColors = ['#E5E0D6', '#E5E0D6', '#E5E0D6']
  for (let i = 0; i < strengthScore; i++)
    strengthColors[i] = STRENGTH_PALETTE[strengthScore - 1]
  const confirmMatches = confirm.length > 0 && confirm === password

  const headline =
    step === 'email'
      ? 'Welcome to Keel'
      : step === 'password'
        ? 'Welcome back'
        : 'Create your account'
  const subhead =
    step === 'email'
      ? 'Enter your email to continue.'
      : step === 'password'
        ? 'Log in to pick up where you left off.'
        : 'A minute of setup, a calmer day after.'
  const submitLabel = submitting
    ? 'ONE MOMENT'
    : step === 'email'
      ? 'CONTINUE'
      : step === 'password'
        ? 'LOG IN'
        : 'CREATE ACCOUNT'

  return (
    <div className="login-page">
      <div className="login-wipe" ref={wipeRef} />

      {error.message && (
        <div className="login-toast" ref={toastRef}>
          {error.message}
        </div>
      )}

      <BrandPanel />

      <div className="form-panel">
        <div className="form-inner">
          {success ? (
            <SuccessView
              isReturning={isReturning}
              onContinue={() => doContinueRef.current()}
            />
          ) : (
            <div>
              <div className="headline" ref={headlineRef}>
                {headline}
              </div>
              <div className="subhead" ref={subheadRef}>
                {subhead}
              </div>

              <div className="fields" ref={fieldsRef}>
                {step === 'email' ? (
                  <div className="field" ref={emailFieldRef}>
                    <div className="field-label">EMAIL</div>
                    <input
                      ref={emailInputRef}
                      className="field-input"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@example.com"
                      autoFocus
                    />
                  </div>
                ) : (
                  <div className="email-chip">
                    <div className="email-chip-left">
                      <div className="email-chip-text">{email}</div>
                      <div className="email-check" ref={emailCheckRef}>
                        &#10003;
                      </div>
                    </div>
                    <button
                      type="button"
                      className="email-edit"
                      onClick={backToEmail}
                    >
                      EDIT
                    </button>
                  </div>
                )}

                {step === 'details' && (
                  <div className="field" ref={nameFieldRef}>
                    <div className="field-label">NAME</div>
                    <input
                      ref={nameInputRef}
                      className="field-input"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Your name"
                    />
                  </div>
                )}

                {(step === 'password' || step === 'details') && (
                  <div className="field" ref={passwordFieldRef}>
                    <div className="password-label-row">
                      <div className="field-label">PASSWORD</div>
                      {step === 'password' && (
                        <button
                          type="button"
                          className="forgot-link"
                          onClick={forgot}
                        >
                          FORGOT?
                        </button>
                      )}
                    </div>
                    <div className="field-input-wrap">
                      <input
                        type={showPassword ? 'text' : 'password'}
                        className="field-input"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="At least 8 characters"
                      />
                      <RevealToggle
                        shown={showPassword}
                        onToggle={() => setShowPassword((v) => !v)}
                      />
                    </div>
                    {step === 'details' && password.length > 0 && (
                      <div>
                        <div className="strength-row">
                          {strengthColors.map((color, i) => (
                            <div
                              key={i}
                              className="strength-seg"
                              style={{ background: color }}
                            />
                          ))}
                        </div>
                        <div className="strength-label">
                          {STRENGTH_LABELS[strengthScore]}
                        </div>
                      </div>
                    )}
                    {step === 'password' && (
                      <button
                        type="button"
                        className="remember-row"
                        onClick={() => setRemember((r) => !r)}
                      >
                        <div
                          className="remember-box"
                          style={{
                            background: remember ? 'var(--ink)' : 'transparent',
                          }}
                        >
                          <svg width="10" height="10" viewBox="0 0 10 10">
                            <path
                              d="M1.5 5L4 7.5L8.5 2"
                              stroke="#FAF8F3"
                              strokeWidth="1.6"
                              fill="none"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              style={{
                                opacity: remember ? 1 : 0,
                                transition: 'opacity .15s',
                              }}
                            />
                          </svg>
                        </div>
                        <div className="remember-text">Remember me</div>
                      </button>
                    )}
                  </div>
                )}

                {step === 'details' && (
                  <div className="field" ref={confirmFieldRef}>
                    <div className="field-label">CONFIRM PASSWORD</div>
                    <div className="field-input-wrap">
                      <input
                        type={showConfirm ? 'text' : 'password'}
                        className="field-input"
                        value={confirm}
                        onChange={(e) => setConfirm(e.target.value)}
                        placeholder="Type it again"
                        style={{
                          borderColor:
                            confirm.length > 0
                              ? confirmMatches
                                ? '#5B7B4F'
                                : '#E5E0D6'
                              : '#E5E0D6',
                        }}
                      />
                      <RevealToggle
                        shown={showConfirm}
                        onToggle={() => setShowConfirm((v) => !v)}
                      />
                    </div>
                    {confirm.length > 0 && (
                      <div
                        className="confirm-hint"
                        style={{
                          color: confirmMatches ? '#5B7B4F' : '#A39B8B',
                        }}
                      >
                        {confirmMatches
                          ? '✓ Passwords match'
                          : 'Doesn’t match yet'}
                      </div>
                    )}
                  </div>
                )}
              </div>

              <button
                type="button"
                className="submit-btn"
                ref={submitBtnRef}
                onClick={handleSubmit}
                style={{ opacity: submitting ? 0.6 : 1 }}
              >
                <span>{submitLabel}</span>
                <span>{submitting ? dots : ''}</span>
                <div className="submit-pulse" ref={submitPulseRef} />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
