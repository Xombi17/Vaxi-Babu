import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Medicines | WellSync Vaxi',
  description: 'Manage medicine regimens and check safety for your family members.',
};

export default function MedicinesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
