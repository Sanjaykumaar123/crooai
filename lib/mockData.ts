import { Agent, Transaction, Escrow } from '../types';

export const INITIAL_AGENTS: Agent[] = [
  {
    id: 'research-agent',
    name: 'Research Agent',
    description: 'Advanced research agent that gathers, analyzes and summarizes information from multiple sources.',
    longDescription: 'Research Agent specializes in comprehensive research, data collection, and analysis from across the web. It can extract key insights, verify sources, and generate structured reports on complex subjects. Ideal for market analysis, academic literature reviews, and competitive intelligence.',
    creator: 'DataMind',
    creatorAvatar: 'DM',
    category: 'Research',
    rating: 4.9,
    reviewsCount: 32,
    tasksCompleted: 1245,
    price: 0.02,
    successRate: 98.2,
    icon: 'Search',
    verified: true,
    capabilities: [
      'Web Scraping & Extraction',
      'Information Synthesis',
      'Source Verification',
      'Fact Checking',
      'Structured Markdown Output'
    ],
    howItWorks: [
      'Input a research prompt or question.',
      'Agent query plans and searches multiple databases & search engines.',
      'Filters results, crawls web pages, and extracts relevant information.',
      'Performs cross-referencing and factual validation.',
      'Compiles a comprehensive markdown report with citations.'
    ],
    dependencies: ['news-agent', 'verification-agent'],
    createdDate: '2024-01-15',
    reviews: [
      { id: 'r1', user: 'Alex H.', rating: 5, comment: 'Phenomenal depth of research. Saved me hours of manual reading.', date: '2026-06-20' },
      { id: 'r2', user: 'Sarah K.', rating: 4, comment: 'Very fast and accurate, though sometimes misses niche references.', date: '2026-06-18' }
    ],
    history: [
      { id: 'h1', taskName: 'Market Analysis: Web3 Infrastructure Trends', status: 'completed', timestamp: '2026-06-24 15:10', cost: 0.02, caller: 'User Wallet' },
      { id: 'h2', taskName: 'Competitive Intelligence: L2 Scaling Solutions', status: 'completed', timestamp: '2026-06-24 12:45', cost: 0.02, caller: 'User Wallet' },
      { id: 'h3', taskName: 'Fact-Check: Decentralized Storage Protocols', status: 'completed', timestamp: '2026-06-23 09:15', cost: 0.02, caller: 'User Wallet' }
    ]
  },
  {
    id: 'news-agent',
    name: 'News Agent',
    description: 'Real-time news aggregator and sentiment analyzer for crypto, tech, and global macro events.',
    longDescription: 'News Agent monitors real-time global news feeds, Twitter, Reddit, and RSS feeds. It filters noise, identifies breaking news, categorizes items, and provides instant sentiment scoring (bullish/bearish/neutral) with summarized takeaways.',
    creator: 'InfoFlow',
    creatorAvatar: 'IF',
    category: 'Data',
    rating: 4.7,
    reviewsCount: 28,
    tasksCompleted: 850,
    price: 0.015,
    successRate: 96.5,
    icon: 'Globe',
    verified: true,
    capabilities: [
      'Real-Time Feed Monitoring',
      'NLP Sentiment Analysis',
      'Summarization',
      'Breaking News Alerts',
      'Custom RSS Scraping'
    ],
    howItWorks: [
      'Define search keywords or select predefined topics (e.g. DeFi, AI).',
      'Agent listens to real-time APIs, news outlets, and social channels.',
      'Applies classification models to filter irrelevant content.',
      'Computes sentiment polarity and impact scores.',
      'Delivers structured alerts and summaries.'
    ],
    dependencies: [],
    createdDate: '2024-02-10',
    reviews: [
      { id: 'r3', user: 'David M.', rating: 5, comment: 'Its sentiment analysis matches market movements very closely.', date: '2026-06-22' }
    ],
    history: [
      { id: 'h4', taskName: 'Monitor: Next.js 15 Release Sentiment', status: 'completed', timestamp: '2026-06-24 14:02', cost: 0.015, caller: 'research-agent' },
      { id: 'h5', taskName: 'Aggregator: Fed Rate Decision Impact', status: 'completed', timestamp: '2026-06-24 11:20', cost: 0.015, caller: 'User Wallet' }
    ]
  },
  {
    id: 'analytics-agent',
    name: 'Analytics Agent',
    description: 'Processes large datasets, extracts statistical trends, and builds dynamic visual charts.',
    longDescription: 'Analytics Agent handles structured numerical data processing. It cleans data, runs regressions, identifies correlations, forecasts trends, and auto-generates chart configurations (Vega, Chart.js, SVG) based on user requirements.',
    creator: 'InsightAI',
    creatorAvatar: 'IA',
    category: 'Analytics',
    rating: 4.8,
    reviewsCount: 45,
    tasksCompleted: 2100,
    price: 0.025,
    successRate: 97.8,
    icon: 'BarChart',
    verified: true,
    capabilities: [
      'Statistical Analysis',
      'Data Cleaning & Preprocessing',
      'Trend Forecasting',
      'Chart Config Generation',
      'CSV / JSON Processing'
    ],
    howItWorks: [
      'Upload a CSV/JSON file or specify an on-chain data endpoint.',
      'Agent checks data integrity, fills missing values, and detects types.',
      'Computes descriptive stats, correlations, and trend-lines.',
      'Builds requested visualizations and highlights key anomalies.',
      'Outputs clean JSON stats and vector-ready chart metadata.'
    ],
    dependencies: [],
    createdDate: '2024-01-05',
    reviews: [
      { id: 'r4', user: 'Emma W.', rating: 5, comment: 'Handles huge CSVs easily. Chart outputs are clean and ready to render.', date: '2026-06-23' }
    ],
    history: [
      { id: 'h6', taskName: 'Analyze: Gas Price Spikes on Ethereum L2s', status: 'completed', timestamp: '2026-06-24 14:50', cost: 0.025, caller: 'research-agent' },
      { id: 'h7', taskName: 'Forecast: Q3 SaaS Market Sentiment', status: 'completed', timestamp: '2026-06-23 16:30', cost: 0.025, caller: 'User Wallet' }
    ]
  },
  {
    id: 'verification-agent',
    name: 'Verification Agent',
    description: 'Decentralized oracle agent that cross-checks facts and audits smart contract code.',
    longDescription: 'Verification Agent functions as an on-chain auditor and fact-checker. It parses smart contract source code for known vulnerabilities, runs symbolic execution tests, and checks assertions against real-time block explorer data.',
    creator: 'TrueCheck',
    creatorAvatar: 'TC',
    category: 'Utility',
    rating: 4.6,
    reviewsCount: 17,
    tasksCompleted: 920,
    price: 0.018,
    successRate: 95.9,
    icon: 'ShieldAlert',
    verified: true,
    capabilities: [
      'Smart Contract Static Analysis',
      'Vulnerability Scanning (Reentrancy, etc.)',
      'Web3 Address Verification',
      'Multi-source Consensus Check',
      'Cryptographic Proof Generation'
    ],
    howItWorks: [
      'Input contract address, source code, or transaction hash.',
      'Agent compiles code and runs security checkers (Slither, Mythril rules).',
      'Validates parameters against mainnet deployment state.',
      'Generates a verification digest with trust scoring.',
      'Signs verification digest with its private key.'
    ],
    dependencies: [],
    createdDate: '2024-03-01',
    reviews: [
      { id: 'r5', user: 'Marcus L.', rating: 4, comment: 'Found a reentrancy vector in our test contract! Lifesaver.', date: '2026-06-21' }
    ],
    history: [
      { id: 'h8', taskName: 'Audit: ERC20 Staking Escrow Contract', status: 'completed', timestamp: '2026-06-24 14:15', cost: 0.018, caller: 'research-agent' },
      { id: 'h9', taskName: 'Verify: Multi-signature Wallet Config', status: 'completed', timestamp: '2026-06-24 10:10', cost: 0.018, caller: 'User Wallet' }
    ]
  },
  {
    id: 'report-agent',
    name: 'Report Agent',
    description: 'Generates professional corporate reports, newsletters, and PDF presentations.',
    longDescription: 'Report Agent transforms structured raw data, summaries, or meeting transcripts into high-fidelity formatted executive reports, marketing decks, or whitepapers, complete with indexes, summaries, and styles.',
    creator: 'ReportGen',
    creatorAvatar: 'RG',
    category: 'Content',
    rating: 4.5,
    reviewsCount: 15,
    tasksCompleted: 600,
    price: 0.015,
    successRate: 94.8,
    icon: 'FileText',
    verified: true,
    capabilities: [
      'PDF Layout Structuring',
      'Executive Summary Synthesis',
      'Typography & Styling Application',
      'Multi-lingual Translation',
      'HTML / Markdown / PDF Exports'
    ],
    howItWorks: [
      'Provide draft content, raw notes, or summaries.',
      'Select a design template (Modern, Formal, Web3 Startup).',
      'Agent organizes content, adds title pages, headers, and indexes.',
      'Generates summary callouts and formats tables/charts.',
      'Outputs clean downloadable files.'
    ],
    dependencies: ['research-agent'],
    createdDate: '2024-02-28',
    reviews: [
      { id: 'r6', user: 'Sophia C.', rating: 5, comment: 'Outstanding layout design. It formats tables beautifully.', date: '2026-06-19' }
    ],
    history: [
      { id: 'h10', taskName: 'Generate: Weekly On-Chain Market Brief', status: 'completed', timestamp: '2026-06-24 15:30', cost: 0.015, caller: 'User Wallet' },
      { id: 'h11', taskName: 'Format: Whitepaper for Autonomous Agent Protocol', status: 'completed', timestamp: '2026-06-22 17:00', cost: 0.015, caller: 'User Wallet' }
    ]
  },
  {
    id: 'code-review-agent',
    name: 'Code Review Agent',
    description: 'Automated GitHub pull request reviewer that optimizes performance, readability, and security.',
    longDescription: 'Code Review Agent integrates directly into dev pipelines. It reviews git diffs, analyzes code complexity, flags memory leaks, suggests refactoring patterns, and writes automated unit tests for modified code blocks.',
    creator: 'CodeMate',
    creatorAvatar: 'CM',
    category: 'Development',
    rating: 4.9,
    reviewsCount: 23,
    tasksCompleted: 3400,
    price: 0.022,
    successRate: 99.1,
    icon: 'Code',
    verified: true,
    capabilities: [
      'Incremental Diff Analysis',
      'Complexity Analysis (Cyclomatic complexity)',
      'Automated Jest/PyTest Writing',
      'Refactoring Advice (Clean Code principles)',
      'Git Hooks & PR Integrations'
    ],
    howItWorks: [
      'Provide a PR URL or paste a git diff.',
      'Agent parses the changed files and identifies code dependencies.',
      'Scans for code smells, performance bottlenecks, and security issues.',
      'Drafts inline review comments with optimized suggestions.',
      'Creates a summary markdown comment with a general score.'
    ],
    dependencies: [],
    createdDate: '2024-01-20',
    reviews: [
      { id: 'r7', user: 'Tyler J.', rating: 5, comment: 'Like having a Senior Dev reviewing my PRs 24/7. Super descriptive comments.', date: '2026-06-24' }
    ],
    history: [
      { id: 'h12', taskName: 'Review: Next.js Route Handler Refactor', status: 'completed', timestamp: '2026-06-24 13:30', cost: 0.022, caller: 'User Wallet' },
      { id: 'h13', taskName: 'Audit: Redis Cache Integration', status: 'completed', timestamp: '2026-06-23 15:40', cost: 0.022, caller: 'User Wallet' }
    ]
  }
];

export const INITIAL_TRANSACTIONS: Transaction[] = [
  {
    id: 'tx-001',
    type: 'hire',
    agentId: 'research-agent',
    agentName: 'Research Agent',
    amount: 0.02,
    status: 'completed',
    timestamp: '2026-06-24 15:10',
    txHash: '0x3a4b...8c9d',
    sender: '0xAf82...C3D4',
    receiver: '0xData...Mind'
  },
  {
    id: 'tx-002',
    type: 'escrow_lock',
    agentId: 'analytics-agent',
    agentName: 'Analytics Agent',
    amount: 0.025,
    status: 'escrowed',
    timestamp: '2026-06-24 14:50',
    txHash: '0x7e8f...1a2b',
    sender: '0xAf82...C3D4',
    receiver: '0xEscrowContract'
  },
  {
    id: 'tx-003',
    type: 'payout',
    agentId: 'verification-agent',
    agentName: 'Verification Agent',
    amount: 0.018,
    status: 'completed',
    timestamp: '2026-06-24 14:15',
    txHash: '0x9c0d...3e4f',
    sender: '0xEscrowContract',
    receiver: '0xTrue...Check'
  },
  {
    id: 'tx-004',
    type: 'deposit',
    amount: 1.0,
    status: 'completed',
    timestamp: '2026-06-24 09:00',
    txHash: '0x1b2c...5d6e',
    sender: 'Binance Hot Wallet',
    receiver: '0xAf82...C3D4'
  },
  {
    id: 'tx-005',
    type: 'hire',
    agentId: 'news-agent',
    agentName: 'News Agent',
    amount: 0.015,
    status: 'completed',
    timestamp: '2026-06-24 08:30',
    txHash: '0xf4e5...7d8c',
    sender: '0xAf82...C3D4',
    receiver: '0xInfo...Flow'
  }
];

export const INITIAL_ESCROWS: Escrow[] = [
  {
    id: 'esc-001',
    agentId: 'analytics-agent',
    agentName: 'Analytics Agent',
    client: '0xAf82...C3D4',
    amount: 0.025,
    status: 'locked',
    taskStatus: 'in_progress',
    createdAt: '2026-06-24 14:50',
    contractAddress: '0xEscrow_Analytics_01'
  },
  {
    id: 'esc-002',
    agentId: 'verification-agent',
    agentName: 'Verification Agent',
    client: '0xAf82...C3D4',
    amount: 0.018,
    status: 'released',
    taskStatus: 'verified',
    createdAt: '2026-06-24 10:10',
    releasedAt: '2026-06-24 14:15',
    contractAddress: '0xEscrow_Verification_04'
  },
  {
    id: 'esc-003',
    agentId: 'code-review-agent',
    agentName: 'Code Review Agent',
    client: '0xAf82...C3D4',
    amount: 0.022,
    status: 'locked',
    taskStatus: 'pending',
    createdAt: '2026-06-24 15:20',
    contractAddress: '0xEscrow_CodeReview_07'
  }
];
