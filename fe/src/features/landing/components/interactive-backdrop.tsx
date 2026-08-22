"use client";

import { useEffect, useRef } from "react";

export function InteractiveBackdrop() {
  const elementRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const element = elementRef.current;
    const motion = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (!element || motion.matches) return;

    let frame = 0;
    let pointerX = window.innerWidth / 2;
    let pointerY = window.innerHeight / 2;

    const render = () => {
      frame = 0;
      element.style.setProperty("--pointer-x", `${(pointerX / window.innerWidth) * 100}%`);
      element.style.setProperty("--pointer-y", `${(pointerY / window.innerHeight) * 100}%`);
      element.style.setProperty("--scroll-offset", `${window.scrollY * -0.025}px`);
    };

    const scheduleRender = () => {
      if (!frame) frame = window.requestAnimationFrame(render);
    };

    const onPointerMove = (event: PointerEvent) => {
      pointerX = event.clientX;
      pointerY = event.clientY;
      scheduleRender();
    };

    window.addEventListener("pointermove", onPointerMove, { passive: true });
    window.addEventListener("scroll", scheduleRender, { passive: true });
    scheduleRender();

    return () => {
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("scroll", scheduleRender);
      if (frame) window.cancelAnimationFrame(frame);
    };
  }, []);

  return <div ref={elementRef} className="interactive-backdrop" aria-hidden="true" />;
}
