'use client';

import { useState } from 'react';
import Image from 'next/image';
import { sampleBusinessPlan } from '@/utils/sampleContent';
import { useAnalysis } from '@/utils/hooks';
import { analyticsEvents } from '@/utils/analytics';

export default function Home() {
  const [text, setText] = useState('');
  const [feedbackGiven, setFeedbackGiven] = useState(false);
  const [showFullScreenLoading, setShowFullScreenLoading] = useState(false);
  const { analyze, reset, error, result } = useAnalysis();

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
    setShowFullScreenLoading(true);
    analyticsEvents.analysisStarted();
    
    // Ensure minimum 3 seconds of loading screen
    const startTime = Date.now();
    
    try {
      await analyze(text);
    } finally {
      const elapsed = Date.now() - startTime;
      const remainingTime = Math.max(0, 3000 - elapsed);
      
      setTimeout(() => {
        setShowFullScreenLoading(false);
      }, remainingTime);
    }
  };

  const handleReset = () => {
    setText('');
    setFeedbackGiven(false);
    setShowFullScreenLoading(false);
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
    <div className="min-h-screen">
      {/* Full Screen Loading Overlay */}
      {showFullScreenLoading && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-white">
          <div className="text-center">
            <Image 
              src="/loading.gif" 
              alt="Loading analysis..." 
              width={800}
              height={600}
              className="max-w-full max-h-screen object-contain"
              unoptimized={true}
            />
          </div>
        </div>
      )}
      
      {/* Main Content */}
      {!result ? (
        <div className="container mx-auto px-4 py-8 max-w-4xl">
          <h1 className="text-4xl font-bold text-center mb-4 text-bowling-brown">
            Dude, Where&apos;s the Money in Your Business Plan?
          </h1>
          <p className="text-lg text-center mb-8 text-gray-600 max-w-2xl mx-auto">
            Your business plan might seem solid, but hidden assumptions could be more complex than you think, man. Find the money assumptions before investors ask the hard questions.
          </p>
          
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="mb-4">
              <textarea
                value={text}
                onChange={handleTextChange}
                placeholder="Paste your business plan here for the ultimate reality check... (minimum 100 characters)"
                className="w-full h-96 p-4 border border-gray-300 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-bowling-brown text-gray-900 bg-white placeholder-gray-500"
                disabled={showFullScreenLoading}
              />
              
              <div className="mt-2 flex justify-between items-center">
                <span className={`text-sm ${showWarning ? 'text-orange-500' : 'text-gray-500'}`}>
                  {characterCount} / 10,000 characters
                  {showWarning && ' (approaching limit)'}
                </span>
                
                <button
                  onClick={loadSampleContent}
                  className="text-sm text-blue-600 hover:text-blue-800 underline"
                  disabled={showFullScreenLoading}
                >
                  Try with sample plan
                </button>
              </div>
            </div>
            
            <div className="flex justify-center">
              <button
                onClick={handleAnalyze}
                disabled={!isValidLength || showFullScreenLoading}
                className={`px-8 py-3 rounded-lg font-medium transition-colors ${
                  isValidLength && !showFullScreenLoading
                    ? 'bg-bowling-brown hover:bg-bowling-brown text-white'
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
              >
                {showFullScreenLoading ? (
                  'Analyzing...'
                ) : (
                  'Find the Money, Dude'
                )}
              </button>
            </div>
            
            
            {error && (
              <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
                <p className="font-medium">🤦‍♂️ This is More Complex Than We Thought, Dude</p>
                <p className="text-sm">{error}</p>
                <p className="text-xs mt-2 italic">Like The Dude says, sometimes shit happens.</p>
              </div>
            )}
          </div>
        </div>
      ) : (
        /* Results Display */
        <div className="container mx-auto px-4 py-8 max-w-7xl">
          {result.summary.total === 0 ? (
            <div className="text-center max-w-2xl mx-auto">
              <h2 className="text-3xl font-bold mb-6 text-bowling-brown">
                🎳 That&apos;s Like, a Really Solid Plan, Man
              </h2>
              <div className="bg-white rounded-lg shadow-md p-8 mb-8">
                <p className="text-lg text-gray-700 mb-4">
                  We couldn&apos;t find any obvious money assumptions in your text.
                </p>
                <p className="text-gray-600 mb-6">
                  Either your plan is incredibly well-researched, or maybe it needs more specifics about the money flow.
                </p>
                <div className="space-x-4">
                  <button
                    onClick={handleReset}
                    className="px-6 py-3 bg-bowling-brown hover:bg-bowling-brown text-white rounded-lg font-medium transition-colors"
                  >
                    Try Another Plan
                  </button>
                  <a 
                    href="mailto:feedback@preflight.com"
                    className="px-6 py-3 bg-gray-500 hover:bg-gray-600 text-white rounded-lg font-medium transition-colors inline-block"
                  >
                    Share Feedback
                  </a>
                </div>
              </div>
            </div>
          ) : (
            <>
              <h2 className="text-3xl font-bold text-center mb-8 text-bowling-brown">
                Far Out! We Found {result.summary.total} Money Assumptions
              </h2>
          
          {/* Summary Dashboard */}
          <div className="bg-white rounded-lg shadow-md p-6 mb-8 border-l-4 border-bowling-brown">
            <h3 className="text-xl font-semibold mb-4 text-bowling-brown">Summary</h3>
            <div className="grid grid-cols-4 gap-4 text-center">
              <div>
                <p className="text-3xl font-bold text-bowling-brown">{result.summary.total}</p>
                <p className="text-gray-600">Total Assumptions</p>
              </div>
              <div>
                <p className="text-3xl font-bold text-red-600">🚨 {result.summary.critical}</p>
                <p className="text-gray-600">OVER THE LINE</p>
              </div>
              <div>
                <p className="text-3xl font-bold text-orange-600">💡 {result.summary.important}</p>
                <p className="text-gray-600">New Shit Has Come to Light</p>
              </div>
              <div>
                <p className="text-3xl font-bold text-yellow-600">🤷 {result.summary.minor}</p>
                <p className="text-gray-600">That&apos;s Just Like, Your Opinion</p>
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
                              ? 'bg-orange-100 text-orange-700'
                              : 'bg-yellow-100 text-yellow-700'
                          }`}
                        >
                          {assumption.risk_level === 'critical' 
                            ? '🚨 OVER THE LINE!'
                            : assumption.risk_level === 'important'
                            ? '💡 New Shit Has Come to Light'
                            : '🤷 That&apos;s Just Like, Your Opinion'
                          }
                        </span>
                      </div>
                      <p className="text-sm text-gray-600">💰 Money Risk: {assumption.reasoning}</p>
                    </div>
                  ))}
              </div>
            </div>
          </div>
          
          {/* Action Buttons */}
          <div className="mt-8 text-center space-y-4">
            <button
              onClick={handleReset}
              className="px-8 py-3 bg-bowling-brown hover:bg-bowling-brown text-white rounded-lg font-medium transition-colors"
            >
              Check Another Plan
            </button>
            
            <div className="flex justify-center items-center gap-4">
              <span className="text-gray-600">Was This Helpful, Man?</span>
              <button 
                onClick={() => handleFeedback(true)}
                disabled={feedbackGiven}
                className={`px-4 py-2 border rounded transition-colors ${
                  feedbackGiven 
                    ? 'border-gray-200 text-gray-400 cursor-not-allowed' 
                    : 'border-gray-300 hover:bg-gray-50'
                }`}
              >
                😎 Yeah, totally helpful
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
                😕 Not really, dude
              </button>
            </div>
            
            {feedbackGiven && (
              <p className="text-sm text-gray-600">Far out! Thanks for the feedback, man</p>
            )}
            
            <p className="text-sm text-gray-500">
              Got more thoughts? Drop us a line:{' '}
              <a href="mailto:feedback@preflight.com" className="text-blue-600 hover:underline">
                feedback@preflight.com
              </a>
              <br />
              <span className="text-xs">Even The Dude appreciates good feedback</span>
            </p>
          </div>
          </>
          )}
        </div>
      )}
      
      {/* Footer */}
      <footer className="mt-16 py-8 text-center text-sm text-gray-500 border-t border-gray-200">
        <h3 className="text-lg font-medium mb-4 text-gray-700">
          🎳 This Website Really Ties the Room Together
        </h3>
        <div className="space-x-4 mb-4">
          <a href="/privacy" className="hover:underline">Privacy Policy</a>
          <span>|</span>
          <a href="/terms" className="hover:underline">Terms</a>
          <span>|</span>
          <a href="mailto:feedback@preflight.com" className="hover:underline">Contact</a>
        </div>
        <p className="text-xs text-gray-400 italic">
          &ldquo;That&apos;s just like, our legal opinion, man&rdquo;
        </p>
        <p className="text-xs text-gray-500 mt-2">
          Made with 🎳 for entrepreneurs who ask the hard questions
        </p>
        <div className="mt-4">
          <a 
            href="https://www.linkedin.com/in/slobodianb/" 
            target="_blank" 
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors text-sm"
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
              <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
            </svg>
            About the Author
          </a>
        </div>
      </footer>
    </div>
  );
}