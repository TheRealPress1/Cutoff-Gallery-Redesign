// Pinches emit ctrl+wheel in Chromium and GestureEvents in Safari.
// Ordinary vertical scrolling also moves toward or away from a photograph.
// Horizontal scrolling steps between works, once per swipe and its momentum.
// Keep listening on the viewport so the new information panel cannot interrupt
// a pinch that began over the room.
export function bindGalleryPinch(viewport, { isSceneTarget, onStart, onZoomIn, onZoomOut, onNavigate }) {
  let wheelActive = false;
  let gestureActive = false;
  let wheelX = 0;
  let wheelY = 0;
  let wheelAxis = null;
  let wheelMode = null;
  let triggered = false;
  let idleTimer;
  const ownerDocument = viewport.ownerDocument;
  const ownerWindow = ownerDocument?.defaultView;

  function reset() {
    clearTimeout(idleTimer);
    wheelActive = false;
    gestureActive = false;
    wheelX = wheelY = 0;
    wheelAxis = null;
    wheelMode = null;
    triggered = false;
  }

  function visibilityChange() {
    if (ownerDocument.hidden) reset();
  }

  function start() {
    if (wheelActive || gestureActive) return;
    wheelX = wheelY = 0;
    wheelAxis = null;
    triggered = false;
    onStart?.();
  }

  function zoom(event, direction) {
    if (triggered) return;
    triggered = true;
    if (direction > 0) onZoomIn?.(event);
    else onZoomOut?.(event);
  }

  function waitForWheelEnd() {
    clearTimeout(idleTimer);
    idleTimer = setTimeout(() => {
      wheelActive = false;
      wheelX = wheelY = 0;
      wheelAxis = null;
      wheelMode = null;
    }, 250);
  }

  function wheel(event) {
    const pinching = event.ctrlKey;
    if (!wheelActive && !gestureActive && !isSceneTarget(event.target)) return;
    // Cancel from the first event, including tiny deltas: Safari can otherwise
    // start browser-history navigation before our horizontal threshold is met.
    event.preventDefault();
    start();
    wheelActive = true;
    const mode = pinching ? 'pinch' : 'scroll';
    if (mode !== wheelMode) {
      wheelX = wheelY = 0;
      wheelAxis = null;
    }
    wheelMode = mode;
    const unitX = event.deltaMode === 1 ? 16 : event.deltaMode === 2 ? viewport.clientWidth : 1;
    const unitY = event.deltaMode === 1 ? 16 : event.deltaMode === 2 ? viewport.clientHeight : 1;
    // Some browsers represent Shift+wheel as a vertical delta with Shift set.
    const shifted = !pinching && event.shiftKey && !event.deltaX;
    wheelX += (shifted ? event.deltaY : event.deltaX) * unitX;
    // Scrolling down approaches the work; a pinch uses the opposite delta sign.
    wheelY += (shifted ? 0 : event.deltaY) * unitY * (pinching ? -1 : 1);
    if (pinching) {
      if (Math.abs(wheelY) >= 8) zoom(event, Math.sign(wheelY));
    } else {
      const x = Math.abs(wheelX);
      const y = Math.abs(wheelY);
      // Ignore early diagonal jitter, then retain the chosen axis for the burst.
      if (!wheelAxis && Math.max(x, y) >= 12) {
        if (x >= y * 1.2) wheelAxis = 'x';
        else if (y >= x * 1.2) wheelAxis = 'y';
      }
      if (!triggered && wheelAxis === 'x' && x >= 48) {
        triggered = true;
        onNavigate?.(Math.sign(wheelX));
      } else if (wheelAxis === 'y' && y >= 48) {
        zoom(event, Math.sign(wheelY));
      }
    }
    waitForWheelEnd();
  }

  function gestureStart(event) {
    if (!wheelActive && !gestureActive && !isSceneTarget(event.target)) return;
    event.preventDefault();
    start();
    gestureActive = true;
  }

  function gestureChange(event) {
    if (!gestureActive) return;
    event.preventDefault();
    // Safari's scale is cumulative from gesturestart, not a per-event delta.
    if (event.scale >= 1.08) zoom(event, 1);
    else if (event.scale <= 1 / 1.08) zoom(event, -1);
  }

  function gestureEnd(event) {
    if (!gestureActive) return;
    event.preventDefault();
    gestureActive = false;
    // Keep Safari's trailing wheel events in the same already-latched gesture.
    wheelActive = true;
    waitForWheelEnd();
  }

  const options = { passive: false, capture: true };
  viewport.addEventListener('wheel', wheel, options);
  viewport.addEventListener('gesturestart', gestureStart, options);
  viewport.addEventListener('gesturechange', gestureChange, options);
  viewport.addEventListener('gestureend', gestureEnd, options);
  ownerWindow?.addEventListener('blur', reset);
  ownerDocument?.addEventListener('visibilitychange', visibilityChange);

  return () => {
    reset();
    viewport.removeEventListener('wheel', wheel, options);
    viewport.removeEventListener('gesturestart', gestureStart, options);
    viewport.removeEventListener('gesturechange', gestureChange, options);
    viewport.removeEventListener('gestureend', gestureEnd, options);
    ownerWindow?.removeEventListener('blur', reset);
    ownerDocument?.removeEventListener('visibilitychange', visibilityChange);
  };
}
