"use client";

import { useEffect } from "react";

export function ErrorGuard() {
  useEffect(() => {
    const onError = (ev: ErrorEvent) => {
      try {
        const src = (ev && (ev as any).filename) || (ev && ev.message) || "";
        if (typeof src === "string" && src.startsWith("chrome-extension://")) {
          ev.preventDefault();
          ev.stopImmediatePropagation();
          return false;
        }
      } catch {
        // swallow
      }
      return true;
    };

    const onUnhandledRejection = (ev: PromiseRejectionEvent) => {
      try {
        const reason = ev.reason && ev.reason.stack ? ev.reason.stack : ev.reason;
        if (typeof reason === "string" && reason.includes("chrome-extension://")) {
          ev.preventDefault();
          ev.stopImmediatePropagation();
          return false;
        }
      } catch {
        // swallow
      }
      return true;
    };

    window.addEventListener("error", onError, true);
    window.addEventListener("unhandledrejection", onUnhandledRejection, true);

    return () => {
      window.removeEventListener("error", onError, true);
      window.removeEventListener("unhandledrejection", onUnhandledRejection, true);
    };
  }, []);

  useEffect(() => {
    const win = window as any;
    try {
      if (win?.chrome?.runtime?.sendMessage) {
        const original = win.chrome.runtime.sendMessage;
        win.__origChromeRuntimeSendMessage = original;
        win.chrome.runtime.sendMessage = function (...args: any[]) {
          try {
            return original.apply(this, args);
          } catch (e) {
            // Suppress extension messaging errors coming from in-page scripts
            // which can crash the dev overlay. Log for visibility.
            // eslint-disable-next-line no-console
            console.warn("Suppressed chrome.runtime.sendMessage error", e);
            return undefined;
          }
        };
        return () => {
          if (win.__origChromeRuntimeSendMessage) {
            win.chrome.runtime.sendMessage = win.__origChromeRuntimeSendMessage;
            delete win.__origChromeRuntimeSendMessage;
          }
        };
      }
    } catch (e) {
      // ignore
    }
    return undefined;
  }, []);

  return null;
}

export default ErrorGuard;
