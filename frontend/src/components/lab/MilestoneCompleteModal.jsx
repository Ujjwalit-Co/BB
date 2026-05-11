import React from 'react';
import { motion as Motion } from 'framer-motion';
import { Sparkles, CheckCircle2, ArrowRight } from 'lucide-react';

export default function MilestoneCompleteModal({ milestone, onProceed }) {
  if (!milestone) return null;

  return (
    <Motion.div 
      className="lab-modal-overlay"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      style={{ backdropFilter: 'none', background: 'rgba(0,0,0,0.4)' }}
    >
      <Motion.div
        initial={{ opacity: 0, scale: 0.98, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.98, y: -10 }}
        style={{ 
          width: '100%',
          maxWidth: 400, 
          background: 'var(--lab-surface)', 
          border: '1px solid var(--lab-border)',
          borderRadius: 'var(--lab-radius)',
          boxShadow: 'var(--lab-shadow-lg)',
          padding: 32,
          position: 'relative'
        }}
      >
        <div style={{ textAlign: 'center', marginBottom: 24 }}>
          <div style={{ width: 48, height: 48, borderRadius: '50%', background: 'rgba(34, 197, 94, 0.1)', color: 'var(--lab-success)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
            <Sparkles size={24} />
          </div>
          <h2 style={{ fontSize: 20, fontWeight: 700, color: 'var(--lab-text)', marginBottom: 8 }}>Milestone Completed!</h2>
          <p style={{ fontSize: 13, color: 'var(--lab-text-secondary)', lineHeight: 1.5 }}>
            Great job! You've successfully finished all tasks for <strong>{milestone.title}</strong>.
          </p>
        </div>

        <div style={{ background: 'var(--lab-surface-elevated)', border: '1px solid var(--lab-border)', borderRadius: 'var(--lab-radius)', padding: 16, marginBottom: 24 }}>
          <h3 style={{ fontSize: 11, fontWeight: 700, color: 'var(--lab-text-muted)', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 12 }}>Checklist</h3>
          <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 10 }}>
            {milestone.steps.map(step => (
              <li key={step.id} style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
                <CheckCircle2 size={16} color="var(--lab-success)" style={{ flexShrink: 0, marginTop: 1 }} />
                <span style={{ fontSize: 13, color: 'var(--lab-text)', fontWeight: 500, lineHeight: 1.4 }}>{step.title}</span>
              </li>
            ))}
          </ul>
        </div>

        <button 
          className="lab-btn lab-btn-run" 
          style={{ width: '100%', justifyContent: 'center', padding: '12px 16px', fontSize: 14 }}
          onClick={onProceed}
        >
          Move Forward <ArrowRight size={16} />
        </button>
      </Motion.div>
    </Motion.div>
  );
}
