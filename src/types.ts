export interface Athlete {
  id: number;
  name: string;
  sport: string;
  age: number;
  gender: string;
  created_at: string;
}

export interface Report {
  id: number;
  athlete_id: number;
  test_date: string;
  heart_rate: number;
  hematocrit: number;
  testosterone: number;
  oxygen_level: number;
  blood_pressure: string;
  test_type: string;
  risk_score: number;
  suspicion_level: string;
  ai_analysis: string;
  confidence_score: number;
  final_decision: string;
  athlete_name?: string;
}

export interface DashboardStats {
  totalAthletes: number;
  highRiskCount: number;
  recentReports: Report[];
}
