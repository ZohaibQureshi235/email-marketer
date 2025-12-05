"use client";

import DashboardLayout from "@/components/layout/DashboardLayout";
import { useAuth } from "@/hooks/useAuth";
import { EmailSpeedIndicator } from "@/components/dashboard/EmailSpeedIndicator";
import { GlassCard } from "@/components/ui/GlassCard";
import { AnimatedCard } from "@/components/ui/AnimatedCard";
import { motion } from "framer-motion";
import {
  EnvelopeOpenIcon,
  UserGroupIcon,
  ChartBarIcon,
  ClockIcon,
  ArrowTrendingUpIcon,
  CheckCircleIcon,
  InboxIcon,
  CursorArrowRaysIcon,
} from "@heroicons/react/24/outline";
import { useRouter } from "next/navigation";
import { BoltIcon } from "lucide-react";

const quickActions = [
  {
    title: "Create Campaign",
    description: "Design and send new email campaign",
    icon: EnvelopeOpenIcon,
    href: "/email-builder",
    color: "bg-gradient-to-br from-blue-500 to-cyan-500",
    shortcut: "⌘ + C",
  },
  {
    title: "Import Contacts",
    description: "Bulk import subscribers from CSV",
    icon: UserGroupIcon,
    href: "/contacts",
    color: "bg-gradient-to-br from-green-500 to-emerald-500",
    shortcut: "⌘ + I",
  },
  {
    title: "Analytics",
    description: "View detailed campaign reports",
    icon: ChartBarIcon,
    href: "/analytics",
    color: "bg-gradient-to-br from-purple-500 to-pink-500",
    shortcut: "⌘ + A",
  },
  {
    title: "Create Template",
    description: "Design reusable email template",
    icon: InboxIcon,
    href: "/templates",
    color: "bg-gradient-to-br from-orange-500 to-amber-500",
    shortcut: "⌘ + T",
  },
];

export default function DashboardPage() {
  const { user } = useAuth();
  const router = useRouter();

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Welcome Banner */}
        <AnimatedCard index={0}>
          <GlassCard>
            <div className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">
                    Welcome back, {user?.name} 👋
                  </h1>
                  <p className="text-gray-600 mt-1">
                    Here's what's happening with your campaigns today
                  </p>
                </div>
                <div className="flex items-center space-x-4">
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-lg cursor-pointer"
                    onClick={() => router.push("/email-builder")}
                  >
                    <EnvelopeOpenIcon className="h-5 w-5" />
                    <span className="font-medium">New Campaign</span>
                  </motion.div>
                </div>
              </div>
            </div>
          </GlassCard>
        </AnimatedCard>

        {/* Email Speed Indicator */}
        <AnimatedCard index={5}>
          <EmailSpeedIndicator />
        </AnimatedCard>

        {/* Two Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Quick Actions */}
          <div className="lg:col-span-2">
            <AnimatedCard index={6}>
              <GlassCard>
                <div className="p-6">
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">
                        Quick Actions
                      </h3>
                      <p className="text-sm text-gray-600">
                        Frequent tasks for quick access
                      </p>
                    </div>
                    <div className="text-sm text-gray-500 flex items-center space-x-2">
                      <ClockIcon className="h-4 w-4" />
                      <span>Last used: Today</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {quickActions.map((action, index) => (
                      <motion.div
                        key={action.title}
                        whileHover={{ y: -2 }}
                        whileTap={{ scale: 0.98 }}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="group relative"
                      >
                        <GlassCard onClick={() => router.push(action.href)}>
                          <div className="p-4">
                            <div className="flex items-start justify-between mb-3">
                              <div className={`p-2 rounded-lg ${action.color}`}>
                                <action.icon className="h-5 w-5 text-white" />
                              </div>
                            </div>
                            <h4 className="font-medium text-gray-900 mb-1 group-hover:text-blue-600 transition-colors">
                              {action.title}
                            </h4>
                            <p className="text-sm text-gray-600">
                              {action.description}
                            </p>
                          </div>
                        </GlassCard>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </GlassCard>
            </AnimatedCard>
          </div>
          <AnimatedCard index={7}>
            <GlassCard>
              <div className="me-2">
                <div className="bg-gradient-to-br from-gray-900 to-blue-900 rounded-2xl p-6 text-white">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-2">
                      <BoltIcon className="h-5 w-5 text-yellow-300" />
                      <span className="font-medium">Current Speed</span>
                    </div>
                    <span className="text-2xl font-bold">500/h</span>
                  </div>

                  <div className="space-y-3">
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>Capacity Usage</span>
                        <span>65%</span>
                      </div>
                      <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
                        <motion.div
                          initial={{ width: "0%" }}
                          animate={{ width: "65%" }}
                          transition={{ duration: 1.5, delay: 0.5 }}
                          className="h-full bg-gradient-to-r from-cyan-400 to-blue-400 rounded-full"
                        />
                      </div>
                    </div>

                    <div className="text-center pt-4 border-t border-gray-700">
                      <button className="text-sm bg-white/20 hover:bg-white/30 px-4 py-2 rounded-lg transition-colors">
                        Upgrade Speed
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </GlassCard>
          </AnimatedCard>
        </div>
      </div>
    </DashboardLayout>
  );
}
