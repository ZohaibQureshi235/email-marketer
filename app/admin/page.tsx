// app/admin/page.tsx
'use client'

import { useState, useEffect } from 'react';
import AdminLogin from "@/components/admin/AdminLogin";
import SettingsPage from "@/components/admin/SettingsPage";
import { motion, AnimatePresence } from 'framer-motion';
import { FiShield, FiSettings } from 'react-icons/fi';

const AdminPage = () => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    // Check for existing auth (simulate loading)
    const timer = setTimeout(() => setIsLoading(false), 800);
    return () => clearTimeout(timer);
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-violet-900 flex items-center justify-center">
        <motion.div
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="text-center"
        >
          <div className="relative">
            <div className="w-24 h-24 border-4 border-white/20 border-t-white/60 rounded-full animate-spin" />
            <FiShield className="absolute inset-0 m-auto text-white/80 text-3xl" />
          </div>
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mt-6 text-white/80 font-light text-lg"
          >
            Securing your dashboard...
          </motion.p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-violet-900">
      {/* Background Elements */}
      <div className="fixed inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl" />
        <div className="absolute top-60 -left-40 w-80 h-80 bg-violet-500/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 left-1/3 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl" />
      </div>

      <AnimatePresence mode="wait">
        {isAuthenticated ? (
          <motion.div
            key="settings"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
          >
            <SettingsPage setIsAuthenticated={setIsAuthenticated} />
          </motion.div>
        ) : (
          <motion.div
            key="login"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.5 }}
          >
            <AdminLogin setIsAuthenticated={setIsAuthenticated} />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Brand */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="fixed bottom-8 left-8 flex items-center gap-2 text-white/40 text-sm font-light"
      >
        <FiSettings className="text-lg" />
        <span>NexSinq Suite v1.0</span>
      </motion.div>
    </div>
  );
};

export default AdminPage;