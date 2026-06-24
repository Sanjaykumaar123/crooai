'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { Agent, Transaction, Escrow, WalletState } from '../types';
import { INITIAL_AGENTS, INITIAL_TRANSACTIONS, INITIAL_ESCROWS } from './mockData';

interface AppContextType {
  wallet: WalletState;
  agents: Agent[];
  transactions: Transaction[];
  escrows: Escrow[];
  connectWallet: () => void;
  disconnectWallet: () => void;
  createAgent: (agent: Omit<Agent, 'id' | 'rating' | 'reviewsCount' | 'tasksCompleted' | 'successRate' | 'reviews' | 'history' | 'createdDate'>) => void;
  hireAgent: (agentId: string) => boolean;
  releaseEscrow: (escrowId: string) => void;
  refundEscrow: (escrowId: string) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [wallet, setWallet] = useState<WalletState>({
    connected: true,
    address: '0xAf82...C3D4',
    balance: 2.45,
  });

  const [agents, setAgents] = useState<Agent[]>(INITIAL_AGENTS);
  const [transactions, setTransactions] = useState<Transaction[]>(INITIAL_TRANSACTIONS);
  const [escrows, setEscrows] = useState<Escrow[]>(INITIAL_ESCROWS);

  // Sync to local storage if running in browser
  useEffect(() => {
    const savedAgents = localStorage.getItem('agentchain_agents');
    const savedTransactions = localStorage.getItem('agentchain_transactions');
    const savedEscrows = localStorage.getItem('agentchain_escrows');
    const savedWallet = localStorage.getItem('agentchain_wallet');

    if (savedAgents) setAgents(JSON.parse(savedAgents));
    if (savedTransactions) setTransactions(JSON.parse(savedTransactions));
    if (savedEscrows) setEscrows(JSON.parse(savedEscrows));
    if (savedWallet) setWallet(JSON.parse(savedWallet));
  }, []);

  const saveToStorage = (updatedAgents: Agent[], updatedTx: Transaction[], updatedEscrows: Escrow[], updatedWallet: WalletState) => {
    localStorage.setItem('agentchain_agents', JSON.stringify(updatedAgents));
    localStorage.setItem('agentchain_transactions', JSON.stringify(updatedTx));
    localStorage.setItem('agentchain_escrows', JSON.stringify(updatedEscrows));
    localStorage.setItem('agentchain_wallet', JSON.stringify(updatedWallet));
  };

  const connectWallet = () => {
    const newWallet: WalletState = {
      connected: true,
      address: '0xAf82...C3D4',
      balance: 5.0,
    };
    setWallet(newWallet);
    saveToStorage(agents, transactions, escrows, newWallet);
  };

  const disconnectWallet = () => {
    const newWallet: WalletState = {
      connected: false,
      address: null,
      balance: 0.0,
    };
    setWallet(newWallet);
    saveToStorage(agents, transactions, escrows, newWallet);
  };

  const createAgent = (newAgentData: Omit<Agent, 'id' | 'rating' | 'reviewsCount' | 'tasksCompleted' | 'successRate' | 'reviews' | 'history' | 'createdDate'>) => {
    const newAgent: Agent = {
      ...newAgentData,
      id: newAgentData.name.toLowerCase().replace(/\s+/g, '-'),
      rating: 5.0,
      reviewsCount: 0,
      tasksCompleted: 0,
      successRate: 100.0,
      reviews: [],
      history: [],
      createdDate: new Date().toISOString().split('T')[0],
    };

    const updatedAgents = [newAgent, ...agents];
    setAgents(updatedAgents);

    // Create a transaction for registration fee/creation log
    const newTx: Transaction = {
      id: `tx-${Math.random().toString(36).substr(2, 9)}`,
      type: 'deposit',
      agentId: newAgent.id,
      agentName: newAgent.name,
      amount: 0,
      status: 'completed',
      timestamp: new Date().toLocaleString(),
      txHash: `0x${Math.random().toString(16).substr(2, 8)}...${Math.random().toString(16).substr(2, 8)}`,
      sender: wallet.address || '0x0000...0000',
      receiver: '0xRegistryContract'
    };

    const updatedTx = [newTx, ...transactions];
    setTransactions(updatedTx);
    saveToStorage(updatedAgents, updatedTx, escrows, wallet);
  };

  const hireAgent = (agentId: string): boolean => {
    const agent = agents.find((a) => a.id === agentId);
    if (!agent) return false;

    if (wallet.balance < agent.price) {
      alert('Insufficient CROO balance to hire this agent!');
      return false;
    }

    const updatedWallet: WalletState = {
      ...wallet,
      balance: parseFloat((wallet.balance - agent.price).toFixed(4)),
    };
    setWallet(updatedWallet);

    // Create an escrow
    const newEscrow: Escrow = {
      id: `esc-${Math.random().toString(36).substr(2, 9)}`,
      agentId: agent.id,
      agentName: agent.name,
      client: wallet.address || '0xAf82...C3D4',
      amount: agent.price,
      status: 'locked',
      taskStatus: 'pending',
      createdAt: new Date().toLocaleString().split(',')[0] + ' ' + new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      contractAddress: `0xEscrow_${agent.name.replace(/\s+/g, '')}_${Math.random().toString(36).substr(2, 4)}`,
    };

    const updatedEscrows = [newEscrow, ...escrows];
    setEscrows(updatedEscrows);

    // Create transaction
    const newTx: Transaction = {
      id: `tx-${Math.random().toString(36).substr(2, 9)}`,
      type: 'escrow_lock',
      agentId: agent.id,
      agentName: agent.name,
      amount: agent.price,
      status: 'escrowed',
      timestamp: newEscrow.createdAt,
      txHash: `0x${Math.random().toString(16).substr(2, 8)}...${Math.random().toString(16).substr(2, 8)}`,
      sender: wallet.address || '0xAf82...C3D4',
      receiver: '0xEscrowContract'
    };
    newTx.timestamp = newEscrow.createdAt;

    const updatedTx = [newTx, ...transactions];
    setTransactions(updatedTx);

    // Update agent's history and task count
    const updatedAgents = agents.map((a) => {
      if (a.id === agentId) {
        return {
          ...a,
          tasksCompleted: a.tasksCompleted + 1,
          history: [
            {
              id: `h-${Math.random().toString(36).substr(2, 9)}`,
              taskName: `Autonomous Service Execution Request`,
              status: 'running' as const,
              timestamp: newEscrow.createdAt,
              cost: a.price,
              caller: wallet.address || '0xAf82...C3D4'
            },
            ...a.history
          ]
        };
      }
      return a;
    });
    setAgents(updatedAgents);

    saveToStorage(updatedAgents, updatedTx, updatedEscrows, updatedWallet);
    return true;
  };

  const releaseEscrow = (escrowId: string) => {
    const escrow = escrows.find((e) => e.id === escrowId);
    if (!escrow || escrow.status !== 'locked') return;

    const updatedEscrows = escrows.map((e) => {
      if (e.id === escrowId) {
        return {
          ...e,
          status: 'released' as const,
          taskStatus: 'verified' as const,
          releasedAt: new Date().toLocaleString().split(',')[0] + ' ' + new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        };
      }
      return e;
    });
    setEscrows(updatedEscrows);

    // Update transaction to show completed / generate payout tx
    const newTx: Transaction = {
      id: `tx-${Math.random().toString(36).substr(2, 9)}`,
      type: 'escrow_release',
      agentId: escrow.agentId,
      agentName: escrow.agentName,
      amount: escrow.amount,
      status: 'completed',
      timestamp: new Date().toLocaleString().split(',')[0] + ' ' + new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      txHash: `0x${Math.random().toString(16).substr(2, 8)}...${Math.random().toString(16).substr(2, 8)}`,
      sender: '0xEscrowContract',
      receiver: `0x${escrow.agentName.substring(0, 4)}...Payout`
    };

    // Update agent task status to completed in history
    const updatedAgents = agents.map((a) => {
      if (a.id === escrow.agentId) {
        const updatedHistory = a.history.map((h, index) => {
          // Complete the latest running task
          if (h.status === 'running') {
            return { ...h, status: 'completed' as const };
          }
          return h;
        });
        return { ...a, history: updatedHistory };
      }
      return a;
    });
    setAgents(updatedAgents);

    const updatedTx = [newTx, ...transactions];
    setTransactions(updatedTx);
    saveToStorage(updatedAgents, updatedTx, updatedEscrows, wallet);
  };

  const refundEscrow = (escrowId: string) => {
    const escrow = escrows.find((e) => e.id === escrowId);
    if (!escrow || escrow.status !== 'locked') return;

    const updatedEscrows = escrows.map((e) => {
      if (e.id === escrowId) {
        return {
          ...e,
          status: 'refunded' as const,
          taskStatus: 'failed' as const,
        };
      }
      return e;
    });
    setEscrows(updatedEscrows);

    const updatedWallet = {
      ...wallet,
      balance: parseFloat((wallet.balance + escrow.amount).toFixed(4)),
    };
    setWallet(updatedWallet);

    const newTx: Transaction = {
      id: `tx-${Math.random().toString(36).substr(2, 9)}`,
      type: 'payout',
      agentId: escrow.agentId,
      agentName: escrow.agentName,
      amount: escrow.amount,
      status: 'failed',
      timestamp: new Date().toLocaleString().split(',')[0] + ' ' + new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      txHash: `0x${Math.random().toString(16).substr(2, 8)}...${Math.random().toString(16).substr(2, 8)}`,
      sender: '0xEscrowContract',
      receiver: wallet.address || '0xAf82...C3D4'
    };

    // Update agent task status to failed in history
    const updatedAgents = agents.map((a) => {
      if (a.id === escrow.agentId) {
        const updatedHistory = a.history.map((h) => {
          if (h.status === 'running') {
            return { ...h, status: 'failed' as const };
          }
          return h;
        });
        return { ...a, history: updatedHistory };
      }
      return a;
    });
    setAgents(updatedAgents);

    const updatedTx = [newTx, ...transactions];
    setTransactions(updatedTx);
    saveToStorage(updatedAgents, updatedTx, updatedEscrows, updatedWallet);
  };

  return (
    <AppContext.Provider
      value={{
        wallet,
        agents,
        transactions,
        escrows,
        connectWallet,
        disconnectWallet,
        createAgent,
        hireAgent,
        releaseEscrow,
        refundEscrow,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}
