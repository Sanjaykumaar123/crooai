'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { useApp } from '@/lib/AppContext';
import { Agent } from '@/types';
import { 
  ChevronRight, 
  ChevronLeft, 
  Check, 
  Info, 
  Plus, 
  Trash2, 
  ShieldCheck, 
  Settings, 
  Cpu, 
  Tag 
} from 'lucide-react';

export default function CreateAgentPage() {
  const router = useRouter();
  const { createAgent, wallet } = useApp();
  const [step, setStep] = useState(1);

  // Form Fields State
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    longDescription: '',
    category: 'Research' as Agent['category'],
    icon: 'Search',
    creator: wallet.connected && wallet.address ? 'User Wallet' : 'Anonymous Dev',
    price: 0.02,
    capabilities: ['Web Research', 'Text Summarization'],
    howItWorks: ['Submit request', 'Analyze query and search', 'Structure detailed markdown report'],
    dependencies: [] as string[],
    model: 'gpt-4o',
    systemPrompt: '',
    temperature: 0.7
  });

  const [newCap, setNewCap] = useState('');
  const [newStep, setNewStep] = useState('');

  const nextStep = () => setStep((s) => Math.min(s + 1, 5));
  const prevStep = () => setStep((s) => Math.max(s - 1, 1));

  const handleAddField = (field: 'capabilities' | 'howItWorks', val: string, setVal: React.Dispatch<React.SetStateAction<string>>) => {
    if (!val.trim()) return;
    setFormData((prev) => ({
      ...prev,
      [field]: [...prev[field], val.trim()]
    }));
    setVal('');
  };

  const handleRemoveField = (field: 'capabilities' | 'howItWorks', index: number) => {
    setFormData((prev) => ({
      ...prev,
      [field]: prev[field].filter((_, i) => i !== index)
    }));
  };

  const handlePublish = () => {
    if (!formData.name.trim() || !formData.description.trim()) {
      alert('Please fill out the agent name and short description first!');
      setStep(1);
      return;
    }

    createAgent({
      name: formData.name,
      description: formData.description,
      longDescription: formData.longDescription,
      category: formData.category,
      icon: formData.icon,
      creator: wallet.connected && wallet.address ? wallet.address.substring(0, 8) + '...' : 'DataMind',
      price: formData.price,
      capabilities: formData.capabilities,
      howItWorks: formData.howItWorks,
      dependencies: formData.dependencies,
      verified: true
    });

    alert('Smart contract created! Agent successfully registered on the blockchain.');
    router.push('/marketplace');
  };

  const steps = [
    { num: 1, label: 'Basic Info' },
    { num: 2, label: 'Capabilities' },
    { num: 3, label: 'Pricing' },
    { num: 4, label: 'AI Configuration' },
    { num: 5, label: 'Review' }
  ];

  return (
    <div className="flex min-h-screen flex-col bg-[#FFFDF5]">
      <Header />

      <main className="flex-1 mx-auto w-full max-w-3xl px-4 py-10 sm:px-6">
        
        {/* Card Container */}
        <div className="p-6 sm:p-8 glass-card rounded-2xl">
          
          {/* Progress Indicator */}
          <div className="mb-10">
            <div className="flex items-center justify-between">
              {steps.map((s, idx) => (
                <React.Fragment key={s.num}>
                  {/* Step bubble */}
                  <div className="flex flex-col items-center relative z-10">
                    <div className={`flex h-10 w-10 items-center justify-center rounded-full border-2 text-xs font-bold transition-all duration-300 ${
                      step === s.num
                        ? 'border-brand-yellow bg-brand-light-gold text-brand-text-dark font-extrabold shadow-sm'
                        : step > s.num
                        ? 'border-emerald-500 bg-emerald-500 text-white'
                        : 'border-neutral-200 bg-white text-brand-text-muted'
                    }`}>
                      {step > s.num ? <Check size={16} /> : s.num}
                    </div>
                    <span className={`mt-2 text-[10px] font-bold tracking-wider uppercase hidden sm:block ${
                      step === s.num ? 'text-brand-text-dark font-extrabold' : 'text-brand-text-muted'
                    }`}>
                      {s.label}
                    </span>
                  </div>

                  {/* Connecting Line */}
                  {idx < steps.length - 1 && (
                    <div className="flex-1 h-0.5 mx-2 bg-neutral-100 relative -top-3 sm:-top-5">
                      <div 
                        className="h-full bg-brand-yellow transition-all duration-300"
                        style={{ width: step > s.num ? '100%' : '0%' }}
                      />
                    </div>
                  )}
                </React.Fragment>
              ))}
            </div>
          </div>

          {/* Form Wizard Content */}
          <div className="min-h-[350px]">
            
            {/* STEP 1: Basic Information */}
            {step === 1 && (
              <div className="space-y-6 animate-in fade-in duration-300">
                <div>
                  <h2 className="font-heading text-xl font-extrabold text-brand-text-dark">Basic Agent Info</h2>
                  <p className="text-xs text-brand-text-muted mt-1">Provide the foundational descriptors for your autonomous agent.</p>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-brand-text-dark uppercase tracking-wider mb-2">Agent Name</label>
                    <input
                      type="text"
                      placeholder="e.g. Research Agent"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full rounded-xl border border-neutral-200 py-3 px-4 text-xs focus:border-brand-yellow focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-brand-text-dark uppercase tracking-wider mb-2">Short Description</label>
                    <input
                      type="text"
                      placeholder="Summarize the core task of the agent in one sentence."
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      className="w-full rounded-xl border border-neutral-200 py-3 px-4 text-xs focus:border-brand-yellow focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-brand-text-dark uppercase tracking-wider mb-2">Long Detail Description</label>
                    <textarea
                      rows={4}
                      placeholder="Provide full description of operations, inputs expected and outputs returned."
                      value={formData.longDescription}
                      onChange={(e) => setFormData({ ...formData, longDescription: e.target.value })}
                      className="w-full rounded-xl border border-neutral-200 py-3 px-4 text-xs focus:border-brand-yellow focus:outline-none resize-none"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-brand-text-dark uppercase tracking-wider mb-2">Category</label>
                      <select
                        value={formData.category}
                        onChange={(e) => setFormData({ ...formData, category: e.target.value as any })}
                        className="w-full rounded-xl border border-neutral-200 py-3 px-3 text-xs bg-white focus:border-brand-yellow focus:outline-none"
                      >
                        <option value="Research">Research</option>
                        <option value="Data">Data</option>
                        <option value="Analytics">Analytics</option>
                        <option value="Content">Content</option>
                        <option value="Development">Development</option>
                        <option value="Utility">Utility</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-brand-text-dark uppercase tracking-wider mb-2">Icon Theme</label>
                      <select
                        value={formData.icon}
                        onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
                        className="w-full rounded-xl border border-neutral-200 py-3 px-3 text-xs bg-white focus:border-brand-yellow focus:outline-none"
                      >
                        <option value="Search">Search Glass</option>
                        <option value="Globe">Globe / Web</option>
                        <option value="BarChart">Bar Chart</option>
                        <option value="ShieldCheck">Shield / Security</option>
                        <option value="FileText">File Text</option>
                        <option value="Code">Coding Tags</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* STEP 2: Capabilities */}
            {step === 2 && (
              <div className="space-y-6 animate-in fade-in duration-300">
                <div>
                  <h2 className="font-heading text-xl font-extrabold text-brand-text-dark">Agent Capabilities</h2>
                  <p className="text-xs text-brand-text-muted mt-1">Specify skills and execution steps that the agent executes.</p>
                </div>

                <div className="space-y-5">
                  {/* Capabilities List */}
                  <div>
                    <label className="block text-xs font-bold text-brand-text-dark uppercase tracking-wider mb-3">Capabilities / Skills</label>
                    <div className="space-y-2 mb-3">
                      {formData.capabilities.map((cap, idx) => (
                        <div key={idx} className="flex items-center justify-between rounded-xl bg-neutral-50 px-4 py-2 text-xs border border-neutral-100">
                          <span className="font-semibold text-brand-text-dark">{cap}</span>
                          <button onClick={() => handleRemoveField('capabilities', idx)} className="text-red-500 hover:text-red-700">
                            <Trash2 size={14} />
                          </button>
                        </div>
                      ))}
                    </div>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        placeholder="Add new capability (e.g. Code Review)"
                        value={newCap}
                        onChange={(e) => setNewCap(e.target.value)}
                        className="flex-1 rounded-xl border border-neutral-200 py-2.5 px-4 text-xs focus:border-brand-yellow focus:outline-none"
                      />
                      <button
                        onClick={() => handleAddField('capabilities', newCap, setNewCap)}
                        className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-yellow text-white hover:bg-[#F59E0B] shadow-sm"
                      >
                        <Plus size={16} />
                      </button>
                    </div>
                  </div>

                  {/* Workflow steps */}
                  <div>
                    <label className="block text-xs font-bold text-brand-text-dark uppercase tracking-wider mb-3">Workflow Execution Steps</label>
                    <div className="space-y-2 mb-3">
                      {formData.howItWorks.map((st, idx) => (
                        <div key={idx} className="flex items-center justify-between rounded-xl bg-neutral-50 px-4 py-2 text-xs border border-neutral-100">
                          <span className="font-semibold text-brand-text-dark">Step {idx + 1}: {st}</span>
                          <button onClick={() => handleRemoveField('howItWorks', idx)} className="text-red-500 hover:text-red-700">
                            <Trash2 size={14} />
                          </button>
                        </div>
                      ))}
                    </div>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        placeholder="Add execution step (e.g. Audit compiler warnings)"
                        value={newStep}
                        onChange={(e) => setNewStep(e.target.value)}
                        className="flex-1 rounded-xl border border-neutral-200 py-2.5 px-4 text-xs focus:border-brand-yellow focus:outline-none"
                      />
                      <button
                        onClick={() => handleAddField('howItWorks', newStep, setNewStep)}
                        className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-yellow text-white hover:bg-[#F59E0B] shadow-sm"
                      >
                        <Plus size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* STEP 3: Pricing */}
            {step === 3 && (
              <div className="space-y-6 animate-in fade-in duration-300">
                <div>
                  <h2 className="font-heading text-xl font-extrabold text-brand-text-dark">On-Chain Pricing Model</h2>
                  <p className="text-xs text-brand-text-muted mt-1">Specify how much you charge users in CROO token per request execution.</p>
                </div>

                <div className="space-y-5">
                  <div>
                    <label className="block text-xs font-bold text-brand-text-dark uppercase tracking-wider mb-2">Price Per Task (CROO)</label>
                    <input
                      type="number"
                      step="0.001"
                      min="0.001"
                      max="1.0"
                      value={formData.price}
                      onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) })}
                      className="w-full rounded-xl border border-neutral-200 py-3 px-4 text-xs focus:border-brand-yellow focus:outline-none"
                    />
                  </div>

                  <div className="rounded-xl border border-gold-soft bg-gold-light-gold/15 p-4 flex items-start space-x-3 text-xs">
                    <Info size={16} className="text-brand-yellow shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold text-brand-text-dark block">Decentralized Escrow Auditing</span>
                      <p className="text-brand-text-muted mt-1 leading-relaxed">
                        Funds from client wallets are locked in a smart contract. Once your agent finishes execution, decentralized oracles check verification logs to release funds to your registered address.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* STEP 4: AI Configuration */}
            {step === 4 && (
              <div className="space-y-6 animate-in fade-in duration-300">
                <div>
                  <h2 className="font-heading text-xl font-extrabold text-brand-text-dark">Agent Engine Configuration</h2>
                  <p className="text-xs text-brand-text-muted mt-1">Hook up your LLM node, set base system instructions, and control generation temperature.</p>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-brand-text-dark uppercase tracking-wider mb-2">Base LLM Model</label>
                    <select
                      value={formData.model}
                      onChange={(e) => setFormData({ ...formData, model: e.target.value })}
                      className="w-full rounded-xl border border-neutral-200 py-3 px-3 text-xs bg-white focus:border-brand-yellow focus:outline-none"
                    >
                      <option value="gpt-4o">GPT-4o (OpenAI)</option>
                      <option value="claude-3-5-sonnet">Claude 3.5 Sonnet (Anthropic)</option>
                      <option value="llama-3">Llama 3 70B (Meta)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-brand-text-dark uppercase tracking-wider mb-2">System Instructions / Prompt</label>
                    <textarea
                      rows={5}
                      placeholder="You are an autonomous AI research node. Your task is to..."
                      value={formData.systemPrompt}
                      onChange={(e) => setFormData({ ...formData, systemPrompt: e.target.value })}
                      className="w-full rounded-xl border border-neutral-200 py-3 px-4 text-xs focus:border-brand-yellow focus:outline-none resize-none"
                    />
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="block text-xs font-bold text-brand-text-dark uppercase tracking-wider">Temperature</label>
                      <span className="text-xs font-bold text-brand-text-dark">{formData.temperature}</span>
                    </div>
                    <input
                      type="range"
                      min="0.0"
                      max="1.2"
                      step="0.1"
                      value={formData.temperature}
                      onChange={(e) => setFormData({ ...formData, temperature: parseFloat(e.target.value) })}
                      className="w-full h-1.5 bg-neutral-200 rounded-lg appearance-none cursor-pointer accent-brand-yellow"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* STEP 5: Review */}
            {step === 5 && (
              <div className="space-y-6 animate-in fade-in duration-300">
                <div>
                  <h2 className="font-heading text-xl font-extrabold text-brand-text-dark">Review & Publish</h2>
                  <p className="text-xs text-brand-text-muted mt-1">Ensure all smart contract details and capabilities are correct before deploying.</p>
                </div>

                <div className="space-y-4 border border-gold-soft rounded-xl p-5 bg-neutral-50/50 text-xs">
                  <div className="grid grid-cols-2 gap-4 pb-4 border-b border-neutral-100">
                    <div>
                      <span className="text-brand-text-muted block">Agent Name</span>
                      <span className="font-bold text-brand-text-dark">{formData.name || 'Not Provided'}</span>
                    </div>
                    <div>
                      <span className="text-brand-text-muted block">Category</span>
                      <span className="font-bold text-brand-text-dark">{formData.category}</span>
                    </div>
                  </div>

                  <div className="pb-4 border-b border-neutral-100">
                    <span className="text-brand-text-muted block">Short Description</span>
                    <p className="font-semibold text-brand-text-dark mt-1">{formData.description || 'Not Provided'}</p>
                  </div>

                  <div className="grid grid-cols-2 gap-4 pb-4 border-b border-neutral-100">
                    <div>
                      <span className="text-brand-text-muted block">Pricing per Request</span>
                      <span className="font-bold text-brand-yellow">{formData.price} CROO</span>
                    </div>
                    <div>
                      <span className="text-brand-text-muted block">LLM Backend Engine</span>
                      <span className="font-bold text-brand-text-dark uppercase">{formData.model}</span>
                    </div>
                  </div>

                  <div>
                    <span className="text-brand-text-muted block mb-1">Capabilities Selected</span>
                    <div className="flex flex-wrap gap-1">
                      {formData.capabilities.map((cap, i) => (
                        <span key={i} className="inline-block bg-brand-light-gold text-brand-text-dark font-semibold px-2 py-0.5 rounded text-[10px]">
                          {cap}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

          </div>

          {/* Wizard Footer Controls */}
          <div className="mt-8 flex items-center justify-between border-t border-neutral-100 pt-6">
            <button
              onClick={prevStep}
              disabled={step === 1}
              className={`flex items-center space-x-1.5 rounded-xl border border-neutral-200 bg-white px-5 py-2.5 text-xs font-bold text-brand-text-dark shadow-sm transition-all hover:bg-neutral-50 ${
                step === 1 ? 'opacity-40 cursor-not-allowed' : ''
              }`}
            >
              <ChevronLeft size={16} />
              <span>Back</span>
            </button>

            {step < 5 ? (
              <button
                onClick={nextStep}
                className="flex items-center space-x-1.5 rounded-xl bg-brand-yellow px-5 py-2.5 text-xs font-bold text-white shadow-premium-soft hover:bg-[#F59E0B] transition-all"
              >
                <span>Next</span>
                <ChevronRight size={16} />
              </button>
            ) : (
              <button
                onClick={handlePublish}
                className="flex items-center space-x-1.5 rounded-xl bg-emerald-500 px-6 py-2.5 text-xs font-bold text-white shadow-md hover:bg-emerald-600 transition-all"
              >
                <Check size={16} />
                <span>Deploy Agent Smart Contract</span>
              </button>
            )}
          </div>

        </div>
      </main>

      <Footer />
    </div>
  );
}
