'use client';

import React, { useState } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import DashboardSidebar from '@/components/DashboardSidebar';
import { useApp } from '@/lib/AppContext';
import { Lock, Unlock, RefreshCcw, ShieldCheck, AlertCircle, FileText, ChevronRight } from 'lucide-react';

export default function EscrowPage() {
  const { escrows, releaseEscrow, refundEscrow } = useApp();
  const [selectedEscrowId, setSelectedEscrowId] = useState<string | null>(escrows[0]?.id || null);

  const selectedEscrow = escrows.find(e => e.id === selectedEscrowId);

  // Escrow Calculations
  const lockedValue = escrows
    .filter(e => e.status === 'locked')
    .reduce((acc, curr) => acc + curr.amount, 0);

  const releasedValue = escrows
    .filter(e => e.status === 'released')
    .reduce((acc, curr) => acc + curr.amount, 0);

  const getStatusBadgeStyles = (status: string) => {
    switch (status) {
      case 'locked':
        return 'bg-amber-50 text-amber-600 border-amber-100';
      case 'released':
        return 'bg-emerald-50 text-emerald-600 border-emerald-100';
      case 'refunded':
        return 'bg-red-50 text-red-600 border-red-100';
      default:
        return 'bg-neutral-50 text-neutral-600 border-neutral-100';
    }
  };

  return (
    <div className="flex min-h-screen flex-col bg-[#FFFDF5]">
      <Header />

      <main className="flex-1 mx-auto w-full max-w-[95%] px-4 sm:px-6 lg:px-8 py-10">
        <div className="flex flex-col md:flex-row gap-8">
          
          {/* Dashboard Sidebar */}
          <DashboardSidebar activeTab="escrow" />

          {/* Main Escrow Dashboard */}
          <div className="flex-1 min-w-0 space-y-6">
            
            {/* Page Header */}
            <div>
              <h1 className="font-heading text-2xl font-extrabold text-brand-text-dark flex items-center gap-2">
                <Lock className="text-brand-yellow" />
                <span>On-Chain Escrow Settlements</span>
              </h1>
              <p className="text-xs text-brand-text-muted mt-1">
                Audit smart contract wallets, release creator funds, or request refunds according to decentralized oracle consensus.
              </p>
            </div>

            {/* Metrics Row */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="p-5 glass-card rounded-2xl hover-lift">
                <span className="block text-[10px] font-bold text-brand-text-muted uppercase tracking-wider">Locked in Escrow</span>
                <p className="font-heading text-xl font-extrabold text-brand-text-dark mt-2">{lockedValue.toFixed(3)} CROO</p>
                <span className="text-[9px] text-brand-text-muted mt-1 block">Active service guarantees</span>
              </div>

              <div className="p-5 glass-card rounded-2xl hover-lift">
                <span className="block text-[10px] font-bold text-brand-text-muted uppercase tracking-wider">Settled Payouts</span>
                <p className="font-heading text-xl font-extrabold text-brand-text-dark mt-2">{releasedValue.toFixed(3)} CROO</p>
                <span className="text-[9px] text-brand-text-muted mt-1 block">Released to creators</span>
              </div>

              <div className="p-5 glass-card rounded-2xl hover-lift">
                <span className="block text-[10px] font-bold text-brand-text-muted uppercase tracking-wider">Active Guarantees</span>
                <p className="font-heading text-xl font-extrabold text-brand-text-dark mt-2">
                  {escrows.filter(e => e.status === 'locked').length} Contracts
                </p>
                <span className="text-[9px] text-brand-text-muted mt-1 block">Verifying execution reports</span>
              </div>
            </div>

            {/* Split Screen Panel */}
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
              
              {/* Left Column: Escrow Contract List */}
              <div className="lg:col-span-3 p-5 glass-card rounded-2xl space-y-4">
                <h3 className="font-heading text-xs font-bold text-brand-text-dark uppercase tracking-wider pb-3 border-b border-neutral-100">
                  Escrow Registry
                </h3>

                <div className="space-y-3 max-h-[400px] overflow-y-auto pr-1">
                  {escrows.map((esc) => (
                    <div
                      key={esc.id}
                      onClick={() => setSelectedEscrowId(esc.id)}
                      className={`p-4 border rounded-xl cursor-pointer transition-all-300 ${
                        selectedEscrowId === esc.id
                          ? 'border-brand-yellow bg-brand-light-gold/15 shadow-sm'
                          : 'border-neutral-100 hover:bg-neutral-50/50'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="space-y-1">
                          <span className="text-[9px] font-mono font-bold text-brand-text-muted uppercase block">{esc.contractAddress}</span>
                          <span className="text-xs font-bold text-brand-text-dark block">{esc.agentName}</span>
                        </div>
                        
                        <div className="text-right">
                          <span className="text-xs font-extrabold text-brand-text-dark block">{esc.amount} CROO</span>
                          <span className={`inline-block rounded-full border px-2 py-0.5 text-[9px] font-bold mt-1 uppercase ${getStatusBadgeStyles(esc.status)}`}>
                            {esc.status}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Right Column: Escrow Smart Contract Telemetry detail */}
              <div className="lg:col-span-2">
                {selectedEscrow ? (
                  <div className="p-5 glass-card rounded-2xl space-y-6">
                    
                    {/* Contract Title & Status */}
                    <div className="pb-4 border-b border-neutral-100">
                      <span className="text-[9px] font-mono font-bold text-brand-text-muted block">CONTRACT WALLET ID</span>
                      <h3 className="font-heading text-sm font-bold text-brand-text-dark mt-1 truncate">{selectedEscrow.contractAddress}</h3>
                      
                      <div className="mt-3 flex items-center justify-between text-xs">
                        <span className="text-brand-text-muted">Status:</span>
                        <span className={`rounded-full border px-2 py-0.5 text-[9px] font-bold uppercase ${getStatusBadgeStyles(selectedEscrow.status)}`}>
                          {selectedEscrow.status}
                        </span>
                      </div>
                    </div>

                    {/* Escrow Timeline */}
                    <div className="space-y-4">
                      <span className="block text-[10px] font-bold text-brand-text-muted uppercase tracking-wider">Contract Milestones</span>
                      
                      <div className="relative border-l border-neutral-100 pl-5 ml-2.5 space-y-4">
                        {[
                          { title: 'Funds Locked in Escrow', desc: `Client deposited ${selectedEscrow.amount} CROO`, done: true },
                          { title: 'Agent Trigger Sent', desc: 'Secure RPC initialized agent node', done: true },
                          { title: 'Execution Report Uploaded', desc: 'Audit report deposited on-chain', done: selectedEscrow.status === 'released' },
                          { title: 'Consensus Verdict Approved', desc: 'Oracle consensus releases payment', done: selectedEscrow.status === 'released' }
                        ].map((milestone, idx) => (
                          <div key={idx} className="relative text-xs">
                            <div className={`absolute -left-[27px] top-0.5 flex h-4.5 w-4.5 items-center justify-center rounded-full border ${
                              milestone.done 
                                ? 'bg-brand-yellow border-brand-yellow text-white' 
                                : 'bg-white border-neutral-200 text-neutral-300'
                            }`}>
                              <CheckIcon size={10} />
                            </div>
                            <div>
                              <span className={`font-bold block ${milestone.done ? 'text-brand-text-dark' : 'text-brand-text-muted'}`}>
                                {milestone.title}
                              </span>
                              <span className="text-[10px] text-brand-text-muted mt-0.5 block">{milestone.desc}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Interactive Escrow Control Actions */}
                    {selectedEscrow.status === 'locked' && (
                      <div className="pt-4 border-t border-neutral-100 space-y-2.5">
                        <button
                          onClick={() => {
                            releaseEscrow(selectedEscrow.id);
                            alert('Transaction broadcasted. Funds successfully released to the agent developer.');
                          }}
                          className="w-full flex items-center justify-center space-x-2 rounded-xl bg-emerald-500 hover:bg-emerald-600 py-3 text-xs font-bold text-white shadow-sm"
                        >
                          <Unlock size={14} />
                          <span>Release Payout to Creator</span>
                        </button>
                        
                        <button
                          onClick={() => {
                            refundEscrow(selectedEscrow.id);
                            alert('Escrow smart contract state set to Refunded. Funds returned to your wallet.');
                          }}
                          className="w-full flex items-center justify-center space-x-2 rounded-xl border border-red-200 hover:bg-red-50 py-3 text-xs font-bold text-red-600 bg-white"
                        >
                          <RefreshCcw size={14} />
                          <span>Request Contract Refund</span>
                        </button>
                      </div>
                    )}

                    {selectedEscrow.status === 'released' && (
                      <div className="pt-4 border-t border-neutral-100 rounded-xl bg-emerald-50/50 border border-emerald-100/50 p-4 text-center text-xs flex flex-col items-center gap-1.5">
                        <ShieldCheck className="text-emerald-500 h-8 w-8" />
                        <span className="font-bold text-emerald-800">Contract Fully Settled</span>
                        <p className="text-[10px] text-emerald-700 leading-relaxed">
                          The funds have been released and deposited to the agent creator wallet. Transaction receipt verified on block #{Math.floor(Math.random() * 90000) + 10000}.
                        </p>
                      </div>
                    )}

                    {selectedEscrow.status === 'refunded' && (
                      <div className="pt-4 border-t border-neutral-100 rounded-xl bg-red-50/50 border border-red-100/50 p-4 text-center text-xs flex flex-col items-center gap-1.5">
                        <AlertCircle className="text-red-500 h-8 w-8" />
                        <span className="font-bold text-red-800">Contract Refunded</span>
                        <p className="text-[10px] text-red-700 leading-relaxed">
                          The escrow transaction was cancelled or failed SLA checking. Funds were returned back to your developer client wallet.
                        </p>
                      </div>
                    )}

                  </div>
                ) : (
                  <div className="p-8 text-center glass-card rounded-2xl">
                    <FileText className="text-brand-yellow mx-auto mb-4" />
                    <p className="text-xs text-brand-text-muted">Select an escrow contract registry item to audit metrics and release payouts.</p>
                  </div>
                )}
              </div>

            </div>

          </div>

        </div>
      </main>

      <Footer />
    </div>
  );
}

function CheckIcon({ size = 12 }: { size?: number }) {
  return (
    <svg 
      className="fill-current"
      style={{ width: size, height: size }}
      viewBox="0 0 24 24"
    >
      <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
    </svg>
  );
}
