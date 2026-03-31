import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { useStore, fmtCurrency, vehicleLabel, getVehicleCosts, getVehicleIncome, getVehicleProfit } from "@/lib/store";
import { AddVehicleModal } from "@/components/AddVehicleModal";
import { MiniValuationRange } from "@/components/ValuationDashboard";

function DashboardPage() {
  const { vehicles, expenses, appraisals, getLatestAppraisal } = useStore();
  const [showAdd, setShowAdd] = useState(false);

  const totalInvested = expenses.filter((e) => !e.is_income).reduce((s, e) => s + e.amount, 0);
  const totalIncome = expenses.filter((e) => e.is_income).reduce((s, e) => s + e.amount, 0);
  const netProfit = totalIncome - totalInvested;

  const prospects = vehicles.filter((v) => v.status === "Prospect");
  const active = vehicles.filter((v) => v.status === "Active");

  const portfolioRetail = vehicles.reduce((sum, v) => {
    const appraisal = getLatestAppraisal(v.id);
    return sum + (appraisal ? appraisal.retail : 0);
  }, 0);

  const stats = [
    { label: "Total Vehicles", value: String(vehicles.length), color: "text-white" },
    { label: "Total Invested", value: fmtCurrency(totalInvested), color: "text-red-400" },
    { label: "Total Income", value: fmtCurrency(totalIncome), color: "text-emerald-400" },
    { label: "Net Profit", value: fmtCurrency(netProfit), color: netProfit >= 0 ? "text-emerald-400" : "text-red-400" },
  ];

  return (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((s) => (
          <div key={s.label} className="bg-[#131a2b] border border-white/[0.06] rounded-xl p-5">
            <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">{s.label}</p>
            <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* Portfolio Value Banner */}
      {portfolioRetail > 0 && (
        <div className="bg-gradient-to-r from-[#131a2b] to-[#0d1220] border border-white/[0.06] rounded-xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">📊 Portfolio Retail Value</p>
            <p className="text-3xl font-bold text-white">{fmtCurrency(portfolioRetail)}</p>
            <p className="text-[11px] text-gray-500 mt-1">
              Based on {appraisals.length} appraisal{appraisals.length !== 1 ? "s" : ""} across your inventory
            </p>
          </div>
          <Link
            to="/appraisals/new"
            className="px-4 py-2 rounded-lg text-sm font-semibold bg-gradient-to-r from-[#3dd45c] to-[#00c9a7] text-black hover:opacity-90 transition-opacity shrink-0"
          >
            🔥 Run New Appraisal
          </Link>
        </div>
      )}

      {/* Quick Actions */}
      <div className="space-y-4">
        <h3 className="text-sm font-semibold text-gray-300">⚡ Quick Actions</h3>
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
          <button
            onClick={() => setShowAdd(true)}
            className="bg-[#131a2b] border border-white/[0.06] rounded-xl p-5 text-left hover:border-[#3dd45c]/30 hover:bg-[#3dd45c]/[0.03] transition-all group"
          >
            <span className="text-2xl mb-2 block">🗃️</span>
            <p className="text-sm font-medium group-hover:text-[#3dd45c] transition-colors">Add a Vehicle</p>
            <p className="text-[11px] text-gray-500 mt-1">Track a new purchase</p>
          </button>
          <Link
            to="/appraisals/new"
            className="bg-[#131a2b] border border-white/[0.06] rounded-xl p-5 text-left hover:border-orange-500/30 hover:bg-orange-500/[0.03] transition-all group"
          >
            <span className="text-2xl mb-2 block">🔥</span>
            <p className="text-sm font-medium group-hover:text-orange-400 transition-colors">Get a Live Appraisal</p>
            <p className="text-[11px] text-gray-500 mt-1">Check market values</p>
          </Link>
          <Link
            to="/marketplace"
            className="bg-[#131a2b] border border-white/[0.06] rounded-xl p-5 text-left hover:border-purple-500/30 hover:bg-purple-500/[0.03] transition-all group"
          >
            <span className="text-2xl mb-2 block">🏪</span>
            <p className="text-sm font-medium group-hover:text-purple-400 transition-colors">Browse Marketplace</p>
            <p className="text-[11px] text-gray-500 mt-1">Find deals nationwide</p>
          </Link>
          <Link
            to="/reports"
            className="bg-[#131a2b] border border-white/[0.06] rounded-xl p-5 text-left hover:border-blue-500/30 hover:bg-blue-500/[0.03] transition-all group"
          >
            <span className="text-2xl mb-2 block">📊</span>
            <p className="text-sm font-medium group-hover:text-blue-400 transition-colors">View Reports</p>
            <p className="text-[11px] text-gray-500 mt-1">Analyze performance</p>
          </Link>
        </div>
      </div>

      {/* Inventory Panels */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Prospects */}
        <div className="bg-[#131a2b] border border-white/[0.06] rounded-xl overflow-hidden">
          <div className="px-5 py-3.5 border-b border-white/[0.06] flex items-center justify-between">
            <h3 className="text-sm font-semibold">Open Prospects</h3>
            <span className="px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-400 text-[11px] font-semibold">{prospects.length}</span>
          </div>
          {prospects.length === 0 ? (
            <div className="px-5 py-10 text-center">
              <p className="text-gray-500 text-sm mb-3">No prospects yet</p>
              <button onClick={() => setShowAdd(true)} className="text-[#3dd45c] text-sm font-medium hover:underline">+ Add a Vehicle</button>
            </div>
          ) : (
            <div className="divide-y divide-white/[0.04]">
              {prospects.slice(0, 5).map((v) => {
                const costs = getVehicleCosts(expenses, v.id);
                const appraisal = getLatestAppraisal(v.id);
                return (
                  <Link key={v.id} to="/inventory/$vehicleId" params={{ vehicleId: v.id }} className="px-5 py-3 flex items-center justify-between hover:bg-white/[0.02] transition-colors">
                    <div>
                      <p className="text-sm font-medium">{vehicleLabel(v)}</p>
                      <p className="text-[11px] text-gray-500">{v.stock_number}</p>
                    </div>
                    <div className="text-right space-y-1">
                      <p className="text-sm text-red-400 font-medium">{costs > 0 ? `-${fmtCurrency(costs)}` : "$0"}</p>
                      {appraisal ? (
                        <MiniValuationRange retail={appraisal.retail} wholesale={appraisal.wholesale} />
                      ) : (
                        <span className="inline-block px-1.5 py-0.5 rounded text-[10px] font-medium bg-purple-500/20 text-purple-400">Prospect</span>
                      )}
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </div>

        {/* Active */}
        <div className="bg-[#131a2b] border border-white/[0.06] rounded-xl overflow-hidden">
          <div className="px-5 py-3.5 border-b border-white/[0.06] flex items-center justify-between">
            <h3 className="text-sm font-semibold">Active Inventory</h3>
            <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 text-[11px] font-semibold">{active.length}</span>
          </div>
          {active.length === 0 ? (
            <div className="px-5 py-10 text-center">
              <p className="text-gray-500 text-sm mb-3">No active listings</p>
              <button onClick={() => setShowAdd(true)} className="text-[#3dd45c] text-sm font-medium hover:underline">+ Add a Vehicle</button>
            </div>
          ) : (
            <div className="divide-y divide-white/[0.04]">
              {active.slice(0, 5).map((v) => {
                const profit = getVehicleProfit(expenses, v.id);
                const appraisal = getLatestAppraisal(v.id);
                return (
                  <Link key={v.id} to="/inventory/$vehicleId" params={{ vehicleId: v.id }} className="px-5 py-3 flex items-center justify-between hover:bg-white/[0.02] transition-colors">
                    <div>
                      <p className="text-sm font-medium">{vehicleLabel(v)}</p>
                      <p className="text-[11px] text-gray-500">{v.stock_number}</p>
                    </div>
                    <div className="text-right space-y-1">
                      <p className={`text-sm font-medium ${profit >= 0 ? "text-emerald-400" : "text-red-400"}`}>{fmtCurrency(profit)}</p>
                      {appraisal ? (
                        <MiniValuationRange retail={appraisal.retail} wholesale={appraisal.wholesale} />
                      ) : (
                        <span className="inline-block px-1.5 py-0.5 rounded text-[10px] font-medium bg-emerald-500/20 text-emerald-400">Active</span>
                      )}
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Recent Appraisals */}
      {appraisals.length > 0 && (
        <div className="bg-[#131a2b] border border-white/[0.06] rounded-xl overflow-hidden">
          <div className="px-5 py-3.5 border-b border-white/[0.06] flex items-center justify-between">
            <h3 className="text-sm font-semibold">🔥 Recent Appraisals</h3>
            <Link to="/appraisals" className="text-xs text-[#3dd45c] hover:underline">View All →</Link>
          </div>
          <div className="divide-y divide-white/[0.04]">
            {appraisals.slice(0, 3).map((a) => (
              <div key={a.id} className="px-5 py-3 flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">{vehicleLabel(a)}</p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-[11px] text-gray-500">{a.miles?.toLocaleString()} mi</span>
                    <span className={`px-1.5 py-0.5 rounded text-[9px] font-semibold uppercase ${
                      a.source === "carsxe" ? "bg-blue-500/15 text-blue-400" : "bg-yellow-500/15 text-yellow-400"
                    }`}>
                      {a.source === "carsxe" ? "Live" : "Est."}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <MiniValuationRange retail={a.retail} wholesale={a.wholesale} />
                  <div className="text-right hidden sm:block">
                    <p className="text-sm font-bold text-white">{fmtCurrency(a.retail)}</p>
                    <p className="text-[10px] text-gray-500">Retail</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <AddVehicleModal open={showAdd} onClose={() => setShowAdd(false)} />
    </div>
  );
}

export const Route = createFileRoute("/")({
  component: DashboardPage,
});
