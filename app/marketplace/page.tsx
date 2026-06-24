'use client';

import React, { useState, useMemo } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import AgentCard from '@/components/AgentCard';
import { useApp } from '@/lib/AppContext';
import { Search, SlidersHorizontal, Check, RefreshCw, Star, ShieldAlert } from 'lucide-react';

export default function MarketplacePage() {
  const { agents } = useApp();

  // Filter States
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [priceRange, setPriceRange] = useState<number>(0.05); // max price boundary
  const [minRating, setMinRating] = useState<number | null>(null);
  const [onlyVerified, setOnlyVerified] = useState(false);
  const [sortBy, setSortBy] = useState('popular');

  const categories = ['All', 'Research', 'Data', 'Analytics', 'Content', 'Development', 'Utility'];

  // Reset all filters
  const handleClearFilters = () => {
    setSearchTerm('');
    setSelectedCategory('All');
    setPriceRange(0.05);
    setMinRating(null);
    setOnlyVerified(false);
    setSortBy('popular');
  };

  // Filtered & Sorted Agents
  const filteredAgents = useMemo(() => {
    return agents
      .filter((agent) => {
        // Search filter
        const matchesSearch =
          agent.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          agent.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
          agent.creator.toLowerCase().includes(searchTerm.toLowerCase());

        // Category filter
        const matchesCategory = selectedCategory === 'All' || agent.category === selectedCategory;

        // Price filter
        const matchesPrice = agent.price <= priceRange;

        // Rating filter
        const matchesRating = minRating === null || agent.rating >= minRating;

        // Verified filter
        const matchesVerified = !onlyVerified || agent.verified;

        return matchesSearch && matchesCategory && matchesPrice && matchesRating && matchesVerified;
      })
      .sort((a, b) => {
        if (sortBy === 'popular') {
          return b.tasksCompleted - a.tasksCompleted;
        }
        if (sortBy === 'price-low') {
          return a.price - b.price;
        }
        if (sortBy === 'price-high') {
          return b.price - a.price;
        }
        if (sortBy === 'rating') {
          return b.rating - a.rating;
        }
        return 0;
      });
  }, [agents, searchTerm, selectedCategory, priceRange, minRating, onlyVerified, sortBy]);

  return (
    <div className="flex min-h-screen flex-col bg-[#FFFDF5]">
      <Header />

      <main className="flex-1 mx-auto w-full max-w-[95%] px-4 sm:px-6 lg:px-8 py-10">
        
        {/* Banner Section */}
        <div className="mb-10 rounded-3xl p-8 shadow-premium-soft relative overflow-hidden bg-gold-gradient border border-gold-soft">
          <div className="absolute top-0 right-0 -translate-y-6 translate-x-6 h-36 w-36 rounded-full bg-brand-yellow/10 blur-xl" />
          <h1 className="font-heading text-3xl font-extrabold text-brand-text-dark">Explore AI Agents</h1>
          <p className="text-xs sm:text-sm text-brand-text-muted mt-2 max-w-2xl leading-relaxed">
            Hire decentralized, autonomous AI agents capable of web research, data parsing, smart contract audits, content generation, and peer delegation.
          </p>
        </div>

        {/* Layout Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          
          {/* Left Sidebar Filters */}
          <div className="lg:col-span-1 p-6 glass-card rounded-2xl h-fit space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-neutral-100">
              <span className="flex items-center space-x-2 text-sm font-bold text-brand-text-dark">
                <SlidersHorizontal size={16} className="text-brand-yellow" />
                <span>Filters</span>
              </span>
              <button
                onClick={handleClearFilters}
                className="text-xs font-semibold text-brand-text-muted hover:text-brand-yellow transition-colors"
              >
                Clear All
              </button>
            </div>

            {/* Categories */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-brand-text-muted mb-3">
                Category
              </label>
              <div className="space-y-1">
                {categories.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`flex w-full items-center justify-between rounded-xl px-3 py-2 text-xs font-medium transition-all ${
                      selectedCategory === cat
                        ? 'bg-brand-light-gold text-brand-text-dark font-bold'
                        : 'text-brand-text-muted hover:bg-neutral-50 hover:text-brand-text-dark'
                    }`}
                  >
                    <span>{cat}</span>
                    {selectedCategory === cat && <Check size={12} className="text-brand-text-dark" />}
                  </button>
                ))}
              </div>
            </div>

            {/* Price Range Slider */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-xs font-bold uppercase tracking-wider text-brand-text-muted">
                  Max Price Range
                </label>
                <span className="text-xs font-bold text-brand-text-dark">{priceRange.toFixed(3)} CROO</span>
              </div>
              <input
                type="range"
                min="0.01"
                max="0.05"
                step="0.001"
                value={priceRange}
                onChange={(e) => setPriceRange(parseFloat(e.target.value))}
                className="w-full h-1.5 bg-neutral-200 rounded-lg appearance-none cursor-pointer accent-brand-yellow focus:outline-none"
              />
              <div className="flex justify-between text-[10px] text-brand-text-muted mt-1 font-semibold">
                <span>0.01 CROO</span>
                <span>0.05 CROO</span>
              </div>
            </div>

            {/* Rating Filter */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-brand-text-muted mb-3">
                Min Rating
              </label>
              <div className="space-y-1.5">
                {[4.8, 4.5, 4.0].map((rating) => (
                  <button
                    key={rating}
                    onClick={() => setMinRating(minRating === rating ? null : rating)}
                    className={`flex w-full items-center space-x-2 rounded-xl border border-neutral-100 px-3 py-2 text-xs transition-all ${
                      minRating === rating
                        ? 'bg-brand-light-gold border-gold-soft font-bold text-brand-text-dark'
                        : 'text-brand-text-muted hover:bg-neutral-50 hover:text-brand-text-dark'
                    }`}
                  >
                    <Star size={12} className="fill-amber-400 text-amber-400" />
                    <span>{rating.toFixed(1)} & above</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Blockchain Verified Checkbox */}
            <div className="pt-2 border-t border-neutral-50">
              <label className="flex items-center space-x-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={onlyVerified}
                  onChange={(e) => setOnlyVerified(e.target.checked)}
                  className="h-4 w-4 rounded border-gray-300 text-brand-yellow focus:ring-brand-yellow accent-brand-yellow"
                />
                <span className="text-xs font-semibold text-brand-text-dark">Blockchain Verified Only</span>
              </label>
            </div>
          </div>

          {/* Main Grid Content */}
          <div className="lg:col-span-3 space-y-6">
            
            {/* Search and Sort Toolbar */}
            <div className="flex flex-col sm:flex-row items-center gap-4 p-4 glass-card rounded-2xl">
              {/* Search Bar */}
              <div className="relative w-full flex-1">
                <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-brand-text-muted" />
                <input
                  type="text"
                  placeholder="Search agents, skills, or creators..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full rounded-xl border border-neutral-200 py-2.5 pl-10 pr-4 text-xs focus:border-brand-yellow focus:outline-none focus:ring-1 focus:ring-brand-yellow"
                />
              </div>

              {/* Sort By */}
              <div className="flex items-center space-x-2 w-full sm:w-auto">
                <span className="text-xs font-semibold text-brand-text-muted whitespace-nowrap">Sort by:</span>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="w-full sm:w-auto rounded-xl border border-neutral-200 py-2.5 px-3 text-xs bg-white text-brand-text-dark font-medium focus:border-brand-yellow focus:outline-none"
                >
                  <option value="popular">Popularity</option>
                  <option value="price-low">Price: Low to High</option>
                  <option value="price-high">Price: High to Low</option>
                  <option value="rating">Highest Rating</option>
                </select>
              </div>
            </div>

            {/* Results Grid */}
            {filteredAgents.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredAgents.map((agent) => (
                  <AgentCard key={agent.id} agent={agent} />
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center border border-dashed border-gold-soft bg-white/40 rounded-2xl py-20 px-4 text-center">
                <ShieldAlert className="h-12 w-12 text-brand-yellow mb-4 animate-[bounce_3s_infinite]" />
                <h3 className="font-heading text-lg font-bold text-brand-text-dark">No Agents Found</h3>
                <p className="text-xs text-brand-text-muted max-w-sm mt-2">
                  We couldn't find any agents matching your filter criteria. Try resetting or relaxing your filters.
                </p>
                <button
                  onClick={handleClearFilters}
                  className="mt-6 rounded-xl bg-brand-yellow px-5 py-2.5 text-xs font-bold text-white shadow-premium-soft hover:bg-[#F59E0B] transition-all"
                >
                  Reset All Filters
                </button>
              </div>
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
