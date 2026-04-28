import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Dashboard | WellSync Vaxi',
  description: 'Manage your family health, upcoming vaccinations, and health milestones in one place.',
};

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
