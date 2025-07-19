import { useEffect } from 'react';

type KeyboardShortcut = {
  key: string;
  ctrl?: boolean;
  shift?: boolean;
  alt?: boolean;
  callback: () => void;
  preventDefault?: boolean;
};

export const useKeyboardShortcuts = (shortcuts: KeyboardShortcut[]) => {
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      for (const shortcut of shortcuts) {
        const isCtrlPressed = shortcut.ctrl ? event.ctrlKey || event.metaKey : true;
        const isShiftPressed = shortcut.shift ? event.shiftKey : true;
        const isAltPressed = shortcut.alt ? event.altKey : true;
        const isKeyPressed = event.key.toLowerCase() === shortcut.key.toLowerCase();

        if (isCtrlPressed && isShiftPressed && isAltPressed && isKeyPressed) {
          if (shortcut.preventDefault) {
            event.preventDefault();
          }
          shortcut.callback();
          break;
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [shortcuts]);
};
