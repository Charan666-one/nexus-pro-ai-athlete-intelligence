import React, { useState, useEffect } from 'react';
import { Users, Search, Filter, ChevronRight, Activity } from 'lucide-react';
import { Athlete } from '../types';
import { cn } from '../lib/utils';

interface AthleteListProps {
  onAthleteClick: (id: number) => void;
}

export default function AthleteList({ onAthleteClick }: AthleteListProps) {
  const [athletes, setAthletes] = useState<Athlete[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetch('/api/athletes')
      .then(res => res.json())
      .then(data => {
        setAthletes(data);
        setLoading(false);
      });
  }, []);

  const filteredAthletes = athletes.filter(a => 
    a.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    a.sport.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="flex flex-col gap-8">
      <div className="flex items-center justify-between">
        <div className="flex flex-col gap-2">
          <h2 className="text-3xl font-bold">Athlete Database</h2>
          <p className="text-white/40">Manage and monitor your team's medical profiles.</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="glass px-4 py-2 rounded-xl flex items-center gap-3 w-64">
            <Search size={18} className="text-white/40" />
            <input 
              type="text" 
              placeholder="Search athletes..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-transparent border-none outline-none text-sm w-full"
            />
          </div>
          <button className="glass p-2.5 rounded-xl hover:bg-white/10 transition-colors">
            <Filter size={20} className="text-white/60" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          Array(6).fill(0).map((_, i) => (
            <div key={i} className="glass h-48 rounded-3xl animate-pulse"></div>
          ))
        ) : (
          filteredAthletes.map((athlete) => (
            <button
              key={athlete.id}
              onClick={() => onAthleteClick(athlete.id)}
              className="glass p-6 rounded-3xl text-left glass-hover flex flex-col gap-6 group"
            >
              <div className="flex items-center justify-between">
                <div className="w-14 h-14 rounded-2xl bg-gradient-brand flex items-center justify-center text-xl font-bold">
                  {athlete.name.charAt(0)}
                </div>
                <div className="p-2 rounded-lg bg-white/5 text-white/40 group-hover:text-brand-primary transition-colors">
                  <ChevronRight size={20} />
                </div>
              </div>
              
              <div>
                <h3 className="text-xl font-bold">{athlete.name}</h3>
                <p className="text-white/40 text-sm">{athlete.sport} • {athlete.age} yrs • {athlete.gender}</p>
              </div>

              <div className="flex items-center gap-4 pt-4 border-t border-white/5">
                <div className="flex flex-col">
                  <span className="text-[10px] text-white/40 uppercase tracking-wider">Status</span>
                  <span className="text-xs font-bold text-green-400">CLEARED</span>
                </div>
                <div className="flex flex-col ml-auto">
                  <span className="text-[10px] text-white/40 uppercase tracking-wider">Last Test</span>
                  <span className="text-xs font-medium text-white/60">2 days ago</span>
                </div>
              </div>
            </button>
          ))
        )}
      </div>
    </div>
  );
}
