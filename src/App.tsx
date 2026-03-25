/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Activity, 
  Users, 
  FileText, 
  AlertTriangle, 
  TrendingUp, 
  Shield, 
  Upload, 
  Search,
  ChevronRight,
  Plus,
  Bell,
  LogOut,
  LayoutDashboard,
  User as UserIcon
} from 'lucide-react';
import { cn } from './lib/utils';
import { Athlete, Report, DashboardStats } from './types';
import Dashboard from './components/Dashboard';
import AthleteList from './components/AthleteList';
import AthleteDetail from './components/AthleteDetail';
import ReportUpload from './components/ReportUpload';

type View = 'dashboard' | 'athletes' | 'athlete-detail' | 'upload';

export default function App() {
  const [activeView, setActiveView] = useState<View>('dashboard');
  const [selectedAthleteId, setSelectedAthleteId] = useState<number | null>(null);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const res = await fetch('/api/dashboard/stats');
      const data = await res.json();
      setStats(data);
    } catch (error) {
      console.error("Failed to fetch stats", error);
    } finally {
      setLoading(false);
    }
  };

  const navigateToAthlete = (id: number) => {
    setSelectedAthleteId(id);
    setActiveView('athlete-detail');
  };

  const SidebarItem = ({ icon: Icon, label, view, active }: { icon: any, label: string, view: View, active: boolean }) => (
    <button
      onClick={() => setActiveView(view)}
      className={cn(
        "flex items-center gap-3 w-full px-4 py-3 rounded-xl transition-all duration-200",
        active 
          ? "bg-gradient-brand text-white shadow-lg shadow-brand-primary/20" 
          : "text-white/60 hover:text-white hover:bg-white/5"
      )}
    >
      <Icon size={20} />
      <span className="font-medium">{label}</span>
    </button>
  );

  return (
    <div className="flex h-screen bg-dark-bg overflow-hidden">
      {/* Sidebar */}
      <aside className="w-64 border-r border-white/10 flex flex-col p-6 gap-8">
        <div className="flex items-center gap-3 px-2">
          <div className="w-10 h-10 bg-gradient-brand rounded-xl flex items-center justify-center shadow-lg shadow-brand-primary/30">
            <Shield className="text-white" size={24} />
          </div>
          <h1 className="text-xl font-bold tracking-tight">NEXUS <span className="text-brand-primary">PRO</span></h1>
        </div>

        <nav className="flex flex-col gap-2 flex-1">
          <SidebarItem icon={LayoutDashboard} label="Dashboard" view="dashboard" active={activeView === 'dashboard'} />
          <SidebarItem icon={Users} label="Athletes" view="athletes" active={activeView === 'athletes'} />
          <SidebarItem icon={Upload} label="Upload Report" view="upload" active={activeView === 'upload'} />
        </nav>

        <div className="mt-auto flex flex-col gap-4">
          <div className="glass p-4 rounded-2xl flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center">
              <UserIcon size={20} className="text-white/60" />
            </div>
            <div className="flex-1 overflow-hidden">
              <p className="text-sm font-medium truncate">Dr.SNEHA</p>
              <p className="text-xs text-white/40 truncate">Medical Director</p>
            </div>
          </div>
          <button className="flex items-center gap-3 px-4 py-3 text-white/40 hover:text-red-400 transition-colors">
            <LogOut size={20} />
            <span className="font-medium text-sm">Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="h-20 border-bottom border-white/10 flex items-center justify-between px-8">
          <div className="flex items-center gap-4 bg-white/5 px-4 py-2 rounded-xl border border-white/10 w-96">
            <Search size={18} className="text-white/40" />
            <input 
              type="text" 
              placeholder="Search athletes, reports, or risks..." 
              className="bg-transparent border-none outline-none text-sm w-full text-white placeholder:text-white/20"
            />
          </div>

          <div className="flex items-center gap-4">
            <button className="w-10 h-10 rounded-xl glass flex items-center justify-center relative hover:bg-white/10 transition-colors">
              <Bell size={20} className="text-white/60" />
              <span className="absolute top-2 right-2 w-2 h-2 bg-brand-primary rounded-full shadow-[0_0_8px_rgba(0,242,255,0.8)]"></span>
            </button>
            <button 
              onClick={() => setActiveView('upload')}
              className="bg-gradient-brand px-6 py-2.5 rounded-xl font-semibold text-sm flex items-center gap-2 shadow-lg shadow-brand-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all"
            >
              <Plus size={18} />
              New Analysis
            </button>
          </div>
        </header>

        {/* View Content */}
        <div className="flex-1 overflow-y-auto p-8">
          <AnimatePresence mode="wait">
            {activeView === 'dashboard' && (
              <motion.div
                key="dashboard"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
              >
                <Dashboard stats={stats} onAthleteClick={navigateToAthlete} />
              </motion.div>
            )}
            {activeView === 'athletes' && (
              <motion.div
                key="athletes"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
              >
                <AthleteList onAthleteClick={navigateToAthlete} />
              </motion.div>
            )}
            {activeView === 'athlete-detail' && selectedAthleteId && (
              <motion.div
                key="athlete-detail"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
              >
                <AthleteDetail athleteId={selectedAthleteId} onBack={() => setActiveView('athletes')} />
              </motion.div>
            )}
            {activeView === 'upload' && (
              <motion.div
                key="upload"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.3 }}
              >
                <ReportUpload onComplete={() => { setActiveView('dashboard'); fetchStats(); }} />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
}
