import { useState } from 'react'
import { SPEND_DOTS } from '../seedData'
import type { Alarm, CreatePanelState, CreatePanelType } from '../types'
import { parseInr } from './helpers'

/// One config per thing the "+" button can create: the panel's title, its save
/// label, its [key, label, placeholder] fields, and an optional chip picker.
/// Adding a kind means adding an entry here and a branch in `saveC`.
const CREATE_CFGS: Record<
  CreatePanelType,
  {
    title: string
    save: string
    fields: [string, string, string][]
    chips?: { label: string; opts: string[] }
  }
> = {
  goal: {
    title: 'NEW GOAL',
    save: 'SET GOAL',
    fields: [
      ['name', 'GOAL', 'e.g. Learn Spanish'],
      ['target', 'FIRST STEP', 'e.g. Book 10 lessons'],
    ],
  },
  book: {
    title: 'NEW BOOK',
    save: 'ADD BOOK',
    fields: [
      ['name', 'TITLE', 'e.g. Thinking, Fast and Slow'],
      ['author', 'AUTHOR', 'e.g. Daniel Kahneman'],
    ],
  },
  quote: {
    title: 'SAVE QUOTE',
    save: 'SAVE QUOTE',
    fields: [
      ['text', 'QUOTE', 'The words worth keeping'],
      ['author', 'WHO SAID IT', 'e.g. Seneca'],
    ],
  },
  wish: {
    title: 'ADD TO WISHLIST',
    save: 'START THE CLOCK',
    fields: [
      ['name', 'ITEM', 'e.g. Espresso machine'],
      ['price', 'PRICE (₹)', 'e.g. 14500'],
    ],
    chips: {
      label: 'CATEGORY',
      opts: ['WANT', 'HOBBY', 'HOME', 'BOOKS', 'HEALTH'],
    },
  },
  spend: {
    title: 'LOG EXPENSE',
    save: 'LOG IT',
    fields: [
      ['name', 'WHAT', 'e.g. Chai + samosa'],
      ['price', 'AMOUNT (₹)', 'e.g. 120'],
    ],
    chips: {
      label: 'CATEGORY',
      opts: ['GROCERIES', 'EATING OUT', 'TRANSPORT', 'HOBBIES', 'OTHER'],
    },
  },
  alarm: {
    title: 'NEW ALARM',
    save: 'ADD ALARM',
    fields: [
      ['time', 'TIME', 'e.g. 6:30'],
      ['name', 'LABEL', 'e.g. Morning run'],
      ['days', 'REPEATS', 'e.g. MON – FRI'],
    ],
    chips: { label: 'AM / PM', opts: ['AM', 'PM'] },
  },
  rem: {
    title: 'NEW REMINDER',
    save: 'SET REMINDER',
    fields: [
      ['name', 'REMIND ME TO', 'e.g. Call the dentist'],
      ['when', 'WHEN', 'e.g. TUE 4PM'],
    ],
    chips: { label: 'BUCKET', opts: ['TODAY', 'UPCOMING', 'RECURRING'] },
  },
}

/// Which chip is pre-selected when a panel opens — the first option, or null
/// for the kinds that have no chips.
const DEFAULT_CHIP: Partial<Record<CreatePanelType, (string | null)[]>> =
  Object.fromEntries(
    Object.entries(CREATE_CFGS).map(([k, v]) => [
      k,
      v.chips ? v.chips.opts : [null],
    ]),
  )

/**
 * The shared "+ new thing" panel, and the lists of things it has created.
 *
 * Alarms are the exception: they belong to useAlarms, which is why its setter
 * is passed in rather than a seventh list being kept here.
 */
export function useCreatePanel(addAlarm: (a: Alarm) => void) {
  const [cPanel, setCPanelState] = useState<CreatePanelState | null>(null)
  const [newGoals, setNewGoals] = useState<{ name: string; target: string }[]>(
    [],
  )
  const [newBooks, setNewBooks] = useState<{ name: string; author: string }[]>(
    [],
  )
  const [newReading, setNewReading] = useState<
    { name: string; author: string }[]
  >([])
  const [newQuotes, setNewQuotes] = useState<
    { text: string; author: string }[]
  >([])
  const [newWish, setNewWish] = useState<
    { name: string; price: string; cat: string | null }[]
  >([])
  const [newSpend, setNewSpend] = useState<
    { name: string; price: string; cat: string | null; dot: string }[]
  >([])
  const [newRems, setNewRems] = useState<
    { name: string; when: string; bucket: string | null }[]
  >([])

  const openC = (type: CreatePanelType) => () =>
    setCPanelState({ type, vals: {}, chip: (DEFAULT_CHIP[type] || [null])[0] })

  const cCfg = cPanel ? CREATE_CFGS[cPanel.type] : null

  const saveC = () => {
    const p = cPanel
    if (!p) return
    const v = (k: string) => (p.vals[k] || '').trim()
    // Every kind is named by either `name` or `text`; with neither there is
    // nothing to save.
    if (!v('name') && !v('text')) return

    switch (p.type) {
      case 'goal':
        setNewGoals((s) => [
          ...s,
          { name: v('name'), target: v('target') || 'define the first step' },
        ])
        break
      case 'book':
        setNewBooks((s) => [
          ...s,
          { name: v('name'), author: (v('author') || 'UNKNOWN').toUpperCase() },
        ])
        break
      case 'quote':
        setNewQuotes((s) => [
          ...s,
          { text: v('text'), author: (v('author') || 'UNKNOWN').toUpperCase() },
        ])
        break
      case 'wish':
        setNewWish((s) => [
          ...s,
          { name: v('name'), price: parseInr(v('price')), cat: p.chip },
        ])
        break
      case 'spend':
        // Newest first: the spend screen is a running log.
        setNewSpend((s) => [
          {
            name: v('name'),
            price: parseInr(v('price')),
            cat: p.chip,
            dot: SPEND_DOTS[p.chip || ''] || 'var(--check-border)',
          },
          ...s,
        ])
        break
      case 'alarm':
        addAlarm({
          time: v('time') || '7:00',
          ampm: (p.chip as 'AM' | 'PM') || 'AM',
          label: v('name'),
          days: (v('days') || 'ONCE').toUpperCase(),
          on: true,
        })
        break
      case 'rem':
        setNewRems((s) => [
          ...s,
          {
            name: v('name'),
            when: (v('when') || 'SOON').toUpperCase(),
            bucket: p.chip,
          },
        ])
        break
    }
    setCPanelState(null)
  }

  return {
    cPanel,
    setCPanelState,
    cCfg,
    openC,
    saveC,
    newGoals,
    /// Each unread book carries the action that moves it to "reading now".
    newBooks: newBooks.map((b, i) => ({
      ...b,
      start: () => {
        setNewBooks((s) => s.filter((_, xi) => xi !== i))
        setNewReading((s) => [...s, b])
      },
    })),
    newReading,
    setNewReading,
    newQuotes,
    newWish,
    newSpend,
    newRems,
  }
}
