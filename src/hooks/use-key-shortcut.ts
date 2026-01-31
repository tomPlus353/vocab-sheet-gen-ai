import { useEffect } from "react";

interface UseKeyboardShortcutArgs {
  key: string;
  onKeyPressed: () => void;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  dependencies?: any[];
}

export function useKeyboardShortcut({
  key,
  onKeyPressed,
  dependencies = [],
}: UseKeyboardShortcutArgs) {
  useEffect(() => {
    function keyDownHandler(e: globalThis.KeyboardEvent) {
      // If any modifier key is pressed, ignore — allow combinations like Cmd+F, Ctrl+C to work
      if (e.ctrlKey || e.metaKey || e.altKey || e.shiftKey) return;

      if (e.key === key) {
        onKeyPressed();
      }
    }

    document.addEventListener("keydown", keyDownHandler);

    return () => {
      document.removeEventListener("keydown", keyDownHandler);
    };
  }, dependencies);
}
