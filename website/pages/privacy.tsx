import Head from 'next/head';
import Image from 'next/image';
import Link from 'next/link';

const scrollToTop = () => typeof window !== 'undefined' && window.scrollTo({ top: 0, behavior: 'smooth' });

export default function Privacy() {
  return (
    <>
      <Head>
        <title>Privacy Policy — Insightory</title>
        <meta name="description" content="Insightory Privacy Policy" />
      </Head>

      <div className="min-h-screen" style={{ background: '#050a14' }}>
        {/* Nav */}
        <nav className="fixed top-0 left-0 right-0 z-50 glass-strong border-b border-white/5">
          <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
            <Link href="/" className="flex items-center gap-3">
              <div className="relative w-8 h-8">
                <Image src="/images/Logo.png" alt="Insightory" fill className="object-contain" />
              </div>
              <span className="text-white font-bold text-lg">Insight<span className="gradient-text">ory</span></span>
            </Link>
            <Link href="/" className="text-white/60 hover:text-white text-sm transition-colors duration-200 flex items-center gap-2">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 12H5M12 5l-7 7 7 7"/></svg>
              Back to Home
            </Link>
          </div>
        </nav>

        <div className="max-w-3xl mx-auto px-6 pt-32 pb-24">
          {/* Header */}
          <div className="mb-12">
            <div className="inline-flex items-center gap-2 glass px-3 py-1.5 rounded-full text-xs text-brand-400 font-semibold mb-6 border border-brand-500/20">
              Legal
            </div>
            <h1 className="text-4xl md:text-5xl font-black text-white mb-4">Privacy Policy</h1>
            <p className="text-white/40 text-sm">Last updated: April 30, 2026</p>
          </div>

          <div className="divider mb-12" />

          {/* Content */}
          <div className="prose-custom space-y-10 text-white/60 text-base leading-relaxed">
            <section>
              <h2 className="text-white text-2xl font-bold mb-4">1. Information We Collect</h2>
              <p>We collect information you provide directly to us when you create an account, use our services, or contact us for support. This includes:</p>
              <ul className="mt-4 space-y-2 list-none pl-0">
                {['Name and email address', 'Business name and store details', 'Product and inventory data you enter', 'Usage data and app interactions', 'Device information and identifiers'].map((item) => (
                  <li key={item} className="flex items-start gap-3">
                    <span className="w-1.5 h-1.5 rounded-full bg-brand-400 mt-2 flex-shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
            </section>

            <section>
              <h2 className="text-white text-2xl font-bold mb-4">2. How We Use Your Information</h2>
              <p>We use the information we collect to provide, maintain, and improve our services, including to:</p>
              <ul className="mt-4 space-y-2 list-none pl-0">
                {[
                  'Process transactions and send related information',
                  'Send technical notices and support messages',
                  'Respond to your comments and questions',
                  'Monitor and analyze usage patterns to improve the app',
                  'Detect and prevent fraudulent transactions and abuse',
                ].map((item) => (
                  <li key={item} className="flex items-start gap-3">
                    <span className="w-1.5 h-1.5 rounded-full bg-brand-400 mt-2 flex-shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
            </section>

            <section>
              <h2 className="text-white text-2xl font-bold mb-4">3. Data Security</h2>
              <p>We take the security of your data seriously. We implement industry-standard encryption (AES-256) for data at rest and TLS 1.3 for data in transit. Your inventory data is stored in isolated, tenant-specific databases and is never shared with other users or third parties without your explicit consent.</p>
            </section>

            <section>
              <h2 className="text-white text-2xl font-bold mb-4">4. Data Retention</h2>
              <p>We retain your personal information for as long as your account is active or as needed to provide you services. You may request deletion of your account and associated data at any time by contacting us at <a href="mailto:privacy@insightory.app" className="text-brand-400 hover:text-brand-300 transition-colors">privacy@insightory.app</a>.</p>
            </section>

            <section>
              <h2 className="text-white text-2xl font-bold mb-4">5. Third-Party Services</h2>
              <p>We may use third-party services to help operate our platform, including cloud infrastructure providers, analytics services, and payment processors. These parties have access to your information only to perform specific tasks on our behalf and are obligated not to disclose or use it for any other purpose.</p>
            </section>

            <section>
              <h2 className="text-white text-2xl font-bold mb-4">6. Your Rights</h2>
              <p>Depending on your location, you may have certain rights regarding your personal data, including the right to access, correct, or delete your data. To exercise these rights, please contact us at <a href="mailto:privacy@insightory.app" className="text-brand-400 hover:text-brand-300 transition-colors">privacy@insightory.app</a>.</p>
            </section>

            <section>
              <h2 className="text-white text-2xl font-bold mb-4">7. Changes to This Policy</h2>
              <p>We may update this Privacy Policy from time to time. We will notify you of any changes by posting the new policy on this page and updating the "Last updated" date. Your continued use of the app after any changes constitutes your acceptance of the new policy.</p>
            </section>

            <section>
              <h2 className="text-white text-2xl font-bold mb-4">8. Contact Us</h2>
              <p>If you have any questions about this Privacy Policy, please contact us at <a href="mailto:privacy@insightory.app" className="text-brand-400 hover:text-brand-300 transition-colors">privacy@insightory.app</a> or visit our <Link href="/contact" className="text-brand-400 hover:text-brand-300 transition-colors">Contact page</Link>.</p>
            </section>
          </div>

          {/* Back to top */}
          <div className="mt-16 flex items-center justify-between">
            <Link href="/" className="text-white/40 hover:text-white text-sm transition-colors duration-200 flex items-center gap-2">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 12H5M12 5l-7 7 7 7"/></svg>
              Back to Home
            </Link>
            <button onClick={scrollToTop} className="text-white/40 hover:text-brand-400 text-sm transition-colors duration-200 flex items-center gap-2">
              Back to top
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M12 19V5M5 12l7-7 7 7"/></svg>
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
