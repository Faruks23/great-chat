import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Great Chat - Dashboard',
};

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return <main className="min-h-screen">{children}</main>;
}
