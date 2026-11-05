export const DETAIL_SCALE = 2.5;
export const PHOTO_DEPTH = 0.173;

// Crop the photograph's texture inside its unchanged physical frame.
// Starting from the live crop also keeps quick zoom reversals under the cursor.
export function detailPanAtPoint(uv, imageWidth, imageHeight, crop = 1, pan = { x: 0, y: 0 }) {
  return {
    x: pan.x + (uv.x - 0.5) * imageWidth * (crop - 1 / DETAIL_SCALE),
    y: pan.y + (uv.y - 0.5) * imageHeight * (crop - 1 / DETAIL_SCALE),
  };
}

export function constrainDetailPan(pan, image, visibleWidth, visibleHeight) {
  const limitX = Math.max(0, (image.imageWidth - visibleWidth) / 2);
  const limitY = Math.max(0, (image.imageHeight - visibleHeight) / 2);
  return {
    x: Math.max(-limitX, Math.min(limitX, pan.x)),
    y: Math.max(-limitY, Math.min(limitY, pan.y)),
  };
}

export function panDetailByPixels(pan, dx, dy, photoDistance, lensScale, viewportHeight, crop) {
  const unitsPerPixel = 2 * photoDistance * lensScale * crop / viewportHeight;
  return { x: pan.x - dx * unitsPerPixel, y: pan.y + dy * unitsPerPixel };
}
