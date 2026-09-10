import type { HomeState } from '../useHomeState'
import {
  SEED_GOALS,
  SEED_READING_NOW,
  SEED_TO_READ,
  SEED_FINISHED_BOOKS,
  SEED_QUOTES,
  SEED_READY_TO_BUY,
  SEED_COOLING,
  SEED_DROPPED,
} from '../seedData'

export function Goals({ vm }: { vm: HomeState }) {
  const { newGoals, openC } = vm
  return (
    <div className="hs-screen">
      <div className="hs-title-row" style={{ marginBottom: 2 }}>
        <div className="hs-title">Goals</div>
        <div className="hs-meta-sm">2026 · DAY 188 OF 365</div>
      </div>
      <div className="hs-meta" style={{ marginBottom: 26 }}>
        4 GOALS · 1 AHEAD · 2 ON TRACK · 1 BEHIND
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
        {SEED_GOALS.map((g) => (
          <div key={g.name} className="hs-card">
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'baseline',
              }}
            >
              <div style={{ fontSize: 15.5, fontWeight: 600 }}>{g.name}</div>
              <div
                style={{
                  font: '500 9px "IBM Plex Mono",monospace',
                  letterSpacing: '.1em',
                  color: g.color,
                }}
              >
                {g.status}
              </div>
            </div>
            <div
              style={{
                height: 4,
                background: 'var(--track)',
                borderRadius: 2,
                margin: '14px 0 6px',
              }}
            >
              <div
                style={{
                  width: g.pct + '%',
                  height: '100%',
                  background: 'var(--accent)',
                  borderRadius: 2,
                  transformOrigin: 'left',
                  animation:
                    'barGrow .8s cubic-bezier(.22,1,.36,1) .2s backwards',
                }}
              />
            </div>
            <div className="hs-meta-sm">{g.meta}</div>
            <div
              style={{
                borderTop: '1px solid var(--line-soft)',
                marginTop: 14,
                paddingTop: 12,
                fontSize: 13,
                color: 'var(--text-2)',
              }}
            >
              {g.next}
            </div>
          </div>
        ))}
        {newGoals.map((g) => (
          <div key={g.name} className="hs-card">
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'baseline',
              }}
            >
              <div style={{ fontSize: 15.5, fontWeight: 600 }}>{g.name}</div>
              <div
                style={{
                  font: '500 9px "IBM Plex Mono",monospace',
                  letterSpacing: '.1em',
                  color: '#5A6E8C',
                }}
              >
                NEW
              </div>
            </div>
            <div
              style={{
                height: 4,
                background: 'var(--track)',
                borderRadius: 2,
                margin: '14px 0 6px',
              }}
            >
              <div
                style={{
                  width: '3%',
                  height: '100%',
                  background: 'var(--accent)',
                  borderRadius: 2,
                }}
              />
            </div>
            <div className="hs-meta-sm">JUST SET · JUL 14</div>
            <div
              style={{
                borderTop: '1px solid var(--line-soft)',
                marginTop: 14,
                paddingTop: 12,
                fontSize: 13,
                color: 'var(--text-2)',
              }}
            >
              Next: {g.target}
            </div>
          </div>
        ))}
      </div>
      <button
        type="button"
        className="hs-add-row"
        onClick={openC('goal')}
        style={{ cursor: 'pointer', width: '100%' }}
      >
        <div className="hs-add-plus" style={{ fontSize: 14 }}>
          +
        </div>
        <div
          style={{
            flex: 1,
            font: '400 13px "IBM Plex Sans",sans-serif',
            color: 'var(--muted)',
            textAlign: 'left',
          }}
        >
          Set a goal for 2026
        </div>
        <div className="hs-add-details">+ ADD</div>
      </button>
    </div>
  )
}

export function Books({ vm }: { vm: HomeState }) {
  const { newReading, newBooks, openC } = vm
  return (
    <div className="hs-screen with-rail">
      <div className="hs-main-col wide">
        <div className="hs-title-row">
          <div className="hs-title">Books</div>
          <div className="hs-meta-sm">14 FINISHED · GOAL 24</div>
        </div>
        <div className="hs-meta" style={{ marginBottom: 24 }}>
          READING LOG · 2026
        </div>
        <div className="hs-section-label">READING NOW</div>
        {SEED_READING_NOW.map((b) => (
          <div
            key={b.name}
            style={{
              padding: '16px 0',
              borderBottom: '1px solid var(--line-soft)',
            }}
          >
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'baseline',
              }}
            >
              <div
                className="hs-newsreader"
                style={{ fontSize: 17, fontWeight: 500 }}
              >
                {b.name}
              </div>
              <div style={{ font: '500 12px "IBM Plex Mono",monospace' }}>
                {b.pct}%
              </div>
            </div>
            <div className="hs-meta-sm" style={{ marginTop: 3 }}>
              {b.meta}
            </div>
            <div
              style={{
                height: 4,
                background: 'var(--track)',
                borderRadius: 2,
                marginTop: 12,
              }}
            >
              <div
                style={{
                  width: b.pct + '%',
                  height: '100%',
                  background: 'var(--accent)',
                  borderRadius: 2,
                  transformOrigin: 'left',
                  animation:
                    'barGrow .8s cubic-bezier(.22,1,.36,1) .2s backwards',
                }}
              />
            </div>
          </div>
        ))}
        {newReading.map((b) => (
          <div
            key={b.name}
            style={{
              padding: '16px 0',
              borderBottom: '1px solid var(--line-soft)',
              animation: 'rowIn .35s ease backwards',
            }}
          >
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'baseline',
              }}
            >
              <div
                className="hs-newsreader"
                style={{ fontSize: 17, fontWeight: 500 }}
              >
                {b.name}
              </div>
              <div style={{ font: '500 12px "IBM Plex Mono",monospace' }}>
                0%
              </div>
            </div>
            <div className="hs-meta-sm" style={{ marginTop: 3 }}>
              {b.author} · STARTED JUL 14
            </div>
            <div
              style={{
                height: 4,
                background: 'var(--track)',
                borderRadius: 2,
                marginTop: 12,
              }}
            >
              <div
                style={{
                  width: '1%',
                  height: '100%',
                  background: 'var(--accent)',
                  borderRadius: 2,
                }}
              />
            </div>
          </div>
        ))}
        <div className="hs-section-label" style={{ marginTop: 28 }}>
          TO READ
        </div>
        {SEED_TO_READ.map((b) => (
          <div
            key={b.name}
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '12px 0',
              borderBottom: '1px solid var(--line-soft)',
            }}
          >
            <div>
              <div className="hs-newsreader" style={{ fontSize: 15 }}>
                {b.name}
              </div>
              <div className="hs-meta-sm" style={{ marginTop: 2 }}>
                {b.author}
              </div>
            </div>
            <button
              type="button"
              style={{
                font: '400 10px "IBM Plex Mono",monospace',
                color: 'var(--accent)',
                cursor: 'pointer',
                background: 'none',
                border: 'none',
              }}
            >
              START →
            </button>
          </div>
        ))}
        {newBooks.map((b) => (
          <div
            key={b.name}
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '12px 0',
              borderBottom: '1px solid var(--line-soft)',
              animation: 'rowIn .35s ease backwards',
            }}
          >
            <div>
              <div className="hs-newsreader" style={{ fontSize: 15 }}>
                {b.name}
              </div>
              <div className="hs-meta-sm" style={{ marginTop: 2 }}>
                {b.author}
              </div>
            </div>
            <button
              type="button"
              style={{
                font: '400 10px "IBM Plex Mono",monospace',
                color: 'var(--accent)',
                cursor: 'pointer',
                background: 'none',
                border: 'none',
              }}
              onClick={b.start}
            >
              START →
            </button>
          </div>
        ))}
        <button
          type="button"
          className="hs-add-row"
          onClick={openC('book')}
          style={{ cursor: 'pointer', width: '100%' }}
        >
          <div className="hs-add-plus">+</div>
          <div
            style={{
              flex: 1,
              font: '400 13px "IBM Plex Sans",sans-serif',
              color: 'var(--muted)',
              textAlign: 'left',
            }}
          >
            Add a book to the pile
          </div>
          <div className="hs-add-details">+ ADD</div>
        </button>
      </div>
      <div className="hs-rail narrow">
        <div>
          <div className="hs-section-label">2026 PACE</div>
          <div
            style={{
              display: 'flex',
              alignItems: 'baseline',
              gap: 8,
              marginTop: 14,
            }}
          >
            <div style={{ font: '500 32px "IBM Plex Mono",monospace' }}>
              14<span style={{ color: 'var(--muted)', fontSize: 19 }}>/24</span>
            </div>
            <div style={{ fontSize: 12, color: 'var(--text-2)' }}>finished</div>
          </div>
          <div className="hs-bar-track" style={{ height: 6, marginTop: 12 }}>
            <div className="hs-bar-fill" style={{ width: '58%' }} />
          </div>
          <div
            style={{
              font: '400 10px "IBM Plex Mono",monospace',
              color: 'var(--positive)',
              marginTop: 10,
            }}
          >
            ▲ 1.6 BOOKS AHEAD OF PACE
          </div>
        </div>
        <div>
          <div className="hs-section-label">RECENTLY FINISHED</div>
          {SEED_FINISHED_BOOKS.map((b) => (
            <div
              key={b.name}
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'baseline',
                padding: '9px 0',
                borderBottom: '1px solid var(--line-soft)',
              }}
            >
              <div className="hs-newsreader" style={{ fontSize: 14 }}>
                {b.name}
              </div>
              <div className="hs-meta-sm">{b.month}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export function Quotes({ vm }: { vm: HomeState }) {
  const { newQuotes, openC } = vm
  return (
    <div className="hs-screen">
      <div style={{ maxWidth: 640 }}>
        <div className="hs-title-row" style={{ marginBottom: 2 }}>
          <div className="hs-title">Quotes</div>
          <div className="hs-meta-sm">18 SAVED · 1 RESURFACES DAILY</div>
        </div>
        <div className="hs-meta" style={{ marginBottom: 26 }}>
          THINGS WORTH RE-READING
        </div>
        <div
          style={{
            padding: '20px 0',
            borderTop: '1px solid var(--ink)',
            borderBottom: '1px solid var(--line-soft)',
          }}
        >
          <div
            className="hs-newsreader"
            style={{ fontSize: 19, lineHeight: 1.55, color: '#3D382F' }}
          >
            &ldquo;What you do every day matters more than what you do once in a
            while.&rdquo;
          </div>
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              marginTop: 10,
            }}
          >
            <div className="hs-meta-sm">— GRETCHEN RUBIN · SAVED MAR 2026</div>
            <div
              style={{
                font: '400 10px "IBM Plex Mono",monospace',
                color: 'var(--accent)',
              }}
            >
              RESURFACED TODAY
            </div>
          </div>
        </div>
        {newQuotes.map((q, i) => (
          <div
            key={i}
            style={{
              padding: '20px 0',
              borderBottom: '1px solid var(--line-soft)',
              animation: 'rowIn .35s ease backwards',
            }}
          >
            <div
              className="hs-newsreader"
              style={{ fontSize: 19, lineHeight: 1.55, color: '#3D382F' }}
            >
              &ldquo;{q.text}&rdquo;
            </div>
            <div className="hs-meta-sm" style={{ marginTop: 10 }}>
              — {q.author} · SAVED JUL 2026
            </div>
          </div>
        ))}
        {SEED_QUOTES.map((q) => (
          <div
            key={q.author}
            style={{
              padding: '20px 0',
              borderBottom: '1px solid var(--line-soft)',
            }}
          >
            <div
              className="hs-newsreader"
              style={{ fontSize: 19, lineHeight: 1.55, color: '#3D382F' }}
            >
              &ldquo;{q.text}&rdquo;
            </div>
            <div className="hs-meta-sm" style={{ marginTop: 10 }}>
              — {q.author} · SAVED {q.saved}
            </div>
          </div>
        ))}
        <button
          type="button"
          className="hs-add-row"
          onClick={openC('quote')}
          style={{ cursor: 'pointer', width: '100%' }}
        >
          <div className="hs-add-plus" style={{ fontSize: 14 }}>
            +
          </div>
          <div
            style={{
              flex: 1,
              font: '400 13px "IBM Plex Sans",sans-serif',
              color: 'var(--muted)',
              textAlign: 'left',
            }}
          >
            Save a quote worth keeping
          </div>
          <div className="hs-add-details">+ ADD</div>
        </button>
      </div>
    </div>
  )
}

export function Wishlist({ vm }: { vm: HomeState }) {
  const { newWish, openC } = vm
  return (
    <div className="hs-screen with-rail">
      <div className="hs-main-col wide">
        <div className="hs-title-row">
          <div className="hs-title">Wishlist</div>
          <div className="hs-meta-sm">7 ITEMS · ₹96,300 TOTAL</div>
        </div>
        <div className="hs-meta" style={{ marginBottom: 24 }}>
          WAIT 30 DAYS BEFORE BUYING
        </div>
        <div className="hs-section-label">READY TO BUY · COOLED OFF</div>
        {SEED_READY_TO_BUY.map((w) => (
          <div
            key={w.name}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 16,
              padding: '14px 0',
              borderBottom: '1px solid var(--line-soft)',
            }}
          >
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 14.5, fontWeight: 500 }}>{w.name}</div>
              <div className="hs-row-sub">{w.meta}</div>
            </div>
            <div
              style={{
                font: '500 13px "IBM Plex Mono",monospace',
                flex: 'none',
              }}
            >
              {w.price}
            </div>
            <div
              style={{
                font: '500 9px "IBM Plex Mono",monospace',
                letterSpacing: '.1em',
                color: 'var(--paper)',
                background: 'var(--accent)',
                padding: '7px 11px',
                cursor: 'pointer',
                flex: 'none',
              }}
            >
              BUY
            </div>
          </div>
        ))}
        <div className="hs-section-label" style={{ marginTop: 28 }}>
          STILL COOLING
        </div>
        {SEED_COOLING.map((w) => (
          <div
            key={w.name}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 16,
              padding: '14px 0',
              borderBottom: '1px solid var(--line-soft)',
            }}
          >
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 14.5, fontWeight: 500 }}>{w.name}</div>
              <div className="hs-row-sub">{w.meta}</div>
            </div>
            <div
              style={{
                width: 60,
                height: 4,
                background: 'var(--track)',
                borderRadius: 2,
                flex: 'none',
              }}
            >
              <div
                style={{
                  width: w.pct + '%',
                  height: '100%',
                  background: '#C0913C',
                  borderRadius: 2,
                }}
              />
            </div>
            <div
              style={{
                font: '500 13px "IBM Plex Mono",monospace',
                flex: 'none',
              }}
            >
              {w.price}
            </div>
          </div>
        ))}
        {newWish.map((w, i) => (
          <div
            key={i}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 16,
              padding: '14px 0',
              borderBottom: '1px solid var(--line-soft)',
              animation: 'rowIn .35s ease backwards',
            }}
          >
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 14.5, fontWeight: 500 }}>{w.name}</div>
              <div className="hs-row-sub">{w.cat} · 0 OF 30 DAYS</div>
            </div>
            <div
              style={{
                width: 60,
                height: 4,
                background: 'var(--track)',
                borderRadius: 2,
                flex: 'none',
              }}
            >
              <div
                style={{
                  width: '2%',
                  height: '100%',
                  background: '#C0913C',
                  borderRadius: 2,
                }}
              />
            </div>
            <div
              style={{
                font: '500 13px "IBM Plex Mono",monospace',
                flex: 'none',
              }}
            >
              {w.price}
            </div>
          </div>
        ))}
        <button
          type="button"
          className="hs-add-row"
          onClick={openC('wish')}
          style={{ cursor: 'pointer', width: '100%' }}
        >
          <div className="hs-add-plus" style={{ fontSize: 14 }}>
            +
          </div>
          <div
            style={{
              flex: 1,
              font: '400 13px "IBM Plex Sans",sans-serif',
              color: 'var(--muted)',
              textAlign: 'left',
            }}
          >
            Want something? Park it here first
          </div>
          <div className="hs-add-details">+ ADD</div>
        </button>
      </div>
      <div className="hs-rail narrow">
        <div>
          <div className="hs-section-label">SAVED BY WAITING</div>
          <div
            style={{
              font: '500 32px "IBM Plex Mono",monospace',
              marginTop: 14,
            }}
          >
            ₹41,200
          </div>
          <div className="hs-meta-sm" style={{ marginTop: 8 }}>
            6 ITEMS DROPPED AFTER COOLING OFF · 2026
          </div>
        </div>
        <div>
          <div className="hs-section-label">RECENTLY DROPPED</div>
          {SEED_DROPPED.map((d) => (
            <div
              key={d.name}
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                padding: '9px 0',
                borderBottom: '1px solid var(--line-soft)',
              }}
            >
              <div
                style={{
                  fontSize: 13,
                  color: 'var(--muted)',
                  textDecoration: 'line-through',
                }}
              >
                {d.name}
              </div>
              <div className="hs-meta-sm">{d.price}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
