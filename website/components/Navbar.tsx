'use client';
import { gsap } from 'gsap';
import Image from 'next/image';
import { useEffect, useRef, useState } from 'react';

const links = [
  { label: 'Features', href: '#features' },
  { label: 'Screenshots', href: '#screenshots' },
  { label: 'Download', href: '#download' },
  { label: 'About', href: '#about' },
];

export default function Navbar() {
  const navRef = useRef<HTMLElement>(null);
  const logoRef = useRef<HTMLDivElement>(null);
  const linksRef = useRef<HTMLUListElement>(null);
  const ctaRef = useRef<HTMLAnchorElement>(null);
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  /* ── Initial entrance animation ── */
  useEffect(() => {
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ delay: 0.3 });

      tl.fromTo(
        navRef.current,
        { y: -80, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.9, ease: 'power3.out' }
      )
        .fromTo(
          logoRef.current,
          { x: -30, opacity: 0 },
          { x: 0, opacity: 1, duration: 0.6, ease: 'back.out(1.7)' },
          '-=0.5'
        )
        .fromTo(
          linksRef.current?.children ? Array.from(linksRef.current.children) : [],
          { y: -20, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.5, stagger: 0.08, ease: 'power2.out' },
          '-=0.4'
        )
        .fromTo(
          ctaRef.current,
          { scale: 0.8, opacity: 0 },
          { scale: 1, opacity: 1, duration: 0.5, ease: 'back.out(1.7)' },
          '-=0.3'
        );
    });

    return () => ctx.revert();
  }, []);

  /* ── Scroll glass effect ── */
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  /* ── Animate scroll state change ── */
  useEffect(() => {
    if (!navRef.current) return;
    gsap.to(navRef.current, {
      backgroundColor: scrolled ? 'rgba(5,10,20,0.75)' : 'rgba(5,10,20,0)',
      borderBottomColor: scrolled ? 'rgba(42,163,245,0.15)' : 'rgba(255,255,255,0)',
      backdropFilter: scrolled ? 'blur(24px)' : 'blur(0px)',
      duration: 0.4,
      ease: 'power2.out',
    });
  }, [scrolled]);

  const handleNavClick = (href: string) => {
    setMenuOpen(false);
    const el = document.querySelector(href);
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <nav
      ref={navRef}
      className="fixed top-0 left-0 right-0 z-50 border-b border-transparent"
      style={{ willChange: 'background-color, backdrop-filter' }}
    >
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        {/* Logo */}
        <div ref={logoRef} className="flex items-center gap-3 cursor-pointer" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
          <div className="relative w-9 h-9">
            <Image src="/images/Logo.png" alt="Insightory" fill className="object-contain" />
          </div>
          <span className="text-white font-bold text-xl tracking-tight">
            Insight<span className="gradient-text">ory</span>
          </span>
        </div>

        {/* Desktop links */}
        <ul ref={linksRef} className="hidden md:flex items-center gap-8 list-none">
          {links.map((l) => (
            <li key={l.label}>
              <button
                onClick={() => handleNavClick(l.href)}
                className="nav-link text-sm text-white/70 hover:text-white transition-colors duration-200 font-medium"
              >
                {l.label}
              </button>
            </li>
          ))}
        </ul>

        {/* CTA */}
        <a
          ref={ctaRef}
          href="#download"
          onClick={(e) => { e.preventDefault(); handleNavClick('#download'); }}
          className="hidden md:flex btn-glow items-center gap-2 px-5 py-2.5 rounded-full text-sm font-semibold text-white"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path d="M12 16l-4-4h3V4h2v8h3l-4 4z"/>
            <path d="M20 18H4v2h16v-2z"/>
          </svg>
          Get the App
        </a>

        {/* Mobile hamburger */}
        <button
          className="md:hidden flex flex-col gap-1.5 p-2"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Toggle menu"
        >
          <span className={`block w-6 h-0.5 bg-white transition-all duration-300 ${menuOpen ? 'rotate-45 translate-y-2' : ''}`} />
          <span className={`block w-6 h-0.5 bg-white transition-all duration-300 ${menuOpen ? 'opacity-0' : ''}`} />
          <span className={`block w-6 h-0.5 bg-white transition-all duration-300 ${menuOpen ? '-rotate-45 -translate-y-2' : ''}`} />
        </button>
      </div>

      {/* Mobile menu */}
      <div
        className={`md:hidden glass-strong transition-all duration-300 overflow-hidden ${menuOpen ? 'max-h-80 opacity-100' : 'max-h-0 opacity-0'}`}
      >
        <ul className="flex flex-col px-6 py-4 gap-4 list-none">
          {links.map((l) => (
            <li key={l.label}>
              <button
                onClick={() => handleNavClick(l.href)}
                className="text-white/80 hover:text-white text-base font-medium w-full text-left"
              >
                {l.label}
              </button>
            </li>
          ))}
          <li>
            <a
              href="#download"
              onClick={(e) => { e.preventDefault(); handleNavClick('#download'); }}
              className="btn-glow inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-semibold text-white mt-2"
            >
              Get the App
            </a>
          </li>
        </ul>
      </div>
    </nav>
  );
}
