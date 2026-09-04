import { forwardRef } from 'react'

interface LogoMarkProps {
  size?: number
  strokeColor?: string
  dotColor?: string
  className?: string
}

const LogoMark = forwardRef<SVGSVGElement, LogoMarkProps>(function LogoMark(
  { size = 22, strokeColor = '#221F1B', dotColor = '#AF4933', className },
  ref,
) {
  const height = size * (520 / 610)
  return (
    <svg
      ref={ref}
      className={className}
      width={size}
      height={height}
      viewBox="210 245 610 520"
      fill="none"
    >
      <g
        stroke={strokeColor}
        strokeWidth={17}
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M232 267 L515 748 L796 267" />
        <path d="M232 267 L515 527 L796 267" />
        <path d="M515 527 L515 748" />
      </g>
      <circle cx={512} cy={372} r={55} fill={dotColor} />
    </svg>
  )
})

export default LogoMark
