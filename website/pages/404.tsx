import Image from 'next/image';
import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 text-center" style={{ background: '#050a14' }}>
      <div className="relative w-16 h-16 mb-8">
        <Image src="/images/Logo.png" alt="Insightory" fill className="object-contain opacity-60" />
      </div>
      <h1 className="text-8xl font-black gradient-text mb-4">404</h1>
      <p className="text-white/50 text-lg mb-8">This page doesn't exist.</p>
      <Link href="/" className="btn-glow px-8 py-3 rounded-2xl text-white font-bold text-sm">
        Back to Home
      </Link>
    </div>
  );
}
