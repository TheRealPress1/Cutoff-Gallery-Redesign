import * as THREE from 'three';

// One four-metre-ish tile of quiet, quarter-sawn oak. Staggered joints and
// continuous grain wrap at the tile edges, so a single map covers the room.
export function createGalleryWoodTextures() {
  const size = 1024;
  const boardWidth = 64;
  let seed = 71029;
  const random = () => {
    seed = (seed * 16807) % 2147483647;
    return (seed - 1) / 2147483646;
  };
  const boards = Array.from({ length: size / boardWidth }, () => ({
    offset: Math.floor(random() * size),
    joint: 420 + Math.floor(random() * 180),
    pieces: Array.from({ length: 2 }, () => ({
      tone: (random() - 0.5) * 10,
      warmth: (random() - 0.5) * 3,
      phase: random() * Math.PI * 2,
      bands: Array.from({ length: 256 }, random),
    })),
  }));
  const sample = (bands, coordinate) => {
    const cell = Math.floor(coordinate);
    const fraction = coordinate - cell;
    const blend = fraction * fraction * (3 - 2 * fraction);
    const a = bands[((cell % bands.length) + bands.length) % bands.length];
    const b = bands[(((cell + 1) % bands.length) + bands.length) % bands.length];
    return a + (b - a) * blend - 0.5;
  };
  const colorCanvas = document.createElement('canvas');
  const bumpCanvas = document.createElement('canvas');
  colorCanvas.width = colorCanvas.height = bumpCanvas.width = bumpCanvas.height = size;
  const colorContext = colorCanvas.getContext('2d');
  const bumpContext = bumpCanvas.getContext('2d');
  const colorPixels = colorContext.createImageData(size, size);
  const bumpPixels = bumpContext.createImageData(size, size);

  for (let y = 0; y < size; y += 1) {
    const board = boards[Math.floor(y / boardWidth)];
    const across = y % boardWidth;
    for (let x = 0; x < size; x += 1) {
      const along = (x - board.offset + size) % size;
      const second = along >= board.joint;
      const piece = board.pieces[second ? 1 : 0];
      const distance = second ? along - board.joint : along;
      const length = second ? size - board.joint : board.joint;
      const t = distance / length;
      const drift = Math.sin(t * Math.PI * 2 + piece.phase) * 1.3
        + Math.sin(t * Math.PI * 5 + piece.phase) * 0.35;
      const broad = sample(piece.bands, across * 0.13 + drift * 0.15) * 6;
      const grain = sample(piece.bands, across * 0.82 + drift) * 3.4;
      const fibers = sample(piece.bands, across * 2.7 + drift * 1.5) * 1.8;
      const pores = Math.min(0, sample(piece.bands, across * 4.3 + drift * 0.8) + 0.28) * 7;
      const detail = broad + grain + fibers + pores;
      const jointDistance = Math.min(distance, length - distance);
      const edgeDistance = Math.min(across, boardWidth - across);
      const seam = edgeDistance < 1 || jointDistance < 1;
      const bevel = !seam && (edgeDistance < 2 || jointDistance < 2);
      const shade = piece.tone + detail + (bevel ? -5 : 0);
      const offset = (y * size + x) * 4;
      colorPixels.data[offset] = seam ? 151 : 198 + shade + piece.warmth;
      colorPixels.data[offset + 1] = seam ? 130 : 177 + shade;
      colorPixels.data[offset + 2] = seam ? 103 : 147 + shade - piece.warmth;
      colorPixels.data[offset + 3] = 255;
      const relief = seam ? 65 : bevel ? 139 : 155 + grain * 0.7 + fibers;
      bumpPixels.data[offset] = relief;
      bumpPixels.data[offset + 1] = relief;
      bumpPixels.data[offset + 2] = relief;
      bumpPixels.data[offset + 3] = 255;
    }
  }

  colorContext.putImageData(colorPixels, 0, 0);
  bumpContext.putImageData(bumpPixels, 0, 0);
  const map = new THREE.CanvasTexture(colorCanvas);
  map.colorSpace = THREE.SRGBColorSpace;
  const bumpMap = new THREE.CanvasTexture(bumpCanvas);
  for (const texture of [map, bumpMap]) {
    texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(5, 5);
  }
  // Cylinder top-cap u follows world z: horizontal grain runs toward the wall.
  return { map, bumpMap };
}
