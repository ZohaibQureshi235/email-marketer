"use client";

import DashboardLayout from "@/components/layout/DashboardLayout";
import { useAuth } from "@/hooks/useAuth";
import { StatsCard } from "@/components/dashboard/StatsCard";
import { RecentCampaigns } from "@/components/dashboard/RecentCampaigns";
import { QuickActions } from "@/components/dashboard/QuickActions";
import { ActivityFeed } from "@/components/dashboard/ActivityFeed";
import { EmailSpeedIndicator } from "@/components/dashboard/EmailSpeedIndicator"; // Add this import
import {
  EnvelopeIcon,
  ChartBarIcon,
  UsersIcon,
  DocumentChartBarIcon,
  PlusIcon,
  UserGroupIcon,
  CogIcon,
  RocketLaunchIcon,
} from "@heroicons/react/24/outline";
import { useRouter } from "next/navigation";
import { Campaign, Activity } from "@/types";
import Link from "next/link";

const quickActions = [
  {
    title: "Create Campaign",
    description: "Start a new email campaign",
    icon: PlusIcon,
    href: "/email-builder",
    color: "bg-blue-600",
  },
  {
    title: "Add Contacts",
    description: "Import or add new subscribers",
    icon: UserGroupIcon,
    href: "/contacts",
    color: "bg-green-600",
  },
  {
    title: "New Template",
    description: "Create a reusable template",
    icon: CogIcon,
    href: "/templates",
    color: "bg-purple-600",
  },
];

const mockCampaigns: Campaign[] = [
  {
    id: "1",
    name: "Welcome Series",
    status: "sent",
    subject: "Welcome to our platform!",
    recipientCount: 2543,
    sentAt: new Date("2024-01-15"),
    createdAt: new Date("2024-01-10"),
    updatedAt: new Date("2024-01-15"),
    openRate: 34.2,
    clickRate: 8.7,
  },
  {
    id: "2",
    name: "Product Launch",
    status: "draft",
    subject: "New Product Announcement",
    recipientCount: 0,
    createdAt: new Date("2024-01-18"),
    updatedAt: new Date("2024-01-18"),
  },
  {
    id: "3",
    name: "Weekly Newsletter",
    status: "scheduled",
    subject: "This Week's Updates",
    recipientCount: 1876,
    scheduledFor: new Date("2024-01-22"),
    createdAt: new Date("2024-01-17"),
    updatedAt: new Date("2024-01-19"),
  },
];

const mockActivities: Activity[] = [
  {
    id: "1",
    type: "campaign_sent",
    description: "Welcome Series campaign was sent to 2,543 recipients",
    timestamp: new Date("2024-01-15T10:30:00"),
    user: "You",
  },
  {
    id: "2",
    type: "contact_added",
    description: "145 new contacts were imported from CSV file",
    timestamp: new Date("2024-01-14T14:20:00"),
    user: "You",
  },
  {
    id: "3",
    type: "template_created",
    description: 'New template "Winter Sale" was created',
    timestamp: new Date("2024-01-13T09:15:00"),
    user: "You",
  },
  {
    id: "4",
    type: "campaign_created",
    description: 'New campaign "Product Launch" was created',
    timestamp: new Date("2024-01-12T16:45:00"),
    user: "You",
  },
];

export default function DashboardPage() {
  const { user, logout } = useAuth();
  const router = useRouter();

  const handleQuickAction = (action: any) => {
    router.push(action.href);
  };

  const handleViewCampaign = (campaign: Campaign) => {
    router.push(`/contacts/${campaign.id}`);
  };

  const handleEditCampaign = (campaign: Campaign) => {
    router.push(`/email-builder?campaign=${campaign.id}`);
  };

  return (
    <DashboardLayout>
      <div className="flex h-screen bg-gray-50">
        {/* Sidebar */}
        <div className="w-64 bg-white shadow-lg">
          <div className="p-6 border-b border-gray-200">
            <Link href={"/"}>
              <h1 className="text-xl font-bold text-gray-900">
                Email Marketer
              </h1>
            </Link>
            <p className="text-sm text-gray-600">POS Platform</p>
          </div>

          <nav className="p-4 space-y-2">
            <a
              href="/dashboard"
              className="flex items-center space-x-3 px-4 py-2 bg-blue-50 text-blue-700 rounded-lg font-medium"
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

        {/* Main Content */}
        <div className="flex-1 overflow-auto">
          {/* Header */}
          <header className="bg-white shadow-sm border-b border-gray-200">
            <div className="px-8 py-4 flex justify-between items-center">
              <h2 className="text-2xl font-bold text-gray-900">Dashboard</h2>
              <div className="flex items-center space-x-4">
                <span className="text-gray-700">Welcome, {user?.name}</span>
                <button
                  onClick={logout}
                  className="px-4 py-2 text-sm text-gray-600 hover:text-gray-900 transition-colors"
                >
                  Logout
                </button>
              </div>
            </div>
          </header>

          {/* Main Content Area */}
          <div className="p-8 space-y-8">
            {/* Email Speed Indicator */}
            <EmailSpeedIndicator />
            {/* Quick Actions */}
            <QuickActions
              actions={quickActions}
              onActionClick={handleQuickAction}
            />

            <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
              {/* Recent Campaigns */}
              <div className="xl:col-span-2">
                <RecentCampaigns
                  campaigns={mockCampaigns}
                  onViewCampaign={handleViewCampaign}
                  onEditCampaign={handleEditCampaign}
                />
              </div>

              {/* Activity Feed */}
              <div className="xl:col-span-1">
                <ActivityFeed activities={mockActivities} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
