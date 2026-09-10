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

/**
 * The "+ add another one" line that closes each list.
 *
 * Every screen on this page ended with its own copy of the same button.
 */
function AddRow({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <button type="button" className="hs-add-row is-button" onClick={onClick}>
      <div className="hs-add-plus">+</div>
      <div className="hs-add-prompt">{label}</div>
      <div className="hs-add-details">+ ADD</div>
    </button>
  )
}

function Bar({ pct, color }: { pct: number; color?: string }) {
  return (
    <div className="hs-bar-track sm">
      <div
        className="hs-bar-fill is-grown"
        style={{ width: pct + '%', background: color }}
      />
    </div>
  )
}

/* ---------------------------------------------------------------- Goals */

export function Goals({ vm }: { vm: HomeState }) {
  const { newGoals, openC } = vm

  // Seeded goals and ones the user just set render identically, so they are
  // one list. Previously this was two near-identical blocks of JSX.
  const goals = [
    ...SEED_GOALS,
    ...newGoals.map((g) => ({
      name: g.name,
      status: 'NEW',
      color: 'var(--info)',
      pct: 3,
      meta: 'JUST SET · JUL 14',
      next: 'Next: ' + g.target,
    })),
  ]

  return (
    <div className="hs-screen">
      <div className="hs-title-row" style={{ marginBottom: 2 }}>
        <div className="hs-title">Goals</div>
        <div className="hs-meta-sm">2026 · DAY 188 OF 365</div>
      </div>
      <div className="hs-meta" style={{ marginBottom: 26 }}>
        4 GOALS · 1 AHEAD · 2 ON TRACK · 1 BEHIND
      </div>

      <div className="hs-card-grid">
        {goals.map((g) => (
          <div key={g.name} className="hs-card">
            <div className="hs-row-between">
              <div className="hs-card-title">{g.name}</div>
              <div className="hs-card-status" style={{ color: g.color }}>
                {g.status}
              </div>
            </div>
            <div style={{ margin: '14px 0 6px' }}>
              <Bar pct={g.pct} />
            </div>
            <div className="hs-meta-sm">{g.meta}</div>
            <div className="hs-card-foot">{g.next}</div>
          </div>
        ))}
      </div>

      <AddRow label="Set a goal for 2026" onClick={openC('goal')} />
    </div>
  )
}

/* ---------------------------------------------------------------- Books */

export function Books({ vm }: { vm: HomeState }) {
  const { newReading, newBooks, openC } = vm

  const reading = [
    ...SEED_READING_NOW,
    ...newReading.map((b) => ({
      name: b.name,
      pct: 0,
      meta: b.author + ' · STARTED JUL 14',
    })),
  ]

  // Seeded titles have no "start" action yet; the user's own do.
  const toRead: { name: string; author: string; start?: () => void }[] = [
    ...SEED_TO_READ,
    ...newBooks,
  ]

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
        {reading.map((b) => (
          <div key={b.name} className="hs-book-row">
            <div className="hs-row-between">
              <div className="hs-newsreader hs-book-title">{b.name}</div>
              <div className="hs-book-pct">{b.pct}%</div>
            </div>
            <div className="hs-meta-sm" style={{ marginTop: 3 }}>
              {b.meta}
            </div>
            <div style={{ marginTop: 12 }}>
              {/* A brand-new book shows a sliver rather than nothing at all. */}
              <Bar pct={b.pct || 1} />
            </div>
          </div>
        ))}

        <div className="hs-section-label" style={{ marginTop: 28 }}>
          TO READ
        </div>
        {toRead.map((b) => (
          <div key={b.name} className="hs-to-read-row">
            <div>
              <div className="hs-newsreader" style={{ fontSize: 15 }}>
                {b.name}
              </div>
              <div className="hs-meta-sm" style={{ marginTop: 2 }}>
                {b.author}
              </div>
            </div>
            <button type="button" className="hs-hobby-cta" onClick={b.start}>
              START →
            </button>
          </div>
        ))}

        <AddRow label="Add a book to the pile" onClick={openC('book')} />
      </div>

      <div className="hs-rail narrow">
        <div>
          <div className="hs-section-label">2026 PACE</div>
          <div className="hs-big-stat">
            <div className="hs-big-stat-value">
              14<span className="hs-big-stat-total">/24</span>
            </div>
            <div style={{ fontSize: 12, color: 'var(--text-2)' }}>finished</div>
          </div>
          <div className="hs-bar-track" style={{ height: 6, marginTop: 12 }}>
            <div className="hs-bar-fill" style={{ width: '58%' }} />
          </div>
          <div className="hs-delta-row" style={{ marginTop: 10 }}>
            ▲ 1.6 BOOKS AHEAD OF PACE
          </div>
        </div>

        <div>
          <div className="hs-section-label">RECENTLY FINISHED</div>
          {SEED_FINISHED_BOOKS.map((b) => (
            <div key={b.name} className="hs-rail-row">
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

/* --------------------------------------------------------------- Quotes */

const RESURFACED = {
  text: 'What you do every day matters more than what you do once in a while.',
  author: 'GRETCHEN RUBIN',
  saved: 'MAR 2026',
}

export function Quotes({ vm }: { vm: HomeState }) {
  const { newQuotes, openC } = vm

  const quotes = [
    ...newQuotes.map((q) => ({ ...q, saved: 'JUL 2026' })),
    ...SEED_QUOTES,
  ]

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

        {/* Today's resurfaced quote sits above the log, ruled off from it. */}
        <div className="hs-quote-row is-resurfaced">
          <div className="hs-newsreader hs-quote-text">
            &ldquo;{RESURFACED.text}&rdquo;
          </div>
          <div className="hs-row-between" style={{ marginTop: 10 }}>
            <div className="hs-meta-sm">
              — {RESURFACED.author} · SAVED {RESURFACED.saved}
            </div>
            <div className="hs-quote-flag">RESURFACED TODAY</div>
          </div>
        </div>

        {quotes.map((q, i) => (
          <div key={q.author + i} className="hs-quote-row">
            <div className="hs-newsreader hs-quote-text">
              &ldquo;{q.text}&rdquo;
            </div>
            <div className="hs-meta-sm" style={{ marginTop: 10 }}>
              — {q.author} · SAVED {q.saved}
            </div>
          </div>
        ))}

        <AddRow label="Save a quote worth keeping" onClick={openC('quote')} />
      </div>
    </div>
  )
}

/* ------------------------------------------------------------- Wishlist */

export function Wishlist({ vm }: { vm: HomeState }) {
  const { newWish, openC } = vm

  // Anything the user has just added starts at day zero of its cooling-off
  // period, so it joins the "still cooling" list rather than getting its own.
  const cooling = [
    ...SEED_COOLING,
    ...newWish.map((w) => ({
      name: w.name,
      meta: `${w.cat} · 0 OF 30 DAYS`,
      pct: 2,
      price: w.price,
    })),
  ]

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
          <div key={w.name} className="hs-wish-row">
            <div className="hs-wish-body">
              <div className="hs-wish-name">{w.name}</div>
              <div className="hs-row-sub">{w.meta}</div>
            </div>
            <div className="hs-wish-price">{w.price}</div>
            <button type="button" className="hs-btn-buy">
              BUY
            </button>
          </div>
        ))}

        <div className="hs-section-label" style={{ marginTop: 28 }}>
          STILL COOLING
        </div>
        {cooling.map((w, i) => (
          <div key={w.name + i} className="hs-wish-row">
            <div className="hs-wish-body">
              <div className="hs-wish-name">{w.name}</div>
              <div className="hs-row-sub">{w.meta}</div>
            </div>
            <div className="hs-cool-bar">
              <Bar pct={w.pct} color="var(--warn)" />
            </div>
            <div className="hs-wish-price">{w.price}</div>
          </div>
        ))}

        <AddRow
          label="Want something? Park it here first"
          onClick={openC('wish')}
        />
      </div>

      <div className="hs-rail narrow">
        <div>
          <div className="hs-section-label">SAVED BY WAITING</div>
          <div className="hs-big-stat-value" style={{ marginTop: 14 }}>
            ₹41,200
          </div>
          <div className="hs-meta-sm" style={{ marginTop: 8 }}>
            6 ITEMS DROPPED AFTER COOLING OFF · 2026
          </div>
        </div>

        <div>
          <div className="hs-section-label">RECENTLY DROPPED</div>
          {SEED_DROPPED.map((d) => (
            <div key={d.name} className="hs-rail-row">
              <div className="hs-done-text">{d.name}</div>
              <div className="hs-meta-sm">{d.price}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
