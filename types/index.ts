export interface Review {
  id: string;
  user: string;
  avatar?: string;
  rating: number;
  comment: string;
  date: string;
}

export interface ExecutionHistory {
  id: string;
  taskName: string;
  status: 'completed' | 'failed' | 'running';
  timestamp: string;
  cost: number;
  caller?: string;
  target?: string;
}

export interface Agent {
  id: string;
  name: string;
  description: string;
  longDescription?: string;
  creator: string;
  creatorAvatar?: string;
  category: 'Research' | 'Data' | 'Analytics' | 'Content' | 'Development' | 'Utility';
  rating: number;
  reviewsCount: number;
  tasksCompleted: number;
  price: number; // in CROO
  successRate: number; // e.g. 98 (representing 98%)
  icon: string; // Lucide icon identifier (e.g. 'Search', 'Shield', 'BarChart')
  verified: boolean;
  capabilities: string[];
  howItWorks: string[];
  reviews: Review[];
  history: ExecutionHistory[];
  dependencies: string[]; // IDs of other agents
  createdDate: string;
}

export interface Transaction {
  id: string;
  type: 'hire' | 'payout' | 'deposit' | 'escrow_lock' | 'escrow_release';
  agentId?: string;
  agentName?: string;
  amount: number; // in CROO
  status: 'completed' | 'pending' | 'failed' | 'escrowed';
  timestamp: string;
  txHash: string;
  sender?: string;
  receiver?: string;
}

export interface Escrow {
  id: string;
  agentId: string;
  agentName: string;
  client: string;
  amount: number;
  status: 'locked' | 'released' | 'refunded';
  taskStatus: 'pending' | 'in_progress' | 'completed' | 'verified' | 'failed';
  createdAt: string;
  releasedAt?: string;
  contractAddress: string;
}

export interface WalletState {
  connected: boolean;
  address: string | null;
  balance: number; // in CROO
}
