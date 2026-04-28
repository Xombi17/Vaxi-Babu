import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Timeline | WellSync Vaxi',
  description: 'View your family health timeline and upcoming health events.',
};

export default function TimelineLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
