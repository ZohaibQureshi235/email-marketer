'use client';

import { UserCircleIcon } from '@heroicons/react/24/outline';

interface AvatarProps {
  name: string;
  email?: string;
  size?: 'sm' | 'md' | 'lg';
  status?: 'online' | 'offline' | 'busy' | 'away';
  onClick?: () => void;
}

export function Avatar({ name, email, size = 'md', status, onClick }: AvatarProps) {
  const sizeClasses = {
    sm: 'w-8 h-8 text-sm',
    md: 'w-10 h-10 text-base',
    lg: 'w-12 h-12 text-lg'
  };

  const statusColors = {
    online: 'bg-green-500',
    offline: 'bg-gray-400',
    busy: 'bg-red-500',
    away: 'bg-yellow-500'
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div 
      className={`relative ${onClick ? 'cursor-pointer' : ''}`}
      onClick={onClick}
    >
      <div className={`
        ${sizeClasses[size]}
        rounded-full bg-gradient-to-br from-blue-500 to-purple-500
        flex items-center justify-center text-white font-semibold
        shadow-md hover:shadow-lg transition-shadow
      `}>
        {getInitials(name)}
      </div>
      
      {status && (
        <div className={`
          absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white
          ${statusColors[status]}
        `} />
      )}
    </div>
  );
}