// A touch contact selects on tap or advances one work on horizontal release.
// Detail mode instead pans the photograph; that choice lasts for the contact.
// Mouse/pen input stays independent.
export function bindGalleryTouch(host, { onStart, onTap, onNavigate, isPanning, onPan }) {
  const ownerDocument = host.ownerDocument;
  const ownerWindow = ownerDocument.defaultView;
  const contacts = new Set();
  let gesture = null;
  let blocked = false;
  let suppressClickUntil = 0;

  function suppressClick() {
    // Safari can deliver a MouseEvent click after a touch rather than a
    // PointerEvent. Keep a short fallback window for that synthesized event.
    suppressClickUntil = Date.now() + 800;
  }

  function cancel() {
    if (gesture) suppressClick();
    gesture = null;
    if (contacts.size) blocked = true;
  }

  function pointerDown(event) {
    if (event.pointerType !== 'touch') return;
    contacts.add(event.pointerId);
    // Listen on the document: the second finger may land on the label or
    // outside the room. Neither remaining finger can then become a swipe.
    if (contacts.size > 1 || !event.isPrimary) {
      cancel();
      blocked = true;
      return;
    }
    if (blocked || !host.contains(event.target)) return;
    suppressClickUntil = 0;
    gesture = {
      id: event.pointerId,
      startX: event.clientX,
      startY: event.clientY,
      dx: 0,
      dy: 0,
      movement: 0,
      axis: null,
      panning: !!isPanning?.(),
      data: onStart?.(event),
    };
    // Touch already has implicit pointer capture on the original target.
    // Moving that capture to host would retarget fallback button clicks.
  }

  function update(event) {
    const previousX = gesture.dx;
    const previousY = gesture.dy;
    gesture.dx = event.clientX - gesture.startX;
    gesture.dy = event.clientY - gesture.startY;
    const x = Math.abs(gesture.dx);
    const y = Math.abs(gesture.dy);
    gesture.movement = Math.max(gesture.movement, Math.hypot(x, y));
    if (!gesture.axis && Math.max(x, y) >= 10) {
      if (x >= y * 1.3) gesture.axis = 'x';
      else if (y >= x * 1.3) gesture.axis = 'y';
    }
    if (gesture.panning) {
      const dx = gesture.dx - previousX;
      const dy = gesture.dy - previousY;
      if (dx || dy) onPan?.(dx, dy);
    }
  }

  function pointerMove(event) {
    if (event.pointerType !== 'touch' || !gesture || event.pointerId !== gesture.id) return;
    update(event);
  }

  function pointerUp(event) {
    if (event.pointerType !== 'touch') return;
    if (gesture && event.pointerId === gesture.id && !blocked) {
      update(event);
      const completed = gesture;
      gesture = null;
      // Wait for release so a second finger or native scrolling can cancel
      // the entire gesture before any selection or navigation is committed.
      if (!completed.panning && completed.axis === 'x' && Math.abs(completed.dx) >= 40 && Math.abs(completed.dx) >= Math.abs(completed.dy) * 1.3) {
        suppressClick();
        onNavigate?.(completed.dx < 0 ? 1 : -1);
      } else if (completed.movement < 8) {
        if (onTap) {
          suppressClick();
          onTap(event, completed.data);
        }
      } else {
        // A short drag or a vertical/diagonal move is not a tap either.
        suppressClick();
      }
    } else if (blocked) {
      suppressClick();
    }
    contacts.delete(event.pointerId);
    if (!contacts.size) blocked = false;
  }

  function pointerCancel(event) {
    if (event.pointerType !== 'touch') return;
    if (gesture?.id === event.pointerId) cancel();
    contacts.delete(event.pointerId);
    if (!contacts.size) blocked = false;
  }

  function lostCapture(event) {
    if (event.pointerType === 'touch' && gesture?.id === event.pointerId) cancel();
  }

  function click(event) {
    if (Date.now() > suppressClickUntil || !host.contains(event.target) || event.detail === 0) return;
    if (event.pointerType && event.pointerType !== 'touch') return;
    if (event.sourceCapabilities && !event.sourceCapabilities.firesTouchEvents) return;
    event.preventDefault();
    event.stopImmediatePropagation();
    suppressClickUntil = 0;
  }

  function reset() {
    cancel();
    contacts.clear();
    blocked = false;
  }

  function visibilityChange() {
    if (ownerDocument.hidden) reset();
  }

  const options = { capture: true };
  ownerDocument.addEventListener('pointerdown', pointerDown, options);
  ownerDocument.addEventListener('pointermove', pointerMove, options);
  ownerDocument.addEventListener('pointerup', pointerUp, options);
  ownerDocument.addEventListener('pointercancel', pointerCancel, options);
  ownerDocument.addEventListener('lostpointercapture', lostCapture, options);
  ownerDocument.addEventListener('click', click, options);
  ownerWindow?.addEventListener('blur', reset);
  ownerDocument.addEventListener('visibilitychange', visibilityChange);

  return {
    cancel,
    cleanup() {
      reset();
      ownerDocument.removeEventListener('pointerdown', pointerDown, options);
      ownerDocument.removeEventListener('pointermove', pointerMove, options);
      ownerDocument.removeEventListener('pointerup', pointerUp, options);
      ownerDocument.removeEventListener('pointercancel', pointerCancel, options);
      ownerDocument.removeEventListener('lostpointercapture', lostCapture, options);
      ownerDocument.removeEventListener('click', click, options);
      ownerWindow?.removeEventListener('blur', reset);
      ownerDocument.removeEventListener('visibilitychange', visibilityChange);
    },
  };
}
