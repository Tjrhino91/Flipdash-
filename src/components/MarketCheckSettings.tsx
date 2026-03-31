export function MarketCheckSettings() {
  return (
    <div className="bg-[#131a2b] border border-white/[0.06] rounded-xl overflow-hidden">
      <div className="px-5 py-3.5 border-b border-white/[0.06] flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-lg">🔍</span>
          <h3 className="text-sm font-semibold">MarketCheck API</h3>
        </div>
        <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/15 text-emerald-400">
          ✅ Enabled
        </span>
      </div>
      <div className="p-5 space-y-4">
        <p className="text-xs text-gray-400">
          MarketCheck integration is enabled and configured securely on the backend.
          Browse real vehicle listings from dealers and private sellers across the country directly in the Marketplace.
        </p>

        <div className="flex items-center justify-between bg-emerald-500/10 border border-emerald-500/20 rounded-lg px-4 py-3">
          <div className="flex items-center gap-2">
            <span className="text-emerald-400 text-sm">🔍</span>
            <span className="text-xs text-emerald-400">Live marketplace listings enabled</span>
          </div>
        </div>

        <div className="bg-white/[0.02] border border-white/[0.04] rounded-lg p-3">
          <p className="text-[11px] text-gray-500 mb-2 font-medium">What you get:</p>
          <ul className="space-y-1.5">
            <li className="text-[11px] text-gray-500 flex items-start gap-1.5">
              <span className="text-blue-400 mt-0.5">•</span>
              <span>Real dealer &amp; private party listings with photos</span>
            </li>
            <li className="text-[11px] text-gray-500 flex items-start gap-1.5">
              <span className="text-blue-400 mt-0.5">•</span>
              <span>Search by zip code &amp; radius for local inventory</span>
            </li>
            <li className="text-[11px] text-gray-500 flex items-start gap-1.5">
              <span className="text-blue-400 mt-0.5">•</span>
              <span>Direct links to original listings (AutoTrader, Cars.com, etc.)</span>
            </li>
            <li className="text-[11px] text-gray-500 flex items-start gap-1.5">
              <span className="text-blue-400 mt-0.5">•</span>
              <span>Flipdash Value Engine analyzes every listing for deal quality</span>
            </li>
          </ul>
        </div>

        <a
          href="https://www.marketcheck.com/automotive"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 text-xs text-blue-400 hover:text-blue-300 transition-colors"
        >
          Get a MarketCheck API key →
        </a>
      </div>
    </div>
  );
}
