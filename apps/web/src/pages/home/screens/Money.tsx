import type { HomeState } from '../useHomeState'
import { SEED_SPEND, SEED_ENVELOPES } from '../seedData'

export function Investments({ vm }: { vm: HomeState }) {
  const { countProg } = vm
  const inr = (n: number) => '₹' + Math.round(n).toLocaleString('en-IN')
  const investedDisp = inr(840000 * countProg)
  const currentDisp = inr(909800 * countProg)
  const returnsDisp = '+' + (8.3 * countProg).toFixed(1) + '%'
  const xirrDisp = (11.2 * countProg).toFixed(1) + '%'

  const holdings = [
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
  const allocation = [
    { name: 'Index fund', pct: 38, color: 'var(--accent)' },
    { name: 'Flexi-cap', pct: 21, color: '#C0913C' },
    { name: 'Stocks', pct: 17, color: '#5A6E8C' },
    { name: 'PPF', pct: 18, color: 'var(--positive)' },
    { name: 'Gold', pct: 6, color: 'var(--check-border)' },
  ]

  return (
    <div className="hs-screen">
      <div className="hs-title-row" style={{ marginBottom: 22 }}>
        <div className="hs-title">Investments</div>
        <div className="hs-meta-sm">SYNCED 09:42 · JUL 05</div>
      </div>
      <div
        style={{
          display: 'flex',
          borderTop: '1px solid var(--ink)',
          borderBottom: '1px solid var(--line)',
          padding: '18px 0',
          marginBottom: 24,
        }}
      >
        <StatCol label="INVESTED" value={investedDisp} />
        <StatCol label="CURRENT VALUE" value={currentDisp} bordered />
        <StatCol
          label="RETURNS"
          value={returnsDisp}
          color="var(--positive)"
          bordered
        />
        <StatCol label="XIRR" value={xirrDisp} bordered />
      </div>
      <div style={{ display: 'flex', gap: 40 }}>
        <div style={{ flex: 1.5, minWidth: 0 }}>
          <div className="hs-section-label">HOLDINGS</div>
          {holdings.map((h) => (
            <div
              key={h.name}
              style={{
                display: 'flex',
                alignItems: 'center',
                padding: '13px 0',
                borderBottom: '1px solid var(--line-soft)',
              }}
            >
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 14, fontWeight: 500 }}>{h.name}</div>
                <div className="hs-row-sub" style={{ marginTop: 2 }}>
                  {h.sub}
                </div>
              </div>
              <div
                style={{
                  font: '500 13px "IBM Plex Mono",monospace',
                  width: 100,
                  textAlign: 'right',
                }}
              >
                {h.value}
              </div>
              <div
                style={{
                  font: '500 12px "IBM Plex Mono",monospace',
                  color: h.retColor,
                  width: 76,
                  textAlign: 'right',
                }}
              >
                {h.ret}
              </div>
            </div>
          ))}
        </div>
        <div className="hs-rail narrow">
          <div>
            <div className="hs-section-label">ALLOCATION</div>
            <AllocBar segments={allocation} />
            <LegendList segments={allocation} />
          </div>
          <div>
            <div className="hs-section-label">SIP SCHEDULE</div>
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                padding: '9px 0',
                borderBottom: '1px solid var(--line-soft)',
              }}
            >
              <div style={{ fontSize: 13, color: 'var(--text-2)' }}>
                5th · Index fund
              </div>
              <div style={{ font: '500 12px "IBM Plex Mono",monospace' }}>
                ₹15,000
              </div>
            </div>
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                padding: '9px 0',
                borderBottom: '1px solid var(--line-soft)',
              }}
            >
              <div style={{ fontSize: 13, color: 'var(--text-2)' }}>
                10th · Flexi-cap
              </div>
              <div style={{ font: '500 12px "IBM Plex Mono",monospace' }}>
                ₹5,000
              </div>
            </div>
            <div
              style={{
                font: '400 10px "IBM Plex Mono",monospace',
                color: 'var(--accent)',
                marginTop: 10,
              }}
            >
              TODAY&rsquo;S SIP EXECUTES 7 PM →
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

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
    <div
      style={{
        flex: 1,
        borderLeft: bordered ? '1px solid var(--line)' : 'none',
        paddingLeft: bordered ? 28 : 0,
      }}
    >
      <div
        style={{
          font: '500 9px "IBM Plex Mono",monospace',
          letterSpacing: '.14em',
          color: 'var(--muted)',
        }}
      >
        {label}
      </div>
      <div
        style={{
          font: '500 24px "IBM Plex Mono",monospace',
          marginTop: 6,
          color,
        }}
      >
        {value}
      </div>
    </div>
  )
}

function AllocBar({
  segments,
}: {
  segments: { pct: number; color: string }[]
}) {
  return (
    <div
      style={{
        display: 'flex',
        height: 10,
        borderRadius: 3,
        overflow: 'hidden',
        marginTop: 14,
        transformOrigin: 'left',
        animation: 'barGrow .8s cubic-bezier(.22,1,.36,1) .2s backwards',
      }}
    >
      {segments.map((s, i) => (
        <div key={i} style={{ width: s.pct + '%', background: s.color }} />
      ))}
    </div>
  )
}

function LegendList({
  segments,
}: {
  segments: { name: string; pct: number; color: string }[]
}) {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 6,
        marginTop: 12,
      }}
    >
      {segments.map((s) => (
        <div
          key={s.name}
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            fontSize: 12,
            color: 'var(--text-2)',
          }}
        >
          <div>
            <span style={{ color: s.color }}>●</span> {s.name}
          </div>
          <div
            style={{ fontFamily: '"IBM Plex Mono",monospace', fontSize: 11 }}
          >
            {s.pct}%
          </div>
        </div>
      ))}
    </div>
  )
}

export function Accounts({ vm }: { vm: HomeState }) {
  const { go } = vm
  const allocation = [
    { name: 'Invested', pct: 60, color: 'var(--accent)' },
    { name: 'EPF', pct: 17, color: '#5A6E8C' },
    { name: 'Bank + cash', pct: 23, color: '#C0913C' },
  ]
  return (
    <div className="hs-screen">
      <div className="hs-title-row" style={{ marginBottom: 22 }}>
        <div className="hs-title">Accounts</div>
        <div className="hs-meta-sm">SYNCED 09:42 · JUL 05</div>
      </div>
      <div
        style={{
          display: 'flex',
          borderTop: '1px solid var(--ink)',
          borderBottom: '1px solid var(--line)',
          padding: '18px 0',
          marginBottom: 24,
        }}
      >
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
      <div style={{ display: 'flex', gap: 40 }}>
        <div style={{ flex: 1.5, minWidth: 0 }}>
          <div className="hs-section-label">BANK</div>
          <AcctRow
            name="HDFC salary account"
            sub="····4821 · PRIMARY"
            value="₹1,24,310"
          />
          <AcctRow
            name="SBI savings"
            sub="····3390 · EMERGENCY FUND"
            value="₹2,10,000"
          />
          <AcctRow name="Cash" sub="WALLET · UPDATED MANUALLY" value="₹5,500" />
          <div className="hs-section-label" style={{ marginTop: 26 }}>
            INVESTED
          </div>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              padding: '14px 0',
              borderBottom: '1px solid var(--line-soft)',
            }}
          >
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 14, fontWeight: 500 }}>
                Investments portfolio
              </div>
              <div className="hs-row-sub" style={{ marginTop: 2 }}>
                MF + STOCKS + PPF + GOLD
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
              <div style={{ font: '500 14px "IBM Plex Mono",monospace' }}>
                ₹9,09,800
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
                onClick={() => go('invest')}
              >
                VIEW →
              </button>
            </div>
          </div>
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
            <AllocBar segments={allocation} />
            <LegendList segments={allocation} />
          </div>
          <div>
            <div className="hs-section-label">UPCOMING</div>
            <MiniRow label="Credit card autopay" value="SUN" />
            <MiniRow label="Rent transfer" value="1ST" />
            <MiniRow
              label="Salary credit"
              value="31ST"
              valueColor="var(--positive)"
            />
          </div>
        </div>
      </div>
    </div>
  )
}

function AcctRow({
  name,
  sub,
  value,
  valueColor,
}: {
  name: string
  sub: string
  value: string
  valueColor?: string
}) {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        padding: '14px 0',
        borderBottom: '1px solid var(--line-soft)',
      }}
    >
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 14, fontWeight: 500 }}>{name}</div>
        <div className="hs-row-sub" style={{ marginTop: 2 }}>
          {sub}
        </div>
      </div>
      <div
        style={{
          font: '500 14px "IBM Plex Mono",monospace',
          color: valueColor,
        }}
      >
        {value}
      </div>
    </div>
  )
}

function MiniRow({
  label,
  value,
  valueColor,
}: {
  label: string
  value: string
  valueColor?: string
}) {
  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'space-between',
        padding: '9px 0',
        borderBottom: '1px solid var(--line-soft)',
      }}
    >
      <div style={{ fontSize: 13, color: 'var(--text-2)' }}>{label}</div>
      <div
        style={{
          font: '400 10px "IBM Plex Mono",monospace',
          color: valueColor || 'var(--muted)',
        }}
      >
        {value}
      </div>
    </div>
  )
}

export function Spend({ vm }: { vm: HomeState }) {
  const { newSpend, openC } = vm
  const byCategory = [
    { name: 'Fixed (rent, bills)', color: 'var(--ink)', value: '₹31,400' },
    { name: 'Groceries', color: 'var(--positive)', value: '₹4,320' },
    { name: 'Eating out', color: '#C0913C', value: '₹3,180' },
    { name: 'Hobbies', color: 'var(--accent)', value: '₹1,100' },
    { name: 'Transport', color: '#5A6E8C', value: '₹1,530' },
    { name: 'Subscriptions', color: 'var(--check-border)', value: '₹650' },
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
        {newSpend.map((sp, i) => (
          <div
            key={i}
            style={{
              display: 'flex',
              gap: 18,
              padding: '13px 0',
              borderBottom: '1px solid var(--line-soft)',
              animation: 'rowIn .35s ease backwards',
            }}
          >
            <div
              style={{
                font: '400 11px "IBM Plex Mono",monospace',
                color: 'var(--muted)',
                width: 66,
                flex: 'none',
                paddingTop: 2,
              }}
            >
              TODAY
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 14, fontWeight: 500 }}>{sp.name}</div>
              <div className="hs-row-sub" style={{ marginTop: 2 }}>
                <span style={{ color: sp.dot }}>●</span> {sp.cat} · CASH
              </div>
            </div>
            <div style={{ font: '500 13px "IBM Plex Mono",monospace' }}>
              {sp.price}
            </div>
          </div>
        ))}
        {SEED_SPEND.map((sp) => (
          <div
            key={sp.name}
            style={{
              display: 'flex',
              gap: 18,
              padding: '13px 0',
              borderBottom: '1px solid var(--line-soft)',
            }}
          >
            <div
              style={{
                font: '400 11px "IBM Plex Mono",monospace',
                color: 'var(--muted)',
                width: 66,
                flex: 'none',
                paddingTop: 2,
              }}
            >
              {sp.when}
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 14, fontWeight: 500 }}>{sp.name}</div>
              <div className="hs-row-sub" style={{ marginTop: 2 }}>
                <span style={{ color: sp.dot }}>●</span> {sp.cat}
              </div>
            </div>
            <div style={{ font: '500 13px "IBM Plex Mono",monospace' }}>
              {sp.price}
            </div>
          </div>
        ))}
        <div className="hs-add-row">
          <div className="hs-add-plus">+</div>
          <div
            style={{
              flex: 1,
              font: '400 13px "IBM Plex Sans",sans-serif',
              color: 'var(--muted)',
            }}
          >
            Log a cash expense
          </div>
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
          <div
            style={{
              display: 'flex',
              alignItems: 'baseline',
              gap: 8,
              marginTop: 14,
            }}
          >
            <div style={{ font: '500 32px "IBM Plex Mono",monospace' }}>
              ₹42,180
            </div>
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
          {byCategory.map((c) => (
            <MiniRow key={c.name} label={`● ${c.name}`} value={c.value} />
          ))}
        </div>
        <div>
          <div className="hs-section-label">DAILY AVERAGE</div>
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'baseline',
              marginTop: 12,
            }}
          >
            <div style={{ fontSize: 13, color: 'var(--text-2)' }}>
              Excluding fixed
            </div>
            <div style={{ font: '500 14px "IBM Plex Mono",monospace' }}>
              ₹2,156
              <span style={{ color: 'var(--muted)', fontSize: 10 }}>/DAY</span>
            </div>
          </div>
          <div
            style={{
              font: '400 10px "IBM Plex Mono",monospace',
              color: 'var(--positive)',
              marginTop: 8,
            }}
          >
            ▼ ₹340 UNDER JUNE&rsquo;S PACE
          </div>
        </div>
      </div>
    </div>
  )
}

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
          <div
            key={e.name}
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
              <div style={{ fontSize: 14.5, fontWeight: 500 }}>{e.name}</div>
              <div style={{ font: '500 12px "IBM Plex Mono",monospace' }}>
                {e.spent}{' '}
                <span style={{ color: 'var(--muted)' }}>/ {e.budget}</span>
              </div>
            </div>
            <div
              style={{
                height: 5,
                background: 'var(--track)',
                borderRadius: 3,
                marginTop: 10,
              }}
            >
              <div
                style={{
                  width: e.pct + '%',
                  height: '100%',
                  background: e.color,
                  borderRadius: 3,
                  transformOrigin: 'left',
                  animation:
                    'barGrow .8s cubic-bezier(.22,1,.36,1) .2s backwards',
                }}
              />
            </div>
            <div
              style={{
                font: '400 10px "IBM Plex Mono",monospace',
                color: e.noteColor,
                marginTop: 6,
              }}
            >
              {e.note}
            </div>
          </div>
        ))}
        <div style={{ display: 'flex', gap: 14, marginTop: 22 }}>
          <div className="hs-stat-tile">
            <div className="hs-stat-label">SAFE TO SPEND</div>
            <div className="hs-stat-value" style={{ color: 'var(--positive)' }}>
              ₹1,262
              <span style={{ fontSize: 12, color: 'var(--muted)' }}>/DAY</span>
            </div>
            <div
              style={{
                font: '400 9px "IBM Plex Mono",monospace',
                color: 'var(--muted)',
              }}
            >
              FOR THE NEXT 26 DAYS
            </div>
          </div>
          <div className="hs-stat-tile">
            <div className="hs-stat-label">JUNE RESULT</div>
            <div className="hs-stat-value">₹68,340</div>
            <div
              style={{
                font: '400 9px "IBM Plex Mono",monospace',
                color: 'var(--positive)',
              }}
            >
              ₹6,660 UNDER BUDGET
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
