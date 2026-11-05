import test from 'node:test';
import assert from 'node:assert/strict';
import * as THREE from 'three';
import { DETAIL_SCALE, detailPanAtPoint, constrainDetailPan, panDetailByPixels } from '../src/components/galleryDetail.js';

function sourcePoint(uv, image, crop, pan) {
  const texture = new THREE.Texture();
  texture.repeat.set(crop, crop);
  texture.offset.set((1 - crop) / 2 + pan.x / image.imageWidth, (1 - crop) / 2 + pan.y / image.imageHeight);
  texture.updateMatrix();
  return new THREE.Vector2(uv.x, uv.y).applyMatrix3(texture.matrix);
}

test('texture zoom anchors the clicked detail inside an unchanged photograph plane', () => {
  for (const image of [{ imageWidth: 4.5, imageHeight: 3 }, { imageWidth: 2.2, imageHeight: 3.25 }]) {
    for (const uv of [{ x: 0.1, y: 0.8 }, { x: 0.8, y: 0.2 }, { x: 0.5, y: 0.5 }]) {
      const pan = detailPanAtPoint(uv, image.imageWidth, image.imageHeight);
      const after = sourcePoint(uv, image, 1 / DETAIL_SCALE, pan);
      assert.ok(after.distanceTo(new THREE.Vector2(uv.x, uv.y)) < 1e-10);
    }
  }
});

test('reversing an unfinished zoom keeps the visible detail under the cursor', () => {
  const image = { imageWidth: 4.5, imageHeight: 3 };
  const uv = { x: 0.3, y: 0.7 };
  const crop = 0.72;
  const currentPan = { x: 0.15, y: -0.12 };
  const before = sourcePoint(uv, image, crop, currentPan);
  const nextPan = detailPanAtPoint(uv, image.imageWidth, image.imageHeight, crop, currentPan);
  const after = sourcePoint(uv, image, 1 / DETAIL_SCALE, nextPan);
  assert.ok(before.distanceTo(after) < 1e-10);
});

test('drag follows the hand at different viewport sizes and during zoom transitions', () => {
  for (const height of [640, 900, 1900]) {
    for (const crop of [0.4, 0.7, 1]) {
      const pan = panDetailByPixels({ x: 0.2, y: -0.3 }, 120, -80, 3, 0.44, height, crop);
      const pixelsPerUnit = height / (2 * 3 * 0.44 * crop);
      assert.ok(Math.abs((0.2 - pan.x) * pixelsPerUnit - 120) < 1e-10);
      assert.ok(Math.abs((pan.y + 0.3) * pixelsPerUnit + 80) < 1e-10);
    }
  }
});

test('pan boundaries keep all four corners inside the original image with no empty or stretched edges', () => {
  const image = { imageWidth: 4.5, imageHeight: 3 };
  for (const crop of [0.4, 0.7, 1]) {
    for (const signX of [-1, 1]) {
      for (const signY of [-1, 1]) {
        const pan = constrainDetailPan({ x: signX * 1000, y: signY * 1000 }, image, image.imageWidth * crop, image.imageHeight * crop);
        for (const x of [0, 1]) {
          for (const y of [0, 1]) {
            const source = sourcePoint({ x, y }, image, crop, pan);
            assert.ok(source.x >= -1e-10 && source.x <= 1 + 1e-10);
            assert.ok(source.y >= -1e-10 && source.y <= 1 + 1e-10);
          }
        }
      }
    }
  }
});
