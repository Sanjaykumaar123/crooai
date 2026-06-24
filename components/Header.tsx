'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useApp } from '@/lib/AppContext';
import { Wallet, Menu, X, ChevronDown, LogOut, ArrowRight, User } from 'lucide-react';

export default function Header() {
  const { wallet, connectWallet, disconnectWallet } = useApp();
  const [isOpen, setIsOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const pathname = usePathname();

  const toggleMenu = () => setIsOpen(!isOpen);
  const toggleDropdown = () => setDropdownOpen(!dropdownOpen);

  const navLinks = [
    { name: 'Explore', href: '/marketplace' },
    { name: 'Dashboard', href: '/dashboard' },
    { name: 'A2A Network', href: '/network' },
    { name: 'Escrow Contract', href: '/escrow' },
    { name: 'Analytics', href: '/analytics' },
  ];

  const isActive = (href: string) => pathname === href;

  return (
    <header className="sticky top-0 z-50 w-full border-b border-gold-soft bg-white/80 backdrop-blur-md">
      <div className="mx-auto flex h-20 max-w-[95%] items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Logo and Brand */}
        <Link href="/" className="flex items-center space-x-3 group">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-yellow font-heading text-xl font-extrabold text-white shadow-premium-soft transition-all duration-300 group-hover:scale-105">
            AC
          </div>
          <div>
            <span className="font-heading text-lg font-bold tracking-tight text-brand-text-dark">
              AgentChain
            </span>
            <span className="block text-[10px] font-medium text-brand-yellow -mt-1 tracking-wider uppercase">
              Marketplace
            </span>
          </div>
        </Link>

        {/* Desktop Nav Links */}
        <nav className="hidden md:flex items-center space-x-1">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
                isActive(link.href)
                  ? 'bg-brand-light-gold text-brand-text-dark font-semibold'
                  : 'text-brand-text-muted hover:text-brand-text-dark hover:bg-neutral-50'
              }`}
            >
              {link.name}
            </Link>
          ))}
        </nav>

        {/* Wallet & Create CTAs */}
        <div className="hidden md:flex items-center space-x-4">
          <Link
            href="/create-agent"
            className="text-sm font-medium text-brand-text-dark hover:text-brand-yellow transition-colors duration-200 mr-2"
          >
            Create Agent
          </Link>

          {wallet.connected ? (
            <div className="relative">
              <button
                onClick={toggleDropdown}
                className="flex items-center space-x-2 rounded-full border border-gold-soft bg-white px-4 py-2 text-xs font-semibold text-brand-text-dark shadow-premium-soft hover:bg-neutral-50 transition-all-300"
              >
                <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                <span>{wallet.address}</span>
                <ChevronDown size={14} className={`transition-transform duration-200 ${dropdownOpen ? 'rotate-180' : ''}`} />
              </button>

              {dropdownOpen && (
                <div className="absolute right-0 mt-2 w-56 origin-top-right rounded-2xl border border-gold-soft bg-white p-4 shadow-premium-glow ring-1 ring-black/5 animate-in fade-in slide-in-from-top-2 duration-200">
                  <div className="mb-3 border-b border-neutral-100 pb-3">
                    <p className="text-[10px] font-semibold tracking-wider text-brand-text-muted uppercase">My Account</p>
                    <p className="font-heading text-lg font-bold text-brand-text-dark mt-1">
                      {wallet.balance.toFixed(3)} <span className="text-xs font-semibold text-brand-yellow">CROO</span>
                    </p>
                  </div>
                  
                  <Link
                    href="/dashboard"
                    onClick={() => setDropdownOpen(false)}
                    className="flex w-full items-center space-x-2 rounded-xl p-2 text-xs font-medium text-brand-text-dark hover:bg-brand-light-gold transition-colors"
                  >
                    <User size={14} />
                    <span>Go to Dashboard</span>
                  </Link>

                  <button
                    onClick={() => {
                      disconnectWallet();
                      setDropdownOpen(false);
                    }}
                    className="flex w-full items-center space-x-2 rounded-xl p-2 text-xs font-medium text-red-600 hover:bg-red-50 transition-colors mt-1"
                  >
                    <LogOut size={14} />
                    <span>Disconnect Wallet</span>
                  </button>
                </div>
              )}
            </div>
          ) : (
            <button
              onClick={connectWallet}
              className="flex items-center space-x-2 rounded-full bg-brand-yellow px-5 py-2.5 text-xs font-bold text-white shadow-premium-soft hover:bg-[#F59E0B] transition-all-300 active:scale-95"
            >
              <Wallet size={14} />
              <span>Connect Wallet</span>
            </button>
          )}
        </div>

        {/* Mobile menu button */}
        <div className="flex md:hidden items-center space-x-3">
          {wallet.connected && (
            <span className="text-xs font-bold bg-brand-light-gold text-brand-text-dark px-3 py-1.5 rounded-full border border-gold-soft">
              {wallet.balance.toFixed(2)} CROO
            </span>
          )}
          <button
            onClick={toggleMenu}
            className="inline-flex items-center justify-center rounded-xl p-2 text-brand-text-muted hover:bg-brand-light-gold hover:text-brand-text-dark focus:outline-none transition-colors"
          >
            {isOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden border-b border-gold-soft bg-white p-4 shadow-lg animate-in slide-in-from-top duration-200">
          <div className="space-y-1 pb-3 pt-2">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setIsOpen(false)}
                className={`block rounded-xl px-4 py-3 text-base font-medium transition-all ${
                  isActive(link.href)
                    ? 'bg-brand-light-gold text-brand-text-dark font-bold'
                    : 'text-brand-text-muted hover:bg-neutral-50 hover:text-brand-text-dark'
                }`}
              >
                {link.name}
              </Link>
            ))}
          </div>
          <div className="border-t border-neutral-100 pb-3 pt-4 flex flex-col space-y-3">
            <Link
              href="/create-agent"
              onClick={() => setIsOpen(false)}
              className="flex w-full items-center justify-center rounded-xl border border-gold-soft px-4 py-3 text-sm font-semibold text-brand-text-dark hover:bg-neutral-50"
            >
              Create Agent
            </Link>

            {wallet.connected ? (
              <div className="flex flex-col space-y-2">
                <div className="flex items-center justify-between rounded-xl bg-brand-light-gold/30 p-3 border border-gold-soft">
                  <div className="text-xs font-semibold text-brand-text-dark">{wallet.address}</div>
                  <div className="text-xs font-bold text-brand-yellow">{wallet.balance.toFixed(3)} CROO</div>
                </div>
                <button
                  onClick={() => {
                    disconnectWallet();
                    setIsOpen(false);
                  }}
                  className="flex w-full items-center justify-center space-x-2 rounded-xl bg-red-50 py-3 text-sm font-semibold text-red-600 hover:bg-red-100 transition-colors"
                >
                  <LogOut size={16} />
                  <span>Disconnect Wallet</span>
                </button>
              </div>
            ) : (
              <button
                onClick={() => {
                  connectWallet();
                  setIsOpen(false);
                }}
                className="flex w-full items-center justify-center space-x-2 rounded-xl bg-brand-yellow py-3 text-sm font-bold text-white shadow-premium-soft hover:bg-[#F59E0B] transition-all"
              >
                <Wallet size={16} />
                <span>Connect Wallet</span>
              </button>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
