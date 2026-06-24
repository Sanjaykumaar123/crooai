'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { useApp } from '@/lib/AppContext';
import DynamicIcon from '@/components/DynamicIcon';
import { 
  Star, 
  Award, 
  ChevronRight, 
  ArrowLeft, 
  Check, 
  ShieldCheck, 
  Cpu, 
  TrendingUp, 
  Zap, 
  Play, 
  Lock, 
  Activity, 
  AlertTriangle 
} from 'lucide-react';

export default function AgentDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const { agents, hireAgent, wallet } = useApp();
  const [activeTab, setActiveTab] = useState<'overview' | 'capabilities' | 'how-it-works' | 'reviews' | 'history' | 'dependencies'>('overview');
  const [isHiring, setIsHiring] = useState(false);
  const [hired, setHired] = useState(false);

  const agentId = params.id as string;
  const agent = agents.find((a) => a.id === agentId);

  if (!agent) {
    return (
      <div className="flex min-h-screen flex-col bg-[#FFFDF5]">
        <Header />
        <main className="flex-1 flex flex-col items-center justify-center py-20 px-4 text-center">
          <AlertTriangle className="h-14 w-14 text-brand-yellow mb-4" />
          <h2 className="font-heading text-2xl font-extrabold text-brand-text-dark">Agent Not Found</h2>
          <p className="text-xs text-brand-text-muted mt-2">The AI agent with identifier &quot;{agentId}&quot; could not be resolved.</p>
          <Link href="/marketplace" className="mt-6 rounded-xl bg-brand-yellow px-5 py-2.5 text-xs font-bold text-white shadow-md">
            Return to Marketplace
          </Link>
        </main>
        <Footer />
      </div>
    );
  }

  const handleHireClick = async () => {
    if (!wallet.connected) {
      alert('Please connect your wallet first!');
      return;
    }

    setIsHiring(true);
    // Simulate smart contract transactions
    await new Promise((resolve) => setTimeout(resolve, 1500));
    const success = hireAgent(agent.id);
    setIsHiring(false);

    if (success) {
      setHired(true);
      setTimeout(() => setHired(false), 3000);
      router.push('/escrow'); // Redirect to escrow page
    }
  };

  const getDependencyDetails = (depId: string) => {
    return agents.find((a) => a.id === depId);
  };

  const tabs = [
    { id: 'overview', name: 'Overview' },
    { id: 'capabilities', name: 'Capabilities' },
    { id: 'how-it-works', name: 'How It Works' },
    { id: 'reviews', name: 'Reviews' },
    { id: 'history', name: 'Execution History' },
    { id: 'dependencies', name: 'Agent Dependencies' }
  ];

  return (
    <div className="flex min-h-screen flex-col bg-[#FFFDF5]">
      <Header />

      <main className="flex-1 mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 py-10">
        
        {/* Back Link */}
        <Link
          href="/marketplace"
          className="inline-flex items-center space-x-2 text-xs font-bold text-brand-text-muted hover:text-brand-text-dark mb-8 group transition-colors"
        >
          <ArrowLeft size={14} className="group-hover:-translate-x-1 transition-transform" />
          <span>Back to Marketplace</span>
        </Link>

        {/* Large Header Section */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start bg-white border border-gold-soft rounded-2xl p-8 shadow-premium-soft mb-8">
          
          {/* Avatar and Name */}
          <div className="lg:col-span-8 flex flex-col sm:flex-row items-center sm:items-start gap-6">
            <div className="flex h-24 w-24 shrink-0 items-center justify-center rounded-2xl border border-gold-soft bg-brand-light-gold/20 text-brand-yellow shadow-sm">
              <DynamicIcon name={agent.icon} size={48} />
            </div>

            <div className="text-center sm:text-left space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                <h1 className="font-heading text-2xl sm:text-3xl font-extrabold tracking-tight text-brand-text-dark">
                  {agent.name}
                </h1>
                {agent.verified && (
                  <div className="inline-flex items-center space-x-1 self-center rounded-full bg-emerald-50 border border-emerald-100 px-2.5 py-0.5 text-[10px] font-bold text-emerald-600">
                    <ShieldCheck size={12} />
                    <span>Verified Developer</span>
                  </div>
                )}
              </div>

              <p className="text-xs text-brand-text-muted">
                Created by <span className="font-semibold text-brand-text-dark">{agent.creator}</span> | Registered {agent.createdDate}
              </p>

              <p className="text-xs sm:text-sm text-brand-text-muted max-w-xl leading-relaxed">
                {agent.description}
              </p>

              <div className="flex flex-wrap justify-center sm:justify-start gap-4 pt-1">
                <div className="flex items-center space-x-1 text-xs">
                  <Star className="h-4.5 w-4.5 fill-amber-400 text-amber-400" />
                  <span className="font-bold text-brand-text-dark">{agent.rating.toFixed(1)}</span>
                  <span className="text-brand-text-muted">({agent.reviewsCount} reviews)</span>
                </div>
                <div className="text-brand-text-muted hidden sm:block">•</div>
                <div className="text-xs text-brand-text-muted">
                  Tasks Completed: <span className="font-bold text-brand-text-dark">{agent.tasksCompleted}</span>
                </div>
                <div className="text-brand-text-muted hidden sm:block">•</div>
                <div className="text-xs text-brand-text-muted">
                  Success Rate: <span className="font-bold text-emerald-600">{agent.successRate}%</span>
                </div>
              </div>
            </div>
          </div>

          {/* Pricing Card & CTA */}
          <div className="lg:col-span-4 w-full border border-gold-soft bg-gold-light-gold/10 rounded-2xl p-6 shadow-sm flex flex-col justify-between h-full">
            <div>
              <span className="block text-[10px] text-brand-text-muted uppercase tracking-wider font-bold">Execution Cost</span>
              <div className="flex items-baseline space-x-2 mt-2">
                <span className="font-heading text-3xl font-extrabold text-brand-text-dark">
                  {agent.price}
                </span>
                <span className="text-sm font-bold text-brand-yellow">CROO / Task</span>
              </div>
              <p className="text-[10px] text-brand-text-muted mt-2 leading-relaxed">
                *Funds are locked in a secure smart escrow contract. The creator is only paid after task verification.
              </p>
            </div>

            <div className="mt-6 space-y-3">
              <button
                onClick={handleHireClick}
                disabled={isHiring}
                className={`flex w-full items-center justify-center space-x-2 rounded-xl py-3.5 text-xs font-bold transition-all duration-300 ${
                  hired
                    ? 'bg-emerald-500 text-white'
                    : 'bg-brand-yellow hover:bg-[#F59E0B] text-white shadow-premium-soft'
                } active:scale-95`}
              >
                {isHiring ? (
                  <div className="h-4.5 w-4.5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                ) : hired ? (
                  <>
                    <Check size={14} />
                    <span>Hired successfully!</span>
                  </>
                ) : (
                  <>
                    <Play size={14} className="fill-current" />
                    <span>Hire {agent.name}</span>
                  </>
                )}
              </button>

              <button
                className="w-full flex items-center justify-center rounded-xl border border-gold-soft bg-white py-3 text-xs font-bold text-brand-text-dark hover:bg-neutral-50 shadow-sm transition-colors"
              >
                Add to Watchlist
              </button>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="border-b border-gold-soft mb-8 flex flex-wrap gap-2">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-4 py-3 text-xs font-bold border-b-2 transition-all ${
                activeTab === tab.id
                  ? 'border-brand-yellow text-brand-text-dark font-extrabold'
                  : 'border-transparent text-brand-text-muted hover:text-brand-text-dark'
              }`}
            >
              {tab.name}
            </button>
          ))}
        </div>

        {/* Tab Panel Content */}
        <div className="bg-white border border-gold-soft rounded-2xl p-8 shadow-premium-soft min-h-[300px]">
          
          {/* Overview Panel */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              <div>
                <h3 className="font-heading text-lg font-bold text-brand-text-dark mb-3">About this Agent</h3>
                <p className="text-xs sm:text-sm text-brand-text-muted leading-relaxed whitespace-pre-line">
                  {agent.longDescription || agent.description}
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 border-t border-neutral-100 pt-6">
                <div>
                  <span className="block text-[10px] text-brand-text-muted uppercase tracking-wider font-bold">Category</span>
                  <span className="text-xs font-bold text-brand-text-dark block mt-1">{agent.category}</span>
                </div>
                <div>
                  <span className="block text-[10px] text-brand-text-muted uppercase tracking-wider font-bold">Rating Score</span>
                  <span className="text-xs font-bold text-brand-text-dark flex items-center space-x-1 mt-1">
                    <Star size={14} className="fill-amber-400 text-amber-400" />
                    <span>{agent.rating.toFixed(1)} / 5.0</span>
                  </span>
                </div>
                <div>
                  <span className="block text-[10px] text-brand-text-muted uppercase tracking-wider font-bold">Standard SLA</span>
                  <span className="text-xs font-bold text-brand-text-dark block mt-1">Execution &lt; 3 mins</span>
                </div>
              </div>
            </div>
          )}

          {/* Capabilities Panel */}
          {activeTab === 'capabilities' && (
            <div>
              <h3 className="font-heading text-lg font-bold text-brand-text-dark mb-4">Core Skills & Capabilities</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {agent.capabilities.map((cap, i) => (
                  <div key={i} className="flex items-center space-x-3 rounded-xl border border-gold-soft/50 p-4 bg-brand-light-gold/10">
                    <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-brand-yellow/20 text-brand-yellow font-bold text-xs">
                      {i + 1}
                    </div>
                    <span className="text-xs font-bold text-brand-text-dark">{cap}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* How It Works Panel */}
          {activeTab === 'how-it-works' && (
            <div>
              <h3 className="font-heading text-lg font-bold text-brand-text-dark mb-6">Workflow Step Timeline</h3>
              <div className="relative border-l border-brand-yellow/30 pl-6 ml-4 space-y-8">
                {agent.howItWorks.map((step, i) => (
                  <div key={i} className="relative">
                    {/* Circle Icon */}
                    <div className="absolute -left-10 top-0.5 flex h-7 w-7 items-center justify-center rounded-full bg-brand-yellow text-xs font-bold text-white shadow-sm">
                      {i + 1}
                    </div>
                    <div>
                      <h4 className="font-heading text-xs font-bold text-brand-text-dark uppercase tracking-wider">Step {i + 1}</h4>
                      <p className="text-xs text-brand-text-muted mt-1 leading-relaxed">{step}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Reviews Panel */}
          {activeTab === 'reviews' && (
            <div>
              <h3 className="font-heading text-lg font-bold text-brand-text-dark mb-6">User Reviews</h3>
              {agent.reviews.length > 0 ? (
                <div className="space-y-6">
                  {agent.reviews.map((rev) => (
                    <div key={rev.id} className="border-b border-neutral-100 pb-6 last:border-0 last:pb-0">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-light-gold text-brand-yellow font-bold text-xs">
                            {rev.user.substring(0, 1)}
                          </div>
                          <div>
                            <span className="text-xs font-bold text-brand-text-dark">{rev.user}</span>
                            <span className="block text-[10px] text-brand-text-muted">{rev.date}</span>
                          </div>
                        </div>
                        <div className="flex items-center space-x-1">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              size={12}
                              className={i < rev.rating ? 'fill-amber-400 text-amber-400' : 'text-neutral-200'}
                            />
                          ))}
                        </div>
                      </div>
                      <p className="text-xs text-brand-text-muted mt-3 leading-relaxed">
                        {rev.comment}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-brand-text-muted">No reviews have been written for this agent yet.</p>
              )}
            </div>
          )}

          {/* History Panel */}
          {activeTab === 'history' && (
            <div>
              <h3 className="font-heading text-lg font-bold text-brand-text-dark mb-4">On-Chain Execution History</h3>
              {agent.history.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs text-brand-text-muted">
                    <thead>
                      <tr className="border-b border-neutral-100 pb-3 text-brand-text-dark font-bold">
                        <th className="py-3 pr-4">Task Name</th>
                        <th className="py-3 px-4">Caller</th>
                        <th className="py-3 px-4">Fee Paid</th>
                        <th className="py-3 px-4">Status</th>
                        <th className="py-3 pl-4">Timestamp</th>
                      </tr>
                    </thead>
                    <tbody>
                      {agent.history.map((hist) => (
                        <tr key={hist.id} className="border-b border-neutral-50 last:border-0 hover:bg-neutral-50/50 transition-colors">
                          <td className="py-3 pr-4 font-bold text-brand-text-dark">{hist.taskName}</td>
                          <td className="py-3 px-4 font-mono text-[10px]">{hist.caller}</td>
                          <td className="py-3 px-4 font-bold text-brand-text-dark">{hist.cost} CROO</td>
                          <td className="py-3 px-4">
                            <span className={`inline-flex items-center space-x-1 rounded-full px-2 py-0.5 text-[10px] font-bold ${
                              hist.status === 'completed'
                                ? 'bg-emerald-50 text-emerald-600'
                                : hist.status === 'running'
                                ? 'bg-amber-50 text-amber-600 animate-pulse'
                                : 'bg-red-50 text-red-600'
                            }`}>
                              <span>{hist.status}</span>
                            </span>
                          </td>
                          <td className="py-3 pl-4">{hist.timestamp}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="text-xs text-brand-text-muted">No historical executions have been logged for this agent.</p>
              )}
            </div>
          )}

          {/* Dependencies Graph Panel */}
          {activeTab === 'dependencies' && (
            <div>
              <h3 className="font-heading text-lg font-bold text-brand-text-dark mb-4">Agent Dependencies</h3>
              <p className="text-xs text-brand-text-muted mb-8 leading-relaxed">
                This agent makes sub-calls to the following helper agents. Real-time settlements and handoffs occur programmatically.
              </p>

              {agent.dependencies.length > 0 ? (
                <div className="flex flex-col md:flex-row items-center justify-center gap-8 py-8">
                  {/* Subject Agent */}
                  <div className="flex flex-col items-center justify-center p-6 border-2 border-brand-yellow rounded-2xl bg-brand-light-gold/10 w-44 text-center shadow-md">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-brand-yellow text-white mb-3">
                      <DynamicIcon name={agent.icon} size={24} />
                    </div>
                    <span className="text-xs font-bold text-brand-text-dark block">{agent.name}</span>
                    <span className="text-[9px] text-brand-yellow uppercase tracking-wider font-extrabold mt-1">Main Caller</span>
                  </div>

                  {/* Flow Arrow */}
                  <div className="flex flex-col items-center shrink-0">
                    <div className="text-[10px] font-semibold text-brand-yellow mb-1 font-mono">Delegates to</div>
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-light-gold text-brand-yellow border border-gold-soft font-bold">
                      ➔
                    </div>
                  </div>

                  {/* Dependency Agents */}
                  <div className="flex flex-col gap-4">
                    {agent.dependencies.map((depId) => {
                      const depAgent = getDependencyDetails(depId);
                      if (!depAgent) return null;
                      return (
                        <Link
                          href={`/agent/${depAgent.id}`}
                          key={depAgent.id}
                          className="flex items-center space-x-4 p-4 border border-gold-soft bg-white hover:bg-neutral-50 rounded-xl transition-all-300 w-64 shadow-sm hover:shadow-md cursor-pointer"
                        >
                          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-neutral-100 text-brand-text-dark">
                            <DynamicIcon name={depAgent.icon} size={20} />
                          </div>
                          <div>
                            <span className="text-xs font-bold text-brand-text-dark block">{depAgent.name}</span>
                            <span className="text-[10px] text-brand-text-muted block mt-0.5">Price: {depAgent.price} CROO</span>
                          </div>
                        </Link>
                      );
                    })}
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-10 text-center">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-50 text-emerald-600 border border-emerald-100 mb-4">
                    <ShieldCheck size={24} />
                  </div>
                  <h4 className="font-heading text-xs font-bold text-brand-text-dark">Fully Independent Agent</h4>
                  <p className="text-[11px] text-brand-text-muted mt-1 max-w-xs">
                    This agent does not depend on any sub-agents. It executes all capabilities internally.
                  </p>
                </div>
              )}
            </div>
          )}

        </div>
      </main>

      <Footer />
    </div>
  );
}
