// components/admin/SettingsPage.tsx - Updated with auto-redirect
"use client";

import React, { useState, useEffect } from "react";
import UserSettings from "./UserSetting";
import EmailSettings from "./EmailSettings";
import { SettingsData } from "@/types/admin";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import {
  FiLogOut,
  FiSettings,
  FiUser,
  FiMail,
  FiBell,
  FiActivity,
  FiChevronRight,
  FiArrowLeft,
} from "react-icons/fi";

interface SettingsPageProps {
  setIsAuthenticated: (value: boolean) => void;
}

const SettingsPage: React.FC<SettingsPageProps> = ({ setIsAuthenticated }) => {
  const [activeTab, setActiveTab] = useState<"user" | "email">("user");
  const [isLoggingOut, setIsLoggingOut] = useState<boolean>(false);
  const [settings, setSettings] = useState<SettingsData>({
    user: {
      email: "",
      password: "",
      confirmPassword: "",
    },
    email: {
      EMAIL_HOST: "",
      EMAIL_PORT: "",
      EMAIL_USER: "",
      EMAIL_PASSWORD: "",
    },
  });

  // Check localStorage for existing user data on mount
  useEffect(() => {
    const savedUserData = localStorage.getItem("userSettings");
    if (savedUserData) {
      try {
        const parsedData = JSON.parse(savedUserData);
        setSettings((prev) => ({
          ...prev,
          user: parsedData,
        }));
        // Auto-switch to email settings if user data exists
        setActiveTab("email");
      } catch (error) {
        console.error("Failed to parse saved user settings:", error);
      }
    }

    // Check for saved email settings
    const savedEmailData = localStorage.getItem("emailSettings");
    if (savedEmailData) {
      try {
        const parsedData = JSON.parse(savedEmailData);
        setSettings((prev) => ({
          ...prev,
          email: parsedData,
        }));
      } catch (error) {
        console.error("Failed to parse saved email settings:", error);
      }
    }
  }, []);

  const handleLogout = async (): Promise<void> => {
    setIsLoggingOut(true);
    await new Promise((resolve) => setTimeout(resolve, 600));
    setIsAuthenticated(false);
  };

  const handleUserSave = (userData: SettingsData["user"]): void => {
    setSettings((prev) => ({
      ...prev,
      user: userData,
    }));
    // Save to localStorage is already done in UserSettings component
  };

  const handleEmailSave = async (
    emailData: SettingsData["email"]
  ): Promise<void> => {
    // setSettings((prev) => ({
    //   ...prev,
    //   email: emailData,
    // }));
    // // Save to localStorage
    // localStorage.setItem("emailSettings", JSON.stringify(emailData));
    console.log(settings);
    const payload = {
      email: settings.user.email,
      password: emailData.EMAIL_PASSWORD,
      name: "",
      smptHost: emailData.EMAIL_HOST,
      smptPort: emailData.EMAIL_PORT,
    };
    try {
      const res = await axios.post(`http://localhost:3001/auth/register`, payload);
      console.log("this is the respone", res);
    } catch (err) {
      console.log("this is the error message", err);
    }
  };

  const handleShowEmailSettings = (): void => {
    setActiveTab("email");
  };

  const tabs = [
    {
      id: "user",
      label: "User Profile",
      icon: FiUser,
      completed: !!settings.user.email,
    },
    {
      id: "email",
      label: "Email Settings",
      icon: FiMail,
      completed: !!settings.email.EMAIL_HOST,
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-violet-900">
      {/* Background Elements */}
      <div className="fixed inset-0 overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-purple-500/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-violet-500/5 rounded-full blur-3xl" />
      </div>

      {/* Main Content */}
      <div className="relative p-6 max-w-7xl mx-auto">
        {/* Header */}
        <motion.header
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="relative">
                <div className="w-14 h-14 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center shadow-lg">
                  <FiSettings className="text-2xl text-white" />
                </div>
                <div className="absolute -inset-1 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl blur opacity-30" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-white">Admin Suite</h1>
                <p className="text-white/60 text-sm font-light">
                  {activeTab === "user"
                    ? "Configure User Credentials"
                    : "Configure Email Settings"}
                </p>
              </div>
            </div>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleLogout}
              disabled={isLoggingOut}
              className="flex items-center gap-2 px-4 py-2.5 bg-white/10 hover:bg-white/15 border border-white/20 rounded-xl text-white transition-all duration-200 disabled:opacity-50"
            >
              {isLoggingOut ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                  Signing out...
                </>
              ) : (
                <>
                  <FiLogOut className="text-lg" />
                  Sign Out
                </>
              )}
            </motion.button>
          </div>
        </motion.header>

        {/* Dashboard Stats */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8"
        >
          {[
            {
              icon: FiUser,
              label: "User Setup",
              value: settings.user.email ? "Complete" : "Pending",
              color: settings.user.email
                ? "from-green-500 to-emerald-500"
                : "from-yellow-500 to-orange-500",
            },
            {
              icon: FiMail,
              label: "Email Setup",
              value: settings.email.EMAIL_HOST ? "Complete" : "Pending",
              color: settings.email.EMAIL_HOST
                ? "from-green-500 to-emerald-500"
                : "from-yellow-500 to-orange-500",
            },
            {
              icon: FiBell,
              label: "Status",
              value:
                settings.user.email && settings.email.EMAIL_HOST
                  ? "Ready"
                  : "Setup Required",
              color:
                settings.user.email && settings.email.EMAIL_HOST
                  ? "from-green-500 to-emerald-500"
                  : "from-blue-500 to-cyan-500",
            },
          ].map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.1 * (index + 1) }}
              whileHover={{ y: -4 }}
              className="group backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-6 transition-all duration-300 hover:border-white/20"
              onClick={() =>
                stat.label === "User Setup" && setActiveTab("user")
              }
            >
              <div className="flex items-center justify-between mb-4">
                <div
                  className={`w-12 h-12 bg-gradient-to-br ${stat.color} rounded-xl flex items-center justify-center shadow-lg`}
                >
                  <stat.icon className="text-xl text-white" />
                </div>
                <div className="text-right">
                  <p className="text-white/60 text-sm font-light">
                    {stat.label}
                  </p>
                  <p className="text-2xl font-bold text-white">{stat.value}</p>
                </div>
              </div>
              <div className="h-1 bg-white/5 rounded-full overflow-hidden">
                <div
                  className={`h-full bg-gradient-to-r ${stat.color} transition-all duration-500 group-hover:w-full`}
                  style={{
                    width:
                      stat.value === "Complete" || stat.value === "Ready"
                        ? "100%"
                        : "30%",
                  }}
                />
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Setup Progress Banner */}
        {(!settings.user.email || !settings.email.EMAIL_HOST) && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8 p-6 bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-500/20 rounded-2xl"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-500 rounded-xl flex items-center justify-center">
                  <FiSettings className="text-white text-lg" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white">
                    Setup Incomplete
                  </h3>
                  <p className="text-white/60 text-sm">
                    {!settings.user.email
                      ? "Start by configuring your user credentials"
                      : "Now configure your email settings to complete setup"}
                  </p>
                </div>
              </div>
              {activeTab === "email" && settings.user.email && (
                <button
                  onClick={() => setActiveTab("user")}
                  className="flex items-center gap-2 px-4 py-2 text-white/60 hover:text-white border border-white/20 hover:border-white/30 rounded-xl transition-all duration-200"
                >
                  <FiArrowLeft className="text-lg" />
                  Back to User Settings
                </button>
              )}
            </div>
          </motion.div>
        )}

        {/* Main Content Area */}
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar */}
          <motion.aside
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="lg:w-64 flex-shrink-0"
          >
            <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-4">
              <nav className="space-y-2">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as "user" | "email")}
                    className={`w-full flex items-center justify-between p-3 rounded-xl transition-all duration-200 group ${
                      activeTab === tab.id
                        ? "bg-gradient-to-r from-purple-500/20 to-pink-500/20 border border-purple-500/30"
                        : "hover:bg-white/5"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="relative">
                        <tab.icon
                          className={`text-lg ${
                            activeTab === tab.id
                              ? "text-purple-400"
                              : tab.completed
                              ? "text-green-400"
                              : "text-white/60"
                          }`}
                        />
                        {tab.completed && (
                          <div className="absolute -top-1 -right-1 w-2 h-2 bg-green-400 rounded-full" />
                        )}
                      </div>
                      <span
                        className={`font-medium ${
                          activeTab === tab.id
                            ? "text-white"
                            : tab.completed
                            ? "text-green-300"
                            : "text-white/80"
                        }`}
                      >
                        {tab.label}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      {tab.completed && (
                        <span className="text-xs text-green-400">✓</span>
                      )}
                      <FiChevronRight
                        className={`text-lg transition-transform ${
                          activeTab === tab.id
                            ? "text-purple-400 rotate-90"
                            : "text-white/40"
                        }`}
                      />
                    </div>
                  </button>
                ))}
              </nav>

              {/* Setup Status */}
              <div className="mt-8 pt-6 border-t border-white/10">
                <h3 className="text-white/60 text-sm font-medium mb-3">
                  Setup Status
                </h3>
                <div className="space-y-3">
                  {tabs.map((tab) => (
                    <div
                      key={tab.id}
                      className="flex items-center justify-between"
                    >
                      <span className="text-white/80 text-sm">{tab.label}</span>
                      <span
                        className={`text-xs px-2 py-1 rounded-full ${
                          tab.completed
                            ? "bg-green-500/20 text-green-400"
                            : "bg-yellow-500/20 text-yellow-400"
                        }`}
                      >
                        {tab.completed ? "Complete" : "Pending"}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </motion.aside>

          {/* Main Content */}
          <motion.main
            key={activeTab}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="flex-1"
          >
            <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl overflow-hidden">
              <div className="p-1">
                <AnimatePresence mode="wait">
                  {activeTab === "user" ? (
                    <UserSettings
                      key="user"
                      settings={settings.user}
                      onSave={handleUserSave}
                      onShowEmailSettings={handleShowEmailSettings}
                    />
                  ) : (
                    <EmailSettings
                      key="email"
                      settings={settings.email}
                      onSave={handleEmailSave}
                    />
                  )}
                </AnimatePresence>
              </div>
            </div>
          </motion.main>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;
