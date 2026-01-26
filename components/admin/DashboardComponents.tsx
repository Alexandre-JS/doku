import React from 'react';
import { motion } from 'framer-motion';
import { LucideIcon, ArrowUpRight } from 'lucide-react';

interface StatsCardProps {
  name: string;
  value: string | number;
  icon: LucideIcon;
  color: string;
  bg: string;
  trend?: string;
  index: number;
}

export const StatsCard = ({ name, value, icon: Icon, color, bg, trend = "+12.5%", index }: StatsCardProps) => (
  <motion.div
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay: index * 0.1 }}
    className="group rounded-2xl border border-zinc-200 bg-white p-5 md:p-6 shadow-sm hover:shadow-md transition-all cursor-default"
  >
    <div className="flex items-start justify-between">
      <div className={`p-2.5 rounded-xl ${bg} ${color}`}>
        <Icon size={20} />
      </div>
      {trend && (
        <div className="flex items-center gap-1 text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
          <ArrowUpRight size={10} />
          {trend}
        </div>
      )}
    </div>
    <div className="mt-4">
      <p className="text-xs font-bold text-zinc-400 uppercase tracking-widest leading-none">{name}</p>
      <h3 className="mt-2 text-2xl md:text-3xl font-black text-[#143361]">{value}</h3>
    </div>
  </motion.div>
);

interface DashboardHeaderProps {
  title: string;
  description?: string;
  children?: React.ReactNode;
}

export const DashboardHeader = ({ title, description, children }: DashboardHeaderProps) => (
  <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between mb-8">
    <div>
      <h2 className="text-2xl font-black text-[#143361] tracking-tight">{title}</h2>
      {description && <p className="text-sm text-zinc-500 font-medium">{description}</p>}
    </div>
    <div className="flex gap-2">
      {children}
    </div>
  </div>
);

export const AdminPageContainer = ({ children }: { children: React.ReactNode }) => (
  <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
    {children}
  </div>
);
