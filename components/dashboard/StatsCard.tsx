import { LucideIcon } from 'lucide-react';

interface StatsCardProps {
  title: string;
  value: string;
  icon: LucideIcon;
  change: string;
  changeType: 'positive' | 'negative' | 'neutral';
  description?: string;
}

export function StatsCard({ 
  title, 
  value, 
  icon: Icon, 
  change, 
  changeType, 
  description 
}: StatsCardProps) {
  const changeColor = {
    positive: 'text-green-600 bg-green-50',
    negative: 'text-red-600 bg-red-50',
    neutral: 'text-gray-600 bg-gray-50',
  }[changeType];

  const changeIcon = {
    positive: '↗',
    negative: '↘',
    neutral: '→',
  }[changeType];

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-600 mb-1">{title}</p>
          <p className="text-2xl font-bold text-gray-900 mb-2">{value}</p>
          <div className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${changeColor}`}>
            <span className="mr-1">{changeIcon}</span>
            {change}
          </div>
          {description && (
            <p className="text-xs text-gray-500 mt-2">{description}</p>
          )}
        </div>
        <div className="p-3 bg-blue-50 rounded-lg">
          <Icon className="h-6 w-6 text-blue-600" />
        </div>
      </div>
    </div>
  );
}