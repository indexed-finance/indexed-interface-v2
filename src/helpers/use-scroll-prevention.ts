// Code adapted from https://stackoverflow.com/questions/4770025/how-to-disable-scrolling-temporarily
import { useEffect } from "react";

export function useScrollPrevention(shouldPreventScroll: boolean) {
  useEffect(() => {
    if (shouldPreventScroll) {
      // modern Chrome requires { passive: false } when adding event
      let supportsPassive = false;
      try {
        (window as any).addEventListener(
          "test",
          null,
          Object.defineProperty({}, "passive", {
            get: function () {
              supportsPassive = true;
            },
          })
        );
      } catch {}

      // left: 37, up: 38, right: 39, down: 40,
      // spacebar: 32, pageup: 33, pagedown: 34, end: 35, home: 36
      const keys: Record<number, number> = { 37: 1, 38: 1, 39: 1, 40: 1 };
      const preventDefault = (event: Event) => event.preventDefault();
      const preventDefaultForScrollKeys = (
        event: Event & { keyCode: number }
      ) => {
        if (keys[event.keyCode]) {
          preventDefault(event);
          return false;
        }
      };
      const wheelOptions = supportsPassive ? { passive: false } : false;
      const wheelEvent =
        "onwheel" in document.createElement("div") ? "wheel" : "mousewheel";

      window.addEventListener("DOMMouseScroll", preventDefault, false); // older FF
      window.addEventListener(wheelEvent, preventDefault, wheelOptions); // modern desktop
      window.addEventListener("touchmove", preventDefault, wheelOptions); // mobile
      window.addEventListener("keydown", preventDefaultForScrollKeys, false);

      return () => {
        window.removeEventListener("DOMMouseScroll", preventDefault, false);
        window.removeEventListener(
          wheelEvent,
          preventDefault,
          wheelOptions as any
        );
        window.removeEventListener(
          "touchmove",
          preventDefault,
          wheelOptions as any
        );
        window.removeEventListener(
          "keydown",
          preventDefaultForScrollKeys,
          false
        );
      };
    }
  }, [shouldPreventScroll]);
}
