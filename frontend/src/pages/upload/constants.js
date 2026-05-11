import {
  Code, DollarSign, Eye, FileText, FolderOpen, Github, Shield, Sparkles,
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
  silver: { label: 'Starter', min: 99, max: 299, color: '#1E3A2F' },
  gold: { label: 'Portfolio', min: 300, max: 999, color: '#D4840A' },
  diamond: { label: 'Advanced', min: 1000, max: 3999, color: '#C0392B' },
};

export function getBadgeFromPrice(price) {
  if (price >= 1000) return 'diamond';
  if (price >= 300) return 'gold';
  return 'silver';
}

export function getPriceError(price) {
  if (price < 99) return 'Minimum price is Rs 99';
  if (price > 3999) return 'Maximum price is Rs 3999';
  return '';
}
