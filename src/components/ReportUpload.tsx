import React, { useState, useCallback, useEffect } from 'react';
import { useDropzone } from 'react-dropzone';
import { 
  Upload, 
  FileText, 
  X, 
  CheckCircle2, 
  Loader2, 
  AlertCircle,
  UserPlus,
  ChevronRight,
  Zap
} from 'lucide-react';
import { cn } from '../lib/utils';
import { analyzeMedicalReport } from '../services/gemini';
import { Athlete } from '../types';

interface ReportUploadProps {
  onComplete: () => void;
}

export default function ReportUpload({ onComplete }: ReportUploadProps) {
  const [file, setFile] = useState<File | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [athletes, setAthletes] = useState<Athlete[]>([]);
  const [selectedAthleteId, setSelectedAthleteId] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [step, setStep] = useState<1 | 2>(1); // 1: Select Athlete, 2: Upload

  useEffect(() => {
    fetch('/api/athletes')
      .then(res => res.json())
      .then(setAthletes);
  }, []);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    setFile(acceptedFiles[0]);
    setError(null);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'image/jpeg': ['.jpg', '.jpeg'],
      'image/png': ['.png']
    },
    multiple: false
  });

  const handleUpload = async () => {
    if (!file || !selectedAthleteId) return;

    setAnalyzing(true);
    setError(null);

    try {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = async () => {
        const base64 = reader.result as string;
        
        // Get athlete history for context
        const historyRes = await fetch(`/api/athletes/${selectedAthleteId}`);
        const athleteData = await historyRes.json();
        
        const analysis = await analyzeMedicalReport(base64, file.type, athleteData.reports);
        
        const reportData = {
          athlete_id: selectedAthleteId,
          test_date: new Date().toISOString().split('T')[0],
          heart_rate: analysis.metrics.heart_rate,
          hematocrit: analysis.metrics.hematocrit,
          testosterone: analysis.metrics.testosterone,
          oxygen_level: analysis.metrics.oxygen_level,
          blood_pressure: analysis.metrics.blood_pressure,
          test_type: analysis.metrics.test_type,
          risk_score: analysis.analysis.risk_score,
          suspicion_level: analysis.analysis.doping_suspicion,
          ai_analysis: `### Key Anomalies\n${analysis.analysis.key_anomalies.map((a: string) => `- ${a}`).join('\n')}\n\n### Risk Interpretation\n${analysis.analysis.risk_interpretation}\n\n### Recommended Action\n${analysis.analysis.recommended_action}`,
          confidence_score: analysis.analysis.confidence_score,
          final_decision: analysis.analysis.final_decision
        };

        const saveRes = await fetch('/api/reports', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(reportData)
        });

        if (saveRes.ok) {
          onComplete();
        } else {
          throw new Error("Failed to save report");
        }
      };
    } catch (err) {
      console.error(err);
      setError("An error occurred during analysis. Please try again.");
    } finally {
      setAnalyzing(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto flex flex-col gap-8">
      <div className="flex flex-col gap-2 text-center">
        <h2 className="text-3xl font-bold">New Medical Analysis</h2>
        <p className="text-white/40">Upload a medical report to detect risks and doping patterns.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Steps */}
        <div className="flex flex-col gap-4">
          <div className={cn(
            "p-4 rounded-2xl border transition-all",
            step === 1 ? "bg-brand-primary/10 border-brand-primary" : "bg-white/5 border-white/10 opacity-50"
          )}>
            <div className="flex items-center gap-3">
              <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center font-bold", step === 1 ? "bg-brand-primary text-black" : "bg-white/10")}>1</div>
              <span className="font-bold">Select Athlete</span>
            </div>
          </div>
          <div className={cn(
            "p-4 rounded-2xl border transition-all",
            step === 2 ? "bg-brand-primary/10 border-brand-primary" : "bg-white/5 border-white/10 opacity-50"
          )}>
            <div className="flex items-center gap-3">
              <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center font-bold", step === 2 ? "bg-brand-primary text-black" : "bg-white/10")}>2</div>
              <span className="font-bold">Upload & Analyze</span>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="md:col-span-2 glass p-8 rounded-3xl">
          {step === 1 ? (
            <div className="flex flex-col gap-6">
              <h3 className="text-xl font-bold">Who is this report for?</h3>
              <div className="flex flex-col gap-2 max-h-[400px] overflow-y-auto pr-2">
                {athletes.map(a => (
                  <button
                    key={a.id}
                    onClick={() => { setSelectedAthleteId(a.id); setStep(2); }}
                    className="flex items-center justify-between p-4 rounded-2xl glass-hover text-left"
                  >
                    <div>
                      <p className="font-bold">{a.name}</p>
                      <p className="text-xs text-white/40">{a.sport} • {a.age} yrs</p>
                    </div>
                    <ChevronRight size={18} className="text-white/20" />
                  </button>
                ))}
                <button className="flex items-center gap-3 p-4 rounded-2xl border border-dashed border-white/20 hover:border-brand-primary hover:bg-brand-primary/5 transition-all text-white/40 hover:text-brand-primary">
                  <UserPlus size={20} />
                  <span className="font-bold">Register New Athlete</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="flex flex-col gap-8">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold">Upload Document</h3>
                <button onClick={() => setStep(1)} className="text-xs text-white/40 hover:text-white underline">Change Athlete</button>
              </div>

              {!file ? (
                <div 
                  {...getRootProps()} 
                  className={cn(
                    "border-2 border-dashed rounded-3xl p-12 flex flex-col items-center gap-4 transition-all cursor-pointer",
                    isDragActive ? "border-brand-primary bg-brand-primary/5" : "border-white/10 hover:border-white/20 hover:bg-white/5"
                  )}
                >
                  <input {...getInputProps()} />
                  <div className="w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center">
                    <Upload className="text-white/40" size={32} />
                  </div>
                  <div className="text-center">
                    <p className="font-bold">Drop your report here</p>
                    <p className="text-sm text-white/40">PDF, JPG, or PNG (Max 10MB)</p>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col gap-6">
                  <div className="flex items-center gap-4 p-4 rounded-2xl bg-white/5 border border-white/10">
                    <div className="w-12 h-12 rounded-xl bg-brand-primary/20 flex items-center justify-center">
                      <FileText className="text-brand-primary" size={24} />
                    </div>
                    <div className="flex-1 overflow-hidden">
                      <p className="font-bold truncate">{file.name}</p>
                      <p className="text-xs text-white/40">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                    </div>
                    <button onClick={() => setFile(null)} className="p-2 hover:bg-white/10 rounded-lg transition-colors">
                      <X size={20} className="text-white/40" />
                    </button>
                  </div>

                  {error && (
                    <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center gap-3 text-red-400 text-sm">
                      <AlertCircle size={18} />
                      {error}
                    </div>
                  )}

                  <button
                    disabled={analyzing}
                    onClick={handleUpload}
                    className="w-full bg-gradient-brand py-4 rounded-2xl font-bold flex items-center justify-center gap-3 shadow-lg shadow-brand-primary/20 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {analyzing ? (
                      <>
                        <Loader2 className="animate-spin" size={20} />
                        AI is analyzing biomarkers...
                      </>
                    ) : (
                      <>
                        <Zap size={20} />
                        Start AI Risk Detection
                      </>
                    )}
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
