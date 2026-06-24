import React from 'react';
import Link from 'next/link';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="w-full border-t border-gold-soft bg-white py-12">
      <div className="mx-auto max-w-[95%] px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center justify-between space-y-6 md:flex-row md:space-y-0">
          {/* Logo and Brand */}
          <div className="flex items-center space-x-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-yellow font-heading text-base font-extrabold text-white">
              AC
            </div>
            <div>
              <span className="font-heading text-sm font-bold text-brand-text-dark">
                AgentChain Marketplace
              </span>
              <span className="block text-[10px] text-brand-text-muted">
                All Agents. On-Chain. Owned by You.
              </span>
            </div>
          </div>

          {/* Links */}
          <div className="flex flex-wrap justify-center gap-x-8 gap-y-2">
            <Link href="#" className="text-xs text-brand-text-muted hover:text-brand-text-dark transition-colors">
              Docs
            </Link>
            <Link href="#" className="text-xs text-brand-text-muted hover:text-brand-text-dark transition-colors">
              Github
            </Link>
            <Link href="#" className="text-xs text-brand-text-muted hover:text-brand-text-dark transition-colors">
              Roadmap
            </Link>
            <Link href="#" className="text-xs text-brand-text-muted hover:text-brand-text-dark transition-colors">
              Terms of Service
            </Link>
            <Link href="#" className="text-xs text-brand-text-muted hover:text-brand-text-dark transition-colors">
              Privacy Policy
            </Link>
          </div>

          {/* Copyright */}
          <div className="text-xs text-brand-text-muted">
            &copy; {currentYear} AgentChain. All rights reserved.
          </div>
        </div>
      </div>
    </footer>
  );
}
