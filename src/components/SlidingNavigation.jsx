import { useLayoutEffect, useRef } from "react";
import { useLanguage } from "../i18n.jsx";

export default function SlidingNavigation({ activeItem, children }) {
  const { language, t } = useLanguage();
  const navRef = useRef(null);
  const indicatorRef = useRef(null);
  const positionedRef = useRef(false);

  useLayoutEffect(() => {
    const nav = navRef.current;
    const indicator = indicatorRef.current;
    let frame;
    const update = () => {
      const active = nav.querySelector('[aria-current="page"]');
      if (!active) return;
      const navRect = nav.getBoundingClientRect();
      const buttonRect = active.getBoundingClientRect();
      // Match the original short line, aligned to the start of the label.
      if (!positionedRef.current) indicator.style.transition = "none";
      indicator.style.transform = `translate3d(${buttonRect.left - navRect.left}px, ${buttonRect.bottom - navRect.top - 8}px, 0)`;
      indicator.style.visibility = "visible";
      if (!positionedRef.current) {
        cancelAnimationFrame(frame);
        frame = requestAnimationFrame(() => {
          indicator.style.removeProperty("transition");
          positionedRef.current = true;
        });
      }
    };
    update();
    // Follow translated labels, loaded fonts, and the mobile header layout.
    const observer = new ResizeObserver(update);
    observer.observe(nav);
    nav.querySelectorAll("button").forEach((button) => observer.observe(button));
    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
    };
  }, [activeItem, language]);

  return (
    <nav ref={navRef} className="main-navigation" aria-label={t("Navigation principale", "Main navigation")}>
      <span ref={indicatorRef} className="nav-indicator" aria-hidden="true" />
      {children}
    </nav>
  );
}
