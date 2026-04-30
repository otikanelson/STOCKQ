'use client';
import Link from 'next/link';
import NavLogo from '../components/NavLogo';
import ThemeApplier from '../components/ThemeApplier';

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 text-center"
      style={{ background: 'var(--bg)' }}>
      <ThemeApplier />
      <div className="mb-8 opacity-60">
        <NavLogo size={16} />
      </div>
      <h1 className="text-8xl font-black gradient-text mb-4">404</h1>
      <p className="text-lg mb-8" style={{ color: 'var(--subtext)' }}>This page doesn't exist.</p>
      <Link href="/" className="btn-glow px-8 py-3 rounded-2xl font-bold text-sm text-white">
        Back to Home
      </Link>
    </div>
  );
}
