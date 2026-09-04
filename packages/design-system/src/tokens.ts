// Mirrors the CSS custom properties in apps/web/src/index.css — update both together.
export const colors = {
  light: {
    text: '#6b6375',
    textHeading: '#08060d',
    background: '#ffffff',
    border: '#e5e4e7',
    codeBackground: '#f4f3ec',
    accent: '#aa3bff',
    accentBackground: 'rgba(170, 59, 255, 0.1)',
    accentBorder: 'rgba(170, 59, 255, 0.5)',
  },
  dark: {
    text: '#9ca3af',
    textHeading: '#f3f4f6',
    background: '#16171d',
    border: '#2e303a',
    codeBackground: '#1f2028',
    accent: '#c084fc',
    accentBackground: 'rgba(192, 132, 252, 0.15)',
    accentBorder: 'rgba(192, 132, 252, 0.5)',
  },
} as const

export const fonts = {
  sans: "system-ui, 'Segoe UI', Roboto, sans-serif",
  heading: "system-ui, 'Segoe UI', Roboto, sans-serif",
  mono: 'ui-monospace, Consolas, monospace',
} as const
