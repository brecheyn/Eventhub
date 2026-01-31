'use client';

import { LucideIcon } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  color?: 'orange' | 'green' | 'blue' | 'purple';
}

export default function StatCard({ title, value, icon: Icon, color = 'orange' }: StatCardProps) {
  const colorClasses = {
    orange: 'from-primary-500 to-primary-600',
    green: 'from-green-500 to-green-600',
    blue: 'from-blue-500 to-blue-600',
    purple: 'from-purple-500 to-purple-600',
  };

  return (
    <div className="card">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-secondary-600 uppercase tracking-wide">{title}</p>
          <p className="text-3xl font-bold text-secondary-900 mt-2">{value}</p>
        </div>
        <div className={`p-4 rounded-xl bg-gradient-to-br ${colorClasses[color]} shadow-lg`}>
          <Icon className="h-8 w-8 text-white" />
        </div>
      </div>
    </div>
  );
}
