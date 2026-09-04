export default function Splash() {
  return (
    <div className="hs-splash">
      <svg width="150" height="130" viewBox="275 172 474 412" fill="none">
        <line
          className="hs-splash-line"
          x1="289"
          y1="186"
          x2="512"
          y2="570"
          pathLength={1}
          style={{ animation: 'drawSeg .55s ease-out .1s both' }}
        />
        <line
          className="hs-splash-line"
          x1="735"
          y1="186"
          x2="512"
          y2="570"
          pathLength={1}
          style={{ animation: 'drawSeg .55s ease-out .1s both' }}
        />
        <line
          className="hs-splash-line"
          x1="289"
          y1="186"
          x2="512"
          y2="399"
          pathLength={1}
          style={{ animation: 'drawSeg .45s ease-out .55s both' }}
        />
        <line
          className="hs-splash-line"
          x1="735"
          y1="186"
          x2="512"
          y2="399"
          pathLength={1}
          style={{ animation: 'drawSeg .45s ease-out .55s both' }}
        />
        <line
          className="hs-splash-line"
          x1="512"
          y1="399"
          x2="512"
          y2="570"
          pathLength={1}
          style={{ animation: 'drawSeg .35s ease-out .95s both' }}
        />
        <circle className="hs-splash-dot" cx="512" cy="267" r="44" />
      </svg>
      <div className="hs-splash-word">KEEL</div>
    </div>
  )
}
