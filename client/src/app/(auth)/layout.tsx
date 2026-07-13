import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Great Chat - Auth',
};

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <section style={{ minHeight: '100vh', display: 'grid', placeItems: 'center', padding: '2rem' }}>
      <div style={{ width: '100%', maxWidth: 420 }}>
        <div style={{ marginBottom: '1.5rem', textAlign: 'center' }}>
          <h1>Great Chat</h1>
          <p>Secure access to your team messaging.</p>
        </div>
        {children}
        <div style={{ marginTop: '1.5rem', textAlign: 'center' }}>
          <Link href="/">Back to home</Link>
        </div>
      </div>
    </section>
  );
}
