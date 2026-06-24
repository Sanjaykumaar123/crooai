import React from 'react';
import { 
  Search, 
  Globe, 
  BarChart, 
  ShieldAlert, 
  FileText, 
  Code,
  ShieldCheck,
  TrendingUp,
  Workflow,
  Cpu,
  ArrowRight,
  Database,
  Terminal,
  Settings,
  Grid,
  History,
  Lock,
  Wallet,
  Play,
  CheckCircle,
  PlusCircle,
  HelpCircle,
  Menu,
  X,
  Star,
  Activity,
  Layers,
  ChevronRight,
  Info,
  DollarSign,
  AlertTriangle,
  User,
  ExternalLink,
  ChevronDown
} from 'lucide-react';

const icons = {
  Search,
  Globe,
  BarChart,
  ShieldAlert,
  FileText,
  Code,
  ShieldCheck,
  TrendingUp,
  Workflow,
  Cpu,
  ArrowRight,
  Database,
  Terminal,
  Settings,
  Grid,
  History,
  Lock,
  Wallet,
  Play,
  CheckCircle,
  PlusCircle,
  HelpCircle,
  Menu,
  X,
  Star,
  Activity,
  Layers,
  ChevronRight,
  Info,
  DollarSign,
  AlertTriangle,
  User,
  ExternalLink,
  ChevronDown
};

export type IconName = keyof typeof icons;

interface DynamicIconProps {
  name: string;
  className?: string;
  size?: number;
}

export default function DynamicIcon({ name, className = '', size = 20 }: DynamicIconProps) {
  // Resolve standard icon keys or mapping
  let IconComponent = icons[name as IconName];
  
  if (!IconComponent) {
    // Try to fallback
    if (name.toLowerCase().includes('search')) IconComponent = Search;
    else if (name.toLowerCase().includes('globe') || name.toLowerCase().includes('news')) IconComponent = Globe;
    else if (name.toLowerCase().includes('chart') || name.toLowerCase().includes('analytic')) IconComponent = BarChart;
    else if (name.toLowerCase().includes('shield') || name.toLowerCase().includes('verify')) IconComponent = ShieldCheck;
    else if (name.toLowerCase().includes('file') || name.toLowerCase().includes('report')) IconComponent = FileText;
    else if (name.toLowerCase().includes('code') || name.toLowerCase().includes('developer')) IconComponent = Code;
    else IconComponent = Cpu; // Default fallback
  }

  return <IconComponent className={className} size={size} />;
}
