import React from 'react';
import { FileText, CheckCircle2, ListTodo, Sparkles } from 'lucide-react';

export const DashboardStats = ({ stats }) => {
  const { totalNotes = 0, openActionItems = 0, completedThisWeek = 0, processedNotes = 0 } = stats || {};

  const processRate = totalNotes > 0 ? Math.round((processedNotes / totalNotes) * 100) : 0;

  const statItems = [
    {
      label: 'Total Notes',
      value: totalNotes,
      icon: FileText,
      color: 'from-blue-500/20 to-indigo-500/20 text-indigo-400 border-indigo-500/30',
      badge: 'All drafts & notes'
    },
    {
      label: 'Open Action Items',
      value: openActionItems,
      icon: ListTodo,
      color: 'from-amber-500/20 to-orange-500/20 text-amber-400 border-amber-500/30',
      badge: 'Pending tasks'
    },
    {
      label: 'Completed This Week',
      value: completedThisWeek,
      icon: CheckCircle2,
      color: 'from-emerald-500/20 to-teal-500/20 text-emerald-400 border-emerald-500/30',
      badge: 'Past 7 days'
    },
    {
      label: 'AI Automation Rate',
      value: `${processRate}%`,
      icon: Sparkles,
      color: 'from-violet-500/20 to-purple-500/20 text-violet-400 border-violet-500/30',
      badge: `${processedNotes} processed`
    }
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      {statItems.map((item, idx) => {
        const Icon = item.icon;
        return (
          <div
            key={idx}
            className="glass-card relative overflow-hidden rounded-2xl p-5 border border-slate-800/80 bg-slate-900/60 shadow-lg"
          >
            <div className="flex items-center justify-between">
              <div className={`rounded-xl p-3 bg-gradient-to-br ${item.color} border`}>
                <Icon className="h-6 w-6" />
              </div>
              <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-slate-800 text-slate-300 border border-slate-700/60">
                {item.badge}
              </span>
            </div>

            <div className="mt-4">
              <h3 className="text-3xl font-extrabold text-white tracking-tight">{item.value}</h3>
              <p className="mt-1 text-sm font-medium text-slate-400">{item.label}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default DashboardStats;
