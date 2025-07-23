export default function PricingManager() {
  return (
    <div className="p-8">
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Legacy Pricing Manager</h1>
          <p className="text-gray-600 text-lg">
            This system has been upgraded to a configurable pricing system
          </p>
        </div>

        <div className="bg-amber-50 border border-amber-200 rounded-lg p-6">
          <div className="text-center">
            <h2 className="text-xl font-semibold text-amber-900 mb-3">
              System Upgraded
            </h2>
            <p className="text-amber-800 mb-4">
              The old hardcoded pricing system has been replaced with a flexible configurable system.
            </p>
            <p className="text-amber-800 font-medium">
              Please use "Configurable Pricing" in the sidebar for the new system.
            </p>
          </div>
        </div>

        <div className="bg-green-50 border border-green-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-green-900 mb-3">New Features Available</h3>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <h4 className="font-medium text-green-800 mb-2">Feature Pool Management</h4>
              <ul className="text-sm text-green-700 space-y-1">
                <li>• Create unlimited feature types</li>
                <li>• Custom units and descriptions</li>
                <li>• Icon selection</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium text-green-800 mb-2">Plan Configuration</h4>
              <ul className="text-sm text-green-700 space-y-1">
                <li>• Set specific limits per plan</li>
                <li>• Toggle unlimited options</li>
                <li>• Real-time updates</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 