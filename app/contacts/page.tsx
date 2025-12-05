"use client";

import { motion } from "framer-motion";
import DashboardLayout from "@/components/layout/DashboardLayout";
import EmailListManager from "@/components/email-list/EmailListManager";

import {
  ChartBarIcon,
  EnvelopeIcon,
  UsersIcon,
  DocumentTextIcon,
  PlusIcon,
  RocketLaunchIcon,
  SparklesIcon,
} from "@heroicons/react/24/outline";
import Link from "next/link";
import { useState } from "react";

export default function CampaignsPage() {
  return (
    <DashboardLayout>
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50/30">
        {/* Animated Background Elements */}
        <motion.div
          animate={{
            rotate: 360,
            scale: [1, 1.1, 1],
          }}
          transition={{
            rotate: { duration: 30, repeat: Infinity, ease: "linear" },
            scale: { duration: 4, repeat: Infinity, ease: "easeInOut" },
          }}
          className="fixed -right-20 -top-20 w-96 h-96 bg-gradient-to-br from-blue-500/5 to-purple-500/5 rounded-full pointer-events-none"
        />

        <motion.div
          animate={{
            rotate: -360,
            scale: [1, 0.9, 1],
          }}
          transition={{
            rotate: { duration: 25, repeat: Infinity, ease: "linear" },
            scale: { duration: 3, repeat: Infinity, ease: "easeInOut" },
          }}
          className="fixed -left-20 -bottom-20 w-96 h-96 bg-gradient-to-tr from-cyan-500/5 to-blue-500/5 rounded-full pointer-events-none"
        />

        <div className="flex">
          {/* Premium Sidebar */}
          <motion.aside
            initial={{ x: -100, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="hidden lg:flex flex-col w-72 h-screen sticky top-0 bg-white/80 backdrop-blur-xl border-r border-gray-100 shadow-xl"
          >
            <div className="p-6 border-b border-gray-100">
              <Link href={"/"} className="group cursor-pointer block">
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  className="flex items-center space-x-3"
                >
                  <div className="p-2 bg-gradient-to-br from-blue-500 to-purple-500 rounded-xl shadow-lg">
                    <RocketLaunchIcon className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                      Email Marketer
                    </h1>
                    <p className="text-sm text-gray-500">
                      Email sending Platform
                    </p>
                  </div>
                </motion.div>
              </Link>
            </div>

            <nav className="p-4 space-y-1 flex-1">
              <Link
                href="/"
                className="flex items-center space-x-3 px-4 py-3 text-gray-700 hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 rounded-xl transition-all duration-300 group"
              >
                <div className="p-2 bg-gray-100 rounded-lg group-hover:bg-gradient-to-br group-hover:from-blue-500 group-hover:to-purple-500 transition-all duration-300">
                  <ChartBarIcon className="h-5 w-5 text-gray-600 group-hover:text-white transition-colors" />
                </div>
                <span className="font-medium">Dashboard</span>
              </Link>

              <Link
                href="/email-builder"
                className="flex items-center space-x-3 px-4 py-3 text-gray-700 hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 rounded-xl transition-all duration-300 group"
              >
                <div className="p-2 bg-gray-100 rounded-lg group-hover:bg-gradient-to-br group-hover:from-blue-500 group-hover:to-purple-500 transition-all duration-300">
                  <EnvelopeIcon className="h-5 w-5 text-gray-600 group-hover:text-white transition-colors" />
                </div>
                <span className="font-medium">Email Builder</span>
              </Link>

              <Link
                href="/contacts"
                className="flex items-center space-x-3 px-4 py-3 bg-gradient-to-r from-blue-50 to-purple-50 text-blue-700 rounded-xl font-medium group"
              >
                <div className="p-2 bg-gradient-to-br from-blue-500 to-purple-500 rounded-lg">
                  <UsersIcon className="h-5 w-5 text-white group-hover:text-white transition-colors" />
                </div>
                <span className="font-medium">Contacts</span>
                <SparklesIcon className="h-4 w-4 text-amber-500 ml-auto" />
              </Link>
            </nav>
          </motion.aside>

          {/* Main Content */}
          <main className="flex-1 overflow-auto">
            {/* Premium Header */}
            <motion.header
              initial={{ y: -50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.5 }}
              className="sticky top-0 z-40 bg-white/80 backdrop-blur-xl border-b border-gray-100 px-8 py-6"
            >
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                <div>
                  <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                    Contacts Management
                  </h2>
                  <p className="text-gray-600 mt-2">
                    Create, manage, and analyze your email contact with
                    precision
                  </p>
                </div>
                <Link href={'/email-builder'}>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="inline-flex items-center space-x-2 bg-gradient-to-r from-blue-500 to-purple-500 text-white px-6 py-3 rounded-xl shadow-lg shadow-blue-500/25 hover:shadow-xl hover:shadow-purple-500/25 transition-all duration-300"
                  >
                    <PlusIcon className="h-5 w-5" />
                    <span className="font-medium">New Campaign</span>
                  </motion.button>
                </Link>
              </div>
            </motion.header>

            <div className="p-6 lg:p-8 space-y-8">
              <div>
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5, delay: 0.4 }}
                >
                  <div className="h-full">
                    <EmailListManager />
                  </div>
                </motion.div>
              </div>
            </div>
          </main>
        </div>
      </div>
    </DashboardLayout>
  );
}
