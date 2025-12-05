// components/admin/AdminLogin.tsx
"use client";

import React, { useEffect, useState } from "react";
import Cookies from "js-cookie";
import { LoginFormData } from "@/types/admin";
import { motion } from "framer-motion";
import {
  FiLock,
  FiUser,
  FiLogIn,
  FiShield,
  FiEye,
  FiEyeOff,
} from "react-icons/fi";

interface AdminLoginProps {
  setIsAuthenticated: (value: boolean) => void;
}

const AdminLogin: React.FC<AdminLoginProps> = ({ setIsAuthenticated }) => {
  const [formData, setFormData] = useState<LoginFormData>({
    username: "",
    password: "",
  });
  const [error, setError] = useState<string>("");
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    if (error) setError("");
  };

  useEffect(() => {
    const token = Cookies.get("token");
    setIsAuthenticated(token === "Nexsinq" ? true : false);
  }, []);

  const handleSubmit = async (
    e: React.FormEvent<HTMLFormElement>
  ): Promise<void> => {
    e.preventDefault();
    setError("");
    setIsSubmitting(true);

    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 800));

    if (
      formData.username === process.env.NEXT_PUBLIC_adminUsername &&
      formData.password === process.env.NEXT_PUBLIC_adminPass
    ) {
      setIsAuthenticated(true);
      Cookies.set("token", "Nexsinq", { expires: 7 });
    } else {
      setError("Invalid credentials. Please try again.");
    }
    setIsSubmitting(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="relative w-full max-w-md"
      >
        {/* Glass card */}
        <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl shadow-2xl overflow-hidden">
          {/* Header */}
          <div className="p-8 pb-6">
            <div className="flex items-center justify-center mb-6">
              <div className="relative">
                <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center shadow-lg">
                  <FiShield className="text-2xl text-white" />
                </div>
                <div className="absolute -inset-1 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl blur opacity-30" />
              </div>
            </div>

            <motion.div
              initial={{ y: 10, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.1 }}
            >
              <h1 className="text-3xl font-bold text-center text-white mb-2">
                Secure Access
              </h1>
              <p className="text-center text-white/60 text-sm font-light">
                Enter your credentials to access the admin dashboard
              </p>
            </motion.div>
          </div>

          {/* Form */}
          <div className="px-8 pb-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Username Field */}
              <motion.div
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.2 }}
              >
                <label className="block text-sm font-medium text-white/80 mb-2 ml-1">
                  Username
                </label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FiUser className="h-5 w-5 text-white/40 group-focus-within:text-purple-400 transition-colors" />
                  </div>
                  <input
                    id="username"
                    name="username"
                    type="text"
                    required
                    value={formData.username}
                    onChange={handleChange}
                    className="block w-full pl-10 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-transparent transition-all duration-200"
                    placeholder="Enter username"
                    style={{ color: "white !important" }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-r from-purple-500/0 to-pink-500/0 group-focus-within:from-purple-500/10 group-focus-within:to-pink-500/10 rounded-xl transition-all duration-300 pointer-events-none" />
                </div>
              </motion.div>

              {/* Password Field */}
              <motion.div
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.3 }}
              >
                <label className="block text-sm font-medium text-white/80 mb-2 ml-1">
                  Password
                </label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FiLock className="h-5 w-5 text-white/40 group-focus-within:text-purple-400 transition-colors" />
                  </div>
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    required
                    value={formData.password}
                    onChange={handleChange}
                    className="block w-full pl-10 pr-12 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-transparent transition-all duration-200"
                    placeholder="Enter password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  >
                    {showPassword ? (
                      <FiEyeOff className="h-5 w-5 text-white/40 hover:text-white/60 transition-colors" />
                    ) : (
                      <FiEye className="h-5 w-5 text-white/40 hover:text-white/60 transition-colors" />
                    )}
                  </button>
                  <div className="absolute inset-0 bg-gradient-to-r from-purple-500/0 to-pink-500/0 group-focus-within:from-purple-500/10 group-focus-within:to-pink-500/10 rounded-xl transition-all duration-300 pointer-events-none" />
                </div>
              </motion.div>

              {/* Error Message */}
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl"
                >
                  <p className="text-red-400 text-sm flex items-center gap-2">
                    <FiShield className="flex-shrink-0" />
                    {error}
                  </p>
                </motion.div>
              )}

              {/* Submit Button */}
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.4 }}
              >
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full group relative overflow-hidden bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-medium py-3.5 px-4 rounded-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl"
                >
                  <span className="relative z-10 flex items-center justify-center gap-2">
                    {isSubmitting ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                        Authenticating...
                      </>
                    ) : (
                      <>
                        <FiLogIn className="text-lg" />
                        Sign In
                      </>
                    )}
                  </span>
                  <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-pink-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                </button>
              </motion.div>
            </form>
          </div>
        </div>

        {/* Security Badge */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="mt-6 flex items-center justify-center gap-2 text-white/30 text-sm"
        >
          <FiShield className="text-base" />
          <span className="font-light">256-bit SSL Encryption</span>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default AdminLogin;
