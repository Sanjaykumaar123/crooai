'use client';

import React, { useState, useEffect } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import DashboardSidebar from '@/components/DashboardSidebar';
import WalletGate from '@/components/WalletGate';
import { BarChart3, TrendingUp, Cpu, Workflow, Layers, ArrowUpRight, ShieldCheck } from 'lucide-react';

export default function AnalyticsPage() {
  const [chartTab, setChartTab] = useState<'revenue' | 'calls' | 'handoffs'>('revenue');

  // Sample analytics logs
  const telemetryLogs = [
    { id: '1', caller: 'Research Agent', target: 'News Agent', task: 'Fetch Breaking DeFi Feed', cost: '0.015 CROO', gasUsed: 48250, executionCost: '0.00024', time: '2 mins ago', status: 'success' },
    { id: '2', caller: 'Research Agent', target: 'Verification Agent', task: 'Audit ERC20 Solidity Digest', cost: '0.018 CROO', gasUsed: 92400, executionCost: '0.00046', time: '14 mins ago', status: 'success' },
    { id: '3', caller: 'Report Agent', target: 'Research Agent', task: 'Compile L2 Scaling Summary', cost: '0.020 CROO', gasUsed: 71200, executionCost: '0.00035', time: '1 hr ago', status: 'success' },
    { id: '4', caller: 'Research Agent', target: 'Analytics Agent', task: 'Calculate Gas Volatility Regression', cost: '0.025 CROO', gasUsed: 54100, executionCost: '0.00027', time: '3 hrs ago', status: 'success' },
    { id: '5', caller: 'Analytics Agent', target: 'Verification Agent', task: 'Audit Input Dataset Hash', cost: '0.018 CROO', gasUsed: 44200, executionCost: '0.00022', time: '4 hrs ago', status: 'success' },
    { id: '6', caller: 'Verification Agent', target: 'Report Agent', task: 'Certify Security Proof Layout', cost: '0.015 CROO', gasUsed: 62100, executionCost: '0.00031', time: '5 hrs ago', status: 'success' },
    { id: '7', caller: 'Code Review Agent', target: 'Verification Agent', task: 'Static Analysis on Pull Request #14', cost: '0.018 CROO', gasUsed: 104500, executionCost: '0.00052', time: '6 hrs ago', status: 'success' },
    { id: '8', caller: 'Research Agent', target: 'News Agent', task: 'Index Trending AI News Outlets', cost: '0.015 CROO', gasUsed: 46100, executionCost: '0.00023', time: '8 hrs ago', status: 'success' },
    { id: '9', caller: 'Research Agent', target: 'Analytics Agent', task: 'Compile Sentiment Data Matrix', cost: '0.025 CROO', gasUsed: 58900, executionCost: '0.00029', time: '10 hrs ago', status: 'success' },
    { id: '10', caller: 'Analytics Agent', target: 'Verification Agent', task: 'Verify Regression Coefficients', cost: '0.018 CROO', gasUsed: 49800, executionCost: '0.00025', time: '12 hrs ago', status: 'success' },
    { id: '11', caller: 'Verification Agent', target: 'Report Agent', task: 'Generate Exec Summary Signature', cost: '0.015 CROO', gasUsed: 64700, executionCost: '0.00032', time: '14 hrs ago', status: 'success' },
    { id: '12', caller: 'Report Agent', target: 'Research Agent', task: 'Search Historical Tokenomics data', cost: '0.020 CROO', gasUsed: 78500, executionCost: '0.00039', time: '16 hrs ago', status: 'success' },
    { id: '13', caller: 'Research Agent', target: 'News Agent', task: 'Aggregate Macro News Feed', cost: '0.015 CROO', gasUsed: 47900, executionCost: '0.00024', time: '18 hrs ago', status: 'success' },
    { id: '14', caller: 'Research Agent', target: 'Analytics Agent', task: 'Plot Macro Event Correlations', cost: '0.025 CROO', gasUsed: 59300, executionCost: '0.00030', time: '20 hrs ago', status: 'success' },
    { id: '15', caller: 'Analytics Agent', target: 'Verification Agent', task: 'Validate Event Date Assertions', cost: '0.018 CROO', gasUsed: 51200, executionCost: '0.00026', time: '22 hrs ago', status: 'success' },
    { id: '16', caller: 'Verification Agent', target: 'Report Agent', task: 'Deliver Signoff Certificate', cost: '0.015 CROO', gasUsed: 63100, executionCost: '0.00031', time: '1 day ago', status: 'success' },
    { id: '17', caller: 'Code Review Agent', target: 'Verification Agent', task: 'Reentrancy Scanning on Wallet.sol', cost: '0.018 CROO', gasUsed: 112000, executionCost: '0.00056', time: '1 day ago', status: 'success' },
    { id: '18', caller: 'Report Agent', target: 'Research Agent', task: 'Search Competitor Roadmap updates', cost: '0.020 CROO', gasUsed: 75400, executionCost: '0.00038', time: '1 day ago', status: 'success' },
    { id: '19', caller: 'Research Agent', target: 'News Agent', task: 'Scrape Developer Forum Posts', cost: '0.015 CROO', gasUsed: 45000, executionCost: '0.00022', time: '2 days ago', status: 'success' },
    { id: '20', caller: 'Research Agent', target: 'Analytics Agent', task: 'Run Developer Growth Projection', cost: '0.025 CROO', gasUsed: 58000, executionCost: '0.00029', time: '2 days ago', status: 'success' },
    { id: '21', caller: 'Analytics Agent', target: 'Verification Agent', task: 'Audit Growth Chart Datapoints', cost: '0.018 CROO', gasUsed: 48900, executionCost: '0.00024', time: '2 days ago', status: 'success' },
    { id: '22', caller: 'Verification Agent', target: 'Report Agent', task: 'Publish Signed HTML Report Code', cost: '0.015 CROO', gasUsed: 65900, executionCost: '0.00033', time: '2 days ago', status: 'success' },
    { id: '23', caller: 'Code Review Agent', target: 'Verification Agent', task: 'Check Mythril Rules on Staking.sol', cost: '0.018 CROO', gasUsed: 109800, executionCost: '0.00055', time: '3 days ago', status: 'success' },
    { id: '24', caller: 'Report Agent', target: 'Research Agent', task: 'Query Global Web3 Regulatory Index', cost: '0.020 CROO', gasUsed: 79200, executionCost: '0.00040', time: '3 days ago', status: 'success' },
    { id: '25', caller: 'Research Agent', target: 'News Agent', task: 'Monitor Real-Time RSS DeFi Feed', cost: '0.015 CROO', gasUsed: 46200, executionCost: '0.00023', time: '3 days ago', status: 'success' }
  ];

  return (
    <WalletGate 
      title="Connect Wallet to View Analytics" 
      description="Connect your Web3 MetaMask wallet to view on-chain network analytics and gas consumption telemetry."
    >
      <div className="flex min-h-screen flex-col bg-[#FFFDF5]">
        <Header />

        <main className="flex-1 mx-auto w-full max-w-[95%] px-4 sm:px-6 lg:px-8 py-10">
          <div className="flex flex-col md:flex-row gap-8">
            
            {/* Dashboard Sidebar */}
            <DashboardSidebar activeTab="analytics" />

            {/* Analytics Dashboard Content */}
            <div className="flex-1 min-w-0 space-y-6">
              
              {/* Page Header */}
              <div>
                <h1 className="font-heading text-2xl font-extrabold text-brand-text-dark flex items-center gap-2">
                  <BarChart3 className="text-brand-yellow" />
                  <span>On-Chain Network Analytics</span>
                </h1>
                <p className="text-xs text-brand-text-muted mt-1">
                  Monitor real-time network volume, growth charts, A2A latency distributions, and revenue settlements.
                </p>
              </div>

              {/* Metrics cards grid */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                  { title: 'Total Volume', value: '4.85 CROO', desc: '+18.4% month-over-month', icon: TrendingUp, color: 'text-amber-500 bg-amber-50' },
                  { title: 'Total API Calls', value: '3,248', desc: '+8.1% weekly increase', icon: Cpu, color: 'text-purple-500 bg-purple-50' },
                  { title: 'A2A Handoffs', value: '840 Tasks', desc: 'Secure peer negotiations', icon: Workflow, color: 'text-indigo-500 bg-indigo-50' },
                  { title: 'Avg SLA Latency', value: '480 ms', desc: 'Optimized execution times', icon: Layers, color: 'text-emerald-500 bg-emerald-50' }
                ].map((m, i) => {
                  const Icon = m.icon;
                  return (
                    <div key={i} className="p-5 glass-card rounded-2xl hover-lift">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold text-brand-text-muted uppercase tracking-wider">{m.title}</span>
                        <div className={`h-8 w-8 rounded-lg flex items-center justify-center ${m.color}`}>
                          <Icon size={16} />
                        </div>
                      </div>
                      <p className="font-heading text-xl font-extrabold text-brand-text-dark mt-4">{m.value}</p>
                      <span className="text-[10px] text-brand-text-muted mt-1 block">{m.desc}</span>
                    </div>
                  );
                })}
              </div>

              {/* Big Interactive Chart Card */}
              <div className="glass-card rounded-2xl p-6 space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b border-neutral-100 pb-4 gap-4">
                  <h3 className="font-heading text-xs font-bold text-brand-text-dark uppercase tracking-wider">Network Growth Charts</h3>
                  
                  {/* Chart Selector Tab */}
                  <div className="flex rounded-xl bg-neutral-50 p-1 border border-neutral-200 self-start">
                    {[
                      { id: 'revenue', label: 'Revenue (CROO)' },
                      { id: 'calls', label: 'API Calls' },
                      { id: 'handoffs', label: 'A2A Activity' }
                    ].map((tab) => (
                      <button
                        key={tab.id}
                        onClick={() => setChartTab(tab.id as any)}
                        className={`rounded-lg px-3.5 py-1.5 text-[10px] font-bold transition-all ${
                          chartTab === tab.id
                            ? 'bg-white text-brand-text-dark shadow-sm'
                            : 'text-brand-text-muted hover:text-brand-text-dark'
                        }`}
                      >
                        {tab.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Chart Canvas Rendering */}
                <div className="h-56 relative w-full pt-4">
                  {chartTab === 'revenue' && (
                    <div className="w-full h-full relative animate-in fade-in duration-300">
                      {/* SVG Line / Bar combo */}
                      <svg className="w-full h-full" viewBox="0 0 500 200" preserveAspectRatio="none">
                        <defs>
                          <linearGradient id="chartGradBlue" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#F59E0B" stopOpacity="0.3" />
                            <stop offset="100%" stopColor="#FFFDF5" stopOpacity="0.0" />
                          </linearGradient>
                        </defs>
                        <line x1="0" y1="50" x2="500" y2="50" stroke="#FFF6D1" strokeWidth="0.5" strokeDasharray="5,5" />
                        <line x1="0" y1="100" x2="500" y2="100" stroke="#FFF6D1" strokeWidth="0.5" strokeDasharray="5,5" />
                        <line x1="0" y1="150" x2="500" y2="150" stroke="#FFF6D1" strokeWidth="0.5" strokeDasharray="5,5" />
                        
                        {/* Curve */}
                        <path
                          d="M 10 160 Q 120 120 250 80 T 490 30"
                          fill="none"
                          stroke="#FBBF24"
                          strokeWidth="3.5"
                        />
                        <path
                          d="M 10 160 Q 120 120 250 80 T 490 30 L 490 200 L 10 200 Z"
                          fill="url(#chartGradBlue)"
                        />
                      </svg>
                      <div className="flex justify-between text-[9px] font-bold text-brand-text-muted mt-2 px-2">
                        <span>Jan</span>
                        <span>Feb</span>
                        <span>Mar</span>
                        <span>Apr</span>
                        <span>May</span>
                        <span>Jun (Current)</span>
                      </div>
                    </div>
                  )}

                  {chartTab === 'calls' && (
                    <div className="w-full h-full relative animate-in fade-in duration-300 flex items-end justify-between px-6 pt-4">
                      {/* SVG Columns representing volume calls */}
                      {[80, 110, 140, 105, 160, 200, 185, 220].map((h, i) => (
                        <div key={i} className="flex flex-col items-center flex-1 mx-2">
                          <div 
                            className="w-full rounded-t-lg bg-brand-yellow/30 border-t border-brand-yellow transition-all duration-500 hover:bg-brand-yellow"
                            style={{ height: `${h * 0.65}px` }}
                          />
                          <span className="text-[9px] font-bold text-brand-text-muted mt-2">W{i + 1}</span>
                        </div>
                      ))}
                    </div>
                  )}

                  {chartTab === 'handoffs' && (
                    <div className="w-full h-full relative animate-in fade-in duration-300">
                      {/* SVG Bezier loops indicating peer triggers */}
                      <svg className="w-full h-full" viewBox="0 0 500 200">
                        <path d="M 50 150 C 150 50, 250 50, 350 150" fill="none" stroke="#FBBF24" strokeWidth="2.5" strokeDasharray="5,5" />
                        <circle cx="50" cy="150" r="6" fill="#FBBF24" />
                        <circle cx="350" cy="150" r="6" fill="#FBBF24" />
                        <circle r="4" fill="#8B5CF6">
                          <animateMotion path="M 50 150 C 150 50, 250 50, 350 150" dur="3s" repeatCount="indefinite" />
                        </circle>
                        <text x="200" y="80" textAnchor="middle" className="fill-brand-text-muted text-[10px] font-semibold">Consensus Trigger Handoff</text>
                      </svg>
                    </div>
                  )}
                </div>
              </div>

              {/* A2A Telemetry audit logs list */}
              <div className="glass-card rounded-2xl p-6">
                <h3 className="font-heading text-xs font-bold text-brand-text-dark uppercase tracking-wider mb-6">A2A Decentralized Call History</h3>
                
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs text-brand-text-muted">
                    <thead>
                      <tr className="border-b border-neutral-100 pb-3 text-brand-text-dark font-bold">
                        <th className="py-3 pr-4">Caller Agent</th>
                        <th className="py-3 px-4">Target Agent</th>
                        <th className="py-3 px-4">Assigned Task Context</th>
                        <th className="py-3 px-4">Handoff Payout</th>
                        <th className="py-3 px-4">Gas Used</th>
                        <th className="py-3 px-4">Execution Cost</th>
                        <th className="py-3 px-4">Consensus Status</th>
                        <th className="py-3 pl-4 text-right">Elapsed Time</th>
                      </tr>
                    </thead>
                    <tbody>
                      {telemetryLogs.map((log) => (
                        <tr key={log.id} className="border-b border-neutral-50 last:border-0 hover:bg-neutral-50/50 transition-colors">
                          <td className="py-3 pr-4 font-bold text-brand-text-dark">{log.caller}</td>
                          <td className="py-3 px-4 font-bold text-brand-text-dark">{log.target}</td>
                          <td className="py-3 px-4">{log.task}</td>
                          <td className="py-3 px-4 font-bold text-brand-text-dark">{log.cost}</td>
                          <td className="py-3 px-4 font-mono text-[11px] font-semibold text-brand-text-dark">{log.gasUsed.toLocaleString('en-US')}</td>
                          <td className="py-3 px-4 font-mono text-[11px] text-brand-yellow font-extrabold">{log.executionCost} CROO</td>
                          <td className="py-3 px-4">
                            <span className="inline-flex items-center space-x-1.5 rounded-full bg-emerald-50 text-emerald-600 px-2 py-0.5 text-[10px] font-bold">
                              <ShieldCheck size={12} />
                              <span>Verified</span>
                            </span>
                          </td>
                          <td className="py-3 pl-4 text-right">{log.time}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

            </div>

          </div>
        </main>

        <Footer />
      </div>
    </WalletGate>
  );
}
