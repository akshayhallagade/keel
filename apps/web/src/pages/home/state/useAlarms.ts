import { useState } from 'react'
import { SEED_ALARMS } from '../seedData'
import type { Alarm, AlarmDraft } from '../types'
import { useClockDrag, type Hand } from '../useClockDrag'
import { pad2 } from './helpers'

/// SVG viewBox sizes of the two clock faces, needed to turn a pointer position
/// into an angle.
const EDIT_CLOCK_VIEWBOX = 260
const TILE_CLOCK_VIEWBOX = 110

export function useAlarms() {
  const [alarms, setAlarms] = useState<Alarm[]>(SEED_ALARMS)
  const [alarmView, setAlarmView] = useState<'list' | 'dial'>('list')
  const [editingAlarmIdx, setEditingAlarmIdx] = useState<number | null>(null)
  const [alarmDraft, setAlarmDraft] = useState<AlarmDraft | null>(null)
  const [dragHand, setDragHand] = useState<Hand | null>(null)
  const [dragTileHand, setDragTileHand] = useState<Hand | null>(null)
  const [dragTileIdx, setDragTileIdx] = useState<number | null>(null)

  // The big editor clock writes into the draft alarm.
  useClockDrag(
    dragHand,
    'alarm-edit-clock',
    EDIT_CLOCK_VIEWBOX,
    (hand, value) =>
      setAlarmDraft((d) =>
        d ? { ...d, ...(hand === 'minute' ? { m: value } : { h: value }) } : d,
      ),
    () => setDragHand(null),
  )

  // A tile clock writes straight back into that alarm's "h:mm" string.
  useClockDrag(
    dragTileHand,
    dragTileIdx === null ? null : 'alarm-tile-clock-' + dragTileIdx,
    TILE_CLOCK_VIEWBOX,
    (hand, value) =>
      setAlarms((s) =>
        s.map((a, i) => {
          if (i !== dragTileIdx) return a
          const [h, m] = a.time.split(':').map(Number)
          const next = hand === 'minute' ? [h, value] : [value, m]
          return { ...a, time: next[0] + ':' + pad2(next[1]) }
        }),
      ),
    () => {
      setDragTileHand(null)
      setDragTileIdx(null)
    },
  )

  return {
    alarms,
    setAlarms,
    alarmView,
    setAlarmView,
    editingAlarmIdx,
    setEditingAlarmIdx,
    alarmDraft,
    setAlarmDraft,
    setDragHand,
    setDragTileHand,
    setDragTileIdx,
  }
}
