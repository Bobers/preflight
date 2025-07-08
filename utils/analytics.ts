import { track } from '@vercel/analytics';

type AnalyticsProperties = {
  [key: string]: string | number | boolean | null;
};

export const trackEvent = (eventName: string, properties?: AnalyticsProperties) => {
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