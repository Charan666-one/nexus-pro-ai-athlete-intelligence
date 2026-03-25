import React, { useState, useEffect } from 'react';
import { 
  ArrowLeft, 
  Activity, 
  Droplets, 
  Wind, 
  Zap, 
  Heart,
  TrendingUp,
  AlertCircle,
  CheckCircle2,
  FileText,
  Download
} from 'lucide-react';
import { Athlete, Report } from '../types';
import { cn, getRiskLevel, getSuspicionStatus } from '../lib/utils';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar
} from 'recharts';
import ReactMarkdown from 'react-markdown';

interface AthleteDetailProps {
  athleteId: number;
  onBack: () => void;
}

export default function AthleteDetail({ athleteId, onBack }: AthleteDetailProps) {
  const [athlete, setAthlete] = useState<(Athlete & { reports: Report[] }) | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);

  useEffect(() => {
    fetch(`/api/athletes/${athleteId}`)
      .then(res => res.json())
      .then(data => {
        setAthlete(data);
        if (data.reports.length > 0) {
          setSelectedReport(data.reports[0]);
        }
        setLoading(false);
      });
  }, [athleteId]);

  if (loading || !athlete) return <div className="flex items-center justify-center h-full">Loading athlete profile...</div>;

  const latestReport = athlete.reports[0];
  const history = athlete.reports.slice().reverse();

  const radarData = selectedReport ? [
    { subject: 'Heart Rate', A: selectedReport.heart_rate, fullMark: 200 },
    { subject: 'Hematocrit', A: selectedReport.hematocrit * 2, fullMark: 100 },
    { subject: 'Testosterone', A: selectedReport.testosterone / 10, fullMark: 100 },
    { subject: 'Oxygen', A: selectedReport.oxygen_level, fullMark: 100 },
  ] : [];

  const MetricCard = ({ icon: Icon, label, value, unit, trend, color }: any) => (
    <div className="glass p-5 rounded-2xl flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <div className={cn("p-2 rounded-xl", color)}>
          <Icon size={18} className="text-white" />
        </div>
        {trend && (
          <span className={cn("text-[10px] font-bold px-2 py-0.5 rounded-full", trend > 0 ? "bg-red-400/10 text-red-400" : "bg-green-400/10 text-green-400")}>
            {trend > 0 ? '+' : ''}{trend}%
          </span>
        )}
      </div>
      <div>
        <p className="text-white/40 text-[10px] uppercase tracking-wider font-bold">{label}</p>
        <div className="flex items-baseline gap-1">
          <span className="text-xl font-bold">{value}</span>
          <span className="text-xs text-white/20">{unit}</span>
        </div>
      </div>
    </div>
  );

  return (
    <div className="flex flex-col gap-8 pb-12">
      <div className="flex items-center gap-4">
        <button onClick={onBack} className="glass p-2.5 rounded-xl hover:bg-white/10 transition-colors">
          <ArrowLeft size={20} />
        </button>
        <div>
          <h2 className="text-3xl font-bold">{athlete.name}</h2>
          <p className="text-white/40">{athlete.sport} • {athlete.age} yrs • Athlete ID: #{athlete.id.toString().padStart(4, '0')}</p>
        </div>
        <button className="ml-auto glass px-6 py-2.5 rounded-xl font-semibold text-sm flex items-center gap-2 hover:bg-white/10 transition-colors">
          <Download size={18} />
          Export Medical History
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {selectedReport && (
          <>
            <MetricCard icon={Heart} label="Heart Rate" value={selectedReport.heart_rate} unit="bpm" color="bg-red-500" />
            <MetricCard icon={Droplets} label="Hematocrit" value={selectedReport.hematocrit} unit="%" color="bg-blue-500" />
            <MetricCard icon={Zap} label="Testosterone" value={selectedReport.testosterone} unit="ng/dL" color="bg-purple-500" />
            <MetricCard icon={Wind} label="Oxygen Level" value={selectedReport.oxygen_level} unit="%" color="bg-cyan-500" />
          </>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Analysis */}
        <div className="lg:col-span-2 flex flex-col gap-8">
          {/* Time Series Chart */}
          <div className="glass p-8 rounded-3xl flex flex-col gap-6">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-bold">Biometric Trends</h3>
              <div className="flex gap-2">
                <button className="px-3 py-1 rounded-lg bg-brand-primary text-black text-xs font-bold">Hematocrit</button>
                <button className="px-3 py-1 rounded-lg glass text-white/60 text-xs font-bold">Testosterone</button>
              </div>
            </div>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={history}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                  <XAxis 
                    dataKey="test_date" 
                    stroke="rgba(255,255,255,0.3)" 
                    fontSize={10} 
                    tickFormatter={(val) => new Date(val).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                  />
                  <YAxis stroke="rgba(255,255,255,0.3)" fontSize={10} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#111', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px' }}
                  />
                  <Line type="monotone" dataKey="hematocrit" stroke="#00f2ff" strokeWidth={3} dot={{ fill: '#00f2ff', r: 4 }} activeDot={{ r: 6 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* AI Reasoning */}
          {selectedReport && (
            <div className="glass p-8 rounded-3xl flex flex-col gap-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-brand flex items-center justify-center">
                  <Activity className="text-white" size={20} />
                </div>
                <h3 className="text-xl font-bold">AI Medical Reasoning</h3>
              </div>
              <div className="prose prose-invert max-w-none text-white/70 text-sm leading-relaxed">
                <ReactMarkdown>{selectedReport.ai_analysis}</ReactMarkdown>
              </div>
            </div>
          )}
        </div>

        {/* Sidebar Info */}
        <div className="flex flex-col gap-8">
          {/* Risk Score */}
          {selectedReport && (
            <div className="glass p-8 rounded-3xl flex flex-col items-center gap-6 text-center">
              <h3 className="text-lg font-bold">Risk Assessment</h3>
              <div className="relative w-40 h-40 flex items-center justify-center">
                <svg className="w-full h-full transform -rotate-90">
                  <circle
                    cx="80"
                    cy="80"
                    r="70"
                    stroke="currentColor"
                    strokeWidth="12"
                    fill="transparent"
                    className="text-white/5"
                  />
                  <circle
                    cx="80"
                    cy="80"
                    r="70"
                    stroke="currentColor"
                    strokeWidth="12"
                    fill="transparent"
                    strokeDasharray={440}
                    strokeDashoffset={440 - (440 * selectedReport.risk_score) / 100}
                    className={cn(
                      "transition-all duration-1000",
                      selectedReport.risk_score > 60 ? "text-red-500" : selectedReport.risk_score > 30 ? "text-yellow-500" : "text-brand-primary"
                    )}
                  />
                </svg>
                <div className="absolute flex flex-col items-center">
                  <span className="text-4xl font-black">{selectedReport.risk_score}</span>
                  <span className="text-[10px] text-white/40 uppercase tracking-widest font-bold">Score</span>
                </div>
              </div>
              
              <div className="w-full flex flex-col gap-2">
                <div className={cn("py-2 rounded-xl font-bold text-sm", getRiskLevel(selectedReport.risk_score).bg, getRiskLevel(selectedReport.risk_score).color)}>
                  {getRiskLevel(selectedReport.risk_score).label} Risk Detected
                </div>
                <div className="flex items-center justify-center gap-2 text-xs font-medium text-white/60">
                  {getSuspicionStatus(selectedReport.risk_score, 0).icon} {getSuspicionStatus(selectedReport.risk_score, 0).label}
                </div>
              </div>

              <div className="w-full pt-6 border-t border-white/5 flex flex-col gap-4">
                <div className="flex justify-between text-xs">
                  <span className="text-white/40">Confidence Score</span>
                  <span className="font-bold text-brand-primary">{selectedReport.confidence_score}%</span>
                </div>
                <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
                  <div className="h-full bg-brand-primary rounded-full" style={{ width: `${selectedReport.confidence_score}%` }}></div>
                </div>
              </div>
            </div>
          )}

          {/* Test History List */}
          <div className="glass p-6 rounded-3xl flex flex-col gap-4">
            <h3 className="text-sm font-bold uppercase tracking-widest text-white/40">Test History</h3>
            <div className="flex flex-col gap-2">
              {athlete.reports.map((r) => (
                <button
                  key={r.id}
                  onClick={() => setSelectedReport(r)}
                  className={cn(
                    "flex items-center justify-between p-3 rounded-xl transition-all",
                    selectedReport?.id === r.id ? "bg-white/10 border border-white/10" : "hover:bg-white/5"
                  )}
                >
                  <div className="flex flex-col items-start">
                    <span className="text-sm font-bold">{new Date(r.test_date).toLocaleDateString()}</span>
                    <span className="text-[10px] text-white/40">{r.test_type}</span>
                  </div>
                  <ChevronRight size={16} className={selectedReport?.id === r.id ? "text-brand-primary" : "text-white/20"} />
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function ChevronRight({ size, className }: { size: number, className?: string }) {
  return (
    <svg 
      width={size} 
      height={size} 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      className={className}
    >
      <path d="m9 18 6-6-6-6"/>
    </svg>
  );
}
