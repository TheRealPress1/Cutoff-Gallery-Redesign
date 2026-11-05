import assert from 'node:assert/strict';
import test from 'node:test';
import { bindGalleryTouch } from '../src/components/galleryTouch.js';

class Surface {
  listeners = new Map();
  style = {};
  constructor(parentNode = null) { this.parentNode = parentNode; }
  contains(target) {
    for (let node = target; node; node = node.parentNode) if (node === this) return true;
    return false;
  }
  addEventListener(type, callback, options = {}) {
    const capture = typeof options === 'boolean' ? options : !!options.capture;
    if (!this.listeners.has(type)) this.listeners.set(type, []);
    this.listeners.get(type).push({ callback, capture });
  }
  removeEventListener(type, callback) {
    this.listeners.set(type, (this.listeners.get(type) || []).filter(entry => entry.callback !== callback));
  }
  setPointerCapture() {}
  releasePointerCapture() {}
  hasPointerCapture() { return false; }
}

function setup(t, { fallback = false, isPanning } = {}) {
  const window = new Surface();
  const document = new Surface(window);
  document.defaultView = window;
  const viewport = new Surface(document);
  const host = new Surface(viewport);
  const image = new Surface(host);
  const panel = new Surface(viewport);
  host.ownerDocument = viewport.ownerDocument = document;
  host.clientWidth = 390;
  const actions = [];
  const starts = [];
  const pans = [];
  const binding = bindGalleryTouch(host, {
    onStart(event) { starts.push(event); return 'artwork-at-start'; },
    onNavigate(direction) { actions.push(['navigate', direction]); },
    ...(isPanning && { isPanning, onPan(dx, dy) { pans.push([dx, dy]); } }),
    ...(!fallback && { onTap(event, metadata) { actions.push(['tap', metadata]); } }),
  });
  t.after(binding.cleanup);
  function emit(type, values = {}) {
    const event = {
      type, target: image, pointerType: 'touch', pointerId: 1, isPrimary: true,
      button: 0, clientX: 220, clientY: 200, detail: 1, cancelable: true,
      defaultPrevented: false,
      preventDefault() { this.defaultPrevented = true; },
      stopPropagation() { this.stopped = true; },
      stopImmediatePropagation() { this.stopped = this.immediateStopped = true; },
      ...values,
    };
    const path = [];
    for (let node = event.target; node; node = node.parentNode) path.push(node);
    for (const capture of [true, false]) {
      for (const node of capture ? [...path].reverse() : path) {
        event.currentTarget = node;
        for (const entry of node.listeners.get(type) || []) {
          if (entry.capture === capture) entry.callback(event);
          if (event.immediateStopped) break;
        }
        if (event.stopped) return event;
      }
    }
    return event;
  }
  function swipe(endX, values = {}) {
    emit('pointerdown', values);
    emit('pointermove', { ...values, clientX: endX });
    emit('pointerup', { ...values, clientX: endX });
  }
  return { host, image, panel, document, window, actions, starts, pans, emit, swipe, ...binding };
}

test('detail drags pan both axes by incremental deltas without changing photographs', t => {
  const h = setup(t, { isPanning: () => true });
  h.emit('pointerdown');
  h.emit('pointermove', { clientX: 150, clientY: 210 });
  h.emit('pointermove', { clientX: 120, clientY: 160 });
  h.emit('pointerup', { clientX: 120, clientY: 160 });
  assert.deepEqual(h.pans, [[-70, 10], [-30, -50]]);
  assert.deepEqual(h.actions, []);
});

test('detail release includes any final movement once and preserves taps', t => {
  const h = setup(t, { isPanning: () => true });
  h.emit('pointerdown');
  h.emit('pointermove', { clientX: 120 });
  h.emit('pointerup', { clientX: 100 });
  h.emit('pointerup', { clientX: 100 });
  assert.deepEqual(h.pans, [[-100, 0], [-20, 0]]);
  assert.deepEqual(h.actions, []);
  h.emit('pointerdown');
  h.emit('pointermove', { clientX: 222, clientY: 201 });
  h.emit('pointerup', { clientX: 222, clientY: 201 });
  assert.deepEqual(h.actions, [['tap', 'artwork-at-start']]);
});

test('pan versus navigation mode is fixed at the start of each contact', t => {
  let panning = true;
  const h = setup(t, { isPanning: () => panning });
  h.emit('pointerdown');
  panning = false;
  h.emit('pointermove', { clientX: 100 });
  h.emit('pointerup', { clientX: 100 });
  assert.deepEqual(h.pans, [[-120, 0]]);
  assert.deepEqual(h.actions, []);
  h.emit('pointerdown');
  panning = true;
  h.emit('pointermove', { clientX: 100 });
  h.emit('pointerup', { clientX: 100 });
  assert.deepEqual(h.pans, [[-120, 0]]);
  assert.deepEqual(h.actions, [['navigate', 1]]);
});

test('a second finger cancels detail panning until all contacts end', t => {
  const h = setup(t, { isPanning: () => true });
  h.emit('pointerdown');
  h.emit('pointermove', { clientX: 180 });
  h.emit('pointerdown', { target: h.panel, pointerId: 2, isPrimary: false });
  h.emit('pointerup', { target: h.panel, pointerId: 2, isPrimary: false });
  h.emit('pointermove', { clientX: 100 });
  h.emit('pointerup', { clientX: 50 });
  assert.deepEqual(h.pans, [[-40, 0]]);
  assert.deepEqual(h.actions, []);
  h.swipe(320);
  assert.deepEqual(h.pans, [[-40, 0], [100, 0]]);
  assert.deepEqual(h.actions, []);
});

test('pinch takeover and native cancellation stop detail panning without a release jump', t => {
  for (const type of ['pinch', 'pointercancel', 'lostpointercapture']) {
    const h = setup(t, { isPanning: () => true });
    h.emit('pointerdown');
    h.emit('pointermove', { clientX: 180 });
    if (type === 'pinch') h.cancel();
    else h.emit(type);
    h.emit('pointermove', { clientX: 100 });
    h.emit('pointerup', { clientX: 50 });
    assert.deepEqual(h.pans, [[-40, 0]]);
    assert.deepEqual(h.actions, []);
  }
});

test('left swipe advances only on release and only one photograph', t => {
  const h = setup(t);
  h.emit('pointerdown');
  h.emit('pointermove', { clientX: 150 });
  h.emit('pointermove', { clientX: 40 });
  assert.deepEqual(h.actions, []);
  h.emit('pointerup', { clientX: 40 });
  h.emit('pointerup', { clientX: 40 });
  assert.deepEqual(h.actions, [['navigate', 1]]);
});

test('right swipe returns to the previous photograph and new swipes work independently', t => {
  const h = setup(t);
  h.swipe(320);
  h.swipe(120);
  assert.deepEqual(h.actions, [['navigate', -1], ['navigate', 1]]);
});

test('a tap keeps artwork selection metadata and slight finger jitter still taps', t => {
  const h = setup(t);
  h.emit('pointerdown');
  h.emit('pointermove', { clientX: 222, clientY: 201 });
  h.emit('pointerup', { clientX: 222, clientY: 201 });
  assert.deepEqual(h.actions, [['tap', 'artwork-at-start']]);
  assert.equal(h.starts.length, 1);
});

test('short drags and a swipe that returns to its start never open a photograph', t => {
  const h = setup(t);
  h.swipe(200);
  h.emit('pointerdown');
  h.emit('pointermove', { clientX: 100 });
  h.emit('pointerup', { clientX: 220 });
  assert.deepEqual(h.actions, []);
});

test('vertical and ambiguous diagonal movements do not navigate or tap', t => {
  const h = setup(t);
  for (const end of [{ clientX: 210, clientY: 100 }, { clientX: 140, clientY: 120 }]) {
    h.emit('pointerdown');
    h.emit('pointermove', end);
    h.emit('pointerup', end);
  }
  assert.deepEqual(h.actions, []);
});

test('mouse and pen input stay with the existing desktop controls', t => {
  const h = setup(t);
  h.swipe(100, { pointerType: 'mouse' });
  h.swipe(320, { pointerType: 'pen' });
  assert.deepEqual(h.actions, []);
  assert.equal(h.starts.length, 0);
});

test('panel-origin gestures stay native', t => {
  const h = setup(t);
  assert.equal(h.emit('pointerdown', { target: h.panel }).defaultPrevented, false);
  assert.equal(h.emit('pointermove', { target: h.panel, clientX: 100 }).defaultPrevented, false);
  assert.equal(h.emit('pointerup', { target: h.panel, clientX: 100 }).defaultPrevented, false);
  assert.deepEqual(h.actions, []);
  assert.equal(h.starts.length, 0);
});

test('a second finger anywhere cancels the swipe until every contact ends', t => {
  const h = setup(t);
  h.emit('pointerdown');
  h.emit('pointermove', { clientX: 100 });
  h.emit('pointerdown', { target: h.panel, pointerId: 2, isPrimary: false });
  h.emit('pointerup', { target: h.panel, pointerId: 2, isPrimary: false });
  h.emit('pointermove', { clientX: 50 });
  h.emit('pointerup', { clientX: 50 });
  assert.deepEqual(h.actions, []);
  h.swipe(100);
  assert.deepEqual(h.actions, [['navigate', 1]]);
});

test('a gesture cannot start on the scene while another finger is on the panel', t => {
  const h = setup(t);
  h.emit('pointerdown', { target: h.panel });
  h.swipe(100, { pointerId: 2, isPrimary: false });
  h.emit('pointerup', { target: h.panel });
  assert.deepEqual(h.actions, []);
  h.swipe(100);
  assert.deepEqual(h.actions, [['navigate', 1]]);
});

test('pointer cancellation and lost capture cannot turn into taps or navigation', t => {
  for (const type of ['pointercancel', 'lostpointercapture']) {
    const h = setup(t);
    h.emit('pointerdown');
    h.emit('pointermove', { clientX: 100 });
    h.emit(type);
    h.emit('pointerup', { clientX: 100 });
    assert.deepEqual(h.actions, []);
  }
});

test('pinch takeover cancels a pending horizontal swipe', t => {
  const h = setup(t);
  h.emit('pointerdown');
  h.emit('pointermove', { clientX: 100 });
  h.cancel();
  h.emit('pointerup', { clientX: 100 });
  assert.deepEqual(h.actions, []);
  h.swipe(320);
  assert.deepEqual(h.actions, [['navigate', -1]]);
});

test('fallback suppresses the browser click after a swipe, but preserves fresh taps and keyboard clicks', t => {
  const h = setup(t, { fallback: true });
  h.swipe(100);
  assert.equal(h.emit('click').defaultPrevented, true);
  assert.equal(h.emit('click', { detail: 0 }).defaultPrevented, false);
  h.emit('pointerdown');
  h.emit('pointerup');
  assert.equal(h.emit('click').defaultPrevented, false);
  assert.deepEqual(h.actions, [['navigate', 1]]);
});

test('leaving the page cancels touch navigation', t => {
  for (const hidden of [false, true]) {
    const h = setup(t);
    h.emit('pointerdown');
    h.emit('pointermove', { clientX: 100 });
    if (hidden) {
      h.document.hidden = true;
      h.emit('visibilitychange', { target: h.document });
    } else h.emit('blur', { target: h.window });
    h.emit('pointerup', { clientX: 100 });
    assert.deepEqual(h.actions, []);
  }
});

test('cleanup removes listeners and pending gesture state', t => {
  const h = setup(t);
  h.emit('pointerdown');
  h.cleanup();
  h.emit('pointerup', { clientX: 100 });
  h.swipe(320);
  assert.deepEqual(h.actions, []);
  for (const surface of [h.host, h.document, h.window]) {
    assert.equal([...surface.listeners.values()].flat().length, 0);
  }
});
