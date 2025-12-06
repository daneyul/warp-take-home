/**
 * Shared dialog styles for consistent dialog appearance across the application
 */

import clsx from 'clsx';

export const dialogOverlayClass = clsx(
  // Positioning
  'fixed inset-0',
  // Background
  'bg-black/50',
  // Animations
  'data-[state=open]:animate-overlay-in',
);

export const dialogContentClass = clsx(
  // Positioning
  'fixed left-1/2 top-1/2',
  '-translate-x-1/2 -translate-y-1/2',
  // Sizing
  'max-h-[85vh] w-[90vw] max-w-lg',
  // Layout
  'overflow-auto',
  // Styling
  'rounded-md bg-white p-6 shadow-lg',
  // Focus
  'focus:outline-none',
  // Animations
  'data-[state=open]:animate-in',
);

