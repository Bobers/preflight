import { useState, useCallback } from 'react';
import type { AnalysisResult, ApiResponse } from '@/types';
import { analyticsEvents } from './analytics';

export function useAnalysis() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<AnalysisResult | null>(null);

  const analyze = useCallback(async (text: string) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text }),
      });

      const data: ApiResponse = await response.json();

      if (!data.success) {
        throw new Error(data.error || 'Analysis failed');
      }

      if (data.data) {
        setResult(data.data);
        analyticsEvents.analysisCompleted(data.data.assumptions.length);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unexpected error occurred';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const reset = useCallback(() => {
    setResult(null);
    setError(null);
    setIsLoading(false);
  }, []);

  return {
    analyze,
    reset,
    isLoading,
    error,
    result,
  };
}