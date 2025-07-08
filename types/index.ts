export interface Assumption {
  text: string;
  risk_level: 'critical' | 'important' | 'minor';
  reasoning: string;
}

export interface AnalysisResult {
  assumptions: Assumption[];
  summary: {
    total: number;
    critical: number;
    important: number;
    minor: number;
  };
}

export interface ApiResponse {
  success: boolean;
  data?: AnalysisResult;
  error?: string;
}

export interface AnalysisState {
  text: string;
  isLoading: boolean;
  result: AnalysisResult | null;
  error: string | null;
}