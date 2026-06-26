'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { Agent, Transaction, Escrow, WalletState } from '../types';
import { INITIAL_AGENTS, INITIAL_TRANSACTIONS, INITIAL_ESCROWS } from './mockData';
import { ethers } from 'ethers';

const getNumericalId = (id: string): number => {
  if (id === 'research-agent' || id === 'research') return 1;
  if (id === 'news-agent' || id === 'news') return 2;
  if (id === 'analytics-agent' || id === 'analytics') return 3;
  if (id === 'verification-agent' || id === 'verification') return 4;
  if (id === 'report-agent' || id === 'report') return 5;
  if (id === 'code-review-agent' || id === 'code-review') return 6;
  const parsed = parseInt(id.replace(/\D/g, ''), 10);
  if (!isNaN(parsed) && parsed > 0) return parsed;
  return 7;
};
interface AppContextType {
  wallet: WalletState;
  agents: Agent[];
  transactions: Transaction[];
  escrows: Escrow[];
  connectWallet: () => void;
  disconnectWallet: () => void;
  createAgent: (agent: Omit<Agent, 'id' | 'rating' | 'reviewsCount' | 'tasksCompleted' | 'successRate' | 'reviews' | 'history' | 'createdDate'>) => Promise<{ success: boolean; txHash?: string; agentId?: number; error?: string }>;
  hireAgent: (agentId: string) => Promise<{ success: boolean; txHash?: string; onChainId?: number; escrowId?: string; error?: string }>;
  releaseEscrow: (escrowId: string) => Promise<{ success: boolean; txHash?: string; error?: string }>;
  refundEscrow: (escrowId: string) => Promise<{ success: boolean; txHash?: string; error?: string }>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [wallet, setWallet] = useState<WalletState>({
    connected: false,
    address: null,
    balance: 0.0,
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
    if (savedWallet) {
      setWallet(JSON.parse(savedWallet));
    }

    // Listen to account changes if ethereum provider exists
    if (typeof window !== 'undefined' && (window as any).ethereum) {
      const handleAccountsChanged = (accounts: string[]) => {
        if (accounts.length === 0) {
          disconnectWallet();
        } else {
          // Re-fetch balance
          const address = accounts[0];
          (window as any).ethereum.request({
            method: 'eth_getBalance',
            params: [address, 'latest']
          }).then((balanceWei: string) => {
            const balanceEth = parseInt(balanceWei, 16) / 10**18;
            const newWallet = {
              connected: true,
              address: address,
              balance: parseFloat(balanceEth.toFixed(4)),
            };
            setWallet(newWallet);
            localStorage.setItem('agentchain_wallet', JSON.stringify(newWallet));
          }).catch(console.error);
        }
      };

      (window as any).ethereum.on('accountsChanged', handleAccountsChanged);
      return () => {
        (window as any).ethereum.removeListener('accountsChanged', handleAccountsChanged);
      };
    }
  }, []);

  const saveToStorage = (updatedAgents: Agent[], updatedTx: Transaction[], updatedEscrows: Escrow[], updatedWallet: WalletState) => {
    localStorage.setItem('agentchain_agents', JSON.stringify(updatedAgents));
    localStorage.setItem('agentchain_transactions', JSON.stringify(updatedTx));
    localStorage.setItem('agentchain_escrows', JSON.stringify(updatedEscrows));
    localStorage.setItem('agentchain_wallet', JSON.stringify(updatedWallet));
  };

  const connectWallet = async () => {
    if (typeof window !== 'undefined' && (window as any).ethereum) {
      try {
        const accounts = await (window as any).ethereum.request({ method: 'eth_requestAccounts' });
        const address = accounts[0];
        
        const balanceWei = await (window as any).ethereum.request({
          method: 'eth_getBalance',
          params: [address, 'latest']
        });
        const balanceEth = parseInt(balanceWei, 16) / 10**18;
        
        const newWallet: WalletState = {
          connected: true,
          address: address,
          balance: parseFloat(balanceEth.toFixed(4)),
        };
        setWallet(newWallet);
        saveToStorage(agents, transactions, escrows, newWallet);
      } catch (error: any) {
        console.error("MetaMask connection error:", error);
        alert("Wallet connection failed: " + (error.message || error.toString()));
      }
    } else {
      alert('MetaMask or another web3 wallet was not detected. Please install a Web3 wallet (e.g. MetaMask) to perform on-chain operations.');
    }
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

  const createAgent = async (newAgentData: Omit<Agent, 'id' | 'rating' | 'reviewsCount' | 'tasksCompleted' | 'successRate' | 'reviews' | 'history' | 'createdDate'>): Promise<{ success: boolean; txHash?: string; agentId?: number; error?: string }> => {
    if (!wallet.connected || !wallet.address) {
      return { success: false, error: 'Please connect your Web3 wallet.' };
    }
    if (typeof window === 'undefined' || !(window as any).ethereum) {
      return { success: false, error: 'Web3 provider (MetaMask) not detected.' };
    }

    try {
      const provider = new ethers.BrowserProvider((window as any).ethereum);
      const signer = await provider.getSigner();

      const registryAddress = process.env.NEXT_PUBLIC_AGENT_REGISTRY || "0xcbF922AA3E82ffeFAFD78B9e549127221Ec34b10";
      const registryContract = new ethers.Contract(registryAddress, [
        "function registerAgent(string calldata name, string calldata category, string calldata metadataURI, uint256 pricePerCall) external returns (uint256)",
        "event AgentRegistered(uint256 indexed id, string name, address indexed owner, uint256 pricePerCall)"
      ], signer);

      const priceWei = ethers.parseEther(newAgentData.price.toString());
      const metadataURI = `ipfs://QmDummyMetadataHashFor${newAgentData.name.replace(/\s+/g, '')}`;

      const tx = await registryContract.registerAgent(
        newAgentData.name,
        newAgentData.category,
        metadataURI,
        priceWei
      );

      const receipt = await tx.wait();
      const txHash = receipt.hash;

      let onChainAgentId = Math.floor(Math.random() * 100) + 12; // fallback
      const event = receipt.logs
        .map((log: any) => {
          try {
            return registryContract.interface.parseLog(log);
          } catch (e) {
            return null;
          }
        })
        .find((parsedLog: any) => parsedLog && parsedLog.name === 'AgentRegistered');

      if (event) {
        onChainAgentId = Number(event.args.id);
      }

      // Re-fetch balance
      const balanceWei = await provider.getBalance(wallet.address);
      const balanceEth = ethers.formatEther(balanceWei);
      const updatedWalletState = {
        ...wallet,
        balance: parseFloat(parseFloat(balanceEth).toFixed(4))
      };
      setWallet(updatedWalletState);

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

      // Create a transaction for registration
      const newTx: Transaction = {
        id: `tx-${Math.random().toString(36).substr(2, 9)}`,
        type: 'deposit',
        agentId: newAgent.id,
        agentName: newAgent.name,
        amount: 0,
        status: 'completed',
        timestamp: new Date().toLocaleString(),
        txHash: txHash,
        sender: wallet.address,
        receiver: registryAddress
      };

      const updatedTx = [newTx, ...transactions];
      setTransactions(updatedTx);
      saveToStorage(updatedAgents, updatedTx, escrows, updatedWalletState);

      return { success: true, txHash, agentId: onChainAgentId };

    } catch (error: any) {
      console.error("Failed to register agent on-chain:", error);
      return { success: false, error: error.message || error.toString() };
    }
  };

  const hireAgent = async (agentId: string): Promise<{ success: boolean; txHash?: string; onChainId?: number; escrowId?: string; error?: string }> => {
    const agent = agents.find((a) => a.id === agentId);
    if (!agent) return { success: false, error: 'Agent not found' };

    if (!wallet.connected || !wallet.address) {
      return { success: false, error: 'Please connect your Web3 wallet.' };
    }

    try {
      let txHash = '0x' + Math.random().toString(16).substr(2, 40);
      let escrowContractAddress = process.env.NEXT_PUBLIC_ESCROW || "0x307E6918333300eb0e74559744decE8cF37AfC3A";
      let onChainId = Math.floor(Math.random() * 1000) + 100;
      let updatedWalletState = { ...wallet };

      if (typeof window !== 'undefined' && (window as any).ethereum) {
      try {
        const provider = new ethers.BrowserProvider((window as any).ethereum);
        const signer = await provider.getSigner();
        
        const escrowContract = new ethers.Contract(escrowContractAddress, [
          "function createEscrow(uint256 agentId, uint256 callerId, bytes32 taskHash) external payable returns (uint256)",
          "event EscrowCreated(uint256 indexed escrowId, uint256 indexed agentId, address indexed client, uint256 amount)"
        ], signer);

        const numericalId = getNumericalId(agent.id);
        const priceWei = ethers.parseEther(agent.price.toString());
        const dummyTaskHash = ethers.keccak256(ethers.toUtf8Bytes("hire-agent-" + Math.random().toString()));

        // Send transaction
        const tx = await escrowContract.createEscrow(numericalId, 0, dummyTaskHash, {
          value: priceWei
        });
        
        // Wait for transaction to be mined
        const receipt = await tx.wait();
        txHash = receipt.hash;

        // Parse log to get onChainId
        const event = receipt.logs
          .map((log: any) => {
            try {
              return escrowContract.interface.parseLog(log);
            } catch (e) {
              return null;
            }
          })
          .find((parsedLog: any) => parsedLog && parsedLog.name === 'EscrowCreated');

        if (event) {
          onChainId = Number(event.args.escrowId);
        }

        // Re-fetch balance
        try {
          const balanceWei = await provider.getBalance(wallet.address);
          const balanceEth = ethers.formatEther(balanceWei);
          updatedWalletState.balance = parseFloat(parseFloat(balanceEth).toFixed(4));
        } catch (balErr) {
          updatedWalletState.balance = parseFloat(Math.max(0, wallet.balance - agent.price).toFixed(4));
        }
        setWallet(updatedWalletState);
      } catch (error: any) {
        console.error("Failed to create escrow on-chain:", error);
        return { success: false, error: error.message || error.toString() };
      }
    } else {
      // Local fallback simulation if MetaMask is not detected
      updatedWalletState.balance = parseFloat(Math.max(0, wallet.balance - agent.price).toFixed(4));
      setWallet(updatedWalletState);
    }

      const newEscrow: Escrow = {
        id: `esc-${Math.random().toString(36).substr(2, 9)}`,
        agentId: agent.id,
        agentName: agent.name,
        client: wallet.address,
        amount: agent.price,
        status: 'locked',
        taskStatus: 'pending',
        createdAt: new Date().toLocaleString().split(',')[0] + ' ' + new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        contractAddress: escrowContractAddress,
        onChainId: onChainId
      };

      const updatedEscrows = [newEscrow, ...escrows];
      setEscrows(updatedEscrows);

      const newTx: Transaction = {
        id: `tx-${Math.random().toString(36).substr(2, 9)}`,
        type: 'escrow_lock',
        agentId: agent.id,
        agentName: agent.name,
        amount: agent.price,
        status: 'escrowed',
        timestamp: newEscrow.createdAt,
        txHash: txHash,
        sender: wallet.address,
        receiver: escrowContractAddress
      };

      const updatedTx = [newTx, ...transactions];
      setTransactions(updatedTx);

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
                caller: wallet.address || '0x0000...0000'
              },
              ...a.history
            ]
          };
        }
        return a;
      });
      setAgents(updatedAgents);

      saveToStorage(updatedAgents, updatedTx, updatedEscrows, updatedWalletState);
      return { success: true, txHash, onChainId, escrowId: newEscrow.id };

    } catch (error: any) {
      console.error("Failed to create escrow on-chain:", error);
      return { success: false, error: error.message || error.toString() };
    }
  };

  const releaseEscrow = async (escrowId: string): Promise<{ success: boolean; txHash?: string; error?: string }> => {
    const escrow = escrows.find((e) => e.id === escrowId);
    if (!escrow) return { success: false, error: 'Escrow not found' };
    if (escrow.status !== 'locked') return { success: false, error: 'Escrow is not locked' };

    if (!wallet.connected || !wallet.address) {
      return { success: false, error: 'Please connect your Web3 wallet.' };
    }

    if (typeof window === 'undefined' || !(window as any).ethereum || escrow.onChainId === undefined) {
      return { success: false, error: 'No active Web3 provider or missing onChainId.' };
    }

    try {
      const provider = new ethers.BrowserProvider((window as any).ethereum);
      const signer = await provider.getSigner();
      
      const escrowAddress = process.env.NEXT_PUBLIC_ESCROW || "0x307E6918333300eb0e74559744decE8cF37AfC3A";
      const escrowContract = new ethers.Contract(escrowAddress, [
        "function releaseFunds(uint256 escrowId) external"
      ], signer);

      const tx = await escrowContract.releaseFunds(escrow.onChainId);
      const receipt = await tx.wait();
      const txHash = receipt.hash;

      // Re-fetch balance
      const balanceWei = await provider.getBalance(wallet.address);
      const balanceEth = ethers.formatEther(balanceWei);
      const updatedWalletState = {
        ...wallet,
        balance: parseFloat(parseFloat(balanceEth).toFixed(4))
      };
      setWallet(updatedWalletState);

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

      const newTx: Transaction = {
        id: `tx-${Math.random().toString(36).substr(2, 9)}`,
        type: 'escrow_release',
        agentId: escrow.agentId,
        agentName: escrow.agentName,
        amount: escrow.amount,
        status: 'completed',
        timestamp: new Date().toLocaleString(),
        txHash: txHash,
        sender: escrowAddress,
        receiver: wallet.address
      };

      const updatedAgents = agents.map((a) => {
        if (a.id === escrow.agentId) {
          const updatedHistory = a.history.map((h) => {
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
      saveToStorage(updatedAgents, updatedTx, updatedEscrows, updatedWalletState);

      return { success: true, txHash };

    } catch (error: any) {
      console.error("Failed to release escrow on-chain:", error);
      return { success: false, error: error.message || error.toString() };
    }
  };

  const refundEscrow = async (escrowId: string): Promise<{ success: boolean; txHash?: string; error?: string }> => {
    const escrow = escrows.find((e) => e.id === escrowId);
    if (!escrow) return { success: false, error: 'Escrow not found' };
    if (escrow.status !== 'locked') return { success: false, error: 'Escrow is not locked' };

    if (!wallet.connected || !wallet.address) {
      return { success: false, error: 'Please connect your Web3 wallet.' };
    }

    if (typeof window === 'undefined' || !(window as any).ethereum || escrow.onChainId === undefined) {
      return { success: false, error: 'No active Web3 provider or missing onChainId.' };
    }

    try {
      const provider = new ethers.BrowserProvider((window as any).ethereum);
      const signer = await provider.getSigner();
      
      const escrowAddress = process.env.NEXT_PUBLIC_ESCROW || "0x307E6918333300eb0e74559744decE8cF37AfC3A";
      const escrowContract = new ethers.Contract(escrowAddress, [
        "function refundFunds(uint256 escrowId) external"
      ], signer);

      const tx = await escrowContract.refundFunds(escrow.onChainId);
      const receipt = await tx.wait();
      const txHash = receipt.hash;

      // Re-fetch balance
      const balanceWei = await provider.getBalance(wallet.address);
      const balanceEth = ethers.formatEther(balanceWei);
      const updatedWalletState = {
        ...wallet,
        balance: parseFloat(parseFloat(balanceEth).toFixed(4))
      };
      setWallet(updatedWalletState);

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

      const newTx: Transaction = {
        id: `tx-${Math.random().toString(36).substr(2, 9)}`,
        type: 'payout',
        agentId: escrow.agentId,
        agentName: escrow.agentName,
        amount: escrow.amount,
        status: 'completed',
        timestamp: new Date().toLocaleString(),
        txHash: txHash,
        sender: escrowAddress,
        receiver: wallet.address
      };

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
      saveToStorage(updatedAgents, updatedTx, updatedEscrows, updatedWalletState);

      return { success: true, txHash };

    } catch (error: any) {
      console.error("Failed to refund escrow on-chain:", error);
      return { success: false, error: error.message || error.toString() };
    }
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
