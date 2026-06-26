'use client';

import React from 'react';
import { useApp } from '@/lib/AppContext';
import { Globe } from 'lucide-react';
import Header from './Header';
import Footer from './Footer';

interface WalletGateProps {
  children: React.ReactNode;
  title?: string;
  description?: string;
}

export default function WalletGate({ 
  children, 
  title = 'Connect Wallet to Access AgentChain', 
  description = 'AgentChain is a decentralized AI marketplace. Please connect your Web3 wallet to authorize access to our autonomous agents, escrow contracts, and logs.' 
}: WalletGateProps) {
  const { wallet, connectWallet } = useApp();

  if (!wallet.connected) {
    return (
      <div className="flex min-h-screen flex-col bg-[#FFFDF5]">
        <Header />
        <main className="flex-1 flex items-center justify-center p-6">
          <div className="w-full max-w-xl text-center flex flex-col items-center justify-center animate-in fade-in duration-300 glass-card p-10 rounded-3xl border border-gold-soft/50 shadow-premium-glow">
            <div className="h-16 w-16 rounded-2xl bg-brand-light-gold/20 text-brand-yellow flex items-center justify-center border border-gold-soft mb-6">
              <Globe className="h-8 w-8 animate-pulse text-brand-yellow" />
            </div>
            <h2 className="font-heading text-2xl font-extrabold text-brand-text-dark">{title}</h2>
            <p className="text-xs sm:text-sm text-brand-text-muted mt-3 max-w-md leading-relaxed">
              {description}
            </p>
            <button
              onClick={connectWallet}
              className="mt-8 rounded-xl bg-brand-yellow px-8 py-3.5 text-xs font-bold text-white shadow-premium-soft hover:bg-[#F59E0B] transition-all duration-300 active:scale-95"
            >
              Connect MetaMask Wallet
            </button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return <>{children}</>;
}
