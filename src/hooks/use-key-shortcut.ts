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
      if (e.key === key) {
        e.preventDefault();
        onKeyPressed();
      }
    }

    document.addEventListener("keydown", keyDownHandler);

    return () => {
      document.removeEventListener("keydown", keyDownHandler);
    };
  }, dependencies);
}
