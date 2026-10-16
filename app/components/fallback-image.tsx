"use client";

import { useEffect, useRef, useState, type ImgHTMLAttributes } from "react";

export default function FallbackImage({ src, fallback, ...props }: Omit<ImgHTMLAttributes<HTMLImageElement>, "onError" | "src"> & { src?: string; fallback: string }) {
  const [failedSource, setFailedSource] = useState<string | null>(null);
  const image = useRef<HTMLImageElement>(null);
  useEffect(() => {
    // An image can fail before React hydrates and attaches its error handler.
    if (image.current?.complete && !image.current.naturalWidth) setFailedSource(src ?? null);
  }, [src]);
  return <img {...props} ref={image} src={!src || failedSource === src ? fallback : src} onError={() => setFailedSource(src ?? null)}/>;
}
