'use client';

import { useState } from 'react';
import { sampleBusinessPlan } from '@/utils/sampleContent';
import { useAnalysis } from '@/utils/hooks';
import { analyticsEvents } from '@/utils/analytics';

export default function Home() {
  const [text, setText] = useState('');
  const [feedbackGiven, setFeedbackGiven] = useState(false);
  const { analyze, reset, isLoading, error, result } = useAnalysis();

  const characterCount = text.length;
  const isValidLength = characterCount >= 100 && characterCount <= 10000;
  const showWarning = characterCount > 9000;

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newText = e.target.value;
    if (newText.length <= 10000) {
      setText(newText);
    }
  };

  const loadSampleContent = () => {
    setText(sampleBusinessPlan);
  };

  const handleAnalyze = async () => {
    analyticsEvents.analysisStarted();
    await analyze(text);
  };

  const handleReset = () => {
    setText('');
    setFeedbackGiven(false);
    reset();
  };
  
  const handleFeedback = (positive: boolean) => {
    if (!feedbackGiven) {
      if (positive) {
        analyticsEvents.feedbackYes();
      } else {
        analyticsEvents.feedbackNo();
      }
      setFeedbackGiven(true);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Main Content */}
      {!result ? (
        <div className="container mx-auto px-4 py-8 max-w-4xl">
          <h1 className="text-4xl font-bold text-center mb-8 text-gray-900">
            Run a Preflight Check on Your Business Plan
          </h1>
          
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="mb-4">
              <textarea
                value={text}
                onChange={handleTextChange}
                placeholder="Paste your business plan, pitch deck content, or startup idea here... (minimum 100 characters)"
                className="w-full h-96 p-4 border border-gray-300 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white placeholder-gray-500"
                disabled={isLoading}
              />
              
              <div className="mt-2 flex justify-between items-center">
                <span className={`text-sm ${showWarning ? 'text-orange-500' : 'text-gray-500'}`}>
                  {characterCount} / 10,000 characters
                  {showWarning && ' (approaching limit)'}
                </span>
                
                <button
                  onClick={loadSampleContent}
                  className="text-sm text-blue-600 hover:text-blue-800 underline"
                  disabled={isLoading}
                >
                  Try with sample
                </button>
              </div>
            </div>
            
            <div className="flex justify-center">
              <button
                onClick={handleAnalyze}
                disabled={!isValidLength || isLoading}
                className={`px-8 py-3 rounded-lg font-medium transition-colors ${
                  isValidLength && !isLoading
                    ? 'bg-blue-600 hover:bg-blue-700 text-white'
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
              >
                {isLoading ? (
                  <span className="flex items-center">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Analyzing...
                  </span>
                ) : (
                  'Analyze Assumptions'
                )}
              </button>
            </div>
            
            {isLoading && (
              <div className="mt-4 text-center text-gray-600">
                <p>AI is reading your plan...</p>
                <p className="text-sm">This usually takes 10-15 seconds</p>
              </div>
            )}
            
            {error && (
              <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
                <p className="font-medium">Error</p>
                <p className="text-sm">{error}</p>
              </div>
            )}
          </div>
        </div>
      ) : (
        /* Results Display */
        <div className="container mx-auto px-4 py-8 max-w-7xl">
          <h2 className="text-3xl font-bold text-center mb-8 text-gray-900">
            Assumption Analysis Results
          </h2>
          
          {/* Summary Dashboard */}
          <div className="bg-white rounded-lg shadow-md p-6 mb-8">
            <h3 className="text-xl font-semibold mb-4">Summary</h3>
            <div className="grid grid-cols-4 gap-4 text-center">
              <div>
                <p className="text-3xl font-bold">{result.summary.total}</p>
                <p className="text-gray-600">Total Assumptions</p>
              </div>
              <div>
                <p className="text-3xl font-bold text-red-600">🔴 {result.summary.critical}</p>
                <p className="text-gray-600">Critical</p>
              </div>
              <div>
                <p className="text-3xl font-bold text-yellow-600">🟡 {result.summary.important}</p>
                <p className="text-gray-600">Important</p>
              </div>
              <div>
                <p className="text-3xl font-bold text-green-600">🟢 {result.summary.minor}</p>
                <p className="text-gray-600">Minor</p>
              </div>
            </div>
          </div>
          
          {/* Results Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Original Text */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-xl font-semibold mb-4">Your Business Plan</h3>
              <div className="prose prose-sm max-w-none">
                <p className="whitespace-pre-wrap text-gray-700">{text}</p>
              </div>
            </div>
            
            {/* Assumption Cards */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-xl font-semibold mb-4">Identified Assumptions</h3>
              <div className="space-y-4">
                {result.assumptions
                  .sort((a, b) => {
                    const order = { critical: 0, important: 1, minor: 2 };
                    return order[a.risk_level] - order[b.risk_level];
                  })
                  .map((assumption, index) => (
                    <div
                      key={index}
                      className="border rounded-lg p-4 hover:shadow-md transition-shadow"
                    >
                      <div className="flex items-start justify-between mb-2">
                        <p className="text-gray-800 font-medium">&ldquo;{assumption.text}&rdquo;</p>
                        <span
                          className={`px-2 py-1 rounded text-xs font-semibold ml-2 ${
                            assumption.risk_level === 'critical'
                              ? 'bg-red-100 text-red-700'
                              : assumption.risk_level === 'important'
                              ? 'bg-yellow-100 text-yellow-700'
                              : 'bg-green-100 text-green-700'
                          }`}
                        >
                          {assumption.risk_level}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600">{assumption.reasoning}</p>
                    </div>
                  ))}
              </div>
            </div>
          </div>
          
          {/* Action Buttons */}
          <div className="mt-8 text-center space-y-4">
            <button
              onClick={handleReset}
              className="px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
            >
              Analyze New Document
            </button>
            
            <div className="flex justify-center items-center gap-4">
              <span className="text-gray-600">Was this helpful?</span>
              <button 
                onClick={() => handleFeedback(true)}
                disabled={feedbackGiven}
                className={`px-4 py-2 border rounded transition-colors ${
                  feedbackGiven 
                    ? 'border-gray-200 text-gray-400 cursor-not-allowed' 
                    : 'border-gray-300 hover:bg-gray-50'
                }`}
              >
                Yes
              </button>
              <button 
                onClick={() => handleFeedback(false)}
                disabled={feedbackGiven}
                className={`px-4 py-2 border rounded transition-colors ${
                  feedbackGiven 
                    ? 'border-gray-200 text-gray-400 cursor-not-allowed' 
                    : 'border-gray-300 hover:bg-gray-50'
                }`}
              >
                No
              </button>
            </div>
            
            {feedbackGiven && (
              <p className="text-sm text-gray-600">Thanks for your feedback!</p>
            )}
            
            <p className="text-sm text-gray-500">
              Share your thoughts:{' '}
              <a href="mailto:feedback@preflight.com" className="text-blue-600 hover:underline">
                feedback@preflight.com
              </a>
            </p>
          </div>
        </div>
      )}
      
      {/* Footer */}
      <footer className="mt-16 py-4 text-center text-sm text-gray-500">
        <a href="/privacy" className="hover:underline">Privacy Policy</a>
      </footer>
    </div>
  );
}