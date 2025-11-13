'use client';

import DashboardLayout from '@/components/layout/DashboardLayout';
import EmailBuilder from '@/components/email-builder/EmailBuilder';

export default function EmailBuilderPage() {
  return (
    <DashboardLayout>
      <EmailBuilder />
    </DashboardLayout>
  );
}