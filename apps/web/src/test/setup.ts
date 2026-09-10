import '@testing-library/jest-dom'

/**
 * jsdom ships no `window.matchMedia`, and anything that asks about
 * `prefers-reduced-motion` — our own helper, or GSAP's matchMedia — throws
 * without it.
 *
 * The stub answers "no preference" to everything, which is the browser default
 * and keeps tests exercising the normal, animated path. A test that wants the
 * reduced-motion branch should override this for its own duration.
 */
if (!window.matchMedia) {
  window.matchMedia = (query: string): MediaQueryList =>
    ({
      matches: false,
      media: query,
      onchange: null,
      addListener: () => {},
      removeListener: () => {},
      addEventListener: () => {},
      removeEventListener: () => {},
      dispatchEvent: () => false,
    }) as MediaQueryList
}
