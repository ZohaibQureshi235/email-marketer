'use client';

import { useState, useEffect } from 'react';
import { BoltIcon, EnvelopeIcon, ClockIcon, CheckCircleIcon } from '@heroicons/react/24/outline';

export function EmailSpeedIndicator() {
  const [sentCount, setSentCount] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const [showComparison, setShowComparison] = useState(false);

  const startAnimation = () => {
    setIsAnimating(true);
    setSentCount(0);
    setShowComparison(true);
    
    // Simulate sending 500 emails in 1 second
    const interval = setInterval(() => {
      setSentCount(prev => {
        if (prev >= 500) {
          clearInterval(interval);
          setTimeout(() => setIsAnimating(false), 2000);
          return 500;
        }
        return prev + 50;
      });
    }, 100);
  };

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

        {/* Interactive Demo */}

        {/* Comparison */}
        {showComparison && (
          <div className="bg-black/20 rounded-xl p-6 border border-blue-500/30">
            <h4 className="font-semibold text-lg mb-4 flex items-center space-x-2">
              <ClockIcon className="h-5 w-5 text-blue-400" />
              <span>Time Comparison</span>
            </h4>
            
            <div className="grid grid-cols-2 gap-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-green-400 mb-2">1 Second</div>
                <div className="text-blue-200 text-sm">Our Platform (500 emails)</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-red-400 mb-2">8.3 Minutes</div>
                <div className="text-blue-200 text-sm">Traditional Systems (500 emails)</div>
              </div>
            </div>
          </div>
        )}

        {/* Features Grid */}
        <div className="grid grid-cols-3 gap-4 mt-6 pt-6 border-t border-blue-500/30">
          <div className="text-center">
            <CheckCircleIcon className="h-8 w-8 text-green-400 mx-auto mb-2" />
            <div className="font-semibold">99.9%</div>
            <div className="text-blue-300 text-xs">Delivery Rate</div>
          </div>
          <div className="text-center">
            <CheckCircleIcon className="h-8 w-8 text-green-400 mx-auto mb-2" />
            <div className="font-semibold">&lt;1s</div>
            <div className="text-blue-300 text-xs">Average Send Time</div>
          </div>
          <div className="text-center">
            <CheckCircleIcon className="h-8 w-8 text-green-400 mx-auto mb-2" />
            <div className="font-semibold">Global</div>
            <div className="text-blue-300 text-xs">CDN Network</div>
          </div>
        </div>

        {/* Real-time counter */}
        <div className="mt-6 text-center">
          <div className="inline-flex items-center space-x-2 bg-black/30 px-4 py-2 rounded-lg">
            <EnvelopeIcon className="h-4 w-4 text-blue-400" />
            <span className="text-sm text-blue-200">
              Over <strong className="text-white">2.5 million</strong> emails sent this month
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}