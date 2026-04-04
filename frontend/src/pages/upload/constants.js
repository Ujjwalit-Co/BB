import {
  Github, FileText, Code, Sparkles, DollarSign, Shield,
  FolderOpen, Eye
} from 'lucide-react';

export const STEPS = [
  { id: 1, title: 'Connect GitHub', icon: Github },
  { id: 2, title: 'Select Repository', icon: FolderOpen },
  { id: 3, title: 'Upload README', icon: FileText },
  { id: 4, title: 'Select Files', icon: Code },
  { id: 5, title: 'AI Processing', icon: Sparkles },
  { id: 6, title: 'Review & Edit', icon: Eye },
  { id: 7, title: 'Set Pricing', icon: DollarSign },
  { id: 8, title: 'Project Preview', icon: Eye },
  { id: 9, title: 'Terms & Submit', icon: Shield },
];

export const TECH_OPTIONS = [
  'React', 'Next.js', 'Vue.js', 'Angular', 'Svelte',
  'Node.js', 'Express', 'Django', 'Flask', 'FastAPI',
  'TypeScript', 'JavaScript', 'Python', 'Java', 'Go',
  'MongoDB', 'PostgreSQL', 'MySQL', 'Firebase', 'Redis',
  'TailwindCSS', 'Docker', 'AWS', 'GraphQL', 'REST API',
];

export const PRICE_TIERS = {
  silver:  { label: '🥈 Silver',  min: 99,   max: 299,  color: '#94a3b8' },
  gold:    { label: '🥇 Gold',    min: 300,  max: 999,  color: '#f59e0b' },
  diamond: { label: '💎 Diamond', min: 1000, max: 3999, color: '#a78bfa' },
};

export function getBadgeFromPrice(price) {
  if (price >= 1000) return 'diamond';
  if (price >= 300) return 'gold';
  return 'silver';
}

export function getPriceError(price) {
  if (price < 99) return 'Minimum price is ₹99';
  if (price > 3999) return 'Maximum price is ₹3999';
  return '';
}
