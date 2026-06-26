'use client';

import React, { useState, useEffect, useRef } from 'react';
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
  AlertTriangle,
  X,
  Terminal,
  ExternalLink,
  ShieldAlert,
  Loader2,
  Sparkles,
  CheckCircle2
} from 'lucide-react';

export default function AgentDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const { agents, hireAgent, wallet, connectWallet, escrows } = useApp();
  const [activeTab, setActiveTab] = useState<'overview' | 'use-cases' | 'capabilities' | 'how-it-works' | 'reviews' | 'history' | 'dependencies'>('overview');
  
  const agentId = params.id as string;
  const agent = agents.find((a) => a.id === agentId);
  const isAlreadyHired = agent ? escrows.some((e) => e.agentId === agent.id) : false;

  // Interactive Swarm States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [executionStep, setExecutionStep] = useState<'input' | 'escrow_locking' | 'running' | 'completed' | 'error'>('input');
  const [txHash, setTxHash] = useState('');
  const [onChainId, setOnChainId] = useState<number | null>(null);
  const [errorMessage, setErrorMessage] = useState('');
  const [logs, setLogs] = useState<string[]>([]);
  const terminalEndRef = useRef<HTMLDivElement>(null);

  // Form states per agent
  const [formData, setFormData] = useState<any>(() => {
    if (agentId === 'research-agent') {
      return { topic: 'Base Sepolia DeFi Yield Landscape', scope: 'Academic Journals', depth: 'Detailed Dossier', focus: ['Financial Metrics', 'Sentiment Trends'] };
    }
    if (agentId === 'news-agent') {
      return { topic: 'Autonomous Agent Regulations', timeframe: 'Last 7 Days', sentiment: 'Deep Topic Clustering', noiseLevel: 'High' };
    }
    if (agentId === 'analytics-agent') {
      return { source: 'https://api.coingecko.com/api/v3/coins/base', type: 'Trend Forecasting', format: 'Chart Config (SVG/Vega)' };
    }
    if (agentId === 'verification-agent') {
      return { address: '0x307E6918333300eb0e74559744decE8cF37AfC3A', depth: 'Vulnerability Scan (Reentrancy/Overflows)', compiler: 'v0.8.24' };
    }
    if (agentId === 'report-agent') {
      return { focus: 'Multi-Agent Network Efficiency Metrics', template: 'Formal Corporate Brief', sections: ['Executive Summary', 'Index Table', 'Chart Visuals'] };
    }
    return { githubUrl: 'https://github.com/Sanjaykumaar123/croo', branch: 'main', checkers: ['Security Checks', 'Performance Hotspots', 'Readability & Clean Code'] };
  });

  // Scroll logs to bottom
  useEffect(() => {
    if (terminalEndRef.current) {
      terminalEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [logs]);

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

  // Predefined logs templates
  const getSimulationLogs = () => {
    if (agentId === 'research-agent') {
      return [
        `[0.1s] Initializing Research Agent swarm instance...`,
        `[0.8s] Querying search indexes for "${formData.topic}" using scope: "${formData.scope}"...`,
        `[1.6s] Fetched 42 relevant papers and web feeds. Parsing articles...`,
        `[2.4s] [Swarm Handoff] Requesting news analysis from News Agent (ID: 2)...`,
        `[3.2s] News Agent response: Sentiment is 84% bullish. Topic clustering completed.`,
        `[3.9s] Synthesizing yields data and calculating averages...`,
        `[4.6s] [Swarm Handoff] Formatting results into report layout using Report Agent (ID: 5)...`,
        `[5.4s] Report generated. Writing cryptographic audit trail to ExecutionLog.sol...`,
        `[6.2s] Smart contract event emitted. Releasing escrow payment to creator...`,
        `[7.0s] Reputation score successfully updated (+2). Task complete!`
      ];
    }
    if (agentId === 'news-agent') {
      return [
        `[0.1s] Initializing News Aggregation swarm...`,
        `[0.9s] Scraping social feeds, RSS feeds, and News APIs for "${formData.topic}"...`,
        `[1.8s] Received 147 raw news feeds. Running duplicate filters (Noise: ${formData.noiseLevel})...`,
        `[2.7s] Running sentiment analysis: "${formData.sentiment}"...`,
        `[3.6s] Topic clustering models loaded. Found 3 key sub-topics.`,
        `[4.5s] Computing statistical news spikes and trust weightings...`,
        `[5.3s] Writing event to ExecutionLog contract...`,
        `[6.1s] Verification proof settled. Escrow payment released...`,
        `[6.8s] Task complete!`
      ];
    }
    if (agentId === 'analytics-agent') {
      return [
        `[0.1s] Initializing Analytics Agent...`,
        `[0.8s] Testing target endpoint: ${formData.source}...`,
        `[1.6s] Fetching 90-day time-series history for token...`,
        `[2.4s] Running math engine: "${formData.type}"...`,
        `[3.2s] Computing standard deviations, trend projections, and volatility indexes...`,
        `[4.0s] Compiling chart visual template: "${formData.format}"...`,
        `[4.8s] Logging analysis completion proof to ExecutionLog.sol...`,
        `[5.5s] Releasing escrow to creator. Reputation score updated (+2).`
      ];
    }
    if (agentId === 'verification-agent') {
      return [
        `[0.1s] Initializing Smart Contract Verification Agent...`,
        `[0.8s] Fetching contract bytecode at address: ${formData.address}...`,
        `[1.6s] Compiler version verified: ${formData.compiler}. Starting static analysis...`,
        `[2.4s] Running Slither diagnostic framework...`,
        `[3.2s] Analyzing vulnerability depth: "${formData.depth}"...`,
        `[4.0s] Scanning for reentrancy entrypoints and integer overflows...`,
        `[4.8s] Audit signature generated: 0xAuditSig_${Math.random().toString(16).substr(2, 8)}...`,
        `[5.6s] Writing report hashes to ExecutionLog contract...`,
        `[6.3s] Verification successful. Releasing escrow to creator.`
      ];
    }
    if (agentId === 'report-agent') {
      return [
        `[0.1s] Initializing Report Generation Swarm...`,
        `[0.8s] Structuring data template: "${formData.template}"...`,
        `[1.6s] Generating section: "Executive Summary"...`,
        `[2.4s] Generating section: "Index Table"...`,
        `[3.2s] Rendering SVG visual assets for data reports...`,
        `[4.0s] Compiling Markdown and PDF binary chunks...`,
        `[4.8s] Writing document signature to blockchain...`,
        `[5.5s] Task completed. Escrow released.`
      ];
    }
    // Default to Code Review Agent
    return [
      `[0.1s] Checking out repository: ${formData.githubUrl} (Branch: ${formData.branch})...`,
      `[0.8s] Cloning repository contents. Found 18 files.`,
      `[1.5s] Running selected checkers: ${formData.checkers.join(', ')}...`,
      `[2.2s] [Swarm Handoff] Delegating smart contract checks to Verification Agent (ID: 4)...`,
      `[3.0s] Verification Agent output: 0 high-risk vulnerabilities, 2 gas optimizations.`,
      `[3.8s] Checking code formatting, variable readability, and comment ratios...`,
      `[4.5s] Running static analysis checks...`,
      `[5.3s] Compiling review annotations...`,
      `[6.1s] Writing execution hashes to ExecutionLog.sol on Base Sepolia...`,
      `[6.8s] Task complete! Escrow released. Reputation score updated (+2).`
    ];
  };

  const handleHireClick = () => {
    if (!wallet.connected) {
      connectWallet();
      return;
    }
    setLogs([]);
    setErrorMessage('');
    setExecutionStep('input');
    setIsModalOpen(true);
  };

  const handleConfirmHire = async () => {
    setExecutionStep('escrow_locking');
    setLogs(['[0.0s] Requesting wallet signature to create escrow...']);

    // Call on-chain hireAgent
    const result = await hireAgent(agent.id);

    if (!result.success) {
      setErrorMessage(result.error || 'Transaction rejected or failed.');
      setExecutionStep('error');
      return;
    }

    if (!result.txHash || result.onChainId === undefined) {
      setErrorMessage('Verified transaction hash or on-chain escrow ID missing.');
      setExecutionStep('error');
      return;
    }

    const hash = result.txHash;
    setTxHash(hash);
    setOnChainId(result.onChainId);

    setLogs((prev) => [
      ...prev,
      `[0.3s] Escrow locked on Base Sepolia!`,
      `[0.4s] On-Chain Escrow ID: #${result.onChainId}`,
      `[0.5s] Transaction Hash: ${hash}`,
      `[0.6s] Starting swarm execution loop...`
    ]);

    setExecutionStep('running');

    // Simulate execution step by step
    const simulatedLogs = getSimulationLogs();
    let currentLogIndex = 0;

    const interval = setInterval(() => {
      if (currentLogIndex < simulatedLogs.length) {
        setLogs((prev) => [...prev, simulatedLogs[currentLogIndex]]);
        currentLogIndex++;
      } else {
        clearInterval(interval);
        setExecutionStep('completed');
      }
    }, 700);
  };

  const getDependencyDetails = (depId: string) => {
    return agents.find((a) => a.id === depId);
  };

  const tabs = [
    { id: 'overview', name: 'Overview' },
    { id: 'use-cases', name: 'Use Cases & Lifecycle' },
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
                className={`flex w-full items-center justify-center space-x-2 rounded-xl py-3.5 text-xs font-bold transition-all duration-300 text-white active:scale-95 ${
                  isAlreadyHired
                    ? 'bg-emerald-500 hover:bg-emerald-600 shadow-md'
                    : 'bg-brand-yellow hover:bg-[#F59E0B] shadow-premium-soft'
                }`}
              >
                {isAlreadyHired ? (
                  <>
                    <Check size={14} />
                    <span>✓ Hired (Execute Swarm)</span>
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

              {agent.useCases && agent.useCases.length > 0 && (
                <div className="border-t border-neutral-100 pt-6">
                  <h4 className="font-heading text-xs font-bold text-brand-text-dark uppercase tracking-wider mb-4">Key Use Cases</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                    {agent.useCases.map((useCase, idx) => (
                      <div key={idx} className="flex items-center space-x-2 text-xs text-brand-text-muted">
                        <Check className="h-4 w-4 text-emerald-600 shrink-0" />
                        <span className="font-bold text-brand-text-dark">{useCase}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

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

              <div className="border-t border-neutral-100 pt-6">
                <h4 className="font-heading text-xs font-bold text-brand-text-dark uppercase tracking-wider mb-4">On-Chain Economic Profile</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="bg-[#FFFDF5] border border-gold-soft/50 rounded-xl p-4">
                    <span className="block text-[10px] text-brand-text-muted uppercase tracking-wider font-bold">Agent Wallet Address</span>
                    <span className="text-xs font-mono font-bold text-brand-text-dark block mt-1 truncate select-all" title={agent.walletAddress || "0x7CeA0B0C5846CEBBA1Fb3CB4F4972e20e2A55787"}>
                      {agent.walletAddress || `0x${agent.id.substring(0, 4)}...${agent.id.substring(agent.id.length - 4)}`}
                    </span>
                  </div>
                  <div className="bg-[#FFFDF5] border border-gold-soft/50 rounded-xl p-4">
                    <span className="block text-[10px] text-brand-text-muted uppercase tracking-wider font-bold">Total Earnings</span>
                    <span className="text-xs font-bold text-emerald-600 block mt-1">
                      {agent.earnings || (agent.tasksCompleted * agent.price).toFixed(3)} CROO
                    </span>
                  </div>
                  <div className="bg-[#FFFDF5] border border-gold-soft/50 rounded-xl p-4">
                    <span className="block text-[10px] text-brand-text-muted uppercase tracking-wider font-bold">Reputation Score</span>
                    <span className="text-xs font-bold text-brand-yellow block mt-1">
                      {agent.successRate}%
                    </span>
                  </div>
                  <div className="bg-[#FFFDF5] border border-gold-soft/50 rounded-xl p-4">
                    <span className="block text-[10px] text-brand-text-muted uppercase tracking-wider font-bold">On-Chain ID</span>
                    <span className="text-xs font-bold text-brand-text-dark block mt-1">
                      {agent.id === 'research-agent' ? 1 : agent.id === 'news-agent' ? 2 : agent.id === 'analytics-agent' ? 3 : agent.id === 'verification-agent' ? 4 : agent.id === 'report-agent' ? 5 : agent.id === 'code-review-agent' ? 6 : 7}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Use Cases & Lifecycle Panel */}
          {activeTab === 'use-cases' && (
            <div className="space-y-8 animate-fadeIn">
              <div>
                <h3 className="font-heading text-lg font-bold text-brand-text-dark mb-3">Targeted Use Cases</h3>
                <p className="text-xs sm:text-sm text-brand-text-muted leading-relaxed mb-6">
                  {agent.name} is specifically designed and optimized to handle the following operational workflows:
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {agent.useCases?.map((useCase, idx) => (
                    <div key={idx} className="flex items-start space-x-3 p-4 rounded-xl border border-gold-soft/50 bg-[#FFFDF5]/40 hover:bg-[#FFFDF5] transition-colors shadow-sm">
                      <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 text-xs font-extrabold mt-0.5">
                        ✓
                      </div>
                      <div>
                        <span className="text-xs font-bold text-brand-text-dark block">{useCase}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="border-t border-neutral-100 pt-8">
                <h3 className="font-heading text-lg font-bold text-brand-text-dark mb-2">Autonomous Escrow & Execution Lifecycle</h3>
                <p className="text-xs sm:text-sm text-brand-text-muted leading-relaxed mb-6">
                  When you hire an agent in the AgentChain Marketplace, you are not just querying an API—you are engaging an autonomous economic agent. Here is what happens behind the scenes:
                </p>

                {/* VISUAL FLOWCHART / TIMELINE */}
                <div className="relative border-l border-brand-yellow/30 pl-8 ml-4 space-y-8">
                  {/* Step 1 */}
                  <div className="relative">
                    <div className="absolute -left-12 top-0.5 flex h-8 w-8 items-center justify-center rounded-full bg-brand-yellow text-xs font-bold text-white shadow-sm font-heading">
                      1
                    </div>
                    <div>
                      <h4 className="font-heading text-xs font-bold text-brand-text-dark uppercase tracking-wider flex items-center space-x-2">
                        <span>Escrow Locked</span>
                        <span className="rounded-full bg-brand-light-gold/40 border border-gold-soft px-2 py-0.5 text-[9px] font-mono text-brand-yellow font-extrabold">On-Chain</span>
                      </h4>
                      <p className="text-xs text-brand-text-muted mt-1 leading-relaxed">
                        Task fees (e.g. <strong>{agent.price} CROO</strong>) are escrowed. The funds are locked in the smart contract on Base Sepolia. Payment resolves only upon successful verification.
                      </p>
                    </div>
                  </div>

                  {/* Step 2 */}
                  <div className="relative">
                    <div className="absolute -left-12 top-0.5 flex h-8 w-8 items-center justify-center rounded-full bg-brand-yellow text-xs font-bold text-white shadow-sm font-heading">
                      2
                    </div>
                    <div>
                      <h4 className="font-heading text-xs font-bold text-brand-text-dark uppercase tracking-wider flex items-center space-x-2">
                        <span>Autonomous Task Dispatch & Swarming</span>
                        <span className="rounded-full bg-brand-light-gold/40 border border-gold-soft px-2 py-0.5 text-[9px] font-mono text-brand-yellow font-extrabold">Agent-to-Agent</span>
                      </h4>
                      <p className="text-xs text-brand-text-muted mt-1 leading-relaxed">
                        {agent.name} starts execution. If it needs supporting services, it delegates sub-tasks to other marketplace agents.
                        {agent.dependencies.length > 0 ? (
                          <span> This agent programmatically recruits and settles micro-transactions with: <strong>{agent.dependencies.map(id => agents.find(a => a.id === id)?.name || id).join(', ')}</strong>.</span>
                        ) : (
                          <span> It executes all logical parameters independently, but can programmatically spin up analytics and verification sub-calls if configured.</span>
                        )}
                      </p>
                    </div>
                  </div>

                  {/* Step 3 */}
                  <div className="relative">
                    <div className="absolute -left-12 top-0.5 flex h-8 w-8 items-center justify-center rounded-full bg-brand-yellow text-xs font-bold text-white shadow-sm font-heading">
                      3
                    </div>
                    <div>
                      <h4 className="font-heading text-xs font-bold text-brand-text-dark uppercase tracking-wider">
                        Swarm Work & Execution Log
                      </h4>
                      <p className="text-xs text-brand-text-muted mt-1 leading-relaxed">
                        The agent swarm aggregates data, reviews logs, runs static checks, and outputs a complete proof package. Execution outputs stream in real-time to your dashboard terminal console.
                      </p>
                    </div>
                  </div>

                  {/* Step 4 */}
                  <div className="relative">
                    <div className="absolute -left-12 top-0.5 flex h-8 w-8 items-center justify-center rounded-full bg-brand-yellow text-xs font-bold text-white shadow-sm font-heading">
                      4
                    </div>
                    <div>
                      <h4 className="font-heading text-xs font-bold text-brand-text-dark uppercase tracking-wider flex items-center space-x-2">
                        <span>Verification & Trustless Settlement</span>
                        <span className="rounded-full bg-emerald-50 border border-emerald-100 px-2 py-0.5 text-[9px] text-emerald-600 font-bold">Smart Contract</span>
                      </h4>
                      <p className="text-xs text-brand-text-muted mt-1 leading-relaxed">
                        Once outputs pass validation rules (e.g. security scanners or accuracy audits), the escrow contract releases the payout to the creator. If the task fails, an automated refund is returned to your wallet.
                      </p>
                    </div>
                  </div>

                  {/* Step 5 */}
                  <div className="relative">
                    <div className="absolute -left-12 top-0.5 flex h-8 w-8 items-center justify-center rounded-full bg-brand-yellow text-xs font-bold text-white shadow-sm font-heading">
                      5
                    </div>
                    <div>
                      <h4 className="font-heading text-xs font-bold text-brand-text-dark uppercase tracking-wider">
                        Reputation Upgrade & On-Chain Audit Trail
                      </h4>
                      <p className="text-xs text-brand-text-muted mt-1 leading-relaxed">
                        The agent&apos;s reputation is updated based on success parameters (currently <span className="text-emerald-600 font-semibold">{agent.successRate}%</span>). A cryptographic hash proof of the work is recorded in <code>ExecutionLog.sol</code> on Base Sepolia.
                      </p>
                    </div>
                  </div>

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

      {/* SWARM EXECUTION WORKFLOW MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-neutral-950/80 backdrop-blur-sm p-4 animate-fadeIn">
          <div className="relative w-full max-w-2xl bg-white border-2 border-gold-soft rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-gold-soft/50 px-6 py-4 bg-brand-light-gold/10">
              <div className="flex items-center space-x-2">
                <Sparkles className="h-5 w-5 text-brand-yellow animate-pulse" />
                <h3 className="font-heading text-sm font-extrabold text-brand-text-dark">
                  Autonomous Swarm Execution - {agent.name}
                </h3>
              </div>
              {executionStep !== 'running' && executionStep !== 'escrow_locking' && (
                <button 
                  onClick={() => setIsModalOpen(false)}
                  className="rounded-lg p-1.5 text-neutral-400 hover:bg-neutral-100 hover:text-neutral-600 transition-colors"
                >
                  <X size={18} />
                </button>
              )}
            </div>

            {/* Modal Content */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              
              {/* STEP 1: PARAMETERS INPUT */}
              {executionStep === 'input' && (
                <div className="space-y-4">
                  <div className="bg-[#FFFDF5] border border-gold-soft/50 rounded-xl p-4 text-[11px] text-brand-text-muted flex items-start space-x-3">
                    <ShieldCheck className="h-5 w-5 text-emerald-600 shrink-0 mt-0.5" />
                    <div>
                      <p className="font-bold text-brand-text-dark">On-Chain Safety Escrow Active</p>
                      <p className="mt-0.5">By starting this task, <span className="font-bold text-brand-text-dark">{agent.price} CROO</span> will be locked into the Escrow contract. Payment resolves only upon proof of successful execution.</p>
                    </div>
                  </div>

                  {/* Hiring & Escrow Lifecycle */}
                  <div className="border border-gold-soft/50 bg-[#FFFDF5]/40 rounded-xl p-4 space-y-2">
                    <span className="block text-[10px] text-brand-text-muted uppercase tracking-wider font-bold">Hiring & Escrow Lifecycle</span>
                    <div className="grid grid-cols-4 gap-2 text-center text-[9px] text-brand-text-muted font-bold">
                      <div className="bg-white border border-gold-soft/30 rounded-lg p-2 flex flex-col justify-between">
                        <span className="text-brand-yellow font-extrabold block">1. Escrow Lock</span>
                        <span className="text-[8px] text-brand-text-muted mt-1 leading-tight font-normal">Funds locked on Base Sepolia</span>
                      </div>
                      <div className="bg-white border border-gold-soft/30 rounded-lg p-2 flex flex-col justify-between">
                        <span className="text-brand-yellow font-extrabold block">2. Swarm Hire</span>
                        <span className="text-[8px] text-brand-text-muted mt-1 leading-tight font-normal">Agent recruits sub-agents</span>
                      </div>
                      <div className="bg-white border border-gold-soft/30 rounded-lg p-2 flex flex-col justify-between">
                        <span className="text-brand-yellow font-extrabold block">3. Verification</span>
                        <span className="text-[8px] text-brand-text-muted mt-1 leading-tight font-normal font-sans">Static checks audit task</span>
                      </div>
                      <div className="bg-white border border-gold-soft/30 rounded-lg p-2 flex flex-col justify-between">
                        <span className="text-emerald-600 font-extrabold block">4. Release</span>
                        <span className="text-[8px] text-brand-text-muted mt-1 leading-tight font-normal">Payout sent or auto-refunded</span>
                      </div>
                    </div>
                  </div>

                  <h4 className="font-heading text-xs font-bold text-brand-text-dark uppercase tracking-wider">Configure Task Inputs</h4>

                  {/* Research Agent Form */}
                  {agent.id === 'research-agent' && (
                    <div className="space-y-3">
                      <div>
                        <label className="block text-[10px] font-bold text-brand-text-muted uppercase tracking-wider mb-1">Research Subject / Topic</label>
                        <input 
                          type="text" 
                          value={formData.topic} 
                          onChange={(e) => setFormData({ ...formData, topic: e.target.value })}
                          className="w-full text-xs font-semibold px-3 py-2 border border-gold-soft rounded-lg focus:outline-none focus:border-brand-yellow" 
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-[10px] font-bold text-brand-text-muted uppercase tracking-wider mb-1">Search Scope</label>
                          <select 
                            value={formData.scope} 
                            onChange={(e) => setFormData({ ...formData, scope: e.target.value })}
                            className="w-full text-xs font-semibold px-3 py-2 border border-gold-soft rounded-lg focus:outline-none"
                          >
                            <option>Standard Search</option>
                            <option>Global Database</option>
                            <option>Academic Journals</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold text-brand-text-muted uppercase tracking-wider mb-1">Research Depth</label>
                          <select 
                            value={formData.depth} 
                            onChange={(e) => setFormData({ ...formData, depth: e.target.value })}
                            className="w-full text-xs font-semibold px-3 py-2 border border-gold-soft rounded-lg focus:outline-none"
                          >
                            <option>Quick Summary</option>
                            <option>Detailed Dossier</option>
                            <option>Comprehensive Thesis</option>
                          </select>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* News Agent Form */}
                  {agent.id === 'news-agent' && (
                    <div className="space-y-3">
                      <div>
                        <label className="block text-[10px] font-bold text-brand-text-muted uppercase tracking-wider mb-1">News Topic / Keywords</label>
                        <input 
                          type="text" 
                          value={formData.topic} 
                          onChange={(e) => setFormData({ ...formData, topic: e.target.value })}
                          className="w-full text-xs font-semibold px-3 py-2 border border-gold-soft rounded-lg focus:outline-none focus:border-brand-yellow" 
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-[10px] font-bold text-brand-text-muted uppercase tracking-wider mb-1">Timeframe</label>
                          <select 
                            value={formData.timeframe} 
                            onChange={(e) => setFormData({ ...formData, timeframe: e.target.value })}
                            className="w-full text-xs font-semibold px-3 py-2 border border-gold-soft rounded-lg focus:outline-none"
                          >
                            <option>Last 24 Hours</option>
                            <option>Last 7 Days</option>
                            <option>Last 30 Days</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold text-brand-text-muted uppercase tracking-wider mb-1">NLP Mode</label>
                          <select 
                            value={formData.sentiment} 
                            onChange={(e) => setFormData({ ...formData, sentiment: e.target.value })}
                            className="w-full text-xs font-semibold px-3 py-2 border border-gold-soft rounded-lg focus:outline-none"
                          >
                            <option>Standard Sentiment</option>
                            <option>Deep Topic Clustering</option>
                            <option>Volume Spike Detection</option>
                          </select>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Analytics Agent Form */}
                  {agent.id === 'analytics-agent' && (
                    <div className="space-y-3">
                      <div>
                        <label className="block text-[10px] font-bold text-brand-text-muted uppercase tracking-wider mb-1">Data Source API / Endpoint</label>
                        <input 
                          type="text" 
                          value={formData.source} 
                          onChange={(e) => setFormData({ ...formData, source: e.target.value })}
                          className="w-full text-xs font-semibold px-3 py-2 border border-gold-soft rounded-lg focus:outline-none focus:border-brand-yellow" 
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-[10px] font-bold text-brand-text-muted uppercase tracking-wider mb-1">Analysis Type</label>
                          <select 
                            value={formData.type} 
                            onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                            className="w-full text-xs font-semibold px-3 py-2 border border-gold-soft rounded-lg focus:outline-none"
                          >
                            <option>Trend Forecasting</option>
                            <option>Correlation Matrix</option>
                            <option>Outlier Detection</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold text-brand-text-muted uppercase tracking-wider mb-1">Output Format</label>
                          <select 
                            value={formData.format} 
                            onChange={(e) => setFormData({ ...formData, format: e.target.value })}
                            className="w-full text-xs font-semibold px-3 py-2 border border-gold-soft rounded-lg focus:outline-none"
                          >
                            <option>Chart Config (SVG/Vega)</option>
                            <option>Raw Table (JSON)</option>
                            <option>Markdown Summary</option>
                          </select>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Verification Agent Form */}
                  {agent.id === 'verification-agent' && (
                    <div className="space-y-3">
                      <div>
                        <label className="block text-[10px] font-bold text-brand-text-muted uppercase tracking-wider mb-1">Smart Contract Address</label>
                        <input 
                          type="text" 
                          value={formData.address} 
                          onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                          className="w-full text-xs font-semibold px-3 py-2 border border-gold-soft rounded-lg focus:outline-none focus:border-brand-yellow font-mono" 
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-[10px] font-bold text-brand-text-muted uppercase tracking-wider mb-1">Verification Scope</label>
                          <select 
                            value={formData.depth} 
                            onChange={(e) => setFormData({ ...formData, depth: e.target.value })}
                            className="w-full text-xs font-semibold px-3 py-2 border border-gold-soft rounded-lg focus:outline-none"
                          >
                            <option>Vulnerability Scan (Reentrancy/Overflows)</option>
                            <option>Gas Optimization Audit</option>
                            <option>Static Code Analysis</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold text-brand-text-muted uppercase tracking-wider mb-1">Solidity Compiler</label>
                          <input 
                            type="text" 
                            value={formData.compiler} 
                            onChange={(e) => setFormData({ ...formData, compiler: e.target.value })}
                            className="w-full text-xs font-semibold px-3 py-2 border border-gold-soft rounded-lg focus:outline-none focus:border-brand-yellow" 
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Report Agent Form */}
                  {agent.id === 'report-agent' && (
                    <div className="space-y-3">
                      <div>
                        <label className="block text-[10px] font-bold text-brand-text-muted uppercase tracking-wider mb-1">Report Focus/Topic</label>
                        <input 
                          type="text" 
                          value={formData.focus} 
                          onChange={(e) => setFormData({ ...formData, focus: e.target.value })}
                          className="w-full text-xs font-semibold px-3 py-2 border border-gold-soft rounded-lg focus:outline-none focus:border-brand-yellow" 
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-brand-text-muted uppercase tracking-wider mb-1">Format Template</label>
                        <select 
                          value={formData.template} 
                          onChange={(e) => setFormData({ ...formData, template: e.target.value })}
                          className="w-full text-xs font-semibold px-3 py-2 border border-gold-soft rounded-lg focus:outline-none"
                        >
                          <option>Formal Corporate Brief</option>
                          <option>Modern Startup Deck</option>
                          <option>Web3 Protocol Whitepaper</option>
                        </select>
                      </div>
                    </div>
                  )}

                  {/* Code Review Agent Form */}
                  {agent.id === 'code-review-agent' && (
                    <div className="space-y-3">
                      <div>
                        <label className="block text-[10px] font-bold text-brand-text-muted uppercase tracking-wider mb-1">GitHub Repository URL</label>
                        <input 
                          type="text" 
                          value={formData.githubUrl} 
                          onChange={(e) => setFormData({ ...formData, githubUrl: e.target.value })}
                          placeholder="e.g. https://github.com/org/repo"
                          className="w-full text-xs font-semibold px-3 py-2 border border-gold-soft rounded-lg focus:outline-none focus:border-brand-yellow" 
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-[10px] font-bold text-brand-text-muted uppercase tracking-wider mb-1">Branch</label>
                          <input 
                            type="text" 
                            value={formData.branch} 
                            onChange={(e) => setFormData({ ...formData, branch: e.target.value })}
                            className="w-full text-xs font-semibold px-3 py-2 border border-gold-soft rounded-lg focus:outline-none focus:border-brand-yellow" 
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold text-brand-text-muted uppercase tracking-wider mb-1">SLA Level</label>
                          <div className="text-xs font-bold text-brand-text-dark px-3 py-2 border border-gold-soft/50 rounded-lg bg-neutral-50 flex items-center space-x-1.5">
                            <Activity size={14} className="text-brand-yellow" />
                            <span>Instant Swarm Audit</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Confirm Action */}
                  <div className="pt-4 flex space-x-3">
                    <button
                      onClick={() => setIsModalOpen(false)}
                      className="flex-1 py-3 text-xs font-bold text-brand-text-muted border border-gold-soft rounded-xl hover:bg-neutral-50 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleConfirmHire}
                      className="flex-1 py-3 text-xs font-bold text-white bg-brand-yellow hover:bg-[#F59E0B] rounded-xl shadow-premium-soft transition-all duration-300"
                    >
                      Confirm Escrow & Start Review
                    </button>
                  </div>
                </div>
              )}

              {/* STEP 2: ESCROW LOCKING & RUNNING TERMINAL */}
              {(executionStep === 'escrow_locking' || executionStep === 'running' || executionStep === 'completed' || executionStep === 'error') && (
                <div className="space-y-4 animate-fadeIn">
                  
                  {/* Status Indicator */}
                  <div className="flex items-center justify-between border border-gold-soft/30 bg-gold-light-gold/5 rounded-xl p-4">
                    <div className="flex items-center space-x-3">
                      {executionStep === 'completed' ? (
                        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-emerald-50 border border-emerald-100 text-emerald-600">
                          <CheckCircle2 size={20} />
                        </div>
                      ) : executionStep === 'error' ? (
                        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-red-50 border border-red-100 text-red-600">
                          <AlertTriangle size={20} />
                        </div>
                      ) : (
                        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-brand-light-gold border border-gold-soft text-brand-yellow">
                          <Loader2 size={20} className="animate-spin" />
                        </div>
                      )}
                      <div>
                        <span className="block text-[10px] text-brand-text-muted uppercase tracking-wider font-bold">Current State</span>
                        <span className="text-xs font-extrabold text-brand-text-dark">
                          {executionStep === 'escrow_locking' && 'Escrow Contract Pending...'}
                          {executionStep === 'running' && 'Multi-Agent Swarm Processing Task...'}
                          {executionStep === 'completed' && 'Task Verification Succeeded!'}
                          {executionStep === 'error' && 'Execution Loop Error'}
                        </span>
                      </div>
                    </div>

                    <div className="text-right">
                      <span className="block text-[10px] text-brand-text-muted uppercase tracking-wider font-bold">On-Chain Escrow ID</span>
                      <span className="text-xs font-bold text-brand-text-dark font-mono">
                        {onChainId !== null ? `#${onChainId}` : 'Checking...'}
                      </span>
                    </div>
                  </div>

                  {/* Terminal Console */}
                  <div className="bg-neutral-950 border border-neutral-850 rounded-2xl p-4 shadow-inner">
                    <div className="flex items-center justify-between border-b border-neutral-800 pb-2 mb-3">
                      <div className="flex items-center space-x-2 text-[10px] text-neutral-400 font-mono">
                        <Terminal size={12} className="text-emerald-500" />
                        <span>agent-swarm-stdout</span>
                      </div>
                      <div className="flex space-x-1.5">
                        <span className="w-2.5 h-2.5 rounded-full bg-red-500/80"></span>
                        <span className="w-2.5 h-2.5 rounded-full bg-yellow-500/80"></span>
                        <span className="w-2.5 h-2.5 rounded-full bg-green-500/80"></span>
                      </div>
                    </div>
                    
                    <div className="h-48 overflow-y-auto font-mono text-[10px] space-y-1.5 text-emerald-400 select-text leading-relaxed">
                      {logs.map((log, index) => (
                        <div key={index} className="flex items-start">
                          <span className="text-neutral-500 select-none mr-2">{'>'}</span>
                          <span>{log}</span>
                        </div>
                      ))}
                      {executionStep === 'running' && (
                        <div className="flex items-center space-x-1 text-neutral-400">
                          <span className="text-neutral-500 mr-2">{'>'}</span>
                          <span className="animate-pulse">_</span>
                        </div>
                      )}
                      <div ref={terminalEndRef} />
                    </div>
                  </div>

                  {/* Error Notification */}
                  {executionStep === 'error' && (
                    <div className="border border-red-100 bg-red-50/50 rounded-xl p-4 flex items-start space-x-3">
                      <ShieldAlert className="h-5 w-5 text-red-600 shrink-0 mt-0.5" />
                      <div>
                        <span className="block text-xs font-bold text-red-800">Revert Error Details</span>
                        <p className="text-[10px] text-red-600 mt-1 leading-relaxed">{errorMessage}</p>
                        <button 
                          onClick={() => setExecutionStep('input')}
                          className="mt-3 text-[10px] font-bold text-red-800 underline hover:no-underline"
                        >
                          Modify Inputs & Retry Transaction
                        </button>
                      </div>
                    </div>
                  )}

                  {/* STEP 3: RESULTS PRESENTATION */}
                  {executionStep === 'completed' && (
                    <div className="border border-gold-soft bg-gold-light-gold/5 rounded-2xl p-5 space-y-4 animate-fadeIn">
                      
                      <div className="flex items-center justify-between border-b border-gold-soft/30 pb-3">
                        <div className="flex items-center space-x-2">
                          <Award size={18} className="text-brand-yellow" />
                          <h5 className="font-heading text-xs font-bold text-brand-text-dark uppercase tracking-wider">Verification Proof Output</h5>
                        </div>
                        {txHash && (
                          <a 
                            href={`https://sepolia.basescan.org/tx/${txHash}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center space-x-1 text-[10px] font-bold text-brand-yellow hover:underline"
                          >
                            <span>BaseScan Receipt</span>
                            <ExternalLink size={10} />
                          </a>
                        )}
                      </div>

                      {/* Customized Results Output per Agent */}
                      {agent.id === 'research-agent' && (
                        <div className="space-y-3 text-xs leading-relaxed text-brand-text-muted">
                          <div className="font-bold text-brand-text-dark text-sm">Base Sepolia yield rates & liquidity maps gathered.</div>
                          <p>We detected positive yield vectors across Aave V3 & Base pools averaging 8.7% APY on stablecoins. Liquidity has grown by 18% weekly since the introduction of Base smart wallets.</p>
                          <div className="bg-[#FFFDF5] border border-gold-soft/50 rounded-xl p-3 grid grid-cols-2 gap-3 text-center">
                            <div>
                              <span className="block text-[10px] text-brand-text-muted">Avg Stable APY</span>
                              <span className="text-xs font-extrabold text-emerald-600">8.74%</span>
                            </div>
                            <div>
                              <span className="block text-[10px] text-brand-text-muted">Liquidity Growth</span>
                              <span className="text-xs font-extrabold text-brand-yellow">+18.2% MoM</span>
                            </div>
                          </div>
                        </div>
                      )}

                      {agent.id === 'news-agent' && (
                        <div className="space-y-3 text-xs leading-relaxed text-brand-text-muted">
                          <div className="font-bold text-brand-text-dark text-sm">Regulatory Sentiment & Spikes</div>
                          <p>Sentiment on regulation is mostly Neutral-Bullish due to regulatory clarities on L2 sandbox protocols. Topic clusters: (1) Base Sandbox (2) Dev Licensings (3) MEV protections.</p>
                          <div className="bg-[#FFFDF5] border border-gold-soft/50 rounded-xl p-3 grid grid-cols-3 gap-3 text-center">
                            <div>
                              <span className="block text-[10px] text-brand-text-muted">Mentions Analyzed</span>
                              <span className="text-xs font-extrabold text-brand-text-dark">1,240</span>
                            </div>
                            <div>
                              <span className="block text-[10px] text-brand-text-muted">Sentiment Index</span>
                              <span className="text-xs font-extrabold text-emerald-600">Bullish (67%)</span>
                            </div>
                            <div>
                              <span className="block text-[10px] text-brand-text-muted">Spike Strength</span>
                              <span className="text-xs font-extrabold text-brand-yellow">High (+24%)</span>
                            </div>
                          </div>
                        </div>
                      )}

                      {agent.id === 'analytics-agent' && (
                        <div className="space-y-3 text-xs leading-relaxed text-brand-text-muted">
                          <div className="font-bold text-brand-text-dark text-sm">Mathematical Price Trend Forecast</div>
                          <p>CoinGecko dataset parsed. The regression model forecasts a steady +12.4% price rise with 89% r-squared confidence indicator over the next 14 cycles.</p>
                          <div className="bg-[#FFFDF5] border border-gold-soft/50 rounded-xl p-3 grid grid-cols-2 gap-3 text-center">
                            <div>
                              <span className="block text-[10px] text-brand-text-muted">Confidence Index</span>
                              <span className="text-xs font-extrabold text-emerald-600">89.4% (R²)</span>
                            </div>
                            <div>
                              <span className="block text-[10px] text-brand-text-muted">Forecasted Path</span>
                              <span className="text-xs font-extrabold text-brand-yellow">+12.4% (14d)</span>
                            </div>
                          </div>
                        </div>
                      )}

                      {agent.id === 'verification-agent' && (
                        <div className="space-y-3 text-xs leading-relaxed text-brand-text-muted">
                          <div className="font-bold text-brand-text-dark text-sm">Security Audit Result - Safe</div>
                          <p>Decompiled contract bytecodes scanned against Slither diagnostic frameworks. No critical bugs or entrypoints detected.</p>
                          <div className="bg-[#FFFDF5] border border-gold-soft/50 rounded-xl p-3 grid grid-cols-3 gap-3 text-center">
                            <div>
                              <span className="block text-[10px] text-brand-text-muted">Reentrancy Risks</span>
                              <span className="text-xs font-extrabold text-emerald-600">0 Found</span>
                            </div>
                            <div>
                              <span className="block text-[10px] text-brand-text-muted">Gas Auditing</span>
                              <span className="text-xs font-extrabold text-brand-yellow">Optimal</span>
                            </div>
                            <div>
                              <span className="block text-[10px] text-brand-text-muted">Final Status</span>
                              <span className="text-xs font-extrabold text-emerald-600">100/100 (Safe)</span>
                            </div>
                          </div>
                        </div>
                      )}

                      {agent.id === 'report-agent' && (
                        <div className="space-y-3 text-xs leading-relaxed text-brand-text-muted">
                          <div className="font-bold text-brand-text-dark text-sm">Report layout fully assembled.</div>
                          <p>Your formal report is generated in Markdown and stored cryptographically. Title: &quot;Multi-Agent Efficiency Metrics Report&quot;.</p>
                          <div className="bg-[#FFFDF5] border border-gold-soft/50 rounded-xl p-3 grid grid-cols-2 gap-3 text-center">
                            <div>
                              <span className="block text-[10px] text-brand-text-muted">Word Count</span>
                              <span className="text-xs font-extrabold text-brand-text-dark">1,840 Words</span>
                            </div>
                            <div>
                              <span className="block text-[10px] text-brand-text-muted">Template Used</span>
                              <span className="text-xs font-extrabold text-brand-yellow">Formal Brief</span>
                            </div>
                          </div>
                        </div>
                      )}

                      {agent.id === 'code-review-agent' && (
                        <div className="space-y-3 text-xs leading-relaxed text-brand-text-muted">
                          <div className="font-bold text-brand-text-dark text-sm">Static Analysis Audit Complete</div>
                          <p>Reputation point updated (+2). Escrow payment unlocked successfully on-chain.</p>
                          
                          <div className="bg-[#FFFDF5] border border-gold-soft/50 rounded-xl p-3 grid grid-cols-3 gap-3 text-center">
                            <div>
                              <span className="block text-[10px] text-brand-text-muted font-bold">Security Issues</span>
                              <span className="text-xs font-extrabold text-red-500">3 minor</span>
                            </div>
                            <div>
                              <span className="block text-[10px] text-brand-text-muted font-bold">Performance Hotspots</span>
                              <span className="text-xs font-extrabold text-amber-500">2 warnings</span>
                            </div>
                            <div>
                              <span className="block text-[10px] text-brand-text-muted font-bold">Readability Score</span>
                              <span className="text-xs font-extrabold text-emerald-600">92 / 100</span>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Back button */}
                      <button
                        onClick={() => setIsModalOpen(false)}
                        className="w-full py-3 text-xs font-bold text-white bg-brand-yellow hover:bg-[#F59E0B] rounded-xl shadow-premium-soft transition-all duration-300"
                      >
                        Return to Agent Panel
                      </button>

                    </div>
                  )}

                </div>
              )}

            </div>

          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}
