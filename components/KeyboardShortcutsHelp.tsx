'use client';

import { useState, useEffect } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { QuestionMarkCircledIcon, Cross2Icon } from '@radix-ui/react-icons';

export default function KeyboardShortcutsHelp() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Open help with '?' or Cmd/Ctrl + /
      if (
        e.key === '?' ||
        ((e.metaKey || e.ctrlKey) && e.key === '/')
      ) {
        e.preventDefault();
        setOpen(true);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const shortcuts = [
    { category: 'Navigation', items: [
      { keys: ['←', '→'], description: 'Navigate between months/weeks/days' },
      { keys: ['T'], description: 'Go to today' },
    ]},
    { category: 'Views', items: [
      { keys: ['M'], description: 'Switch to month view' },
      { keys: ['W'], description: 'Switch to week view' },
      { keys: ['D'], description: 'Switch to day view' },
    ]},
    { category: 'Actions', items: [
      { keys: ['Esc'], description: 'Close sidebar or dialog' },
      { keys: ['?'], description: 'Show keyboard shortcuts' },
    ]},
  ];

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="rounded-md p-1.5 text-gray-600 hover:bg-gray-100"
        aria-label="Keyboard shortcuts"
      >
        <QuestionMarkCircledIcon className="h-5 w-5" />
      </button>

      <Dialog.Root open={open} onOpenChange={setOpen}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 bg-black/50 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
          <Dialog.Content className="fixed left-[50%] top-[50%] max-h-[85vh] w-[90vw] max-w-[500px] translate-x-[-50%] translate-y-[-50%] overflow-auto rounded-lg bg-white p-6 shadow-lg focus:outline-none data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95">
            <div className="flex items-center justify-between">
              <Dialog.Title className="text-lg font-semibold text-gray-900">
                Keyboard Shortcuts
              </Dialog.Title>
              <Dialog.Close asChild>
                <button
                  className="rounded-md p-1 hover:bg-gray-100"
                  aria-label="Close"
                >
                  <Cross2Icon className="h-5 w-5 text-gray-500" />
                </button>
              </Dialog.Close>
            </div>

            <div className="mt-6 space-y-6">
              {shortcuts.map((section) => (
                <div key={section.category}>
                  <h3 className="text-sm font-semibold text-gray-900">{section.category}</h3>
                  <div className="mt-2 space-y-2">
                    {section.items.map((item, index) => (
                      <div key={index} className="flex items-center justify-between">
                        <span className="text-sm text-gray-700">{item.description}</span>
                        <div className="flex gap-1">
                          {item.keys.map((key) => (
                            <kbd
                              key={key}
                              className="rounded border border-gray-300 bg-gray-50 px-2 py-1 text-xs font-semibold text-gray-700"
                            >
                              {key}
                            </kbd>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </>
  );
}
