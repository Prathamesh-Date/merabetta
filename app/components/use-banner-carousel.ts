"use client";

import { useEffect, useState } from "react";

export default function useBannerCarousel(length: number) {
  const [slide, setSlide] = useState(0);
  const [playing, setPlaying] = useState(true);
  const [hovered, setHovered] = useState(false);
  const [focused, setFocused] = useState(false);
  const rotating = playing && !hovered && !focused;

  useEffect(() => {
    const motion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const respectMotion = () => { if (motion.matches) setPlaying(false); };
    respectMotion();
    motion.addEventListener("change", respectMotion);
    return () => motion.removeEventListener("change", respectMotion);
  }, []);

  useEffect(() => {
    if (!rotating) return;
    const timer = window.setInterval(() => {
      if (!document.hidden) setSlide(index => (index + 1) % length);
    }, 2500);
    return () => window.clearInterval(timer);
  }, [length, rotating, slide]);

  return { slide, setSlide, playing, setPlaying, setHovered, setFocused, rotating };
}
