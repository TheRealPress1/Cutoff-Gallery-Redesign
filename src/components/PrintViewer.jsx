import { useCallback, useEffect, useRef, useState } from "react";
import { Minus, Plus, RotateCcw } from "lucide-react";
import { useLanguage } from "../i18n.jsx";
import "./print-viewer.css";

const ZOOM_SCALE = 2.5;
const ANGLES = { Front: 0, Left: 28, Right: -28 };

export default function PrintViewer({ artwork }) {
  const { t } = useLanguage();
  const angleLabels = { Front: t("Face", "Front"), Left: t("Gauche", "Left"), Right: t("Droite", "Right") };
  const [zoom, setZoom] = useState(false);
  const [angle, setAngle] = useState("Front");
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [dragging, setDragging] = useState(false);
  const [frameSize, setFrameSize] = useState({ width: 0, height: 0 });
  const [imageResult, setImageResult] = useState({ src: null, status: "loading" });
  const [retry, setRetry] = useState(0);
  const stageRef = useRef(null);
  const frameRef = useRef(null);
  const zoomButtonRef = useRef(null);
  const gesture = useRef(null);
  const ratio = artwork.aspectRatio || artwork.width / artwork.height || 1.5;
  const imageSrc = retry ? `${artwork.image}${artwork.image.includes("?") ? "&" : "?"}retry=${retry}` : artwork.image;
  const imageState = imageResult.src === imageSrc ? imageResult.status : "loading";

  const constrainPan = useCallback((x, y) => {
    const stage = stageRef.current;
    const frame = frameRef.current;
    if (!stage || !frame) return { x: 0, y: 0 };
    const bound = (value, offset, size, viewport) => {
      const scaled = size * ZOOM_SCALE;
      if (scaled <= viewport) return 0;
      const center = offset + size / 2;
      return Math.max(viewport - center - scaled / 2, Math.min(scaled / 2 - center, value));
    };
    return {
      x: bound(x, frame.offsetLeft, frame.offsetWidth, stage.clientWidth),
      y: bound(y, frame.offsetTop, frame.offsetHeight, stage.clientHeight),
    };
  }, []);

  useEffect(() => {
    const stage = stageRef.current;
    const frame = frameRef.current;
    if (!stage || !frame) return;
    const measure = () => {
      const style = getComputedStyle(stage);
      const frameStyle = getComputedStyle(frame);
      const inset = 2 * (parseFloat(frameStyle.getPropertyValue("--pv-mat")) + parseFloat(frameStyle.getPropertyValue("--pv-edge")));
      const width = Math.max(1, stage.clientWidth - parseFloat(style.paddingLeft) - parseFloat(style.paddingRight) - inset);
      const height = Math.max(1, stage.clientHeight - parseFloat(style.paddingTop) - parseFloat(style.paddingBottom) - inset);
      const imageWidth = Math.min(width, height * ratio);
      const next = { width: imageWidth + inset, height: imageWidth / ratio + inset };
      setFrameSize((previous) => previous.width === next.width && previous.height === next.height ? previous : next);
      gesture.current = null;
      setDragging(false);
    };
    const observer = new ResizeObserver(measure);
    observer.observe(stage);
    measure();
    return () => observer.disconnect();
  }, [ratio]);

  useEffect(() => {
    if (zoom) setPan((previous) => constrainPan(previous.x, previous.y));
  }, [zoom, frameSize, constrainPan]);

  useEffect(() => {
    setZoom(false);
    setAngle("Front");
    setPan({ x: 0, y: 0 });
    setDragging(false);
    setRetry(0);
    gesture.current = null;
  }, [artwork.image]);

  const resetGesture = () => {
    gesture.current = null;
    setDragging(false);
    setPan({ x: 0, y: 0 });
  };
  const toggleZoom = () => {
    if (imageState !== "loaded") return;
    const next = !zoom;
    setZoom(next);
    setAngle("Front");
    resetGesture();
    requestAnimationFrame(() => (next ? stageRef.current : zoomButtonRef.current)?.focus());
  };
  const chooseAngle = (view) => {
    setAngle(view);
    setZoom(false);
    resetGesture();
  };
  const startPan = (event) => {
    if (!zoom || event.button !== 0 || !event.isPrimary || gesture.current) return;
    event.preventDefault();
    event.currentTarget.setPointerCapture(event.pointerId);
    gesture.current = { id: event.pointerId, x: event.clientX, y: event.clientY, origin: pan };
    setDragging(true);
  };
  const movePan = (event) => {
    const start = gesture.current;
    if (!start || start.id !== event.pointerId) return;
    setPan(constrainPan(start.origin.x + event.clientX - start.x, start.origin.y + event.clientY - start.y));
  };
  const endPan = (event) => {
    if (gesture.current && event.pointerId !== gesture.current.id) return;
    gesture.current = null;
    setDragging(false);
  };
  const panWithKeys = (event) => {
    if (!zoom || !["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown"].includes(event.key)) return;
    event.preventDefault();
    event.stopPropagation();
    const dx = event.key === "ArrowLeft" ? 50 : event.key === "ArrowRight" ? -50 : 0;
    const dy = event.key === "ArrowUp" ? 50 : event.key === "ArrowDown" ? -50 : 0;
    setPan((previous) => constrainPan(previous.x + dx, previous.y + dy));
  };

  return (
    <div className={`detail-art print-viewer ${zoom ? "print-viewer--zoomed" : ""} ${dragging ? "print-viewer--dragging" : ""}`}>
      <div className="print-viewer__eyebrow" aria-live="polite">
        {zoom ? t("GLISSEZ POUR EXPLORER · FLÈCHES POUR DÉPLACER", "DRAG TO EXPLORE · ARROW KEYS TO PAN") : t("LE TIRAGE, EN DÉTAIL", "THE PRINT, UP CLOSE")}
      </div>
      <div
        ref={stageRef}
        className="print-viewer__stage"
        tabIndex={zoom ? 0 : undefined}
        role={zoom ? "region" : undefined}
        aria-label={zoom ? t("Photographie agrandie. Faites glisser l’image ou utilisez les flèches du clavier pour en explorer les détails.", "Enlarged photograph. Drag or use arrow keys to explore details.") : undefined}
        onPointerDown={startPan}
        onPointerMove={movePan}
        onPointerUp={endPan}
        onPointerCancel={endPan}
        onLostPointerCapture={endPan}
        onKeyDown={panWithKeys}
        onDoubleClick={toggleZoom}
      >
        <div
          ref={frameRef}
          className="print-viewer__frame"
          style={{
            width: frameSize.width,
            height: frameSize.height,
            opacity: imageState === "loaded" && frameSize.width ? 1 : 0,
            transform: `translate3d(${pan.x}px, ${pan.y}px, 0) scale(${zoom ? ZOOM_SCALE : 1}) rotateY(${ANGLES[angle]}deg)`,
          }}
        >
          <span className="print-viewer__edge print-viewer__edge--left" aria-hidden="true" />
          <span className="print-viewer__edge print-viewer__edge--right" aria-hidden="true" />
          <span className="print-viewer__edge print-viewer__edge--top" aria-hidden="true" />
          <span className="print-viewer__edge print-viewer__edge--bottom" aria-hidden="true" />
          <div className="print-viewer__front">
            <img
              src={imageSrc}
              alt={artwork.title}
              draggable={false}
              decoding="async"
              onLoad={() => setImageResult({ src: imageSrc, status: "loaded" })}
              onError={() => setImageResult({ src: imageSrc, status: "error" })}
            />
          </div>
        </div>
      </div>
      {imageState !== "loaded" && (
        <div className="print-viewer__status" role="status">
          <span>{imageState === "error" ? t("Impossible de charger la photographie.", "The photograph could not be loaded.") : t("Chargement de la photographie", "Loading photograph")}</span>
          {imageState === "error" && <button onClick={() => setRetry((value) => value + 1)}><RotateCcw size={13} />{t("Réessayer", "Try again")}</button>}
        </div>
      )}
      <div className="print-viewer__controls">
        <div className="print-viewer__angle-control" role="group" aria-label={t("Angle de vue du cadre", "Frame view")}>
          <span>{t("Angle de vue", "Frame view")}</span>
          <div className="print-viewer__angle-buttons">
            {Object.keys(ANGLES).map((view) => (
              <button key={view} type="button" aria-pressed={angle === view} onClick={() => chooseAngle(view)} disabled={imageState !== "loaded"}>{angleLabels[view]}</button>
            ))}
          </div>
        </div>
        <button ref={zoomButtonRef} className="print-viewer__zoom-button" onClick={toggleZoom} disabled={imageState !== "loaded"} aria-pressed={zoom}>
          {zoom ? <Minus size={15} /> : <Plus size={15} />}
          {zoom ? t("Voir l’œuvre entière", "See full work") : t("Voir de plus près", "A closer look")}
        </button>
      </div>
      <span className="print-viewer__credit">{t("Photographie", "Photograph")} © {artwork.photographer}</span>
    </div>
  );
}
