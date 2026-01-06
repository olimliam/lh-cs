import '@testing-library/jest-dom';

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: (query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: () => {},
    removeListener: () => {},
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => {},
  }),
});

// Mock ResizeObserver
global.ResizeObserver = class ResizeObserver {
  constructor(cb: ResizeObserverCallback) {
    this.cb = cb;
  }
  cb: ResizeObserverCallback;
  observe() {}
  unobserve() {}
  disconnect() {}
};

// Mock IntersectionObserver
global.IntersectionObserver = class IntersectionObserver {
  root: Element | null = null;
  rootMargin: string = '';
  thresholds: ReadonlyArray<number> = [];
  constructor(
    _: IntersectionObserverCallback,
    options?: IntersectionObserverInit
  ) {
    if (options) {
      this.root = options.root instanceof Element ? options.root : null;
      this.rootMargin = options.rootMargin || '';
      this.thresholds = Array.isArray(options.threshold)
        ? options.threshold
        : typeof options.threshold === 'number'
          ? [options.threshold]
          : [];
    }
  }
  observe() {}
  unobserve() {}
  disconnect() {}
  takeRecords(): IntersectionObserverEntry[] {
    return [];
  }
};
