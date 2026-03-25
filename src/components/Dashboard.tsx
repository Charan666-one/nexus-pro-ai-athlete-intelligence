import React from 'react';
import { 
  Activity, 
  Users, 
  AlertTriangle, 
  TrendingUp, 
  ChevronRight,
  ShieldAlert
} from 'lucide-react';
import { DashboardStats, Report } from '../types';
import { getRiskLevel, cn } from '../lib/utils';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  BarChart,
  Bar
} from 'recharts';

interface DashboardProps {
  stats: DashboardStats | null;
  onAthleteClick: (id: number) => void;
}

export default function Dashboard({ stats, onAthleteClick }: DashboardProps) {
  if (!stats) return <div className="flex items-center justify-center h-full">Loading dashboard...</div>;

  const StatCard = ({ icon: Icon, label, value, color, trend }: any) => (
    <div className="glass p-6 rounded-3xl flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div className={cn("p-3 rounded-2xl", color)}>
          <Icon size={24} className="text-white" />
        </div>
        {trend && (
          <div className="flex items-center gap-1 text-green-400 text-sm font-medium">
            <TrendingUp size={14} />
            {trend}
          </div>
        )}
      </div>
      <div>
        <p className="text-white/40 text-sm font-medium">{label}</p>
        <p className="text-3xl font-bold mt-1">{value}</p>
      </div>
    </div>
  );

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-2">
        <h2 className="text-3xl font-bold">System Overview</h2>
        <p className="text-white/40">Real-time monitoring of athlete health and risk indicators.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          icon={Users} 
          label="Total Athletes" 
          value={stats.totalAthletes} 
          color="bg-blue-500" 
          trend="+4% this month"
        />
        <StatCard 
          icon={ShieldAlert} 
          label="High Risk Cases" 
          value={stats.highRiskCount} 
          color="bg-red-500" 
        />
        <StatCard 
          icon={Activity} 
          label="Tests Conducted" 
          value={stats.recentReports.length + 124} 
          color="bg-brand-primary" 
          trend="+12% today"
        />
        <StatCard 
          icon={AlertTriangle} 
          label="Active Alerts" 
          value="8" 
          color="bg-yellow-500" 
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Risk Trend Chart */}
        <div className="lg:col-span-2 glass p-8 rounded-3xl flex flex-col gap-6">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-bold">Risk Distribution Trend</h3>
            <select className="bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-sm outline-none">
              <option>Last 30 Days</option>
              <option>Last 6 Months</option>
            </select>
          </div>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorRisk" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#00f2ff" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#00f2ff" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                <XAxis dataKey="name" stroke="rgba(255,255,255,0.3)" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="rgba(255,255,255,0.3)" fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#111', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px' }}
                  itemStyle={{ color: '#00f2ff' }}
                />
                <Area type="monotone" dataKey="risk" stroke="#00f2ff" strokeWidth={3} fillOpacity={1} fill="url(#colorRisk)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Recent Alerts */}
        <div className="glass p-8 rounded-3xl flex flex-col gap-6">
          <h3 className="text-xl font-bold">Recent Critical Reports</h3>
          <div className="flex flex-col gap-4">
            {stats.recentReports.map((report) => {
              const risk = getRiskLevel(report.risk_score);
              return (
                <button 
                  key={report.id}
                  onClick={() => onAthleteClick(report.athlete_id)}
                  className="flex items-center gap-4 p-4 rounded-2xl glass-hover text-left"
                >
                  <div className={cn("w-2 h-12 rounded-full", risk.bg.replace('/10', ''))}></div>
                  <div className="flex-1 overflow-hidden">
                    <p className="font-semibold truncate">{report.athlete_name}</p>
                    <p className="text-xs text-white/40">{new Date(report.test_date).toLocaleDateString()}</p>
                  </div>
                  <div className="text-right">
                    <p className={cn("text-sm font-bold", risk.color)}>{report.risk_score}</p>
                    <p className="text-[10px] text-white/40 uppercase tracking-wider">Risk Score</p>
                  </div>
                </button>
              );
            })}
          </div>
          <button className="mt-auto text-center text-sm text-brand-primary font-medium hover:underline">
            View All Reports
          </button>
        </div>
      </div>
    </div>
  );
}

const chartData = [
  { name: 'Mar 1', risk: 40 },
  { name: 'Mar 5', risk: 35 },
  { name: 'Mar 10', risk: 55 },
  { name: 'Mar 15', risk: 45 },
  { name: 'Mar 20', risk: 65 },
  { name: 'Mar 25', risk: 50 },
];
