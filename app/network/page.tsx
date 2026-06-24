'use client';

import React, { useState } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import DashboardSidebar from '@/components/DashboardSidebar';
import { Network, ArrowRight, Play, Server, DollarSign, Activity, FileCheck } from 'lucide-react';

export default function NetworkPage() {
  const [activeEdge, setActiveEdge] = useState<string | null>(null);

  // Connection data representation
  const nodes = [
    { id: 'research', name: 'Research Agent', role: 'Main Orchestrator', color: '#FBBF24', cx: 250, cy: 110, icon: 'Search' },
    { id: 'news', name: 'News Agent', role: 'Feed Scraper', color: '#8B5CF6', cx: 80, cy: 260, icon: 'Globe' },
    { id: 'analytics', name: 'Analytics Agent', role: 'Data Compiler', color: '#0EA5E9', cx: 250, cy: 300, icon: 'BarChart' },
    { id: 'verification', name: 'Verification Agent', role: 'Oracle Auditor', color: '#10B981', cx: 420, cy: 260, icon: 'ShieldCheck' },
  ];

  const connections = [
    { from: 'research', to: 'news', label: 'Fetches Feed Data', price: '0.015 CROO', latency: '420ms', task: 'Sentiment scoring' },
    { from: 'research', to: 'analytics', label: 'Processes CSV Data', price: '0.025 CROO', latency: '850ms', task: 'Trend calculation' },
    { from: 'research', to: 'verification', label: 'Verifies Signatures', price: '0.018 CROO', latency: '1200ms', task: 'Consensus checking' },
  ];

  return (
    <div className="flex min-h-screen flex-col bg-[#FFFDF5]">
      <Header />

      <main className="flex-1 mx-auto w-full max-w-[95%] px-4 sm:px-6 lg:px-8 py-10">
        <div className="flex flex-col md:flex-row gap-8">
          
          {/* Dashboard Sidebar */}
          <DashboardSidebar activeTab="network" />

          {/* Network Visualization Container */}
          <div className="flex-1 min-w-0 space-y-6">
            
            {/* Page Header */}
            <div>
              <h1 className="font-heading text-2xl font-extrabold text-brand-text-dark flex items-center gap-2">
                <Network className="text-brand-yellow" />
                <span>Agent-to-Agent Network (A2A)</span>
              </h1>
              <p className="text-xs text-brand-text-muted mt-1">
                Visualize multi-agent workflows. Monitor real-time telemetry, peer delegation payments, and on-chain dependency logs.
              </p>
            </div>

            {/* Interactive Graph Box */}
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
              
              {/* Left SVG canvas */}
              <div className="xl:col-span-2 glass-card rounded-2xl p-6 flex flex-col items-center justify-center relative overflow-hidden min-h-[450px]">
                <div className="absolute top-4 left-4 bg-brand-light-gold/25 border border-gold-soft rounded-lg px-2.5 py-1 text-[9px] font-bold uppercase tracking-wider text-brand-text-dark flex items-center gap-1.5 animate-pulse">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                  <span>Network Telemetry Active</span>
                </div>

                {/* SVG Graph Canvas */}
                <svg className="w-full max-w-[500px] h-[400px] overflow-visible" viewBox="0 0 500 400">
                  {/* Drawing connecting path arrows */}
                  {connections.map((conn, idx) => {
                    const fromNode = nodes.find(n => n.id === conn.from)!;
                    const toNode = nodes.find(n => n.id === conn.to)!;
                    
                    const isSelected = activeEdge === `${conn.from}-${conn.to}`;

                    return (
                      <g 
                        key={idx} 
                        className="cursor-pointer group"
                        onClick={() => setActiveEdge(isSelected ? null : `${conn.from}-${conn.to}`)}
                      >
                        {/* Interactive glow border line */}
                        <line
                          x1={fromNode.cx}
                          y1={fromNode.cy}
                          x2={toNode.cx}
                          y2={toNode.cy}
                          stroke={isSelected ? '#FBBF24' : 'rgba(251, 191, 36, 0.15)'}
                          strokeWidth={isSelected ? 6 : 8}
                          className="transition-all duration-300 opacity-60 group-hover:stroke-brand-yellow/30"
                        />

                        {/* Solid line */}
                        <line
                          x1={fromNode.cx}
                          y1={fromNode.cy}
                          x2={toNode.cx}
                          y2={toNode.cy}
                          stroke={isSelected ? '#D97706' : '#94A3B8'}
                          strokeWidth={isSelected ? 2.5 : 1.5}
                          strokeDasharray="4 4"
                          className="transition-all duration-300"
                        />

                        {/* Moving Pulse Dot representing smart contract payments & triggers */}
                        <circle r="4.5" fill={toNode.color} className="shadow-md">
                          <animateMotion
                            path={`M ${fromNode.cx} ${fromNode.cy} L ${toNode.cx} ${toNode.cy}`}
                            dur={`${2 + idx * 0.7}s`}
                            repeatCount="indefinite"
                          />
                        </circle>
                      </g>
                    );
                  })}

                  {/* Draw Nodes */}
                  {nodes.map((node) => (
                    <g key={node.id} className="cursor-help group">
                      <circle
                        cx={node.cx}
                        cy={node.cy}
                        r="38"
                        fill="white"
                        stroke={node.color}
                        strokeWidth="2.5"
                        className="shadow-md transition-all duration-300 group-hover:scale-105 group-hover:stroke-brand-yellow"
                      />
                      <circle
                        cx={node.cx}
                        cy={node.cy}
                        r="32"
                        fill={`${node.color}15`}
                      />

                      {/* Label Text */}
                      <text
                        x={node.cx}
                        y={node.cy + 52}
                        textAnchor="middle"
                        className="fill-brand-text-dark font-heading text-[10px] font-bold"
                      >
                        {node.name}
                      </text>
                      <text
                        x={node.cx}
                        y={node.cy + 64}
                        textAnchor="middle"
                        className="fill-brand-text-muted text-[8px] font-semibold uppercase tracking-wider"
                      >
                        {node.role}
                      </text>

                      {/* Indicator symbol in circle */}
                      <text
                        x={node.cx}
                        y={node.cy + 4}
                        textAnchor="middle"
                        className="fill-brand-text-dark font-bold text-xs"
                      >
                        {node.id === 'research' ? '🤖' : node.id === 'news' ? '📰' : node.id === 'analytics' ? '📈' : '🛡️'}
                      </text>
                    </g>
                  ))}
                </svg>
              </div>

              {/* Right Telemetry Details sidebar panel */}
              <div className="space-y-4">
                
                {/* Connection stats telemetry panel */}
                <div className="glass-card rounded-2xl p-6 space-y-4">
                  <h3 className="font-heading text-xs font-bold text-brand-text-dark uppercase tracking-wider">A2A Telemetry Monitor</h3>
                  
                  {activeEdge ? (
                    (() => {
                      const activeConn = connections.find(c => `${c.from}-${c.to}` === activeEdge)!;
                      const toNode = nodes.find(n => n.id === activeConn.to)!;
                      return (
                        <div className="space-y-4 animate-in fade-in duration-200 text-xs">
                          <div className="rounded-xl bg-brand-light-gold/20 p-4 border border-gold-soft">
                            <span className="text-[10px] font-bold text-brand-text-muted uppercase">Selected Channel</span>
                            <div className="font-bold text-brand-text-dark mt-1 flex items-center gap-1">
                              <span>Research Agent</span>
                              <ArrowRight size={12} className="text-brand-yellow" />
                              <span>{toNode.name}</span>
                            </div>
                          </div>

                          <div className="grid grid-cols-2 gap-4">
                            <div className="border border-neutral-100 rounded-xl p-3">
                              <span className="block text-[10px] text-brand-text-muted uppercase font-bold">Transfer Cost</span>
                              <span className="font-bold text-brand-text-dark mt-1 block">{activeConn.price}</span>
                            </div>
                            <div className="border border-neutral-100 rounded-xl p-3">
                              <span className="block text-[10px] text-brand-text-muted uppercase font-bold">RPC Latency</span>
                              <span className="font-bold text-emerald-600 mt-1 block">{activeConn.latency}</span>
                            </div>
                          </div>

                          <div className="border border-neutral-100 rounded-xl p-3">
                            <span className="block text-[10px] text-brand-text-muted uppercase font-bold">Assigned Task</span>
                            <span className="font-semibold text-brand-text-dark mt-1 block">{activeConn.task}</span>
                          </div>

                          <button 
                            onClick={() => setActiveEdge(null)}
                            className="w-full py-2 bg-neutral-100 hover:bg-neutral-200 text-neutral-600 font-bold rounded-xl"
                          >
                            Reset Focus
                          </button>
                        </div>
                      );
                    })()
                  ) : (
                    <div className="text-center py-10">
                      <p className="text-xs text-brand-text-muted leading-relaxed">
                        Click on any animated dotted connection path to audit smart contract triggers, gas latency, and settlement amounts.
                      </p>
                    </div>
                  )}
                </div>

                {/* Quick actions Panel */}
                <div className="glass-card rounded-2xl p-6 space-y-4 text-xs">
                  <h3 className="font-heading text-xs font-bold text-brand-text-dark uppercase tracking-wider">Network Insights</h3>
                  
                  <div className="space-y-3">
                    <div className="flex items-start gap-2.5">
                      <DollarSign size={16} className="text-brand-yellow mt-0.5" />
                      <div>
                        <span className="font-bold text-brand-text-dark">Dynamic Fee Locking</span>
                        <p className="text-brand-text-muted mt-0.5">Sub-agents receive locked payouts only upon signature execution digests.</p>
                      </div>
                    </div>
                    
                    <div className="flex items-start gap-2.5">
                      <FileCheck size={16} className="text-brand-yellow mt-0.5" />
                      <div>
                        <span className="font-bold text-brand-text-dark">On-Chain Consensus</span>
                        <p className="text-brand-text-muted mt-0.5">Verification oracles validate outputs, avoiding single-agent failures.</p>
                      </div>
                    </div>
                  </div>
                </div>

              </div>

            </div>

          </div>

        </div>
      </main>

      <Footer />
    </div>
  );
}
