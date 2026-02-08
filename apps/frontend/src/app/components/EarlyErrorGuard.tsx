"use client";

export default function EarlyErrorGuard() {
  const script = `(() => {
    try {
      // Suppress errors originating from browser extensions that pollute dev overlay
      function isExtensionSource(src) {
        return typeof src === 'string' && (src.startsWith('chrome-extension://') || src.startsWith('moz-extension://'));
      }

      window.addEventListener('error', function (ev) {
        try {
          const e = ev || window.event;
          const filename = e && e.filename ? e.filename : (e && e.message) || '';
          if (isExtensionSource(filename) || (typeof filename === 'string' && filename.includes('chrome.runtime.sendMessage'))) {
            ev.preventDefault && ev.preventDefault();
            ev.stopImmediatePropagation && ev.stopImmediatePropagation();
            return false;
          }
        } catch (err) {
          // ignore
        }
        return true;
      }, true);

      window.addEventListener('unhandledrejection', function (ev) {
        try {
          const reason = ev && ev.reason ? (ev.reason.stack || ev.reason) : '';
          if (typeof reason === 'string' && reason.indexOf('chrome-extension://') !== -1) {
            ev.preventDefault && ev.preventDefault();
            ev.stopImmediatePropagation && ev.stopImmediatePropagation();
            return false;
          }
        } catch (err) {}
        return true;
      }, true);

      // Wrap chrome.runtime.sendMessage if present to avoid throws when extensions call it
      try {
        if (window.chrome && window.chrome.runtime && typeof window.chrome.runtime.sendMessage === 'function') {
          const orig = window.chrome.runtime.sendMessage;
          window.chrome.runtime.sendMessage = function () {
            try {
              return orig.apply(this, arguments);
            } catch (e) {
              // swallow extension messaging errors
              try { console.warn('Suppressed chrome.runtime.sendMessage error', e); } catch {};
              return undefined;
            }
          };
        }
      } catch (e) {}
    } catch (e) {}
  })();`;

  return (
    // eslint-disable-next-line react/no-danger
    <script dangerouslySetInnerHTML={{ __html: script }} />
  );
}
