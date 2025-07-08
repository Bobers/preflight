export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-gray-50 px-4 py-8">
      <div className="mx-auto max-w-3xl">
        <h1 className="mb-8 text-3xl font-bold text-gray-900">Privacy Policy</h1>
        
        <div className="prose prose-gray max-w-none">
          <h2 className="text-xl font-semibold mb-4">Data Collection</h2>
          <p className="mb-4">
            Preflight collects minimal anonymous usage data to improve our service. We use Vercel Web Analytics 
            which collects aggregated, anonymous information about page views and user interactions.
          </p>
          
          <h2 className="text-xl font-semibold mb-4">What We Collect</h2>
          <ul className="list-disc pl-6 mb-4">
            <li>Anonymous page view statistics</li>
            <li>General browser and device information (no personal identifiers)</li>
            <li>Anonymous usage patterns (button clicks, feature usage)</li>
          </ul>
          
          <h2 className="text-xl font-semibold mb-4">What We Don&apos;t Collect</h2>
          <ul className="list-disc pl-6 mb-4">
            <li>Personal information</li>
            <li>IP addresses</li>
            <li>The content of your business plans</li>
            <li>Any identifying information</li>
          </ul>
          
          <h2 className="text-xl font-semibold mb-4">Data Usage</h2>
          <p className="mb-4">
            We use this anonymous data solely to understand how users interact with our tool and to improve 
            the user experience. Your business plan content is processed temporarily for analysis and is not 
            stored or logged.
          </p>
          
          <h2 className="text-xl font-semibold mb-4">Contact</h2>
          <p className="mb-4">
            If you have any questions about our privacy practices, please contact us at{' '}
            <a href="mailto:feedback@preflight.com" className="text-blue-600 hover:underline">
              feedback@preflight.com
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}