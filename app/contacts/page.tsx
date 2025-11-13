"use client";

import DashboardLayout from "@/components/layout/DashboardLayout";
import EmailListManager from "@/components/email-list/EmailListManager";
import { EmailSpeedIndicator } from "@/components/dashboard/EmailSpeedIndicator";
import Link from "next/link";

export default function CampaignsPage() {
  return (
    <DashboardLayout>
      <div className="flex h-screen bg-gray-50">
        {/* Sidebar */}
        <div className="w-64 bg-white shadow-lg">
          <div className="p-6 border-b border-gray-200">
            <Link href={"/"} className="cursor-pointer">
              <h1 className="text-xl font-bold text-gray-900">
                Email Marketer
              </h1>
              <p className="text-sm text-gray-600">POS Platform</p>
            </Link>
          </div>

          <nav className="p-4 space-y-2">
            <a
              href="/"
              className="flex items-center space-x-3 px-4 py-2 text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
            >
              <ChartBarIcon className="h-5 w-5" />
              <span>Dashboard</span>
            </a>
            <a
              href="/email-builder"
              className="flex items-center space-x-3 px-4 py-2 text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
            >
              <EnvelopeIcon className="h-5 w-5" />
              <span>Email Builder</span>
            </a>
            <a
              href="/contacts"
              className="flex items-center space-x-3 px-4 py-2 text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
            >
              <UsersIcon className="h-5 w-5" />
              <span>Contacts</span>
            </a>
          </nav>
        </div>

        <div className="flex-1 overflow-auto">
          {/* Header */}
          <header className="bg-white shadow-sm border-b border-gray-200">
            <div className="px-8 py-4">
              <h2 className="text-2xl font-bold text-gray-900">
                Campaign Management
              </h2>
              <p className="text-gray-600">
                Manage your email campaigns and contacts
              </p>
            </div>
          </header>

          <div className="p-8 space-y-8">
            {/* Email Speed Indicator */}
            <EmailSpeedIndicator />

            {/* Email List Manager */}
            <EmailListManager />
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

// Add the missing icons
function ChartBarIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg {...props} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
      />
    </svg>
  );
}

function EnvelopeIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg {...props} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
      />
    </svg>
  );
}

function DocumentChartBarIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg {...props} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
      />
    </svg>
  );
}

function UsersIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg {...props} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z"
      />
    </svg>
  );
}
