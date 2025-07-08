import Link from 'next/link';

export default function About() {
  return (
    <div className="min-h-screen">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Navigation */}
        <div className="mb-8">
          <Link 
            href="/"
            className="inline-flex items-center gap-2 text-bowling-brown hover:text-gray-700 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"/>
            </svg>
            Back to Analysis
          </Link>
        </div>

        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-bowling-brown mb-4">
            🎳 About Preflight
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            The Dude&apos;s guide to finding where the money really is in your business plan
          </p>
        </div>

        {/* Main Content */}
        <div className="bg-white rounded-lg shadow-md p-8 mb-8">
          {/* What is Preflight */}
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-bowling-brown mb-4">
              What is Preflight?
            </h2>
            <p className="text-gray-700 mb-4">
              Preflight is an AI-powered business plan analyzer that asks the most important question in entrepreneurship: 
              <strong> &ldquo;Dude, where&apos;s the money?&rdquo;</strong>
            </p>
            <p className="text-gray-700 mb-4">
              Most business plans are filled with hidden assumptions about money flow - who will pay, how much they&apos;ll pay, 
              when the money actually shows up, and how long it lasts. These assumptions can make or break your startup, 
              but they&apos;re often buried in optimistic projections and wishful thinking.
            </p>
            <p className="text-gray-700">
              We help you find these assumptions before investors do, so you can address them proactively and build a more 
              solid foundation for your business.
            </p>
          </section>

          {/* How it Works */}
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-bowling-brown mb-4">
              How It Works
            </h2>
            <div className="space-y-4">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-8 h-8 bg-bowling-brown text-white rounded-full flex items-center justify-center font-bold">
                  1
                </div>
                <div>
                  <h3 className="font-semibold text-gray-800">Paste Your Business Plan</h3>
                  <p className="text-gray-600">Upload your business plan, pitch deck, or startup idea (100-10,000 characters)</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-8 h-8 bg-bowling-brown text-white rounded-full flex items-center justify-center font-bold">
                  2
                </div>
                <div>
                  <h3 className="font-semibold text-gray-800">AI Analysis</h3>
                  <p className="text-gray-600">Our AI scans for money-related assumptions using advanced pattern recognition</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-8 h-8 bg-bowling-brown text-white rounded-full flex items-center justify-center font-bold">
                  3
                </div>
                <div>
                  <h3 className="font-semibold text-gray-800">Get Results</h3>
                  <p className="text-gray-600">Receive categorized assumptions with risk levels and actionable insights</p>
                </div>
              </div>
            </div>
          </section>

          {/* What We Look For */}
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-bowling-brown mb-4">
              What We Look For
            </h2>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <span className="text-lg">💰</span>
                  <span className="font-semibold">WHO will pay</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-lg">💳</span>
                  <span className="font-semibold">HOW MUCH they&apos;ll pay</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-lg">⏰</span>
                  <span className="font-semibold">WHEN they&apos;ll pay</span>
                </div>
              </div>
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <span className="text-lg">📊</span>
                  <span className="font-semibold">HOW MANY will pay</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-lg">🏗️</span>
                  <span className="font-semibold">WHAT it costs to deliver</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-lg">🔥</span>
                  <span className="font-semibold">HOW LONG money lasts</span>
                </div>
              </div>
            </div>
          </section>

          {/* Risk Levels */}
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-bowling-brown mb-4">
              Risk Assessment
            </h2>
            <div className="space-y-4">
              <div className="flex items-start gap-4 p-4 bg-red-50 rounded-lg border-l-4 border-red-500">
                <span className="text-2xl">🚨</span>
                <div>
                  <h3 className="font-bold text-red-700">OVER THE LINE!</h3>
                  <p className="text-red-600">Critical assumptions that could kill your business if wrong</p>
                </div>
              </div>
              <div className="flex items-start gap-4 p-4 bg-orange-50 rounded-lg border-l-4 border-orange-500">
                <span className="text-2xl">💡</span>
                <div>
                  <h3 className="font-bold text-orange-700">New Shit Has Come to Light</h3>
                  <p className="text-orange-600">Important assumptions that significantly impact profitability</p>
                </div>
              </div>
              <div className="flex items-start gap-4 p-4 bg-yellow-50 rounded-lg border-l-4 border-yellow-500">
                <span className="text-2xl">🤷</span>
                <div>
                  <h3 className="font-bold text-yellow-700">That&apos;s Just Like, Your Opinion</h3>
                  <p className="text-yellow-600">Minor assumptions with limited financial impact</p>
                </div>
              </div>
            </div>
          </section>

          {/* Who Should Use This */}
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-bowling-brown mb-4">
              Who Should Use Preflight?
            </h2>
            <div className="grid md:grid-cols-3 gap-6">
              <div className="text-center p-4">
                <div className="text-3xl mb-3">🚀</div>
                <h3 className="font-semibold mb-2">Entrepreneurs</h3>
                <p className="text-gray-600 text-sm">Validate your business model before pitching to investors</p>
              </div>
              <div className="text-center p-4">
                <div className="text-3xl mb-3">💼</div>
                <h3 className="font-semibold mb-2">Startup Advisors</h3>
                <p className="text-gray-600 text-sm">Help founders identify blind spots in their financial planning</p>
              </div>
              <div className="text-center p-4">
                <div className="text-3xl mb-3">🏦</div>
                <h3 className="font-semibold mb-2">Investors</h3>
                <p className="text-gray-600 text-sm">Quickly assess the financial assumptions in pitch decks</p>
              </div>
            </div>
          </section>

          {/* The Philosophy */}
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-bowling-brown mb-4">
              The Philosophy
            </h2>
            <div className="bg-gray-50 p-6 rounded-lg border-l-4 border-bowling-brown">
              <p className="text-gray-700 italic text-lg mb-4">
                &ldquo;The Dude abides, but bad assumptions don&apos;t.&rdquo;
              </p>
              <p className="text-gray-700">
                We believe that the best business plans are built on validated assumptions, not hopeful projections. 
                Like The Dude&apos;s laid-back wisdom, the most important questions are often the simplest ones: 
                Where&apos;s the money? Who&apos;s going to pay? When? How much?
              </p>
            </div>
          </section>
        </div>

        {/* CTA */}
        <div className="text-center">
          <Link 
            href="/"
            className="inline-block px-8 py-3 bg-bowling-brown hover:bg-bowling-brown text-white rounded-lg font-medium transition-colors"
          >
            Try Preflight Now
          </Link>
        </div>
      </div>
    </div>
  );
}