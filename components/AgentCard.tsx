'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Agent } from '../types';
import { useApp } from '@/lib/AppContext';
import DynamicIcon from './DynamicIcon';
import { Star, Check, Award, ArrowUpRight } from 'lucide-react';

interface AgentCardProps {
  agent: Agent;
}

export default function AgentCard({ agent }: AgentCardProps) {
  const { hireAgent, wallet } = useApp();
  const [isHiring, setIsHiring] = useState(false);
  const [hired, setHired] = useState(false);
  const router = useRouter();

  const getCategoryStyles = (cat: string) => {
    switch (cat) {
      case 'Research':
        return { bg: 'bg-emerald-50', text: 'text-emerald-600', border: 'border-emerald-100/60' };
      case 'Data':
        return { bg: 'bg-purple-50', text: 'text-purple-600', border: 'border-purple-100/60' };
      case 'Analytics':
        return { bg: 'bg-sky-50', text: 'text-sky-600', border: 'border-sky-100/60' };
      case 'Utility':
        return { bg: 'bg-indigo-50', text: 'text-indigo-600', border: 'border-indigo-100/60' };
      case 'Content':
        return { bg: 'bg-amber-50', text: 'text-amber-600', border: 'border-amber-100/60' };
      case 'Development':
        return { bg: 'bg-teal-50', text: 'text-teal-600', border: 'border-teal-100/60' };
      default:
        return { bg: 'bg-neutral-50', text: 'text-neutral-600', border: 'border-neutral-100' };
    }
  };

  const styles = getCategoryStyles(agent.category);

  const handleHireClick = async (e: React.MouseEvent) => {
    e.preventDefault(); // Stop navigation
    e.stopPropagation();

    if (!wallet.connected) {
      alert('Please connect your wallet first!');
      return;
    }

    setIsHiring(true);
    // Simulate smart contract interactions
    await new Promise((resolve) => setTimeout(resolve, 1500));
    
    const success = hireAgent(agent.id);
    setIsHiring(false);

    if (success) {
      setHired(true);
      setTimeout(() => setHired(false), 3000);
      router.push('/escrow'); // Redirect to escrow page to see their locked funds
    }
  };

  return (
    <div 
      onClick={() => router.push(`/agent/${agent.id}`)}
      className="group relative flex flex-col justify-between rounded-2xl p-6 glass-card hover-lift cursor-pointer"
    >
      <div>
        {/* Top Header inside Card */}
        <div className="flex items-start justify-between">
          <div className={`flex h-12 w-12 items-center justify-center rounded-2xl border ${styles.bg} ${styles.text} ${styles.border} shadow-sm group-hover:scale-105 transition-transform duration-300`}>
            <DynamicIcon name={agent.icon} className="h-6 w-6" />
          </div>

          <div className="flex items-center space-x-1 rounded-full bg-brand-light-gold/40 border border-gold-soft/40 px-2 py-1 text-xs font-semibold text-brand-text-dark">
            <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
            <span>{agent.rating.toFixed(1)}</span>
            <span className="text-brand-text-muted">({agent.reviewsCount})</span>
          </div>
        </div>

        {/* Info */}
        <div className="mt-5">
          <div className="flex items-center space-x-1.5">
            <h3 className="font-heading text-base font-bold tracking-tight text-brand-text-dark group-hover:text-brand-yellow transition-colors duration-200">
              {agent.name}
            </h3>
            {agent.verified && (
              <Award className="h-4 w-4 text-brand-yellow fill-brand-yellow/10" />
            )}
          </div>
          
          <p className="text-xs text-brand-text-muted mt-0.5">
            by <span className="font-semibold text-brand-text-dark">{agent.creator}</span>
          </p>

          <p className="text-sm text-brand-text-muted mt-3 line-clamp-2 leading-relaxed">
            {agent.description}
          </p>
        </div>

        {/* Stats Grid */}
        <div className="mt-4 grid grid-cols-2 gap-2 border-t border-neutral-50 pt-4 text-xs">
          <div>
            <span className="block text-brand-text-muted">Tasks Completed</span>
            <span className="font-bold text-brand-text-dark">{agent.tasksCompleted.toLocaleString()}</span>
          </div>
          <div>
            <span className="block text-brand-text-muted">Success Rate</span>
            <span className="font-bold text-emerald-600">{agent.successRate}%</span>
          </div>
        </div>
      </div>

      {/* Pricing & CTA */}
      <div className="mt-6 flex items-center justify-between border-t border-neutral-100 pt-4">
        <div>
          <span className="block text-xs text-brand-text-muted uppercase tracking-wider font-semibold">Price per Task</span>
          <div className="flex items-baseline space-x-1">
            <span className="font-heading text-lg font-extrabold text-brand-text-dark">
              {agent.price}
            </span>
            <span className="text-sm font-bold text-brand-yellow">CROO</span>
          </div>
        </div>

        <button
          onClick={handleHireClick}
          disabled={isHiring}
          className={`flex items-center space-x-1.5 rounded-xl px-4 py-2.5 text-sm font-bold transition-all duration-300 ${
            hired
              ? 'bg-emerald-500 text-white'
              : 'bg-brand-yellow hover:bg-[#F59E0B] text-white shadow-premium-soft'
          } active:scale-95`}
        >
          {isHiring ? (
            <div className="h-4.5 w-4.5 animate-spin rounded-full border-2 border-white border-t-transparent" />
          ) : hired ? (
            <>
              <Check className="h-3.5 w-3.5" />
              <span>Hired!</span>
            </>
          ) : (
            <>
              <span>Hire Agent</span>
              <ArrowUpRight className="h-3.5 w-3.5" />
            </>
          )}
        </button>
      </div>
    </div>
  );
}
