"use client";

import React from "react";
import { BoltIcon } from "@heroicons/react/24/outline";

export function EmailSpeedIndicator() {
  return (
    <div className="bg-gradient-to-br from-gray-900 to-blue-900 rounded-2xl shadow-2xl p-8 text-white overflow-hidden relative">
      {/* Background pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-purple-400 mix-blend-overlay"></div>
      </div>
      <div className="relative z-10">
        <div className="flex items-start justify-between mb-6">
          <div>
            <div className="flex items-center space-x-3 mb-2">
              <div className="p-2 bg-blue-500 rounded-lg">
                <BoltIcon className="h-6 w-6 text-yellow-300" />
              </div>
              <h3 className="text-2xl font-bold">Enterprise-Grade Speed</h3>
            </div>
            <p className="text-blue-200 text-lg">
              Send 500 emails per Hour with our optimized infrastructure
            </p>
          </div>
          <div className="text-right bg-black/30 rounded-xl p-4 min-w-[120px]">
            <div className="text-3xl font-bold text-green-400 mb-1">500/h</div>
            <div className="text-blue-300 text-sm">Emails per Hour</div>
          </div>
        </div>
      </div>
    </div>
  );
}
