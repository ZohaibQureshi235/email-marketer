'use client';

import DashboardLayout from '@/components/layout/DashboardLayout';
import ElementorStyleBuilder from '@/components/email-builder/ElementorStyleBuilder';

export default function EmailBuilderPage() {
  return (
    <DashboardLayout>
      <ElementorStyleBuilder />
    </DashboardLayout>
  );
}