import test from 'node:test';
import assert from 'node:assert/strict';
import { createGalleryThemeTransition } from '../src/components/galleryTheme.js';

test('a mounted gallery starts settled in its selected theme', () => {
  for (const [theme, value] of [['dark', 0], ['light', 1]]) {
    const transition = createGalleryThemeTransition(theme);
    assert.deepEqual(transition.update(theme, 1200), { value, active: false });
  }
});

test('a theme change settles after 650ms and no longer requests animation frames', () => {
  const transition = createGalleryThemeTransition('dark');
  assert.deepEqual(transition.update('light', 100), { value: 0, active: true });
  assert.deepEqual(transition.update('light', 425), { value: 0.5, active: true });
  assert.deepEqual(transition.update('light', 750), { value: 1, active: false });
  assert.deepEqual(transition.update('light', 90000), { value: 1, active: false });
});

test('reversing between frames begins at the interpolated color instead of jumping', () => {
  const transition = createGalleryThemeTransition('dark');
  transition.update('light', 0);
  transition.update('light', 100);
  assert.deepEqual(transition.update('dark', 325), { value: 0.5, active: true });
  assert.deepEqual(transition.update('dark', 650), { value: 0.25, active: true });
  assert.deepEqual(transition.update('dark', 975), { value: 0, active: false });
});

test('reduced motion and hidden documents settle immediately, including mid-transition', () => {
  const transition = createGalleryThemeTransition('dark');
  transition.update('light', 0);
  transition.update('light', 200);
  assert.deepEqual(transition.update('light', 210, true), { value: 1, active: false });
  assert.deepEqual(transition.update('dark', 211, true), { value: 0, active: false });
  assert.deepEqual(transition.update('light', 220), { value: 0, active: true });
  assert.deepEqual(transition.update('light', 870), { value: 1, active: false });
});

test('a delayed frame completes cleanly without overshooting the palette endpoints', () => {
  const transition = createGalleryThemeTransition('light');
  transition.update('dark', 150);
  assert.deepEqual(transition.update('dark', 5000), { value: 0, active: false });
});
