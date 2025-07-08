import { track } from '@vercel/analytics';

export const trackEvent = (eventName: string, properties?: Record<string, unknown>) => {
  try {
    track(eventName, properties);
  } catch (error) {
    console.error('Analytics tracking error:', error);
  }
};

export const analyticsEvents = {
  analysisStarted: () => trackEvent('analysis_started'),
  analysisCompleted: (assumptionCount: number) => trackEvent('analysis_completed', { assumptionCount }),
  feedbackYes: () => trackEvent('feedback_yes'),
  feedbackNo: () => trackEvent('feedback_no'),
};