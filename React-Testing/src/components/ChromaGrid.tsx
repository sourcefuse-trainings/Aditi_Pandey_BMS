// src/components/ChromaGrid.tsx
import React, { useRef, useEffect, useImperativeHandle } from 'react';
import { gsap } from 'gsap';

// Define Props and Handle types as before
export interface ChromaGridProps<T> {
  items: T[];
  className?: string;
  radius?: number;
  damping?: number;
  fadeOut?: number;
  ease?: string;
  renderItem: (item: T, index: number) => React.ReactNode;
}

export interface ChromaGridHandle {
  reFocus: () => void;
}

type SetterFn = (v: number | string) => void;

// 1. Define the component's render logic as an inner function.
// This function is generic over type T.
function ChromaGridInner<T>(
  props: ChromaGridProps<T>,
  ref: React.Ref<ChromaGridHandle>
) {
  const {
    items,
    className = '',
    radius = 300,
    damping = 0.45,
    fadeOut = 0.6,
    ease = 'power3.out',
    renderItem,
  } = props;
    
  const rootRef = useRef<HTMLDivElement>(null);
  const fadeRef = useRef<HTMLDivElement>(null);
  const setX = useRef<SetterFn | null>(null);
  const setY = useRef<SetterFn | null>(null);
  const pos = useRef({ x: 0, y: 0 });

  useImperativeHandle(ref, () => ({
    reFocus() {
      gsap.to(fadeRef.current, { opacity: 0, duration: 0.25, overwrite: true });
    }
  }));

  useEffect(() => {
    const el = rootRef.current;
    if (!el) return;
    const { width, height } = el.getBoundingClientRect();
    pos.current = { x: width / 2, y: height / 2 };
    setX.current = gsap.quickSetter(el, '--x', 'px') as SetterFn;
    setY.current = gsap.quickSetter(el, '--y', 'px') as SetterFn;
    setX.current(pos.current.x);
    setY.current(pos.current.y);
  }, []);

  const handleMove = (e: React.PointerEvent) => {
    const r = rootRef.current!.getBoundingClientRect();
    const x = e.clientX - r.left;
    const y = e.clientY - r.top;

    gsap.to(pos.current, {
      x, y, duration: damping, ease,
      onUpdate: () => {
        setX.current?.(pos.current.x);
        setY.current?.(pos.current.y);
      },
      overwrite: true
    });

    gsap.to(fadeRef.current, { opacity: 0, duration: 0.25, overwrite: true });
  };

  const handleLeave = () => {
    gsap.to(fadeRef.current, {
      opacity: 1, duration: fadeOut, overwrite: true
    });
  };

  return (
    <div
      ref={rootRef}
      onPointerMove={handleMove}
      onPointerLeave={handleLeave}
      className={`relative w-full h-full flex flex-wrap justify-center items-start gap-4 p-4 ${className}`}
      style={{'--r': `${radius}px`, '--x': '50%', '--y': '50%'} as React.CSSProperties}
    >
      {items.map((item, i) => renderItem(item, i))}
      <div
        className="absolute inset-0 pointer-events-none z-30"
        style={{
          background: 'rgba(0,0,0,0.001)',
          maskImage: 'radial-gradient(circle var(--r) at var(--x) var(--y),transparent 0%,transparent 15%,rgba(0,0,0,0.10) 30%,rgba(0,0,0,0.22)45%,rgba(0,0,0,0.35)60%,rgba(0,0,0,0.50)75%,rgba(0,0,0,0.68)88%,white 100%)',
        }}
      />
      <div
        ref={fadeRef}
        className="absolute inset-0 pointer-events-none transition-opacity duration-[250ms] z-40"
        style={{
          background: 'rgba(0,0,0,0.001)',
          maskImage: 'radial-gradient(circle var(--r) at var(--x) var(--y),white 0%,white 15%,rgba(255,255,255,0.90)30%,rgba(255,255,255,0.78)45%,rgba(255,255,255,0.65)60%,rgba(255,255,255,0.50)75%,rgba(255,255,255,0.32)88%,transparent 100%)',
          opacity: 1
        }}
      />
    </div>
  );
}

// 2. Create the final component by wrapping the inner function with forwardRef
// and casting it to the correct generic type. This is the key part.
const ChromaGrid = React.forwardRef(ChromaGridInner) as <T>(
  props: ChromaGridProps<T> & { ref?: React.Ref<ChromaGridHandle> }
) => React.ReactElement;

export default ChromaGrid;