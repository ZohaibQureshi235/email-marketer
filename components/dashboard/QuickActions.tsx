'use client';

import { LucideIcon } from 'lucide-react';
import { motion } from 'framer-motion';
import { GlassCard } from '@/components/ui/GlassCard';

interface QuickAction {
  title: string;
  description: string;
  icon: LucideIcon;
  href: string;
  color: string;
  shortcut?: string;
}

interface QuickActionsProps {
  actions: QuickAction[];
  onActionClick: (action: QuickAction) => void;
}

export function QuickActions({ actions, onActionClick }: QuickActionsProps) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Quick Actions</h3>
          <p className="text-sm text-gray-600">Frequently used actions for quick access</p>
        </div>
        <div className="text-sm text-gray-500">
          Click or use keyboard shortcuts
        </div>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {actions.map((action, index) => (
          <motion.div
            key={action.title}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.1 }}
            whileHover={{ y: -4 }}
            whileTap={{ scale: 0.98 }}
          >
            <GlassCard onClick={() => onActionClick(action)}>
              <div className="p-4">
                <div className="flex items-start justify-between mb-3">
                  <div className={`p-2 rounded-lg ${action.color}`}>
                    <action.icon className="h-5 w-5 text-white" />
                  </div>
                  {action.shortcut && (
                    <span className="text-xs font-mono text-gray-400 bg-gray-100 px-2 py-1 rounded">
                      {action.shortcut}
                    </span>
                  )}
                </div>
                <h4 className="font-medium text-gray-900 mb-1 group-hover:text-blue-600 transition-colors">
                  {action.title}
                </h4>
                <p className="text-sm text-gray-600">{action.description}</p>
                
                {/* Visual feedback */}
                <motion.div
                  className="mt-3 h-1 bg-gradient-to-r from-transparent via-blue-500 to-transparent rounded-full"
                  initial={{ width: 0 }}
                  whileHover={{ width: "100%" }}
                  transition={{ duration: 0.3 }}
                />
              </div>
            </GlassCard>
          </motion.div>
        ))}
      </div>
    </div>
  );
}