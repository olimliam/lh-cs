// UI Components
export { SynchronizedTourViewer } from './ui/synchronized-tour-viewer';

// Store and Types
export { useViewportSyncStore } from './model/viewport-sync.store';
export type {
  ViewportData,
  ViewportSyncPayload,
  ViewportSyncState,
  ViewportSyncActions,
} from './model/viewport-sync.types';

// Utilities
export { ViewportDetector } from './lib/viewport-detector';