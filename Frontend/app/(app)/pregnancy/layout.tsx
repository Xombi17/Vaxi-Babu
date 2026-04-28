import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Pregnancy Care | WellSync Vaxi',
  description: 'Track your pregnancy journey, milestones, and high-risk monitoring with personalized care.',
};

export default function PregnancyLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
