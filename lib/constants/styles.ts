import clsx from 'clsx';

// Base component styles
const baseInput = clsx(
  'w-full rounded-md border px-3 py-2 text-sm',
  'focus:outline-none focus:ring-1'
);

const baseButton = clsx(
  'rounded-md px-4 py-2 text-sm font-medium',
  'transition-colors'
);

// Form input styles
export const formFieldClass = clsx(
  'mt-1',
  baseInput,
  'border-zinc-300',
  'focus:border-blue-500 focus:ring-blue-500'
);

export const formFieldErrorClass = clsx(
  'mt-1',
  baseInput,
  'border-red-500',
  'focus:border-red-500 focus:ring-red-500'
);

export const formLabelClass = clsx(
  'block text-sm font-medium'
);

export const formErrorMessageClass = clsx(
  'mt-1 text-sm text-red-600'
);

// Button styles
export const buttonCancelClass = clsx(
  baseButton,
  'border border-zinc-300',
  'hover:bg-zinc-100'
);

export const buttonSecondaryClass = clsx(
  baseButton,
  'border border-zinc-300',
  'hover:bg-zinc-100'
);

export const buttonPrimaryClass = clsx(
  baseButton,
  'bg-black/80 text-white',
  'hover:bg-black/70'
);

export const buttonDisabledClass = clsx(
  baseButton,
  'bg-zinc-300 text-zinc-500',
  'cursor-not-allowed'
);

export const buttonDeleteClass = clsx(
  'flex items-center justify-center',
  'rounded-md border border-red-300',
  'px-3 py-2 text-sm font-medium',
  'text-red-700',
  'hover:bg-red-100',
  'transition-all duration-300 ease-out',
  'overflow-hidden whitespace-nowrap'
);

export const buttonDeleteExpandedClass = clsx(
  'flex items-center justify-center',
  'rounded-md border border-red-300',
  'bg-red-50 px-4 py-2 text-sm font-medium',
  'text-red-700',
  'hover:bg-red-100',
  'transition-all duration-300 ease-out',
  'overflow-hidden whitespace-nowrap'
);

// Select component styles
export const selectTriggerClass = clsx(
  'mt-1',
  baseInput,
  'border-zinc-300',
  'focus:border-blue-500 focus:ring-blue-500',
  'flex items-center justify-between'
);

export const selectContentClass = clsx(
  'min-w-(--radix-select-trigger-width)',
  'overflow-hidden rounded-lg',
  'border border-zinc-300',
  'bg-white shadow-lg',
  'z-50'
);

export const selectItemClass = clsx(
  'relative flex items-center',
  'cursor-pointer select-none',
  'rounded-md px-4 py-2 text-sm',
  'outline-none',
  'data-highlighted:bg-zinc-100',
  'data-[state=checked]:bg-zinc-200'
);

export const selectLabelClass = clsx(
  'px-4 py-2',
  'text-xs font-semibold text-zinc-500'
);

export const selectSeparatorClass = clsx(
  'my-1 h-px bg-zinc-200'
);

// Checkbox styles
export const checkboxClass = clsx(
  'flex h-4 w-4 items-center justify-center',
  'rounded border border-zinc-300',
  'bg-white',
  'hover:bg-zinc-100',
  'data-[state=checked]:border-black',
  'data-[state=checked]:bg-black'
);

// Dialog close button
export const dialogCloseButtonClass = clsx(
  'rounded-md p-1',
  'hover:bg-zinc-100'
);

// Alert/Warning styles
export const warningAlertClass = clsx(
  'flex items-center gap-2',
  'rounded-md border border-yellow-200',
  'bg-yellow-50 px-3 py-2'
);

export const warningTextClass = clsx(
  'text-sm text-yellow-800'
);

export const ICON_SIZES = {
  xs: 'h-3 w-3',
  sm: 'h-3.5 w-3.5',
  md: 'h-4 w-4',
  lg: 'h-5 w-5',
} as const;
