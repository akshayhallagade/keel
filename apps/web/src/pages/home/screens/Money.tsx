import type { HomeState } from '../useHomeState'
import { SEED_SPEND, SEED_ENVELOPES } from '../seedData'

const inr = (n: number) => '₹' + Math.round(n).toLocaleString('en-IN')

/* ------------------------------------------------------- shared pieces */

/// One figure in the rule-topped summary strip at the head of a money screen.
function StatCol({
  label,
  value,
  color,
  bordered,
}: {
  label: string
  value: string
  color?: string
  bordered?: boolean
}) {
  return (
    <div className={`hs-stat-col${bordered ? ' is-bordered' : ''}`}>
      <div className="hs-stat-col-label">{label}</div>
      <div className="hs-stat-col-value" style={{ color }}>
        {value}
      </div>
    </div>
  )
}

type Segment = { name: string; pct: number; color: string }

/// A single stacked bar plus its legend — the same pair on Investments and
/// Accounts, and the same shape as the hobby split.
function Allocation({ segments }: { segments: Segment[] }) {
  return (
    <>
      <div className="hs-split-bar">
        {segments.map((s) => (
          <div
            key={s.name}
            style={{ width: s.pct + '%', background: s.color }}
          />
        ))}
      </div>
      <div className="hs-split-legend">
        {segments.map((s) => (
          <div key={s.name} className="hs-split-legend-row">
            <div>
              <span style={{ color: s.color }}>●</span> {s.name}
            </div>
            <div className="hs-split-pct">{s.pct}%</div>
          </div>
        ))}
      </div>
    </>
  )
}

/// name + sub on the left, a figure on the right. Holdings, bank accounts and
/// the owed list are all this row.
function AcctRow({
  name,
  sub,
  value,
  valueColor,
  extra,
}: {
  name: string
  sub: string
  value: string
  valueColor?: string
  extra?: React.ReactNode
}) {
  return (
    <div className="hs-acct-row">
      <div style={{ flex: 1 }}>
        <div className="hs-acct-name">{name}</div>
        <div className="hs-row-sub" style={{ marginTop: 2 }}>
          {sub}
        </div>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
        <div className="hs-acct-value" style={{ color: valueColor }}>
          {value}
        </div>
        {extra}
      </div>
    </div>
  )
}

/// Compact label/value line for the rails.
function MiniRow({
  label,
  value,
  valueColor,
  dotColor,
}: {
  label: string
  value: string
  valueColor?: string
  dotColor?: string
}) {
  return (
    <div className="hs-rail-row">
      <div>
        {dotColor && <span style={{ color: dotColor }}>●</span>} {label}
      </div>
      <div className="hs-mini-value" style={{ color: valueColor }}>
        {value}
      </div>
    </div>
  )
}

/* -------------------------------------------------------- Investments */

const HOLDINGS = [
  {
    name: 'Nifty 50 index fund',
    sub: 'MUTUAL FUND · SIP',
    value: '₹3,20,000',
    ret: '+12.4%',
    retColor: 'var(--positive)',
  },
  {
    name: 'Flexi-cap fund',
    sub: 'MUTUAL FUND · SIP',
    value: '₹1,80,000',
    ret: '+9.1%',
    retColor: 'var(--positive)',
  },
  {
    name: 'Stocks — 6 holdings',
    sub: 'DIRECT EQUITY',
    value: '₹1,40,000',
    ret: '+4.2%',
    retColor: 'var(--positive)',
  },
  {
    name: 'PPF',
    sub: 'GOVT · LOCKED TILL 2031',
    value: '₹1,50,000',
    ret: '7.1% FIX',
    retColor: 'var(--text-3)',
  },
  {
    name: 'Gold ETF',
    sub: 'HEDGE',
    value: '₹50,000',
    ret: '+6.0%',
    retColor: 'var(--positive)',
  },
]

const PORTFOLIO_SPLIT: Segment[] = [
  { name: 'Index fund', pct: 38, color: 'var(--accent)' },
  { name: 'Flexi-cap', pct: 21, color: 'var(--warn)' },
  { name: 'Stocks', pct: 17, color: 'var(--info)' },
  { name: 'PPF', pct: 18, color: 'var(--positive)' },
  { name: 'Gold', pct: 6, color: 'var(--check-border)' },
]

const SIP_SCHEDULE = [
  { label: '5th · Index fund', value: '₹15,000' },
  { label: '10th · Flexi-cap', value: '₹5,000' },
]

export function Investments({ vm }: { vm: HomeState }) {
  // countProg runs 0 → 1 when the screen opens, so the figures count up.
  const { countProg } = vm

  return (
    <div className="hs-screen">
      <div className="hs-title-row" style={{ marginBottom: 22 }}>
        <div className="hs-title">Investments</div>
        <div className="hs-meta-sm">SYNCED 09:42 · JUL 05</div>
      </div>

      <div className="hs-stat-strip">
        <StatCol label="INVESTED" value={inr(840000 * countProg)} />
        <StatCol
          label="CURRENT VALUE"
          value={inr(909800 * countProg)}
          bordered
        />
        <StatCol
          label="RETURNS"
          value={'+' + (8.3 * countProg).toFixed(1) + '%'}
          color="var(--positive)"
          bordered
        />
        <StatCol
          label="XIRR"
          value={(11.2 * countProg).toFixed(1) + '%'}
          bordered
        />
      </div>

      <div className="hs-two-col">
        <div className="hs-two-col-main">
          <div className="hs-section-label">HOLDINGS</div>
          {HOLDINGS.map((h) => (
            <div key={h.name} className="hs-acct-row">
              <div style={{ flex: 1 }}>
                <div className="hs-acct-name">{h.name}</div>
                <div className="hs-row-sub" style={{ marginTop: 2 }}>
                  {h.sub}
                </div>
              </div>
              <div className="hs-holding-value">{h.value}</div>
              <div className="hs-holding-return" style={{ color: h.retColor }}>
                {h.ret}
              </div>
            </div>
          ))}
        </div>

        <div className="hs-rail narrow">
          <div>
            <div className="hs-section-label">ALLOCATION</div>
            <Allocation segments={PORTFOLIO_SPLIT} />
          </div>
          <div>
            <div className="hs-section-label">SIP SCHEDULE</div>
            {SIP_SCHEDULE.map((s) => (
              <MiniRow key={s.label} label={s.label} value={s.value} />
            ))}
            <div className="hs-accent-note">
              TODAY&rsquo;S SIP EXECUTES 7 PM →
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

/* ----------------------------------------------------------- Accounts */

const NET_WORTH_SPLIT: Segment[] = [
  { name: 'Invested', pct: 60, color: 'var(--accent)' },
  { name: 'EPF', pct: 17, color: 'var(--info)' },
  { name: 'Bank + cash', pct: 23, color: 'var(--warn)' },
]

const BANK_ACCOUNTS = [
  {
    name: 'HDFC salary account',
    sub: '····4821 · PRIMARY',
    value: '₹1,24,310',
  },
  { name: 'SBI savings', sub: '····3390 · EMERGENCY FUND', value: '₹2,10,000' },
  { name: 'Cash', sub: 'WALLET · UPDATED MANUALLY', value: '₹5,500' },
]

const UPCOMING = [
  { label: 'Credit card autopay', value: 'SUN' },
  { label: 'Rent transfer', value: '1ST' },
  { label: 'Salary credit', value: '31ST', valueColor: 'var(--positive)' },
]

export function Accounts({ vm }: { vm: HomeState }) {
  const { go } = vm

  return (
    <div className="hs-screen">
      <div className="hs-title-row" style={{ marginBottom: 22 }}>
        <div className="hs-title">Accounts</div>
        <div className="hs-meta-sm">SYNCED 09:42 · JUL 05</div>
      </div>

      <div className="hs-stat-strip">
        <StatCol label="NET WORTH" value="₹14,86,400" />
        <StatCol label="ASSETS" value="₹15,09,810" bordered />
        <StatCol label="OWED" value="−₹23,410" color="var(--accent)" bordered />
        <StatCol
          label="VS LAST MONTH"
          value="+₹38,900"
          color="var(--positive)"
          bordered
        />
      </div>

      <div className="hs-two-col">
        <div className="hs-two-col-main">
          <div className="hs-section-label">BANK</div>
          {BANK_ACCOUNTS.map((a) => (
            <AcctRow key={a.name} {...a} />
          ))}

          <div className="hs-section-label" style={{ marginTop: 26 }}>
            INVESTED
          </div>
          <AcctRow
            name="Investments portfolio"
            sub="MF + STOCKS + PPF + GOLD"
            value="₹9,09,800"
            extra={
              <button
                type="button"
                className="hs-hobby-cta"
                onClick={() => go('invest')}
              >
                VIEW →
              </button>
            }
          />
          <AcctRow name="EPF" sub="EMPLOYER · AUTO" value="₹2,60,200" />

          <div className="hs-section-label" style={{ marginTop: 26 }}>
            OWED
          </div>
          <AcctRow
            name="HDFC credit card"
            sub="DUE SUN 9 AM · AUTOPAY ON"
            value="−₹23,410"
            valueColor="var(--accent)"
          />
        </div>

        <div className="hs-rail narrow">
          <div>
            <div className="hs-section-label">WHERE IT SITS</div>
            <Allocation segments={NET_WORTH_SPLIT} />
          </div>
          <div>
            <div className="hs-section-label">UPCOMING</div>
            {UPCOMING.map((u) => (
              <MiniRow key={u.label} {...u} />
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

/* -------------------------------------------------------------- Spend */

const BY_CATEGORY = [
  { name: 'Fixed (rent, bills)', color: 'var(--ink)', value: '₹31,400' },
  { name: 'Groceries', color: 'var(--positive)', value: '₹4,320' },
  { name: 'Eating out', color: 'var(--warn)', value: '₹3,180' },
  { name: 'Hobbies', color: 'var(--accent)', value: '₹1,100' },
  { name: 'Transport', color: 'var(--info)', value: '₹1,530' },
  { name: 'Subscriptions', color: 'var(--check-border)', value: '₹650' },
]

export function Spend({ vm }: { vm: HomeState }) {
  const { newSpend, openC } = vm

  // Cash expenses the user just logged are today's, and go on top of the
  // synced log. One list, so one block of markup instead of two.
  const spends = [
    ...newSpend.map((sp) => ({
      name: sp.name,
      dot: sp.dot,
      cat: sp.cat + ' · CASH',
      price: sp.price,
      when: 'TODAY',
    })),
    ...SEED_SPEND,
  ]

  return (
    <div className="hs-screen with-rail">
      <div className="hs-main-col wide">
        <div className="hs-title-row">
          <div className="hs-title">Spend</div>
          <div className="hs-meta-sm">JULY · DAY 5 OF 31</div>
        </div>
        <div className="hs-meta" style={{ marginBottom: 24 }}>
          ₹42,180 SPENT · 56% OF BUDGET
        </div>

        <div className="hs-section-label">RECENT</div>
        {spends.map((sp, i) => (
          <div key={sp.name + i} className="hs-agenda-row">
            <div className="hs-agenda-time">{sp.when}</div>
            <div style={{ flex: 1 }}>
              <div className="hs-agenda-what">{sp.name}</div>
              <div className="hs-row-sub" style={{ marginTop: 2 }}>
                <span style={{ color: sp.dot }}>●</span> {sp.cat}
              </div>
            </div>
            <div className="hs-wish-price">{sp.price}</div>
          </div>
        ))}

        <div className="hs-add-row">
          <div className="hs-add-plus">+</div>
          <div className="hs-add-prompt">Log a cash expense</div>
          <button
            type="button"
            className="hs-add-details"
            onClick={openC('spend')}
          >
            + ADD
          </button>
        </div>
      </div>

      <div className="hs-rail narrow">
        <div>
          <div className="hs-section-label">THIS MONTH</div>
          <div className="hs-big-stat">
            <div className="hs-big-stat-value">₹42,180</div>
          </div>
          <div className="hs-bar-track" style={{ height: 6, marginTop: 12 }}>
            <div className="hs-bar-fill" style={{ width: '56%' }} />
          </div>
          <div className="hs-meta-sm" style={{ marginTop: 10 }}>
            56% OF ₹75,000 · ₹32,820 LEFT
          </div>
        </div>

        <div>
          <div className="hs-section-label">BY CATEGORY</div>
          {BY_CATEGORY.map((c) => (
            <MiniRow
              key={c.name}
              label={c.name}
              dotColor={c.color}
              value={c.value}
            />
          ))}
        </div>

        <div>
          <div className="hs-section-label">DAILY AVERAGE</div>
          <div className="hs-rail-stat">
            <div className="hs-rail-stat-label">Excluding fixed</div>
            <div className="hs-rail-stat-value">
              ₹2,156<span className="hs-unit">/DAY</span>
            </div>
          </div>
          <div className="hs-delta-row">▼ ₹340 UNDER JUNE&rsquo;S PACE</div>
        </div>
      </div>
    </div>
  )
}

/* ------------------------------------------------------------- Budget */

export function Budget() {
  return (
    <div className="hs-screen">
      <div style={{ maxWidth: 680 }}>
        <div className="hs-title-row" style={{ marginBottom: 2 }}>
          <div className="hs-title">Budget</div>
          <div className="hs-meta-sm">JULY · ₹75,000 PLANNED</div>
        </div>
        <div className="hs-meta" style={{ marginBottom: 26 }}>
          ₹42,180 SPENT · ₹32,820 REMAINING · 26 DAYS LEFT
        </div>

        <div className="hs-section-label">ENVELOPES</div>
        {SEED_ENVELOPES.map((e) => (
          <div key={e.name} className="hs-book-row">
            <div className="hs-row-between">
              <div className="hs-wish-name">{e.name}</div>
              <div className="hs-book-pct">
                {e.spent}{' '}
                <span style={{ color: 'var(--muted)' }}>/ {e.budget}</span>
              </div>
            </div>
            <div className="hs-bar-track" style={{ marginTop: 10 }}>
              <div
                className="hs-bar-fill is-grown"
                style={{ width: e.pct + '%', background: e.color }}
              />
            </div>
            <div className="hs-envelope-note" style={{ color: e.noteColor }}>
              {e.note}
            </div>
          </div>
        ))}

        <div style={{ display: 'flex', gap: 14, marginTop: 22 }}>
          <div className="hs-stat-tile">
            <div className="hs-stat-label">SAFE TO SPEND</div>
            <div className="hs-stat-value" style={{ color: 'var(--positive)' }}>
              ₹1,262<span className="hs-unit">/DAY</span>
            </div>
            <div className="hs-stat-unit">FOR THE NEXT 26 DAYS</div>
          </div>
          <div className="hs-stat-tile">
            <div className="hs-stat-label">JUNE RESULT</div>
            <div className="hs-stat-value">₹68,340</div>
            <div className="hs-stat-unit" style={{ color: 'var(--positive)' }}>
              ₹6,660 UNDER BUDGET
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
