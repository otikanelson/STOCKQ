'use client';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useEffect, useRef, useState } from 'react';

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

const stats = [
  {
    value: 10000, suffix: '+', label: 'Products Tracked',
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>
        <polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/>
      </svg>
    ),
  },
  {
    value: 99.9, suffix: '%', label: 'Uptime Guaranteed', decimals: 1,
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
      </svg>
    ),
  },
  {
    value: 500, suffix: '+', label: 'Stores Powered',
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/>
      </svg>
    ),
  },
  {
    value: 4.9, suffix: '★', label: 'App Store Rating', decimals: 1,
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
      </svg>
    ),
  },
];

function Counter({ target, suffix, decimals = 0 }: { target: number; suffix: string; decimals?: number }) {
  const [val, setVal] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const triggered = useRef(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const trigger = ScrollTrigger.create({
      trigger: ref.current,
      start: 'top 85%',
      onEnter: () => {
        if (triggered.current) return;
        triggered.current = true;
        gsap.to({ v: 0 }, {
          v: target,
          duration: 2,
          ease: 'power2.out',
          onUpdate: function () {
            setVal(parseFloat(this.targets()[0].v.toFixed(decimals)));
          },
        });
      },
    });
    return () => trigger.kill();
  }, [target, decimals]);

  return (
    <span ref={ref}>
      {decimals > 0 ? val.toFixed(decimals) : val.toLocaleString()}
      {suffix}
    </span>
  );
}

export default function Stats() {
  const sectionRef = useRef<HTMLElement>(null);
  const cardsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const ctx = gsap.context(() => {
      const cards = cardsRef.current?.querySelectorAll('.stat-item');
      if (cards) {
        gsap.fromTo(
          cards,
          { y: 40, opacity: 0 },
          {
            y: 0, opacity: 1, duration: 0.7, stagger: 0.12, ease: 'power3.out',
            scrollTrigger: { trigger: cardsRef.current, start: 'top 85%' },
          }
        );
      }
    }, sectionRef);
    return () => ctx.revert();
  }, []);

  return (
    <section ref={sectionRef} className="relative py-20 px-6">
      <div className="divider mb-20" />
      <div ref={cardsRef} className="max-w-5xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-6">
        {stats.map((s, i) => (
          <div key={i} className="stat-item stat-card p-8 text-center">
            <div className="flex items-center justify-center mb-3" style={{ color: 'var(--primary)' }}>{s.icon}</div>
            <div className="text-2xl md:text-3xl font-black gradient-text mb-2">
              <Counter target={s.value} suffix={s.suffix} decimals={s.decimals} />
            </div>
            <div className="text-sm font-medium" style={{ color: 'var(--subtext)' }}>{s.label}</div>
          </div>
        ))}
      </div>
      <div className="divider mt-20" />
    </section>
  );
}
