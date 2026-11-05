import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { bindGalleryPinch } from './galleryPinch.js';
import { bindGalleryTouch } from './galleryTouch.js';
import { createGalleryThemeTransition } from './galleryTheme.js';
import { useLanguage } from '../i18n.jsx';
import { localizeArtwork } from '../data/translations.js';

const clamp = (value, min, max) => Math.max(min, Math.min(max, value));
const TAU = Math.PI * 2;
const ROOM_RADIUS = 8;
const ART_HEIGHT = 2.8;
const nearestAngle = (angle, reference) => reference + Math.atan2(Math.sin(angle - reference), Math.cos(angle - reference));

function stoneTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = canvas.height = 256;
  const context = canvas.getContext('2d');
  const pixels = context.createImageData(256, 256);
  let seed = 34891;
  for (let i = 0; i < pixels.data.length; i += 4) {
    seed = (seed * 16807) % 2147483647;
    const grain = (seed / 2147483647 - 0.5) * 11;
    pixels.data[i] = 235 + grain;
    pixels.data[i + 1] = 233 + grain;
    pixels.data[i + 2] = 229 + grain;
    pixels.data[i + 3] = 255;
  }
  context.putImageData(pixels, 0, 0);
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(3, 3);
  return texture;
}

function labelTexture(artwork, light = false) {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 220;
  const context = canvas.getContext('2d');
  context.fillStyle = light ? '#e8e9e4' : '#363632';
  context.fillRect(0, 0, 512, 220);
  context.fillStyle = light ? '#252923' : '#dbd8d1';
  context.font = '25px Arial, sans-serif';
  context.fillText(artwork.artist, 22, 53, 465);
  context.fillStyle = light ? '#5a6156' : '#a4a199';
  context.font = '23px Arial, sans-serif';
  context.fillText(`${artwork.year} · ${artwork.location}`, 22, 98, 465);
  context.font = '22px Arial, sans-serif';
  context.fillText(artwork.photographer || 'Cut Off Gallery', 22, 163, 465);
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

export default function GalleryScene({ artworks = [], activeIndex = 0, navigationId = 0, onViewChange, onSelect, onNavigate, onBackgroundClick, onReady, focused = false, inspecting = false, reducedMotion = false, theme = 'dark' }) {
  const { language, t } = useLanguage();
  const hostRef = useRef(null);
  const controlsRef = useRef(null);
  const invalidateRef = useRef(() => {});
  const [failed, setFailed] = useState(false);
  const [compactFallback, setCompactFallback] = useState(false);
  controlsRef.current = { language, t, activeIndex, navigationId, onViewChange, onSelect, onNavigate, onBackgroundClick, onReady, focused, inspecting, reducedMotion, theme };

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return undefined;
    const update = () => setCompactFallback(host.clientWidth <= 760);
    const observer = new ResizeObserver(update);
    observer.observe(host);
    update();
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const host = hostRef.current;
    if (!host || !artworks.length) return undefined;
    let renderer;
    try {
      renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false, powerPreference: 'high-performance' });
    } catch {
      setFailed(true);
      controlsRef.current.onReady?.();
      return undefined;
    }

    let disposed = false;
    let initialized = false;
    let frame = null;
    let inView = true;
    let ready = false;
    function invalidate(immediate = false) {
      if (disposed || !initialized) return;
      if (immediate) {
        if (frame !== null) cancelAnimationFrame(frame);
        frame = null;
        animate(performance.now());
      } else if (frame === null && inView && !document.hidden) {
        frame = requestAnimationFrame(animate);
      }
    }
    invalidateRef.current = invalidate;
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.12;
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFShadowMap;
    renderer.shadowMap.autoUpdate = false;
    renderer.shadowMap.needsUpdate = true;
    renderer.domElement.setAttribute('role', 'img');
    renderer.domElement.style.cssText = 'display:block;width:100%;height:100%;touch-action:pan-y;outline:none;';
    host.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    scene.background = new THREE.Color('#101111');
    scene.fog = new THREE.Fog('#101111', 17, 34);
    const camera = new THREE.PerspectiveCamera(47, 1, 0.1, 60);
    const pointer = new THREE.Vector2();
    const raycaster = new THREE.Raycaster();
    const selectable = [];
    const textures = new Set();
    const pendingTextures = [];
    const galleryLights = [];
    const dimensions = [];
    const wallLabels = [];
    let renderedLanguage = controlsRef.current.language;
    const count = Math.max(artworks.length, 4);
    const wallWidth = 2 * ROOM_RADIUS * Math.tan(Math.PI / count) + 0.06;
    const outerRadius = ROOM_RADIUS / Math.cos(Math.PI / count);
    const grain = stoneTexture();
    textures.add(grain);
    const wallMaterial = new THREE.MeshStandardMaterial({ color: '#45443f', map: grain, roughness: 0.98, emissive: '#272a27', emissiveIntensity: 0.5 });
    const floorMaterial = new THREE.MeshStandardMaterial({ color: '#353731', map: grain, roughness: 0.78, metalness: 0.08, emissive: '#1b211c', emissiveIntensity: 0.45 });
    const ceilingMaterial = new THREE.MeshStandardMaterial({ color: '#171817', roughness: 1, emissive: '#191c1b', emissiveIntensity: 0.55 });
    const frameMaterial = new THREE.MeshStandardMaterial({ color: '#080909', roughness: 0.52, metalness: 0.3 });
    const matteMaterial = new THREE.MeshStandardMaterial({ color: '#eeece5', roughness: 1 });
    const fixtureMaterial = new THREE.MeshStandardMaterial({ color: '#3b3e38', roughness: 0.56, metalness: 0.3, emissive: '#30332e', emissiveIntensity: 0.2 });
    const trimMaterial = fixtureMaterial.clone();
    const lensMaterial = new THREE.MeshBasicMaterial({ color: '#fff2d8', toneMapped: false });
    const themeTransition = createGalleryThemeTransition(controlsRef.current.theme);
    let renderedThemeAmount = -1;
    const darkBackground = new THREE.Color('#101111');
    const lightBackground = new THREE.Color('#f4f4f1');
    // Surface emission gives the room a white exhibition finish without
    // changing the lighting, exposure, frames, mats, or photograph materials.
    const themedSurfaces = [
      { material: wallMaterial, color: '#f7f7f4', emissive: '#ffffff', intensity: 1.6 },
      { material: floorMaterial, color: '#d8dad5', emissive: '#d3d6cf', intensity: 0.8 },
      { material: ceilingMaterial, color: '#e8e9e7', emissive: '#ffffff', intensity: 1.1 },
      { material: trimMaterial, color: '#d3d6cf', emissive: '#d3d6cf', intensity: 0.9 },
    ].map(({ material, color, emissive, intensity }) => ({
      material,
      darkColor: material.color.clone(),
      lightColor: new THREE.Color(color),
      darkEmissive: material.emissive.clone(),
      lightEmissive: new THREE.Color(emissive),
      darkIntensity: material.emissiveIntensity,
      lightIntensity: intensity,
    }));

    function box(parent, width, height, depth, material, x, y, z, castShadow = false) {
      const object = new THREE.Mesh(new THREE.BoxGeometry(width, height, depth), material);
      object.position.set(x, y, z);
      object.castShadow = castShadow;
      object.receiveShadow = true;
      parent.add(object);
      return object;
    }

    const floor = new THREE.Mesh(new THREE.CylinderGeometry(outerRadius + 0.1, outerRadius + 0.1, 0.16, count, 1, false, Math.PI / count), floorMaterial);
    floor.position.y = -0.08;
    floor.receiveShadow = true;
    scene.add(floor);
    const ceiling = new THREE.Mesh(new THREE.CylinderGeometry(outerRadius + 0.1, outerRadius + 0.1, 0.18, count, 1, false, Math.PI / count), ceilingMaterial);
    ceiling.position.y = 6.28;
    scene.add(ceiling);
    const seamMaterial = new THREE.LineBasicMaterial({ color: '#171917', transparent: true, opacity: 0.7 });
    const darkSeam = seamMaterial.color.clone();
    const lightSeam = new THREE.Color('#afb4a9');
    for (let i = 0; i < count; i += 1) {
      const angle = TAU * i / count;
      const points = [new THREE.Vector3(0, 0.004, 0), new THREE.Vector3(Math.sin(angle) * ROOM_RADIUS, 0.004, -Math.cos(angle) * ROOM_RADIUS)];
      scene.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(points), seamMaterial));
    }
    scene.add(new THREE.HemisphereLight('#d7dcdf', '#252820', 0.8));
    const centralFill = new THREE.PointLight('#e9e8de', 18, 15, 2);
    centralFill.position.set(0, 5.5, 0);
    scene.add(centralFill);

    // Every photograph occupies its own wall, arranged around a single intimate room.
    const loader = new THREE.TextureLoader();
    for (let i = 0; i < count; i += 1) {
      const angle = TAU * i / count;
      const bay = new THREE.Group();
      bay.position.set(ROOM_RADIUS * Math.sin(angle), 0, -ROOM_RADIUS * Math.cos(angle));
      bay.rotation.y = -angle;
      scene.add(bay);
      box(bay, wallWidth, 6.2, 0.3, wallMaterial, 0, 3.1, -0.15);
      box(bay, wallWidth, 0.08, 0.04, trimMaterial, 0, 0.045, 0.025);
      // Slim vertical reveals make the changes in wall angle legible in the low light.
      box(bay, 0.045, 6.2, 0.055, trimMaterial, -wallWidth / 2 + 0.035, 3.1, 0.03);
      const artwork = artworks[i];
      if (!artwork) continue;
      const aspect = Number(artwork.aspectRatio) || 1.5;
      const imageWidth = Math.min(4.5, 3.25 * aspect, wallWidth - 1.5);
      const imageHeight = imageWidth / aspect;
      const mat = 0.23;
      const edge = 0.047;
      const outerWidth = imageWidth + 2 * (mat + edge);
      const outerHeight = imageHeight + 2 * (mat + edge);
      dimensions.push({ outerWidth, outerHeight });
      const backing = box(bay, outerWidth, outerHeight, 0.13, frameMaterial, 0, ART_HEIGHT, 0.09, true);
      backing.userData.artworkIndex = i;
      selectable.push(backing);
      box(bay, outerWidth - edge * 2, outerHeight - edge * 2, 0.016, matteMaterial, 0, ART_HEIGHT, 0.161);
      const imageMaterial = new THREE.MeshStandardMaterial({ color: '#b7b5ad', roughness: 1, metalness: 0 });
      const photograph = new THREE.Mesh(new THREE.PlaneGeometry(imageWidth, imageHeight), imageMaterial);
      photograph.position.set(0, ART_HEIGHT, 0.173);
      photograph.userData.artworkIndex = i;
      bay.add(photograph);
      selectable.push(photograph);
      pendingTextures.push(new Promise((resolve) => {
        loader.load(artwork.image, (texture) => {
          if (disposed) { texture.dispose(); resolve(); return; }
          texture.colorSpace = THREE.SRGBColorSpace;
          texture.anisotropy = Math.min(8, renderer.capabilities.getMaxAnisotropy());
          textures.add(texture);
          imageMaterial.color.set('#ffffff');
          imageMaterial.map = texture;
          imageMaterial.needsUpdate = true;
          invalidate(true);
          resolve();
        }, undefined, resolve);
      }));
      const labelMap = labelTexture(localizeArtwork(artwork, renderedLanguage));
      const lightLabelMap = labelTexture(localizeArtwork(artwork, renderedLanguage), true);
      textures.add(labelMap);
      textures.add(lightLabelMap);
      const label = new THREE.Mesh(new THREE.PlaneGeometry(0.64, 0.275), new THREE.MeshBasicMaterial({ map: labelMap, toneMapped: false }));
      label.position.set(outerWidth / 2 + 0.5, 1.2, 0.015);
      const lightLabel = new THREE.Mesh(label.geometry, new THREE.MeshBasicMaterial({ map: lightLabelMap, toneMapped: false, transparent: true, opacity: 0, depthWrite: false }));
      lightLabel.position.z = 0.001;
      lightLabel.visible = false;
      label.add(lightLabel);
      bay.add(label);
      wallLabels.push({ artworkIndex: i, material: label.material, lightLabel });
      box(bay, 1.5, 0.035, 0.045, fixtureMaterial, 0, 5.98, 3.0);
      box(bay, 0.035, 0.25, 0.035, fixtureMaterial, 0, 5.87, 3.0);
      const fixture = new THREE.Group();
      fixture.position.set(0, 5.65, 3.0);
      fixture.rotation.x = 0.76;
      const body = new THREE.Mesh(new THREE.CylinderGeometry(0.105, 0.105, 0.29, 16), fixtureMaterial);
      fixture.add(body);
      const lens = new THREE.Mesh(new THREE.CircleGeometry(0.082, 16), lensMaterial);
      lens.rotation.x = Math.PI / 2;
      lens.position.y = -0.147;
      fixture.add(lens);
      bay.add(fixture);
      const spotlight = new THREE.SpotLight('#fff3e3', 75, 15, 0.9, 0.82, 2);
      spotlight.position.set(0, 5.55, 3.0);
      spotlight.target.position.set(0, 2.4, 0);
      spotlight.shadow.mapSize.set(1024, 1024);
      spotlight.shadow.bias = -0.00015;
      spotlight.shadow.normalBias = 0.015;
      spotlight.shadow.camera.near = 0.15;
      spotlight.shadow.camera.far = 14;
      spotlight.castShadow = i === activeIndex;
      bay.add(spotlight, spotlight.target);
      galleryLights.push(spotlight);
    }

    let firstFrame = true;
    let viewAngle = 0;
    let viewYaw = TAU * activeIndex / count;
    let targetYaw = viewYaw;
    let freeLooking = false;
    let viewDistance = 9.5;
    let viewShiftX = 0;
    let viewShiftY = 0;
    let hostWidth = 1;
    let hostHeight = 1;
    let lastInspecting = inspecting;
    let lastIndex = activeIndex;
    let lastNavigationId = navigationId;
    let lastViewedIndex = null;
    let shadowIndex = activeIndex;
    let lastFocused = focused;
    let lastTime = performance.now();
    let dragging = false;
    let activePointer = null;
    let pointerStartedOnArtwork = false;
    let lastPointerX = 0;
    let lastPointerY = 0;
    let dragDistance = 0;
    let lookDragStarted = false;
    let dragY = 0;
    let targetDragY = 0;
    const lookAt = new THREE.Vector3();

    function resize() {
      const width = Math.max(1, host.clientWidth);
      const height = Math.max(1, host.clientHeight);
      hostWidth = width;
      hostHeight = height;
      // Retain photograph detail on Retina phones in both orientations.
      // Bound the drawing buffer for larger touch viewports without changing
      // resolution during a swipe or approach animation.
      const mobileViewport = width < 768 || (height < 768 && window.matchMedia('(pointer: coarse)').matches);
      const resolutionLimit = mobileViewport ? Math.min(3, Math.sqrt(4_000_000 / (width * height))) : 2;
      const pixelRatio = Math.min(window.devicePixelRatio || 1, resolutionLimit);
      if (renderer.getPixelRatio() !== pixelRatio) renderer.setPixelRatio(pixelRatio);
      renderer.setSize(width, height, false);
      camera.aspect = width / height;
      // Very tall phones widen the vertical lens instead of backing through the opposite wall.
      camera.fov = Math.max(47, Math.min(100, THREE.MathUtils.radToDeg(2 * Math.atan(5.1 / (2 * 13.8 * camera.aspect * 0.9)))));
      camera.updateProjectionMatrix();
      invalidate(true);
    }
    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(host);
    resize();
    function hitsAt(event) {
      const rect = renderer.domElement.getBoundingClientRect();
      pointer.set((event.clientX - rect.left) / rect.width * 2 - 1, -(event.clientY - rect.top) / rect.height * 2 + 1);
      raycaster.setFromCamera(pointer, camera);
      return raycaster.intersectObjects(selectable, false);
    }
    function facingArtworkIndex() {
      // Choose the work nearest the current gaze, including when the camera is
      // off-center after approaching a different wall.
      let nearest = controlsRef.current.activeIndex;
      let bestAlignment = -Infinity;
      for (let i = 0; i < artworks.length; i += 1) {
        const angle = TAU * i / count;
        const dx = ROOM_RADIUS * Math.sin(angle) - camera.position.x;
        const dz = -ROOM_RADIUS * Math.cos(angle) - camera.position.z;
        const alignment = (dx * Math.sin(viewYaw) - dz * Math.cos(viewYaw)) / Math.hypot(dx, dz);
        if (alignment > bestAlignment) { bestAlignment = alignment; nearest = i; }
      }
      return nearest;
    }
    function pointerDown(event) {
      if (event.pointerType === 'touch' || event.button !== 0 || !event.isPrimary || dragging) return;
      dragging = true;
      activePointer = event.pointerId;
      pointerStartedOnArtwork = controlsRef.current.inspecting && hitsAt(event).length > 0;
      dragDistance = 0;
      lookDragStarted = false;
      lastPointerX = event.clientX;
      lastPointerY = event.clientY;
      renderer.domElement.setPointerCapture?.(event.pointerId);
    }
    function pointerMove(event) {
      if (event.pointerType === 'touch') return;
      if (dragging) {
        if (event.pointerId !== activePointer) return;
        const dx = event.clientX - lastPointerX;
        const dy = event.clientY - lastPointerY;
        dragDistance += Math.abs(dx) + Math.abs(dy);
        lastPointerX = event.clientX;
        lastPointerY = event.clientY;
        if (!controlsRef.current.inspecting) {
          if (dragDistance < 8) return;
          if (!lookDragStarted) {
            lookDragStarted = true;
            freeLooking = true;
            targetYaw = viewYaw;
            targetDragY = dragY;
          }
          const horizontalFov = 2 * Math.atan(Math.tan(THREE.MathUtils.degToRad(camera.fov / 2)) * camera.aspect);
          // Yaw is unbounded: repeated drags can keep turning through the room.
          targetYaw -= dx * horizontalFov / hostWidth;
          viewYaw = targetYaw;
          targetDragY = clamp(targetDragY + dy * 0.004, -0.75, 0.75);
          dragY = targetDragY;
          renderer.domElement.style.cursor = 'grabbing';
          invalidate();
        }
      } else if (event.pointerType !== 'touch') {
        const overArtwork = hitsAt(event).length > 0;
        renderer.domElement.style.cursor = controlsRef.current.inspecting
          ? overArtwork ? 'default' : 'zoom-out'
          : overArtwork ? 'pointer' : 'grab';
      }
    }
    function pointerUp(event) {
      if (event.pointerType === 'touch') return;
      if (!dragging || event.pointerId !== activePointer) return;
      dragging = false;
      activePointer = null;
      const current = controlsRef.current;
      renderer.domElement.style.cursor = current.inspecting ? 'default' : 'grab';
      if (dragDistance < 8) {
        const hit = hitsAt(event)[0];
        if (current.inspecting) {
          if (!hit && !pointerStartedOnArtwork && document.elementFromPoint(event.clientX, event.clientY) === renderer.domElement) current.onBackgroundClick?.();
        } else if (hit) current.onSelect?.(hit.object.userData.artworkIndex);
      }
    }
    function pointerCancel(event) {
      if (event.pointerType === 'touch') return;
      if (event.pointerId !== activePointer) return;
      dragging = false;
      activePointer = null;
    }
    renderer.domElement.addEventListener('pointerdown', pointerDown);
    renderer.domElement.addEventListener('pointermove', pointerMove);
    renderer.domElement.addEventListener('pointerup', pointerUp);
    renderer.domElement.addEventListener('pointercancel', pointerCancel);
    renderer.domElement.addEventListener('lostpointercapture', pointerCancel);
    const touch = bindGalleryTouch(host, {
      onStart: (event) => controlsRef.current.inspecting && hitsAt(event).length > 0,
      onTap: (event, startedOnArtwork) => {
        const current = controlsRef.current;
        const hit = hitsAt(event)[0];
        if (current.inspecting) {
          if (!hit && !startedOnArtwork && document.elementFromPoint(event.clientX, event.clientY) === renderer.domElement) current.onBackgroundClick?.();
        } else if (hit) current.onSelect?.(hit.object.userData.artworkIndex);
      },
      onNavigate: (direction) => controlsRef.current.onNavigate?.(direction),
    });
    const unbindPinch = bindGalleryPinch(host.parentElement, {
      isSceneTarget: (target) => host.contains(target),
      onStart: () => {
        touch.cancel();
        const pointerId = activePointer;
        dragging = false;
        activePointer = null;
        if (pointerId !== null && renderer.domElement.hasPointerCapture?.(pointerId)) {
          renderer.domElement.releasePointerCapture(pointerId);
        }
      },
      onZoomIn: (event) => {
        const current = controlsRef.current;
        if (current.inspecting) return;
        const hit = Number.isFinite(event.clientX) && Number.isFinite(event.clientY) ? hitsAt(event)[0] : null;
        current.onSelect?.(hit?.object.userData.artworkIndex ?? facingArtworkIndex());
      },
      onZoomOut: () => {
        const current = controlsRef.current;
        if (current.inspecting || current.focused) current.onBackgroundClick?.();
      },
      onNavigate: (direction) => controlsRef.current.onNavigate?.(direction),
    });
    Promise.allSettled(pendingTextures).then(() => {
      if (!disposed && !ready) { ready = true; controlsRef.current.onReady?.(); }
    });

    function animate(time) {
      frame = null;
      if (disposed) return;
      const delta = Math.min((time - lastTime) / 1000, 0.08);
      lastTime = time;
      const current = controlsRef.current;
      const roomTheme = themeTransition.update(current.theme, time, current.reducedMotion || document.hidden);
      if (roomTheme.value !== renderedThemeAmount) {
        const amount = roomTheme.value;
        scene.background.lerpColors(darkBackground, lightBackground, amount);
        scene.fog.color.copy(scene.background);
        for (const surface of themedSurfaces) {
          surface.material.color.lerpColors(surface.darkColor, surface.lightColor, amount);
          surface.material.emissive.lerpColors(surface.darkEmissive, surface.lightEmissive, amount);
          surface.material.emissiveIntensity = THREE.MathUtils.lerp(surface.darkIntensity, surface.lightIntensity, amount);
        }
        seamMaterial.color.lerpColors(darkSeam, lightSeam, amount);
        seamMaterial.opacity = THREE.MathUtils.lerp(0.7, 0.35, amount);
        for (const label of wallLabels) {
          label.lightLabel.material.opacity = amount;
          label.lightLabel.visible = amount > 0;
        }
        renderedThemeAmount = amount;
      }
      if (current.language !== renderedLanguage) {
        // Replace only text maps; retain the room, camera, free yaw, and interaction state.
        for (const label of wallLabels) {
          const artwork = localizeArtwork(artworks[label.artworkIndex], current.language);
          for (const [material, light] of [[label.material, false], [label.lightLabel.material, true]]) {
            const oldTexture = material.map;
            const texture = labelTexture(artwork, light);
            textures.add(texture);
            material.map = texture;
            material.needsUpdate = true;
            textures.delete(oldTexture);
            oldTexture.dispose();
          }
        }
        renderedLanguage = current.language;
      }
      const index = clamp(current.activeIndex, 0, artworks.length - 1);
      if (index !== lastIndex || current.navigationId !== lastNavigationId || current.focused !== lastFocused || current.inspecting !== lastInspecting) {
        // Retarget from the live direction, so clicking after several full
        // turns follows the shortest path without snapping back to a wall.
        targetYaw = nearestAngle(TAU * index / count, viewYaw);
        targetDragY = 0;
        freeLooking = false;
        lastNavigationId = current.navigationId;
        lastFocused = current.focused;
        lastInspecting = current.inspecting;
        lastIndex = index;
      }
      const selectedSize = dimensions[index];
      const fitDistance = selectedSize.outerWidth / (2 * Math.tan(THREE.MathUtils.degToRad(camera.fov / 2)) * camera.aspect * 0.9);
      const heightDistance = selectedSize.outerHeight / (2 * Math.tan(THREE.MathUtils.degToRad(camera.fov / 2)) * 0.8);
      // Blend the near-square layouts so a header resize cannot abruptly move the camera.
      const comfortableDistance = THREE.MathUtils.lerp(
        fitDistance + 1.05,
        Math.min(12.7, Math.max(9, 20.0 / camera.aspect)),
        THREE.MathUtils.smoothstep(camera.aspect, 1.0, 1.2),
      );
      const compactInspection = hostWidth <= 760;
      const lensScale = Math.tan(THREE.MathUtils.degToRad(camera.fov / 2));
      // Fit the outer frame, including its distance in front of the wall surface.
      const inspectionWidth = compactInspection ? 0.9 : 0.5;
      const inspectionHeight = compactInspection ? 0.37 : 0.73;
      const inspectionDistance = 0.175 + Math.max(
        selectedSize.outerWidth / (2 * lensScale * camera.aspect * inspectionWidth),
        selectedSize.outerHeight / (2 * lensScale * inspectionHeight),
      );
      const targetDistance = current.inspecting
        ? inspectionDistance
        : current.focused ? Math.max(5.15, fitDistance, heightDistance) : Math.max(comfortableDistance, fitDistance, heightDistance);
      // A parallel horizontal move preserves the wall-normal perspective on desktop.
      // The mobile lens offset raises the picture without moving the camera below the floor.
      const targetShiftX = current.inspecting && !compactInspection ? 0.36 : 0;
      const targetShiftY = current.inspecting && compactInspection ? 0.26 : 0;
      const targetAngle = TAU * index / count;
      const angleDelta = THREE.MathUtils.euclideanModulo(targetAngle - viewAngle + Math.PI, TAU) - Math.PI;
      const yawDelta = targetYaw - viewYaw;
      if (firstFrame || current.reducedMotion || document.hidden) {
        viewAngle = targetAngle;
        viewYaw = targetYaw;
        dragY = targetDragY;
        viewDistance = targetDistance;
        viewShiftX = targetShiftX;
        viewShiftY = targetShiftY;
        firstFrame = false;
      } else {
        const ease = 1 - Math.exp(-delta * 5.8);
        viewAngle += angleDelta * ease;
        viewYaw += yawDelta * ease;
        dragY += (targetDragY - dragY) * ease;
        viewDistance += (targetDistance - viewDistance) * ease;
        viewShiftX += (targetShiftX - viewShiftX) * ease;
        viewShiftY += (targetShiftY - viewShiftY) * ease;
      }
      const sin = Math.sin(viewAngle);
      const cos = Math.cos(viewAngle);
      // Camera and gaze move together along the wall: frames retain parallel verticals and horizontals.
      const lateralShift = viewShiftX * Math.max(0.1, viewDistance - 0.17) * lensScale * camera.aspect;
      camera.position.set((ROOM_RADIUS - viewDistance) * sin + lateralShift * cos, ART_HEIGHT, -(ROOM_RADIUS - viewDistance) * cos + lateralShift * sin);
      // Free looking turns in place; approach navigation still moves the
      // camera and settles the gaze perpendicular to the selected wall.
      lookAt.set(camera.position.x + Math.sin(viewYaw) * viewDistance, ART_HEIGHT + dragY, camera.position.z - Math.cos(viewYaw) * viewDistance);
      camera.lookAt(lookAt);
      if (Math.abs(viewShiftY) > 0.00001) camera.setViewOffset(hostWidth, hostHeight, 0, viewShiftY * hostHeight, hostWidth, hostHeight);
      else if (camera.view?.enabled) camera.clearViewOffset();
      const viewedIndex = freeLooking ? facingArtworkIndex() : index;
      if (viewedIndex !== lastViewedIndex) {
        lastViewedIndex = viewedIndex;
        current.onViewChange?.(viewedIndex);
      }
      if (viewedIndex !== shadowIndex) {
        galleryLights.forEach((light, i) => { light.castShadow = i === viewedIndex; });
        renderer.shadowMap.needsUpdate = true;
        shadowIndex = viewedIndex;
      }
      const viewed = localizeArtwork(artworks[viewedIndex], current.language);
      const placement = current.inspecting
        ? hostWidth <= 760
          ? current.t('se trouve au-dessus des informations sur l’œuvre', 'is above the artwork information')
          : current.t('se trouve à gauche des informations sur l’œuvre', 'is on the left beside the artwork information')
        : current.t('se trouve devant vous', 'is ahead');
      renderer.domElement.setAttribute('aria-label', current.t(
        `${current.theme === 'light' ? 'Galerie immersive aux murs blancs' : 'Galerie immersive à l’éclairage tamisé'}. ${viewed.artist}, ${viewed.year}, ${placement}. Sur écran tactile, balayez vers la gauche ou la droite pour changer de photographie. Avec la souris, faites glisser pour tourner à 360 degrés. Les commandes de navigation sont également disponibles.`,
        `${current.theme === 'light' ? 'White-walled museum gallery' : 'Dark museum gallery'}. ${viewed.artist}, ${viewed.year}, ${placement}. On a touchscreen, swipe left or right to change photographs. With a mouse, drag to turn 360 degrees. Photograph navigation controls are also available.`,
      ));
      renderer.render(scene, camera);
      if (roomTheme.active || Math.abs(angleDelta) > 0.0001 || Math.abs(yawDelta) > 0.0001 || Math.abs(targetDragY - dragY) > 0.0001 || Math.abs(targetDistance - viewDistance) > 0.0005 || Math.abs(targetShiftX - viewShiftX) > 0.0001 || Math.abs(targetShiftY - viewShiftY) > 0.0001) invalidate();
    }
    function visibilityChange() {
      if (document.hidden && frame !== null) { cancelAnimationFrame(frame); frame = null; }
      else if (!document.hidden) invalidate(true);
    }
    document.addEventListener('visibilitychange', visibilityChange);
    const intersectionObserver = new IntersectionObserver(([entry]) => {
      inView = entry.isIntersecting;
      if (inView) invalidate(true);
      else if (frame !== null) { cancelAnimationFrame(frame); frame = null; }
    }, { rootMargin: '100px' });
    intersectionObserver.observe(host);
    initialized = true;
    invalidate(true);

    return () => {
      disposed = true;
      if (frame !== null) cancelAnimationFrame(frame);
      invalidateRef.current = () => {};
      resizeObserver.disconnect();
      intersectionObserver.disconnect();
      document.removeEventListener('visibilitychange', visibilityChange);
      unbindPinch();
      touch.cleanup();
      renderer.domElement.removeEventListener('pointerdown', pointerDown);
      renderer.domElement.removeEventListener('pointermove', pointerMove);
      renderer.domElement.removeEventListener('pointerup', pointerUp);
      renderer.domElement.removeEventListener('pointercancel', pointerCancel);
      renderer.domElement.removeEventListener('lostpointercapture', pointerCancel);
      const geometries = new Set();
      const materials = new Set();
      scene.traverse((object) => {
        if (object.geometry) geometries.add(object.geometry);
        if (object.isLight && object.shadow) object.shadow.dispose();
        if (object.material) (Array.isArray(object.material) ? object.material : [object.material]).forEach((material) => materials.add(material));
      });
      geometries.forEach((geometry) => geometry.dispose());
      materials.forEach((material) => material.dispose());
      textures.forEach((texture) => texture.dispose());
      renderer.dispose();
      renderer.domElement.remove();
    };
  }, [artworks]);

  useEffect(() => {
    const host = hostRef.current;
    if (!failed || !host) return undefined;
    const touch = bindGalleryTouch(host, {
      onNavigate: (direction) => controlsRef.current.onNavigate?.(direction),
    });
    const unbindPinch = bindGalleryPinch(host.parentElement, {
      isSceneTarget: (target) => host.contains(target),
      onStart: touch.cancel,
      onZoomIn: () => {
        const current = controlsRef.current;
        if (!current.inspecting) current.onSelect?.(current.activeIndex);
      },
      onZoomOut: () => {
        const current = controlsRef.current;
        if (current.inspecting || current.focused) current.onBackgroundClick?.();
      },
      onNavigate: (direction) => controlsRef.current.onNavigate?.(direction),
    });
    return () => { unbindPinch(); touch.cleanup(); };
  }, [failed]);

  useEffect(() => { invalidateRef.current(true); }, [activeIndex, navigationId, focused, inspecting, reducedMotion, language, theme]);
  const baseSelected = artworks[clamp(activeIndex, 0, Math.max(artworks.length - 1, 0))];
  const selected = baseSelected ? localizeArtwork(baseSelected, language) : undefined;
  const fallbackBounds = inspecting
    ? compactFallback ? { left: '5%', top: '5.5%', width: '90%', height: '37%' } : { left: '7%', top: '13.5%', width: '50%', height: '73%' }
    : { left: '5%', top: '12.5%', width: '90%', height: '75%' };
  return <div ref={hostRef} className="gallery-scene" style={{ width: '100%', height: '100%', position: 'relative', overflow: 'hidden', touchAction: 'pan-y' }}>
    {failed && selected && <div onClick={(event) => { if (inspecting && event.target === event.currentTarget) onBackgroundClick?.(); }} style={{ position: 'absolute', inset: 0, background: theme === 'light' ? '#f4f4f1' : '#171817', transition: reducedMotion ? 'none' : 'background-color 650ms ease', cursor: inspecting ? 'zoom-out' : 'default' }}>
      <button type="button" onClick={(event) => { if (!inspecting) onSelect?.(activeIndex); else if (event.detail > 0 && event.target === event.currentTarget) onBackgroundClick?.(); }} aria-label={t(`Voir ${selected.title}`, `View ${selected.title}`)} style={{ position: 'absolute', ...fallbackBounds, display: 'grid', placeItems: 'center', border: 0, padding: 0, background: 'transparent', cursor: inspecting ? 'default' : 'pointer', transition: reducedMotion ? 'none' : 'left 700ms ease, top 700ms ease, width 700ms ease, height 700ms ease' }}>
        <img src={selected.image} alt={selected.title} style={{ maxWidth: '100%', maxHeight: '100%', width: 'auto', height: 'auto', boxSizing: 'border-box', objectFit: 'contain', display: 'block', border: '6px solid #080909', padding: 20, background: '#e7e4dc', boxShadow: '0 0 70px #fff1c51f' }} />
      </button>
    </div>}
  </div>;
}
