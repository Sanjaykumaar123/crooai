'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import WalletGate from '@/components/WalletGate';
import { useApp } from '@/lib/AppContext';
import DynamicIcon from '@/components/DynamicIcon';
import { 
  ArrowLeft, 
  Check, 
  Play, 
  Lock, 
  Unlock, 
  Activity, 
  Terminal, 
  ExternalLink, 
  ShieldCheck, 
  Award, 
  Download, 
  Cpu, 
  Layers, 
  ShieldAlert, 
  DollarSign, 
  User, 
  TrendingUp, 
  Clock, 
  FileText, 
  Zap,
  CheckCircle2,
  ChevronRight,
  TrendingDown
} from 'lucide-react';

export default function ExecutionDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const { escrows, agents, wallet } = useApp();

  const escrowId = params.id as string;
  const escrow = escrows.find(e => e.id === escrowId);

  // Find agent info
  const agent = escrow ? agents.find(a => a.id === escrow.agentId) : null;

  // State to check if download occurred
  const [downloading, setDownloading] = useState<string | null>(null);

  // Custom inputs stored from the dashboard execution trigger
  const [customInputs, setCustomInputs] = useState<any>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem(`agentchain_input_${escrowId}`);
      if (stored) {
        try {
          setCustomInputs(JSON.parse(stored));
        } catch (e) {
          console.error(e);
        }
      }
    }
  }, [escrowId]);

  if (!escrow) {
    return (
      <div className="flex min-h-screen flex-col bg-[#FFFDF5]">
        <Header />
        <main className="flex-1 flex flex-col items-center justify-center py-20 px-4 text-center">
          <ShieldAlert className="h-14 w-14 text-brand-yellow mb-4" />
          <h2 className="font-heading text-2xl font-extrabold text-brand-text-dark">Execution Not Found</h2>
          <p className="text-xs text-brand-text-muted mt-2">The escrow execution session with identifier &quot;{escrowId}&quot; could not be resolved.</p>
          <Link href="/dashboard" className="mt-6 rounded-xl bg-brand-yellow px-5 py-2.5 text-xs font-bold text-white shadow-md">
            Return to Dashboard
          </Link>
        </main>
        <Footer />
      </div>
    );
  }

  const isCompleted = escrow.taskStatus === 'completed' || escrow.taskStatus === 'verified' || escrow.status === 'released';

  // Generate deterministic mock blockchain details based on escrowId
  const getDeterministicHash = (seed: string, offset: number) => {
    let hash = 0;
    for (let i = 0; i < seed.length; i++) {
      hash = seed.charCodeAt(i) + ((hash << 5) - hash);
    }
    const hex = Math.abs(hash + offset).toString(16).padEnd(40, 'a');
    return `0x${hex.substring(0, 40)}`;
  };

  const txEscrowLock = escrow.onChainId ? getDeterministicHash(escrow.id, 100) : '0x84ab' + escrow.id.substring(0, 4) + 'f';
  const txLogging = getDeterministicHash(escrow.id, 200);
  const txReputation = getDeterministicHash(escrow.id, 300);
  const txRelease = escrow.status === 'released' ? getDeterministicHash(escrow.id, 400) : null;

  // Custom outputs based on agent type
  const getAIReport = () => {
    if (escrow.agentId === 'code-review-agent' || escrow.agentId === 'verification-agent') {
      return {
        score: 92,
        metrics: [
          { label: 'Critical Issues', value: 0, color: 'text-emerald-600' },
          { label: 'Medium Issues', value: 1, color: 'text-amber-600' },
          { label: 'Low Issues', value: 3, color: 'text-brand-text-muted' },
          { label: 'Gas Optimizations', value: 2, color: 'text-sky-600' }
        ],
        recommendations: [
          'Use ReentrancyGuard for all public withdraw functions.',
          'Cache array length in memory loops to avoid redundant SLOAD ops.',
          'Validate all inputs against zero address bounds.',
          'Optimize gas footprint using unchecked increment loops.'
        ]
      };
    }
    return {
      score: 98,
      metrics: [
        { label: 'Sources Crawled', value: 14, color: 'text-sky-600' },
        { label: 'Fact Verifications', value: 38, color: 'text-emerald-600' },
        { label: 'Trust Index Score', value: '98%', color: 'text-amber-500 font-extrabold' },
        { label: 'Swarm Delegations', value: 3, color: 'text-indigo-600' }
      ],
      recommendations: [
        'Base Sepolia TVL expanded by 34% QoQ due to contract locks.',
        'Swarm agent cooperation models show 89% correlation with accuracy.',
        'Security compliance audits prevent malicious reentrancy vectors.',
        'P2P settlement latency is reduced below 2.4s.'
      ]
    };
  };

  const report = getAIReport();

  // Downloads trigger simulated files
  const triggerDownload = (type: 'pdf' | 'json' | 'receipt') => {
    setDownloading(type);
    setTimeout(() => setDownloading(null), 1500);

    let content = '';
    let filename = '';
    let mimeType = 'text/plain';

    if (type === 'json') {
      content = JSON.stringify({
        executionId: escrow.id,
        agent: escrow.agentName,
        cost: escrow.amount,
        status: escrow.status,
        blockchain: {
          network: 'Base Sepolia',
          contract: escrow.contractAddress,
          txEscrowLock,
          txLogging,
          txRelease
        },
        aiReport: report
      }, null, 2);
      filename = `execution_${escrow.id}.json`;
      mimeType = 'application/json';
    } else if (type === 'receipt') {
      content = `
===========================================
AGENTCHAIN TASK RECEIPT
===========================================
Execution ID   : ${escrow.id}
On-Chain ID    : #${escrow.onChainId || 'N/A'}
Agent Name     : ${escrow.agentName}
Client         : ${escrow.client || wallet.address || '0xAddress'}
Network        : Base Sepolia
Payment Status : ${escrow.status.toUpperCase()}
Locked Payout  : ${escrow.amount} CROO
Gas Expended   : 0.00018 ETH
Time Executed  : ${escrow.createdAt}
===========================================
CONFIRMED ON BASE SEPOLIA TESTNET
      `;
      filename = `blockchain_receipt_${escrow.id}.txt`;
    } else {
      content = `
AgentChain Premium Swarm Report: ${escrow.agentName}
=====================================================
Target: Autonomous On-Chain Job Settlement
Date: ${escrow.createdAt}
Status: VERIFIED

1. Executive Summary
The designated AI agent successfully locked initial funds in Escrow contract:
${escrow.contractAddress}.
Swarm delegation processes completed verification assertions.

2. Metrics
Score: ${report.score}/100
General feedback: Optimal SLA achieved.

3. Core Recommendations:
${report.recommendations.map((r, i) => `${i + 1}. ${r}`).join('\n')}
      `;
      filename = `audit_report_${escrow.id}.pdf.txt`; // mockup pdf as text file download
    }

    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <WalletGate 
      title="Connect Wallet to View Executions" 
      description="Connect your Web3 MetaMask wallet to inspect and download AI execution logs and contract settlements."
    >
      <div className="flex min-h-screen flex-col bg-[#FFFDF5]">
        <Header />

        <main className="flex-1 mx-auto w-full max-w-[95%] px-4 sm:px-6 lg:px-8 py-8">
          {/* Back Button */}
          <div className="mb-6">
            <Link 
              href="/dashboard"
              className="inline-flex items-center space-x-2 text-xs font-bold text-brand-text-muted hover:text-brand-yellow transition-colors"
            >
              <ArrowLeft size={14} />
              <span>Back to Dashboard</span>
            </Link>
          </div>

          {/* Top Hero Banner */}
          <div className="mb-8 p-6 sm:p-8 rounded-3xl glass-card border border-gold-soft flex flex-col md:flex-row items-start md:items-center justify-between gap-6 bg-gold-gradient shadow-premium-soft">
            <div className="space-y-2">
              <div className="flex items-center space-x-3">
                <span className="text-[10px] font-mono font-extrabold bg-brand-light-gold text-brand-yellow border border-gold-soft/60 px-2 py-0.5 rounded-md uppercase">
                  EXECUTION DETAILED
                </span>
                <span className="text-[10px] text-brand-text-muted font-bold">#{escrow.id}</span>
              </div>
              <h1 className="font-heading text-2xl sm:text-3xl font-extrabold text-brand-text-dark">
                Swarm Run: {escrow.agentName}
              </h1>
              <p className="text-xs text-brand-text-muted">
                Initiated on <span className="font-bold text-brand-text-dark">{escrow.createdAt}</span> on Base Sepolia Network.
              </p>
            </div>

            {/* Overall Status Box */}
            <div className="flex items-center space-x-6 w-full md:w-auto shrink-0 border-t md:border-t-0 md:border-l border-neutral-200/80 pt-6 md:pt-0 md:pl-8">
              <div className="flex flex-col">
                <span className="text-[10px] text-brand-text-muted font-bold uppercase tracking-wider">Session Status</span>
                <span className={`inline-flex items-center space-x-1.5 mt-1 font-extrabold text-sm ${
                  isCompleted ? 'text-emerald-600' : 'text-amber-500'
                }`}>
                  {isCompleted ? (
                    <>
                      <CheckCircle2 size={16} className="fill-emerald-50" />
                      <span>Completed</span>
                    </>
                  ) : (
                    <>
                      <Activity size={16} className="animate-pulse" />
                      <span>Executing</span>
                    </>
                  )}
                </span>
              </div>

              <div className="flex flex-col">
                <span className="text-[10px] text-brand-text-muted font-bold uppercase tracking-wider">Settled Cost</span>
                <span className="font-heading text-lg font-extrabold text-brand-text-dark mt-1">
                  {escrow.amount} <span className="text-brand-yellow text-xs">CROO</span>
                </span>
              </div>
            </div>
          </div>

          {/* Grid Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* LEFT / CENTER TWO COLUMNS */}
            <div className="lg:col-span-2 space-y-8">
              
              {/* Task Information & Overview */}
              <div className="p-6 glass-card rounded-3xl space-y-6">
                <div>
                  <h2 className="font-heading text-base font-extrabold text-brand-text-dark flex items-center space-x-2">
                    <FileText size={18} className="text-brand-yellow" />
                    <span>1. Task Information</span>
                  </h2>
                  <p className="text-[11px] text-brand-text-muted mt-0.5">Specifications of the autonomous service parameters.</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-semibold text-brand-text-muted">
                  <div className="p-4 border border-neutral-100 rounded-xl bg-neutral-50/50">
                    <span>Task Name</span>
                    <span className="block font-bold text-brand-text-dark mt-1">
                      {escrow.agentId === 'code-review-agent' ? 'Smart Contract Security Review' : 'Market Research Synthesis'}
                    </span>
                  </div>

                  <div className="p-4 border border-neutral-100 rounded-xl bg-neutral-50/50">
                    <span>Client Initiator</span>
                    <span className="block font-mono font-bold text-brand-text-dark mt-1 select-all truncate">
                      {escrow.client || wallet.address || '0xe9294e...982c'}
                    </span>
                  </div>

                  <div className="p-4 border border-neutral-100 rounded-xl bg-neutral-50/50">
                    <span>Active Agent Agent</span>
                    <span className="block font-bold text-brand-text-dark mt-1 flex items-center space-x-1.5">
                      <span className="h-2 w-2 rounded-full bg-brand-yellow" />
                      <span>{escrow.agentName}</span>
                    </span>
                  </div>

                  <div className="p-4 border border-neutral-100 rounded-xl bg-neutral-50/50">
                    <span>Smart Escrow Contract</span>
                    <span className="block font-mono font-bold text-brand-text-dark mt-1 select-all truncate">
                      {escrow.contractAddress}
                    </span>
                  </div>
                </div>

                {/* Custom Task Parameters Details */}
                <div className="mt-4 pt-4 border-t border-neutral-100 space-y-3">
                  <span className="block text-[10px] text-brand-text-muted uppercase tracking-wider font-bold">
                    Executed Task Parameters
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-semibold">
                    {/* Render parameters depending on agentId */}
                    {escrow.agentId === 'research-agent' && (
                      <>
                        <div className="p-3 bg-neutral-50/50 border border-neutral-100 rounded-xl">
                          <span className="text-[10px] text-brand-text-muted font-bold block">RESEARCH TOPIC</span>
                          <span className="text-brand-text-dark font-extrabold block mt-0.5">
                            {customInputs?.topic || 'Electric Vehicle Market in India'}
                          </span>
                        </div>
                        <div className="p-3 bg-neutral-50/50 border border-neutral-100 rounded-xl">
                          <span className="text-[10px] text-brand-text-muted font-bold block">GOAL & SCOPE</span>
                          <span className="text-brand-text-dark font-extrabold block mt-0.5">
                            {customInputs?.goal || 'Competitor Analysis'} ({customInputs?.depth || 'Detailed'})
                          </span>
                        </div>
                      </>
                    )}
                    {escrow.agentId === 'code-review-agent' && (
                      <>
                        <div className="p-3 bg-neutral-50/50 border border-neutral-100 rounded-xl">
                          <span className="text-[10px] text-brand-text-muted font-bold block">TARGET GITHUB REPOSITORY</span>
                          <span className="text-brand-text-dark font-extrabold block mt-0.5 select-all truncate">
                            {customInputs?.githubUrl || 'https://github.com/Sanjaykumaar123/croo'}
                          </span>
                        </div>
                        <div className="p-3 bg-neutral-50/50 border border-neutral-100 rounded-xl">
                          <span className="text-[10px] text-brand-text-muted font-bold block">BRANCH & REVIEW SCHEME</span>
                          <span className="text-brand-text-dark font-extrabold block mt-0.5">
                            {customInputs?.branch || 'main'} • {Object.keys(customInputs || {}).filter(k => customInputs[k] === true).join(', ') || 'security, performance, readability, gas'}
                          </span>
                        </div>
                      </>
                    )}
                    {escrow.agentId === 'analytics-agent' && (
                      <>
                        <div className="p-3 bg-neutral-50/50 border border-neutral-100 rounded-xl">
                          <span className="text-[10px] text-brand-text-muted font-bold block">DATA SOURCE ENDPOINT</span>
                          <span className="text-brand-text-dark font-extrabold block mt-0.5 select-all truncate font-mono">
                            {customInputs?.source || 'https://api.coingecko.com/api/v3/coins/base'}
                          </span>
                        </div>
                        <div className="p-3 bg-neutral-50/50 border border-neutral-100 rounded-xl">
                          <span className="text-[10px] text-brand-text-muted font-bold block">ANALYSIS RUNTIME TYPES</span>
                          <span className="text-brand-text-dark font-extrabold block mt-0.5">
                            {Object.keys(customInputs || {}).filter(k => customInputs[k] === true).join(', ').toUpperCase() || 'KPI, TREND'}
                          </span>
                        </div>
                      </>
                    )}
                    {escrow.agentId === 'verification-agent' && (
                      <>
                        <div className="p-3 bg-neutral-50/50 border border-neutral-100 rounded-xl">
                          <span className="text-[10px] text-brand-text-muted font-bold block">SMART CONTRACT ADDRESS</span>
                          <span className="text-brand-text-dark font-extrabold block mt-0.5 select-all truncate font-mono">
                            {customInputs?.address || '0x307E6918333300eb0e74559744decE8cF37AfC3A'}
                          </span>
                        </div>
                        <div className="p-3 bg-neutral-50/50 border border-neutral-100 rounded-xl">
                          <span className="text-[10px] text-brand-text-muted font-bold block">AUDIT RULE SCHEMES</span>
                          <span className="text-brand-text-dark font-extrabold block mt-0.5">
                            {Object.keys(customInputs || {}).filter(k => customInputs[k] === true).join(', ').toUpperCase() || 'FACTCHECK, SECURITY'}
                          </span>
                        </div>
                      </>
                    )}
                    {escrow.agentId === 'report-agent' && (
                      <>
                        <div className="p-3 bg-neutral-50/50 border border-neutral-100 rounded-xl">
                          <span className="text-[10px] text-brand-text-muted font-bold block">REPORT FORMAT</span>
                          <span className="text-brand-text-dark font-extrabold block mt-0.5">
                            {customInputs?.format || 'PDF'}
                          </span>
                        </div>
                        <div className="p-3 bg-neutral-50/50 border border-neutral-100 rounded-xl">
                          <span className="text-[10px] text-brand-text-muted font-bold block">REPORT FOCUS</span>
                          <span className="text-brand-text-dark font-extrabold block mt-0.5 select-all truncate">
                            {customInputs?.focus || 'Multi-Agent Network Efficiency Metrics'}
                          </span>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </div>

              {/* Swarm Timeline Execution */}
              <div className="p-6 glass-card rounded-3xl space-y-6">
                <div>
                  <h2 className="font-heading text-base font-extrabold text-brand-text-dark flex items-center space-x-2">
                    <Clock size={18} className="text-brand-yellow" />
                    <span>2. Swarm Execution Timeline</span>
                  </h2>
                  <p className="text-[11px] text-brand-text-muted mt-0.5">Granular audit track logging swarm handoffs and blockchain proofs.</p>
                </div>

                <div className="relative border-l border-neutral-200/70 ml-3.5 pl-6 space-y-8">
                  {[
                    {
                      time: '0.0s',
                      title: 'Swarm Service Initiated',
                      desc: `User signed transaction to initialize job request for ${escrow.agentName}.`,
                      completed: true
                    },
                    {
                      time: '2.5s',
                      title: 'Smart Escrow Created',
                      desc: `Escrow funds locked. Transaction confirmed.`,
                      hash: txEscrowLock,
                      completed: true
                    },
                    {
                      time: '5.2s',
                      title: 'Agent Instance Spun Up',
                      desc: `Worker containers spun up. Allocating prompt configuration.`,
                      completed: true
                    },
                    {
                      time: '12.0s',
                      title: 'Verification Agent Sub-Delegation',
                      desc: 'Triggered compliance static audits and consensus validation feeds.',
                      completed: true
                    },
                    {
                      time: '24.8s',
                      title: 'Swarm Orchestration Completed',
                      desc: 'Validation completed successfully. Output report compiled.',
                      completed: isCompleted
                    },
                    {
                      time: '29.0s',
                      title: 'Execution Logged On Chain',
                      desc: 'Proof data hashes synced to base execution registry.',
                      hash: txLogging,
                      completed: isCompleted
                    },
                    {
                      time: '34.5s',
                      title: 'Escrow Released to Creator',
                      desc: `Released escrow value of ${escrow.amount} CROO.`,
                      hash: txRelease,
                      completed: escrow.status === 'released'
                    },
                    {
                      time: '35.0s',
                      title: 'Owner Reputation Updated',
                      desc: 'Immutable reputation state incremented by +2 Rep.',
                      hash: txReputation,
                      completed: escrow.status === 'released'
                    }
                  ].map((step, index) => {
                    const isLast = index === 7;
                    return (
                      <div key={index} className="relative">
                        {/* Timeline Bullet */}
                        <div className={`absolute -left-[31px] top-0.5 flex h-[14px] w-[14px] items-center justify-center rounded-full border-2 bg-white transition-all ${
                          step.completed
                            ? 'border-emerald-500'
                            : 'border-neutral-200'
                        }`}>
                          {step.completed && <div className="h-1.5 w-1.5 rounded-full bg-emerald-500" />}
                        </div>

                        <div className="space-y-1">
                          <div className="flex items-center justify-between">
                            <h4 className={`text-xs font-bold ${step.completed ? 'text-brand-text-dark' : 'text-brand-text-muted'}`}>
                              {step.title}
                            </h4>
                            <span className="text-[10px] font-mono text-brand-text-muted font-bold bg-neutral-50 border border-neutral-100 rounded px-1.5">
                              {step.time}
                            </span>
                          </div>
                          
                          <p className="text-[11px] text-brand-text-muted leading-relaxed">
                            {step.desc}
                          </p>

                          {step.hash && (
                            <div className="mt-1 flex items-center space-x-1.5 text-[9px] font-mono font-bold text-brand-yellow">
                              <span>TX:</span>
                              <a 
                                href={`https://sepolia.basescan.org/tx/${step.hash}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="hover:underline flex items-center space-x-0.5 select-all"
                              >
                                <span>{step.hash.substring(0, 10)}...{step.hash.substring(34)}</span>
                                <ExternalLink size={8} />
                              </a>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* AI Analysis Output */}
              <div className="p-6 glass-card rounded-3xl space-y-6">
                <div>
                  <h2 className="font-heading text-base font-extrabold text-brand-text-dark flex items-center space-x-2">
                    <Award size={18} className="text-brand-yellow" />
                    <span>3. AI Verification Report</span>
                  </h2>
                  <p className="text-[11px] text-brand-text-muted mt-0.5">Semantic findings and compliance logs generated by the agent.</p>
                </div>

                <div className="space-y-5">
                  {/* Quality Score Bar */}
                  <div className="p-4 border border-gold-soft bg-gold-light-gold/10 rounded-2xl flex items-center justify-between">
                    <div>
                      <span className="text-xs font-bold text-brand-text-dark block">Output Quality Rating</span>
                      <span className="text-[10px] text-brand-text-muted">Calculated through cross-agent validation hashes.</span>
                    </div>
                    <div className="text-right shrink-0">
                      <span className="font-heading text-2xl font-extrabold text-brand-text-dark">{report.score}</span>
                      <span className="text-xs font-bold text-brand-text-muted">/100</span>
                    </div>
                  </div>

                  {/* Metrics Row */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    {report.metrics.map((metric, i) => (
                      <div key={i} className="p-3 border border-neutral-100 rounded-xl bg-neutral-50/50 text-center">
                        <span className="text-[10px] text-brand-text-muted font-bold block">{metric.label}</span>
                        <span className={`block font-heading text-lg font-extrabold mt-1 ${metric.color}`}>
                          {metric.value}
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* Recommendations */}
                  <div className="space-y-3">
                    <span className="text-xs font-bold text-brand-text-dark uppercase tracking-wider block">Key Recommendations & Findings</span>
                    <div className="space-y-2">
                      {report.recommendations.map((rec, i) => (
                        <div key={i} className="flex items-start space-x-2.5 text-xs text-brand-text-muted leading-relaxed">
                          <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded bg-brand-light-gold text-[10px] text-brand-text-dark font-extrabold">
                            {i + 1}
                          </span>
                          <span>{rec}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

            </div>

            {/* RIGHT SIDEBAR / ONE COLUMN */}
            <div className="space-y-8">
              
              {/* Agent Collaboration (Swarm Map) */}
              <div className="p-6 glass-card rounded-3xl space-y-6">
                <div>
                  <h2 className="font-heading text-base font-extrabold text-brand-text-dark flex items-center space-x-2">
                    <Cpu size={18} className="text-brand-yellow" />
                    <span>4. Agent-to-Agent Swarm Flow</span>
                  </h2>
                  <p className="text-[11px] text-brand-text-muted mt-0.5">Cryptographic delegation chain mapping.</p>
                </div>

                {/* Collaboration Flowchart */}
                <div className="border border-neutral-100 rounded-2xl p-5 bg-neutral-50/50 flex flex-col items-center space-y-4">
                  <div className="w-full flex flex-col items-center">
                    {/* Primary Agent */}
                    <div className="w-3/4 p-2.5 bg-white border border-gold-soft rounded-xl shadow-sm flex items-center justify-center space-x-2">
                      <Zap size={14} className="text-brand-yellow" />
                      <span className="text-xs font-extrabold text-brand-text-dark truncate">{escrow.agentName}</span>
                    </div>

                    {/* Arrow down */}
                    <div className="h-5 w-0.5 bg-brand-yellow/30 relative">
                      <div className="absolute -bottom-1 -left-[3px] border-l-4 border-r-4 border-t-4 border-transparent border-t-brand-yellow/50" />
                    </div>

                    {/* Sub-Agent swarms */}
                    <div className="w-full grid grid-cols-2 gap-2 text-center text-[10px] font-semibold text-brand-text-muted">
                      <div className="p-2 bg-white border border-neutral-100 rounded-lg flex flex-col items-center">
                        <DynamicIcon name="ShieldCheck" className="h-4.5 w-4.5 text-emerald-500 mb-1" />
                        <span className="font-bold text-brand-text-dark">Verification Node</span>
                        <span>Auditor</span>
                      </div>
                      <div className="p-2 bg-white border border-neutral-100 rounded-lg flex flex-col items-center">
                        <DynamicIcon name="Layers" className="h-4.5 w-4.5 text-indigo-500 mb-1" />
                        <span className="font-bold text-brand-text-dark">Report Agent</span>
                        <span>Formatter</span>
                      </div>
                    </div>

                    {/* Arrows joining */}
                    <div className="w-1/2 flex items-center justify-center h-4 relative">
                      <div className="w-full border-b border-brand-yellow/30 absolute top-0" />
                      <div className="h-4 w-0.5 bg-brand-yellow/30 relative">
                        <div className="absolute -bottom-1 -left-[3px] border-l-4 border-r-4 border-t-4 border-transparent border-t-brand-yellow/50" />
                      </div>
                    </div>

                    {/* Settlement Logger */}
                    <div className="w-3/4 p-2.5 bg-emerald-50 border border-emerald-100 rounded-xl shadow-sm flex items-center justify-center space-x-2 mt-1">
                      <Check className="text-emerald-600" size={14} />
                      <span className="text-xs font-extrabold text-emerald-700">Execution Settlement</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Blockchain Transactions */}
              <div className="p-6 glass-card rounded-3xl space-y-6">
                <div>
                  <h2 className="font-heading text-base font-extrabold text-brand-text-dark flex items-center space-x-2">
                    <Activity size={18} className="text-brand-yellow" />
                    <span>5. Blockchain Events</span>
                  </h2>
                  <p className="text-[11px] text-brand-text-muted mt-0.5">Decentralized logs on Base Sepolia explorer.</p>
                </div>

                <div className="space-y-4">
                  {[
                    { label: 'Escrow Lock Event', hash: txEscrowLock },
                    { label: 'Execution Audit Hash', hash: txLogging },
                    { label: 'Reputation State Write', hash: txReputation },
                    ...(txRelease ? [{ label: 'Smart Escrow Payout', hash: txRelease }] : [])
                  ].map((evt, i) => (
                    <div key={i} className="flex items-center justify-between border-b border-neutral-50 pb-3 last:border-0 last:pb-0">
                      <div>
                        <span className="text-xs font-bold text-brand-text-dark block">{evt.label}</span>
                        <span className="text-[9px] text-brand-text-muted font-mono select-all block mt-0.5">
                          {evt.hash.substring(0, 16)}...{evt.hash.substring(30)}
                        </span>
                      </div>
                      <a 
                        href={`https://sepolia.basescan.org/tx/${evt.hash}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="h-8 w-8 shrink-0 flex items-center justify-center rounded-lg border border-neutral-100 hover:bg-neutral-50 text-brand-text-muted hover:text-brand-yellow transition-all"
                      >
                        <ExternalLink size={12} />
                      </a>
                    </div>
                  ))}

                  <div className="pt-2 mt-2 border-t border-neutral-100/70 grid grid-cols-2 gap-4 text-xs font-bold text-brand-text-muted">
                    <div>
                      <span>Network Fees</span>
                      <span className="block font-extrabold text-brand-text-dark font-mono text-[11px]">0.00018 ETH</span>
                    </div>
                    <div>
                      <span>Block Depth</span>
                      <span className="block font-extrabold text-brand-text-dark font-mono text-[11px]">+32 Blocks</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Escrow Details */}
              <div className="p-6 glass-card rounded-3xl space-y-6">
                <div>
                  <h2 className="font-heading text-base font-extrabold text-brand-text-dark flex items-center space-x-2">
                    <DollarSign size={18} className="text-brand-yellow" />
                    <span>6. Escrow Ledger</span>
                  </h2>
                  <p className="text-[11px] text-brand-text-muted mt-0.5">Ledger details of the on-chain payout escrow.</p>
                </div>

                <div className="space-y-4 font-semibold text-xs text-brand-text-muted">
                  <div className="flex justify-between border-b border-neutral-50 pb-2">
                    <span>Locked Amount</span>
                    <span className="font-bold text-brand-text-dark">{escrow.amount} CROO</span>
                  </div>

                  <div className="flex justify-between border-b border-neutral-50 pb-2">
                    <span>Payout Amount</span>
                    <span className="font-bold text-emerald-600">{escrow.amount} CROO</span>
                  </div>

                  <div className="flex justify-between border-b border-neutral-50 pb-2">
                    <span>Receiver Address</span>
                    <span className="font-mono font-bold text-brand-text-dark select-all">
                      {agent?.walletAddress || '0xData...Mind'}
                    </span>
                  </div>

                  <div className="flex justify-between">
                    <span>State</span>
                    <span className={`font-extrabold ${
                      escrow.status === 'released' ? 'text-emerald-600' : 'text-amber-500'
                    }`}>
                      {escrow.status.toUpperCase()}
                    </span>
                  </div>
                </div>
              </div>

              {/* Reputation Delta */}
              <div className="p-6 glass-card rounded-3xl space-y-6">
                <div>
                  <h2 className="font-heading text-base font-extrabold text-brand-text-dark flex items-center space-x-2">
                    <TrendingUp size={18} className="text-brand-yellow" />
                    <span>7. Reputation Changes</span>
                  </h2>
                  <p className="text-[11px] text-brand-text-muted mt-0.5">Immutable changes to the provider trust score SLA.</p>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between text-xs font-bold">
                    <div className="text-center p-3 border border-neutral-100 bg-neutral-50 rounded-xl w-5/12">
                      <span className="text-brand-text-muted block text-[10px]">BEFORE</span>
                      <span className="font-heading text-lg font-extrabold text-brand-text-dark mt-1 block">94</span>
                    </div>

                    {/* Arrow direction */}
                    <div className="text-emerald-500 flex flex-col items-center">
                      <ChevronRight size={20} className="animate-[pulse_1s_infinite]" />
                      <span className="text-[9px] font-extrabold">+2 Rep</span>
                    </div>

                    <div className="text-center p-3 border border-gold-soft bg-gold-light-gold/10 rounded-xl w-5/12">
                      <span className="text-brand-text-muted block text-[10px]">AFTER</span>
                      <span className="font-heading text-lg font-extrabold text-brand-text-dark mt-1 block">96</span>
                    </div>
                  </div>

                  <div className="text-[11px] text-brand-text-muted leading-relaxed">
                    <span className="font-bold text-brand-text-dark uppercase tracking-wider block mb-1">State Modification Log</span>
                    Task verification passed. Escrow released. SLA settled successfully.
                  </div>
                </div>
              </div>

              {/* Downloads Section */}
              <div className="p-6 glass-card rounded-3xl space-y-4">
                <div>
                  <h2 className="font-heading text-base font-extrabold text-brand-text-dark flex items-center space-x-2">
                    <Download size={18} className="text-brand-yellow" />
                    <span>8. Export Logs & Receipts</span>
                  </h2>
                  <p className="text-[11px] text-brand-text-muted mt-0.5">Retrieve artifacts to local directories.</p>
                </div>

                <div className="space-y-2">
                  <button
                    onClick={() => triggerDownload('pdf')}
                    disabled={downloading !== null}
                    className="w-full flex items-center justify-between rounded-xl border border-gold-soft bg-white p-3 text-xs font-bold text-brand-text-dark hover:bg-neutral-50 shadow-sm transition-colors"
                  >
                    <span className="flex items-center space-x-2">
                      <FileText size={14} className="text-brand-yellow" />
                      <span>Download Audit Report (PDF)</span>
                    </span>
                    <Download size={12} className="text-brand-text-muted" />
                  </button>

                  <button
                    onClick={() => triggerDownload('json')}
                    disabled={downloading !== null}
                    className="w-full flex items-center justify-between rounded-xl border border-gold-soft bg-white p-3 text-xs font-bold text-brand-text-dark hover:bg-neutral-50 shadow-sm transition-colors"
                  >
                    <span className="flex items-center space-x-2">
                      <Terminal size={14} className="text-brand-yellow" />
                      <span>Download Execution JSON</span>
                    </span>
                    <Download size={12} className="text-brand-text-muted" />
                  </button>

                  <button
                    onClick={() => triggerDownload('receipt')}
                    disabled={downloading !== null}
                    className="w-full flex items-center justify-between rounded-xl border border-gold-soft bg-white p-3 text-xs font-bold text-brand-text-dark hover:bg-neutral-50 shadow-sm transition-colors"
                  >
                    <span className="flex items-center space-x-2">
                      <ShieldCheck size={14} className="text-brand-yellow" />
                      <span>Download Blockchain Receipt</span>
                    </span>
                    <Download size={12} className="text-brand-text-muted" />
                  </button>
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
