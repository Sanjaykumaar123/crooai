'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import DashboardSidebar from '@/components/DashboardSidebar';
import { useApp } from '@/lib/AppContext';
import WalletGate from '@/components/WalletGate';
import DynamicIcon from '@/components/DynamicIcon';
import Link from 'next/link';
import { 
  ArrowUpRight, 
  ArrowDownLeft, 
  CheckCircle, 
  XCircle, 
  HelpCircle, 
  DollarSign, 
  Activity, 
  Award, 
  Star, 
  Plus, 
  Sliders, 
  Key, 
  Globe,
  UserCheck,
  Terminal,
  Zap
} from 'lucide-react';

function DashboardContent() {
  const router = useRouter();
  const { wallet, agents, transactions, escrows, connectWallet, hireAgent } = useApp();
  const searchParams = useSearchParams();
  const [activeTab, setActiveTab] = useState('dashboard');

  // Custom states for task executions
  const [executingAgentId, setExecutingAgentId] = useState<string | null>(null);
  const [executionFilter, setExecutionFilter] = useState<string | null>(null);
  const [agentInputs, setAgentInputs] = useState<Record<string, any>>({
    'research-agent': {
      topic: 'Electric Vehicle Market in India',
      goal: 'Competitor Analysis',
      depth: 'Detailed',
      output: 'Full Report'
    },
    'code-review-agent': {
      githubUrl: 'https://github.com/Sanjaykumaar123/croo',
      branch: 'main',
      security: true,
      performance: true,
      readability: true,
      gas: true
    },
    'analytics-agent': {
      source: 'https://api.coingecko.com/api/v3/coins/base',
      kpi: true,
      trend: true,
      forecast: false
    },
    'verification-agent': {
      address: '0x307E6918333300eb0e74559744decE8cF37AfC3A',
      factCheck: true,
      security: true,
      consistency: false
    },
    'report-agent': {
      focus: 'Multi-Agent Network Efficiency Metrics',
      format: 'PDF'
    }
  });

  const handleExecuteAgent = async (agentId: string) => {
    if (!wallet.connected) {
      alert('Please connect your wallet first!');
      return;
    }
    setExecutingAgentId(agentId);
    try {
      const result = await hireAgent(agentId);
      if (result.success && result.escrowId) {
        // Save the inputs to local storage for the detail page to optionally read
        const currentInputs = agentInputs[agentId] || {};
        localStorage.setItem(`agentchain_input_${result.escrowId}`, JSON.stringify(currentInputs));
        
        // Redirect to the newly created execution details page
        router.push(`/execution/${result.escrowId}`);
      } else {
        alert(`Execution failed: ${result.error || 'User signature rejected or transaction failed.'}`);
      }
    } catch (err: any) {
      alert(`Execution failed: ${err.message || err.toString()}`);
    } finally {
      setExecutingAgentId(null);
    }
  };

  const handleViewHistory = (agentId: string) => {
    setExecutionFilter(agentId);
    setActiveTab('executions');
  };

  const handleInputChange = (agentId: string, field: string, value: any) => {
    setAgentInputs(prev => ({
      ...prev,
      [agentId]: {
        ...prev[agentId],
        [field]: value
      }
    }));
  };

  useEffect(() => {
    const tab = searchParams.get('tab');
    if (tab) {
      setActiveTab(tab);
    } else {
      setActiveTab('dashboard');
    }
  }, [searchParams]);


  // Calculations for Stats
  const totalEarnings = transactions
    .filter(tx => tx.type === 'hire' || tx.type === 'escrow_release')
    .reduce((acc, curr) => acc + curr.amount, 0);

  const completedTasks = escrows.filter(e => e.taskStatus === 'completed' || e.taskStatus === 'verified').length;
  
  const userAgents = agents.filter(a => a.creator.includes('User') || a.creator.includes('0xAf82'));

  const uniqueHiredAgentIds = Array.from(new Set(escrows.map(e => e.agentId)));
  const hiredAgents = agents.filter(a => uniqueHiredAgentIds.includes(a.id));

  // SVG Chart Data (Revenue over 7 days)
  const revenueData = [
    { day: 'Mon', val: 0.05 },
    { day: 'Tue', val: 0.08 },
    { day: 'Wed', val: 0.12 },
    { day: 'Thu', val: 0.15 },
    { day: 'Fri', val: 0.19 },
    { day: 'Sat', val: 0.22 },
    { day: 'Sun', val: totalEarnings > 0.22 ? totalEarnings : 0.25 }
  ];

  // Helper for status classes
  const getStatusClass = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-emerald-50 text-emerald-600';
      case 'escrowed':
        return 'bg-amber-50 text-amber-600';
      case 'pending':
        return 'bg-blue-50 text-blue-600';
      case 'failed':
        return 'bg-red-50 text-red-600';
      default:
        return 'bg-neutral-50 text-neutral-600';
    }
  };

  return (
    <div className="flex-1 mx-auto w-full max-w-[95%] px-4 sm:px-6 lg:px-8 py-10">
      <div className="flex flex-col md:flex-row gap-8">
        
        {/* Sidebar Nav */}
        <DashboardSidebar activeTab={activeTab} onTabChange={setActiveTab} />

        {/* Dashboard Panels */}
        <div className="flex-1 min-w-0">
          
          {/* VIEW: MAIN DASHBOARD */}
          {activeTab === 'dashboard' && (
            <div className="space-y-8 animate-in fade-in duration-300">
              
              {/* Header Info */}
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <h1 className="font-heading text-2xl font-extrabold text-brand-text-dark">Welcome back, Developer!</h1>
                  <p className="text-xs text-brand-text-muted mt-1">Here is what is happening across your AI agents and on-chain escrows today.</p>
                </div>
                <Link
                  href="/create-agent"
                  className="inline-flex items-center justify-center space-x-1.5 rounded-xl bg-brand-yellow px-5 py-3 text-xs font-bold text-white shadow-premium-soft hover:bg-[#F59E0B] transition-all-300 self-start"
                >
                  <Plus size={14} />
                  <span>Deploy New Agent</span>
                </Link>
              </div>

              {/* Stats Metrics Cards */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                  { title: 'Total Revenue', value: `${totalEarnings.toFixed(3)} CROO`, desc: '+15.2% this week', icon: DollarSign, color: 'text-amber-500 bg-amber-50' },
                  { title: 'Tasks Settled', value: completedTasks + 12, desc: '+3.5% task load', icon: Activity, color: 'text-emerald-500 bg-emerald-50' },
                  { title: 'Success Rate', value: '98.2%', desc: 'SLA maintained', icon: CheckCircle, color: 'text-sky-500 bg-sky-50' },
                  { title: 'Reputation Score', value: '4.8 / 5.0', desc: 'Excellent trust rating', icon: Star, color: 'text-purple-500 bg-purple-50' }
                ].map((stat, idx) => {
                  const Icon = stat.icon;
                  return (
                    <div key={idx} className="p-5 glass-card rounded-2xl hover-lift">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold text-brand-text-muted uppercase tracking-wider">{stat.title}</span>
                        <div className={`h-8 w-8 rounded-lg flex items-center justify-center ${stat.color}`}>
                          <Icon size={16} />
                        </div>
                      </div>
                      <p className="font-heading text-xl font-extrabold text-brand-text-dark mt-4">{stat.value}</p>
                      <span className="text-[10px] text-brand-text-muted mt-1 block">{stat.desc}</span>
                    </div>
                  );
                })}
              </div>

              {/* Charts Section */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* Revenue Chart Card */}
                <div className="lg:col-span-2 p-6 glass-card rounded-2xl">
                  <h3 className="font-heading text-xs font-bold text-brand-text-dark uppercase tracking-wider mb-6">Revenue Growth (CROO)</h3>
                  
                  {/* Custom SVG Line Chart */}
                  <div className="w-full h-48 relative">
                    <svg className="w-full h-full" viewBox="0 0 500 200" preserveAspectRatio="none">
                      <defs>
                        <linearGradient id="chartGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#FBBF24" stopOpacity="0.4" />
                          <stop offset="100%" stopColor="#FFFDF5" stopOpacity="0.0" />
                        </linearGradient>
                      </defs>

                      {/* Grid Lines */}
                      <line x1="0" y1="50" x2="500" y2="50" stroke="#FFF6D1" strokeWidth="0.5" strokeDasharray="5,5" />
                      <line x1="0" y1="100" x2="500" y2="100" stroke="#FFF6D1" strokeWidth="0.5" strokeDasharray="5,5" />
                      <line x1="0" y1="150" x2="500" y2="150" stroke="#FFF6D1" strokeWidth="0.5" strokeDasharray="5,5" />

                      {/* Area Fill */}
                      <path
                        d="M 10 180 Q 80 150 160 120 T 320 80 T 490 50 L 490 180 L 10 180 Z"
                        fill="url(#chartGrad)"
                      />

                      {/* Line Path */}
                      <path
                        d="M 10 180 Q 80 150 160 120 T 320 80 T 490 50"
                        fill="none"
                        stroke="#FBBF24"
                        strokeWidth="3.5"
                        strokeLinecap="round"
                      />

                      {/* Dots on nodes */}
                      <circle cx="160" cy="120" r="4.5" fill="white" stroke="#FBBF24" strokeWidth="2" />
                      <circle cx="320" cy="80" r="4.5" fill="white" stroke="#FBBF24" strokeWidth="2" />
                      <circle cx="490" cy="50" r="4.5" fill="white" stroke="#FBBF24" strokeWidth="2" />
                    </svg>

                    {/* Chart Labels */}
                    <div className="flex justify-between text-[9px] font-bold text-brand-text-muted mt-3 px-2">
                      {revenueData.map((d, i) => <span key={i}>{d.day}</span>)}
                    </div>
                  </div>
                </div>

                {/* Agent Usage Donut Card */}
                <div className="glass-card rounded-2xl p-6 flex flex-col justify-between">
                  <h3 className="font-heading text-xs font-bold text-brand-text-dark uppercase tracking-wider mb-6">Task Distribution</h3>
                  
                  {/* SVG Donut */}
                  <div className="flex justify-center items-center h-32 relative">
                    <svg className="w-28 h-28 transform -rotate-90">
                      <circle cx="56" cy="56" r="40" fill="none" stroke="#F3F4F6" strokeWidth="12" />
                      {/* Research Agent Segment (50%) */}
                      <circle cx="56" cy="56" r="40" fill="none" stroke="#FBBF24" strokeWidth="12" strokeDasharray="251" strokeDashoffset="125" />
                      {/* Analytics Agent Segment (30%) */}
                      <circle cx="56" cy="56" r="40" fill="none" stroke="#60A5FA" strokeWidth="12" strokeDasharray="251" strokeDashoffset="200" className="opacity-90" />
                    </svg>
                    
                    <div className="absolute text-center">
                      <span className="block text-lg font-extrabold text-brand-text-dark">164</span>
                      <span className="text-[9px] text-brand-text-muted uppercase tracking-wider font-bold">Calls</span>
                    </div>
                  </div>

                  {/* Legend */}
                  <div className="mt-4 flex flex-wrap gap-x-4 gap-y-2 justify-center text-[10px] font-semibold">
                    <div className="flex items-center space-x-1">
                      <span className="h-2 w-2 rounded-full bg-brand-yellow" />
                      <span className="text-brand-text-dark">Research</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <span className="h-2 w-2 rounded-full bg-blue-400" />
                      <span className="text-brand-text-dark">Analytics</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <span className="h-2 w-2 rounded-full bg-neutral-300" />
                      <span className="text-brand-text-dark">Others</span>
                    </div>
                  </div>
                </div>

              </div>

              {/* Transactions Table Card */}
              <div className="glass-card rounded-2xl p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="font-heading text-xs font-bold text-brand-text-dark uppercase tracking-wider">Recent Smart Contract Transactions</h3>
                  <button 
                    onClick={() => setActiveTab('transactions')}
                    className="text-xs font-bold text-brand-yellow hover:text-[#F59E0B] transition-colors"
                  >
                    View All
                  </button>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs text-brand-text-muted">
                    <thead>
                      <tr className="border-b border-neutral-100 pb-3 text-brand-text-dark font-bold">
                        <th className="py-3 pr-4">Tx Hash</th>
                        <th className="py-3 px-4">Type</th>
                        <th className="py-3 px-4">Agent</th>
                        <th className="py-3 px-4">Amount</th>
                        <th className="py-3 px-4">Status</th>
                        <th className="py-3 pl-4 text-right">Timestamp</th>
                      </tr>
                    </thead>
                    <tbody>
                      {transactions.slice(0, 5).map((tx) => (
                        <tr key={tx.id} className="border-b border-neutral-50 last:border-0 hover:bg-neutral-50/50 transition-colors">
                          <td className="py-3 pr-4 font-mono font-semibold text-brand-text-dark">{tx.txHash}</td>
                          <td className="py-3 px-4">
                            <span className="inline-flex items-center space-x-1 uppercase text-[9px] font-extrabold tracking-wider text-brand-text-dark">
                              {tx.type === 'deposit' ? <ArrowDownLeft size={10} className="text-emerald-500" /> : <ArrowUpRight size={10} className="text-amber-500" />}
                              <span>{tx.type.replace('_', ' ')}</span>
                            </span>
                          </td>
                          <td className="py-3 px-4 font-bold text-brand-text-dark">{tx.agentName || 'N/A'}</td>
                          <td className="py-3 px-4 font-bold text-brand-text-dark">{tx.amount > 0 ? `${tx.amount} CROO` : '0 CROO'}</td>
                          <td className="py-3 px-4">
                            <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-bold ${getStatusClass(tx.status)}`}>
                              {tx.status}
                            </span>
                          </td>
                          <td className="py-3 pl-4 text-right">{tx.timestamp}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

            </div>
          )}

          {/* VIEW: MY AGENTS */}
          {activeTab === 'my-agents' && (
            <div className="space-y-6 animate-in fade-in duration-300">
              <div>
                <h1 className="font-heading text-2xl font-extrabold text-brand-text-dark">My Registered Agents</h1>
                <p className="text-xs text-brand-text-muted mt-1">Smart contracts and configurations for AI agents you currently run or monetize.</p>
              </div>

              {userAgents.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  {userAgents.map((agent) => (
                    <div key={agent.id} className="glass-card rounded-2xl p-6 hover-lift flex flex-col justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-light-gold text-brand-yellow font-bold">
                          <DynamicIcon name={agent.icon} />
                        </div>
                        <div>
                          <h3 className="font-heading text-sm font-bold text-brand-text-dark">{agent.name}</h3>
                          <span className="text-[10px] text-brand-text-muted uppercase tracking-wider font-bold">{agent.category}</span>
                        </div>
                      </div>
                      <p className="text-xs text-brand-text-muted mt-4">{agent.description}</p>
                      
                      <div className="mt-6 flex justify-between border-t border-neutral-100 pt-4 text-[11px] font-semibold text-brand-text-muted">
                        <div>
                          <span>Tasks Settled</span>
                          <span className="block font-bold text-brand-text-dark">{agent.tasksCompleted}</span>
                        </div>
                        <div>
                          <span>Rate per Request</span>
                          <span className="block font-bold text-brand-yellow">{agent.price} CROO</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="border border-dashed border-gold-soft bg-white rounded-2xl py-16 px-4 text-center">
                  <Award size={40} className="text-brand-yellow mx-auto mb-4" />
                  <h3 className="font-heading text-sm font-bold text-brand-text-dark">No Agents Deployed</h3>
                  <p className="text-xs text-brand-text-muted max-w-sm mx-auto mt-2">
                    You have not registered any custom smart contracts on the AgentChain network. Deploy an agent to start generating revenue.
                  </p>
                  <Link
                    href="/create-agent"
                    className="mt-6 inline-flex items-center space-x-2 rounded-xl bg-brand-yellow px-5 py-2.5 text-xs font-bold text-white shadow-sm"
                  >
                    <Plus size={14} />
                    <span>Create Agent now</span>
                  </Link>
                </div>
              )}
            </div>
          )}

          {/* VIEW: MY HIRED AGENTS */}
          {activeTab === 'hired-agents' && (
            <div className="space-y-6 animate-in fade-in duration-300">
              <div>
                <h1 className="font-heading text-2xl font-extrabold text-brand-text-dark">My AI Workforce</h1>
                <p className="text-xs text-brand-text-muted mt-1">Configure and launch task executions for your hired multi-agent workflows.</p>
              </div>

              {hiredAgents.length > 0 ? (
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                  {hiredAgents.map((agentObj) => {
                    const isExecuting = executingAgentId === agentObj.id;
                    
                    return (
                      <div key={agentObj.id} className="glass-card rounded-3xl p-6 hover-lift border border-gold-soft flex flex-col justify-between bg-white shadow-premium-soft">
                        <div>
                          {/* Card Header */}
                          <div className="flex items-start justify-between border-b border-neutral-100 pb-4">
                            <div className="flex items-center space-x-3">
                              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-light-gold/40 border border-gold-soft/50 text-brand-yellow font-bold">
                                <DynamicIcon name={agentObj.icon || 'Cpu'} className="h-5 w-5" />
                              </div>
                              <div>
                                <h3 className="font-heading text-sm font-extrabold text-brand-text-dark">{agentObj.name}</h3>
                                <span className="text-[10px] text-brand-text-muted font-bold block mt-0.5">
                                  Provider: {'0x' + agentObj.id.substring(0, 6) + '...' + '982c'}
                                </span>
                              </div>
                            </div>
                            <div className="text-right">
                              <span className="inline-flex items-center rounded-full bg-emerald-50 px-2 py-0.5 text-[9px] font-extrabold text-emerald-700">
                                ● Ready
                              </span>
                              <span className="block text-[9px] text-brand-text-muted mt-1 font-bold">
                                Cost: {agentObj.price} CROO
                              </span>
                            </div>
                          </div>

                          {/* Input Fields */}
                          <div className="py-5 space-y-4">
                            <span className="block text-[10px] text-brand-text-muted uppercase tracking-wider font-bold">
                              Task Parameters Input
                            </span>

                            {/* Research Agent Form */}
                            {agentObj.id === 'research-agent' && (
                              <div className="space-y-3">
                                <div>
                                  <label className="block text-[10px] text-brand-text-muted font-bold mb-1">Topic / Subject</label>
                                  <input 
                                    type="text"
                                    value={agentInputs['research-agent']?.topic || ''}
                                    onChange={(e) => handleInputChange('research-agent', 'topic', e.target.value)}
                                    className="w-full text-xs font-semibold px-3 py-2 border border-neutral-200 rounded-lg focus:outline-none focus:border-brand-yellow bg-neutral-50/50"
                                  />
                                </div>
                                <div className="grid grid-cols-2 gap-3">
                                  <div>
                                    <label className="block text-[10px] text-brand-text-muted font-bold mb-1">Goal</label>
                                    <select 
                                      value={agentInputs['research-agent']?.goal || ''}
                                      onChange={(e) => handleInputChange('research-agent', 'goal', e.target.value)}
                                      className="w-full text-xs font-semibold px-3 py-2 border border-neutral-200 rounded-lg focus:outline-none bg-neutral-50/50"
                                    >
                                      <option>Market Research</option>
                                      <option>Competitor Analysis</option>
                                      <option>Trend Analysis</option>
                                    </select>
                                  </div>
                                  <div>
                                    <label className="block text-[10px] text-brand-text-muted font-bold mb-1">Depth</label>
                                    <select 
                                      value={agentInputs['research-agent']?.depth || ''}
                                      onChange={(e) => handleInputChange('research-agent', 'depth', e.target.value)}
                                      className="w-full text-xs font-semibold px-3 py-2 border border-neutral-200 rounded-lg focus:outline-none bg-neutral-50/50"
                                    >
                                      <option>Basic</option>
                                      <option>Detailed</option>
                                    </select>
                                  </div>
                                </div>
                              </div>
                            )}

                            {/* Code Review Agent Form */}
                            {agentObj.id === 'code-review-agent' && (
                              <div className="space-y-3">
                                <div>
                                  <label className="block text-[10px] text-brand-text-muted font-bold mb-1">GitHub Repository URL</label>
                                  <input 
                                    type="text"
                                    value={agentInputs['code-review-agent']?.githubUrl || ''}
                                    onChange={(e) => handleInputChange('code-review-agent', 'githubUrl', e.target.value)}
                                    className="w-full text-xs font-semibold px-3 py-2 border border-neutral-200 rounded-lg focus:outline-none focus:border-brand-yellow bg-neutral-50/50"
                                  />
                                </div>
                                <div className="grid grid-cols-2 gap-3">
                                  <div>
                                    <label className="block text-[10px] text-brand-text-muted font-bold mb-1">Branch</label>
                                    <input 
                                      type="text"
                                      value={agentInputs['code-review-agent']?.branch || ''}
                                      onChange={(e) => handleInputChange('code-review-agent', 'branch', e.target.value)}
                                      className="w-full text-xs font-semibold px-3 py-2 border border-neutral-200 rounded-lg focus:outline-none focus:border-brand-yellow bg-neutral-50/50"
                                    />
                                  </div>
                                  <div>
                                    <label className="block text-[10px] text-brand-text-muted font-bold mb-1">Review Level</label>
                                    <div className="text-xs font-bold text-brand-text-dark px-3 py-2 border border-neutral-200 rounded-lg bg-neutral-50 flex items-center space-x-1.5 h-[34px]">
                                      <Activity size={12} className="text-brand-yellow" />
                                      <span>Instant Swarm Audit</span>
                                    </div>
                                  </div>
                                </div>
                                
                                {/* Checkboxes */}
                                <div className="space-y-1 pt-1">
                                  <label className="block text-[10px] text-brand-text-muted font-bold mb-1">Review Types</label>
                                  <div className="grid grid-cols-2 gap-2 text-xs font-semibold text-brand-text-dark">
                                    {['security', 'performance', 'readability', 'gas'].map((type) => (
                                      <label key={type} className="flex items-center space-x-2 cursor-pointer">
                                        <input 
                                          type="checkbox"
                                          checked={!!agentInputs['code-review-agent']?.[type]}
                                          onChange={(e) => handleInputChange('code-review-agent', type, e.target.checked)}
                                          className="rounded border-neutral-300 text-brand-yellow focus:ring-brand-yellow"
                                        />
                                        <span className="capitalize">{type === 'gas' ? 'Gas Optimization' : type}</span>
                                      </label>
                                    ))}
                                  </div>
                                </div>
                              </div>
                            )}

                            {/* Analytics Agent Form */}
                            {agentObj.id === 'analytics-agent' && (
                              <div className="space-y-3">
                                <div>
                                  <label className="block text-[10px] text-brand-text-muted font-bold mb-1">Data Source API / JSON Endpoint</label>
                                  <input 
                                    type="text"
                                    value={agentInputs['analytics-agent']?.source || ''}
                                    onChange={(e) => handleInputChange('analytics-agent', 'source', e.target.value)}
                                    className="w-full text-xs font-semibold px-3 py-2 border border-neutral-200 rounded-lg focus:outline-none focus:border-brand-yellow bg-neutral-50/50"
                                  />
                                </div>
                                <div className="space-y-1">
                                  <label className="block text-[10px] text-brand-text-muted font-bold mb-1">Analysis Types</label>
                                  <div className="flex space-x-4 text-xs font-semibold text-brand-text-dark">
                                    {['kpi', 'trend', 'forecast'].map((type) => (
                                      <label key={type} className="flex items-center space-x-2 cursor-pointer">
                                        <input 
                                          type="checkbox"
                                          checked={!!agentInputs['analytics-agent']?.[type]}
                                          onChange={(e) => handleInputChange('analytics-agent', type, e.target.checked)}
                                          className="rounded border-neutral-300 text-brand-yellow focus:ring-brand-yellow"
                                        />
                                        <span className="capitalize">{type}</span>
                                      </label>
                                    ))}
                                  </div>
                                </div>
                              </div>
                            )}

                            {/* Verification Agent Form */}
                            {agentObj.id === 'verification-agent' && (
                              <div className="space-y-3">
                                <div>
                                  <label className="block text-[10px] text-brand-text-muted font-bold mb-1">Smart Contract Address</label>
                                  <input 
                                    type="text"
                                    value={agentInputs['verification-agent']?.address || ''}
                                    onChange={(e) => handleInputChange('verification-agent', 'address', e.target.value)}
                                    className="w-full text-xs font-semibold px-3 py-2 border border-neutral-200 rounded-lg focus:outline-none focus:border-brand-yellow bg-neutral-50/50 font-mono"
                                  />
                                </div>
                                <div className="space-y-1">
                                  <label className="block text-[10px] text-brand-text-muted font-bold mb-1">Verification Rules</label>
                                  <div className="grid grid-cols-3 gap-2 text-xs font-semibold text-brand-text-dark">
                                    {['factCheck', 'security', 'consistency'].map((type) => (
                                      <label key={type} className="flex items-center space-x-1.5 cursor-pointer">
                                        <input 
                                          type="checkbox"
                                          checked={!!agentInputs['verification-agent']?.[type]}
                                          onChange={(e) => handleInputChange('verification-agent', type, e.target.checked)}
                                          className="rounded border-neutral-300 text-brand-yellow focus:ring-brand-yellow"
                                        />
                                        <span className="capitalize">{type === 'factCheck' ? 'Fact Check' : type === 'security' ? 'Security' : 'Consistency'}</span>
                                      </label>
                                    ))}
                                  </div>
                                </div>
                              </div>
                            )}

                            {/* Report Agent Form */}
                            {agentObj.id === 'report-agent' && (
                              <div className="space-y-3">
                                <div>
                                  <label className="block text-[10px] text-brand-text-muted font-bold mb-1">Report Focus/Topic</label>
                                  <input 
                                    type="text"
                                    value={agentInputs['report-agent']?.focus || ''}
                                    onChange={(e) => handleInputChange('report-agent', 'focus', e.target.value)}
                                    className="w-full text-xs font-semibold px-3 py-2 border border-neutral-200 rounded-lg focus:outline-none focus:border-brand-yellow bg-neutral-50/50"
                                  />
                                </div>
                                <div>
                                  <label className="block text-[10px] text-brand-text-muted font-bold mb-1">Format Template</label>
                                  <select 
                                    value={agentInputs['report-agent']?.format || ''}
                                    onChange={(e) => handleInputChange('report-agent', 'format', e.target.value)}
                                    className="w-full text-xs font-semibold px-3 py-2 border border-neutral-200 rounded-lg focus:outline-none bg-neutral-50/50"
                                  >
                                    <option>PDF</option>
                                    <option>Markdown</option>
                                    <option>HTML</option>
                                  </select>
                                </div>
                              </div>
                            )}

                          </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="mt-6 pt-4 border-t border-neutral-100 flex items-center justify-between gap-4">
                          <button
                            onClick={() => handleViewHistory(agentObj.id)}
                            className="flex-1 inline-flex items-center justify-center space-x-1.5 rounded-xl border border-gold-soft/60 bg-white py-2.5 text-xs font-bold text-brand-text-muted hover:bg-neutral-50 transition-all"
                          >
                            <Activity size={14} />
                            <span>Execution History</span>
                          </button>

                          <button
                            onClick={() => handleExecuteAgent(agentObj.id)}
                            disabled={isExecuting}
                            className="flex-1 inline-flex items-center justify-center space-x-1.5 rounded-xl bg-brand-yellow text-white py-2.5 text-xs font-bold shadow-premium-soft hover:bg-[#F59E0B] disabled:bg-neutral-200 disabled:text-neutral-400 disabled:shadow-none transition-all"
                          >
                            {isExecuting ? (
                              <>
                                <div className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                                <span>Locking Escrow...</span>
                              </>
                            ) : (
                              <>
                                <Zap size={14} className="fill-white" />
                                <span>Execute Agent</span>
                              </>
                            )}
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="border border-dashed border-gold-soft bg-white rounded-2xl py-16 px-4 text-center">
                  <UserCheck size={40} className="text-brand-yellow mx-auto mb-4" />
                  <h3 className="font-heading text-sm font-bold text-brand-text-dark">No Hired Agents Yet</h3>
                  <p className="text-xs text-brand-text-muted max-w-sm mx-auto mt-2">
                    Hire decentralized AI specialists from the marketplace to run complex tasks on-chain.
                  </p>
                  <Link
                    href="/marketplace"
                    className="mt-6 inline-flex items-center space-x-2 rounded-xl bg-brand-yellow px-5 py-2.5 text-xs font-bold text-white shadow-sm"
                  >
                    <span>Browse Marketplace</span>
                  </Link>
                </div>
              )}
            </div>
          )}

          {/* VIEW: EXECUTIONS */}
          {activeTab === 'executions' && (
            <div className="space-y-6 animate-in fade-in duration-300">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <h1 className="font-heading text-2xl font-extrabold text-brand-text-dark">Execution Logs</h1>
                  <p className="text-xs text-brand-text-muted mt-1">Audit trail of multi-agent swarm runtimes and secure cryptographic proofs.</p>
                </div>
                {executionFilter && (
                  <div className="flex items-center space-x-2 bg-brand-light-gold/30 border border-gold-soft/50 rounded-xl px-4 py-2 self-start text-xs font-bold text-brand-text-dark">
                    <span>Filtering: {agents.find(a => a.id === executionFilter)?.name}</span>
                    <button 
                      onClick={() => setExecutionFilter(null)}
                      className="text-neutral-400 hover:text-neutral-600 transition-colors ml-1 p-0.5"
                    >
                      <XCircle size={14} className="fill-neutral-100" />
                    </button>
                  </div>
                )}
              </div>

              {(() => {
                const filteredEscrows = executionFilter 
                  ? escrows.filter(e => e.agentId === executionFilter)
                  : escrows;

                return filteredEscrows.length > 0 ? (
                  <div className="bg-white border border-gold-soft rounded-2xl p-6 shadow-premium-soft space-y-4">
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-xs text-brand-text-muted">
                        <thead>
                          <tr className="border-b border-neutral-100 pb-3 text-brand-text-dark font-bold">
                            <th className="py-3 pr-4">Execution ID</th>
                            <th className="py-3 px-4">AI Agent</th>
                            <th className="py-3 px-4">Status</th>
                            <th className="py-3 px-4">Escrow Status</th>
                            <th className="py-3 px-4">Verification Report</th>
                            <th className="py-3 pl-4 text-right">Details</th>
                          </tr>
                        </thead>
                        <tbody>
                          {filteredEscrows.map((escrow, index) => {
                            const isCompleted = escrow.taskStatus === 'completed' || escrow.taskStatus === 'verified';
                            return (
                              <tr key={escrow.id} className="border-b border-neutral-50 last:border-0 hover:bg-neutral-50/50 transition-colors">
                                <td className="py-3 pr-4 font-mono font-bold text-brand-text-dark">
                                  Exec #{142 + index}
                                </td>
                                <td className="py-3 px-4 font-bold text-brand-text-dark">
                                  {escrow.agentName}
                                </td>
                                <td className="py-3 px-4">
                                  <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[10px] font-bold ${
                                    isCompleted ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'
                                  }`}>
                                    {isCompleted ? 'Completed' : 'Running'}
                                  </span>
                                </td>
                                <td className="py-3 px-4 font-semibold">
                                  {escrow.status === 'released' ? 'Released' : escrow.status === 'refunded' ? 'Refunded' : 'Locked'}
                                </td>
                                <td className="py-3 px-4">
                                  <span className="font-medium text-brand-text-dark">
                                    {isCompleted ? '✓ Available' : '⌛ In Progress'}
                                  </span>
                                </td>
                                <td className="py-3 pl-4 text-right">
                                  <Link
                                    href={`/execution/${escrow.id}`}
                                    className="inline-flex items-center space-x-1 text-xs font-bold text-brand-yellow hover:underline"
                                  >
                                    <span>View Report</span>
                                    <ArrowUpRight size={12} />
                                  </Link>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>
                ) : (
                  <div className="border border-dashed border-gold-soft bg-white rounded-2xl py-16 px-4 text-center">
                    <Terminal size={40} className="text-brand-yellow mx-auto mb-4" />
                    <h3 className="font-heading text-sm font-bold text-brand-text-dark">No Swarm Executions Detected</h3>
                    <p className="text-xs text-brand-text-muted max-w-sm mx-auto mt-2">
                      {executionFilter 
                        ? "No executions found matching the selected agent filter."
                        : "Execution feeds are populated dynamically once an autonomous on-chain transaction is broadcasted."
                      }
                    </p>
                    {executionFilter && (
                      <button
                        onClick={() => setExecutionFilter(null)}
                        className="mt-4 inline-flex items-center space-x-1 rounded-xl bg-brand-yellow px-4 py-2 text-xs font-bold text-white shadow-sm"
                      >
                        Clear Filter
                      </button>
                    )}
                  </div>
                );
              })()}
            </div>
          )}

          {/* VIEW: TRANSACTIONS */}
          {activeTab === 'transactions' && (
            <div className="space-y-6 animate-in fade-in duration-300">
              <div>
                <h1 className="font-heading text-2xl font-extrabold text-brand-text-dark">Transaction Ledger</h1>
                <p className="text-xs text-brand-text-muted mt-1">Full cryptographic audit logs of locked, pending, and released payments.</p>
              </div>

              <div className="bg-white border border-gold-soft rounded-2xl p-6 shadow-premium-soft">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs text-brand-text-muted">
                    <thead>
                      <tr className="border-b border-neutral-100 pb-3 text-brand-text-dark font-bold">
                        <th className="py-3 pr-4">Tx Hash</th>
                        <th className="py-3 px-4">Type</th>
                        <th className="py-3 px-4">Agent Name</th>
                        <th className="py-3 px-4">Amount</th>
                        <th className="py-3 px-4">Status</th>
                        <th className="py-3 pl-4 text-right">Timestamp</th>
                      </tr>
                    </thead>
                    <tbody>
                      {transactions.map((tx) => (
                        <tr key={tx.id} className="border-b border-neutral-50 last:border-0 hover:bg-neutral-50/50 transition-colors">
                          <td className="py-3 pr-4 font-mono font-semibold text-brand-text-dark">{tx.txHash}</td>
                          <td className="py-3 px-4">
                            <span className="inline-flex items-center space-x-1 uppercase text-[9px] font-extrabold tracking-wider text-brand-text-dark">
                              {tx.type === 'deposit' ? <ArrowDownLeft size={10} className="text-emerald-500" /> : <ArrowUpRight size={10} className="text-amber-500" />}
                              <span>{tx.type.replace('_', ' ')}</span>
                            </span>
                          </td>
                          <td className="py-3 px-4 font-bold text-brand-text-dark">{tx.agentName || 'N/A'}</td>
                          <td className="py-3 px-4 font-bold text-brand-text-dark">{tx.amount > 0 ? `${tx.amount} CROO` : '0 CROO'}</td>
                          <td className="py-3 px-4">
                            <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-bold ${getStatusClass(tx.status)}`}>
                              {tx.status}
                            </span>
                          </td>
                          <td className="py-3 pl-4 text-right">{tx.timestamp}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* VIEW: SETTINGS */}
          {activeTab === 'settings' && (
            <div className="space-y-6 animate-in fade-in duration-300">
              <div>
                <h1 className="font-heading text-2xl font-extrabold text-brand-text-dark">Account Settings</h1>
                <p className="text-xs text-brand-text-muted mt-1">Configure your RPC endpoints, dev keys, and wallet hooks.</p>
              </div>

              <div className="bg-white border border-gold-soft rounded-2xl p-6 shadow-premium-soft space-y-6">
                
                {/* Section 1 */}
                <div className="pb-6 border-b border-neutral-100">
                  <h3 className="font-heading text-sm font-bold text-brand-text-dark mb-4 flex items-center space-x-2">
                    <Key size={16} className="text-brand-yellow" />
                    <span>Developer Keys</span>
                  </h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-wider text-brand-text-muted mb-2">AgentChain Private SDK Key</label>
                      <div className="flex gap-2">
                        <input
                          type="password"
                          value="••••••••••••••••••••••••••••••••"
                          disabled
                          className="flex-1 rounded-xl border border-neutral-200 py-2.5 px-4 text-xs bg-neutral-50 text-neutral-400"
                        />
                        <button className="rounded-xl border border-neutral-200 px-4 text-xs font-bold text-brand-text-dark hover:bg-neutral-50">
                          Reveal
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Section 2 */}
                <div>
                  <h3 className="font-heading text-sm font-bold text-brand-text-dark mb-4 flex items-center space-x-2">
                    <Globe size={16} className="text-brand-yellow" />
                    <span>RPC Endpoint Configuration</span>
                  </h3>
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-brand-text-muted mb-2">Ethereum/Casper L2 Network RPC</label>
                    <input
                      type="text"
                      defaultValue="https://node.agentchain.network/v1/rpc"
                      className="w-full rounded-xl border border-neutral-200 py-2.5 px-4 text-xs focus:border-brand-yellow focus:outline-none"
                    />
                  </div>
                </div>

                {/* Save Button */}
                <div className="pt-4 flex justify-end">
                  <button 
                    onClick={() => alert('Settings successfully updated.')}
                    className="rounded-xl bg-brand-yellow px-5 py-2.5 text-xs font-bold text-white shadow-sm hover:bg-[#F59E0B] transition-all"
                  >
                    Save Changes
                  </button>
                </div>

              </div>
            </div>
          )}

        </div>

      </div>
    </div>
  );
}

export default function DashboardPage() {
  return (
    <WalletGate 
      title="Connect Wallet to View Dashboard" 
      description="Connect your Web3 MetaMask wallet to view your registered agents, on-chain revenue statistics, hired freelancers, and configuration settings."
    >
      <div className="flex min-h-screen flex-col bg-[#FFFDF5]">
        <Header />
        <Suspense fallback={
          <div className="flex-1 flex items-center justify-center">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-brand-yellow border-t-transparent" />
          </div>
        }>
          <DashboardContent />
        </Suspense>
        <Footer />
      </div>
    </WalletGate>
  );
}
