"use client";

import React, { useRef } from "react";
import {
  BoltIcon,
  RocketLaunchIcon,
  ChartBarIcon,
} from "@heroicons/react/24/outline";
import { motion, useInView } from "framer-motion";
import { GlassCard } from "@/components/ui/GlassCard";

export function EmailSpeedIndicator() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 20 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6 }}
    >
      <GlassCard className="relative overflow-hidden m-2">
        {/* Animated Background Elements */}
        <motion.div
          animate={{
            rotate: 360,
            x: [0, 100, 0],
          }}
          transition={{
            rotate: { duration: 20, repeat: Infinity, ease: "linear" },
            x: { duration: 8, repeat: Infinity, ease: "easeInOut" },
          }}
          className="absolute -right-20 -top-20 w-60 h-60 bg-gradient-to-br from-blue-500/5 to-purple-500/5 rounded-full"
        />

        <div className="relative z-10 p-6">
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between mb-6 gap-6">
            <div className="flex-1">
              <div className="flex items-center space-x-3 mb-4">
                <div className="p-2 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl shadow-lg shadow-blue-500/30">
                  <motion.div
                    animate={{ rotate: [0, 10, -10, 0] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  >
                    <RocketLaunchIcon className="h-6 w-6 text-white" />
                  </motion.div>
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900">
                    Lightning Fast Delivery
                  </h3>
                  <p className="text-gray-600 mt-1">
                    Enterprise-grade infrastructure for maximum performance
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-6">
                <div className="text-center p-4 bg-gradient-to-br from-blue-50 to-white rounded-xl">
                  <div className="text-2xl font-bold text-gray-900 mb-1">
                    500/h
                  </div>
                  <div className="text-sm text-gray-600">Emails per Hour</div>
                  <div className="text-xs text-green-600 mt-1">
                    ✓ Enterprise Tier
                  </div>
                </div>
                <div className="text-center p-4 bg-gradient-to-br from-green-50 to-white rounded-xl">
                  <div className="text-2xl font-bold text-gray-900 mb-1">
                    99.9%
                  </div>
                  <div className="text-sm text-gray-600">Delivery Rate</div>
                  <div className="text-xs text-green-600 mt-1">
                    ✓ Guaranteed
                  </div>
                </div>
                <div className="text-center p-4 bg-gradient-to-br from-purple-50 to-white rounded-xl">
                  <div className="text-2xl font-bold text-gray-900 mb-1">
                    ~2s
                  </div>
                  <div className="text-sm text-gray-600">Avg. Send Time</div>
                  <div className="text-xs text-green-600 mt-1">✓ Optimized</div>
                </div>
              </div>
            </div>
          </div>

          {/* Usage Tips */}
          <div className="mt-6 pt-6 border-t border-gray-200">
            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <ChartBarIcon className="h-4 w-4" />
              <span>
                💡 <strong>Pro Tip:</strong> Schedule campaigns during peak
                hours (9 AM - 5 PM) for optimal engagement
              </span>
            </div>
          </div>
        </div>
      </GlassCard>
    </motion.div>
  );
}
