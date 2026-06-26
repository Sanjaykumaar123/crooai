'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { 
  LayoutDashboard, 
  User, 
  UserCheck,
  Terminal,
  History, 
  Lock, 
  BarChart3, 
  Settings, 
  Network,
  Wallet,
  LogOut
} from 'lucide-react';
import { useApp } from '@/lib/AppContext';

interface SidebarProps {
  activeTab?: string;
  onTabChange?: (tab: string) => void;
}

export default function DashboardSidebar({ activeTab = 'dashboard', onTabChange }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { wallet, disconnectWallet, connectWallet } = useApp();

  const menuItems = [
    { id: 'dashboard', name: 'Dashboard', icon: LayoutDashboard, href: '/dashboard' },
    { id: 'my-agents', name: 'My Agents', icon: User, href: '/dashboard?tab=my-agents' },
    { id: 'hired-agents', name: 'My Hired Agents', icon: UserCheck, href: '/dashboard?tab=hired-agents' },
    { id: 'executions', name: 'Executions', icon: Terminal, href: '/dashboard?tab=executions' },
    { id: 'transactions', name: 'Transactions', icon: History, href: '/dashboard?tab=transactions' },
    { id: 'escrow', name: 'Escrows', icon: Lock, href: '/escrow' },
    { id: 'network', name: 'A2A Network', icon: Network, href: '/network' },
    { id: 'analytics', name: 'Analytics', icon: BarChart3, href: '/analytics' },
    { id: 'settings', name: 'Settings', icon: Settings, href: '/dashboard?tab=settings' },
  ];

  const handleItemClick = (item: typeof menuItems[0], e: React.MouseEvent) => {
    if (onTabChange && item.href.includes('tab=')) {
      e.preventDefault();
      const tabName = item.href.split('tab=')[1];
      onTabChange(tabName);
      router.push(`/dashboard?tab=${tabName}`);
    } else if (onTabChange && item.id === 'dashboard') {
      e.preventDefault();
      onTabChange('dashboard');
      router.push('/dashboard');
    }
  };

  const isActive = (item: typeof menuItems[0]) => {
    if (pathname === item.href) return true;
    if (onTabChange && item.href.includes('tab=')) {
      const tabName = item.href.split('tab=')[1];
      return activeTab === tabName && pathname === '/dashboard';
    }
    if (item.id === 'dashboard' && pathname === '/dashboard' && activeTab === 'dashboard') {
      return true;
    }
    return false;
  };

  return (
    <aside className="w-full md:w-72 shrink-0 glass-card rounded-2xl p-6 h-fit md:sticky md:top-24">
      {/* Wallet Status Box */}
      <div className="mb-6 border-b border-neutral-100 pb-6">
        <p className="text-xs font-bold text-brand-text-muted uppercase tracking-wider">Connected Account</p>
        
        {wallet.connected ? (
          <div className="mt-3 space-y-2">
            <div className="flex items-center justify-between rounded-xl bg-brand-light-gold/20 border border-gold-soft/55 p-3">
              <span className="text-xs font-bold text-brand-text-dark truncate max-w-[140px]">
                {wallet.address && wallet.address.length > 13 ? `${wallet.address.substring(0, 6)}...${wallet.address.substring(wallet.address.length - 4)}` : wallet.address}
              </span>
              <span className="text-xs font-extrabold text-brand-yellow">
                {(wallet.balance ?? 0).toFixed(2)} CROO
              </span>
            </div>
            <button
              onClick={disconnectWallet}
              className="flex w-full items-center justify-center space-x-1.5 rounded-lg py-2 text-xs font-bold text-red-500 hover:bg-red-50 transition-colors"
            >
              <LogOut size={14} />
              <span>Disconnect</span>
            </button>
          </div>
        ) : (
          <button
            onClick={connectWallet}
            className="mt-3 flex w-full items-center justify-center space-x-2 rounded-xl bg-brand-yellow py-3 text-sm font-bold text-white shadow-sm hover:bg-[#F59E0B] transition-all"
          >
            <Wallet size={16} />
            <span>Connect Wallet</span>
          </button>
        )}
      </div>

      {/* Nav List */}
      <nav className="space-y-1.5">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item);
          return (
            <Link
              key={item.id}
              href={item.href}
              onClick={(e) => handleItemClick(item, e)}
              className={`flex items-center space-x-3.5 rounded-xl px-4 py-3.5 text-sm font-bold transition-all ${
                active
                  ? 'bg-brand-light-gold text-brand-text-dark font-extrabold shadow-sm'
                  : 'text-brand-text-muted hover:bg-neutral-50 hover:text-brand-text-dark'
              }`}
            >
              <Icon size={18} className={active ? 'text-brand-yellow' : 'text-brand-text-muted'} />
              <span>{item.name}</span>
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
