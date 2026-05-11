import React, { useState } from 'react';
import { motion as Motion } from 'framer-motion';
import { Check, Settings, Monitor, Package, Edit3 } from 'lucide-react';
import useLabStore from '../../store/useLabStore';

export default function OnboardingModal() {
  const { setUserEnvironment } = useLabStore();
  const [env, setEnv] = useState({
    os: 'windows',
    hasNode: true,
    hasPython: false,
    editor: 'VS Code',
    editorOther: ''
  });

  const handleFinish = () => {
    const finalEnv = {
      ...env,
      editor: env.editor === 'Other' && env.editorOther ? env.editorOther : env.editor
    };
    setUserEnvironment(finalEnv);
  };

  return (
    <div className="lab-modal-overlay" style={{ backdropFilter: 'none', background: 'rgba(0,0,0,0.4)' }}>
      <Motion.div
        initial={{ opacity: 0, scale: 0.98, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        style={{ 
          width: '100%',
          maxWidth: 440, 
          background: 'var(--lab-surface)', 
          border: '1px solid var(--lab-border)',
          borderRadius: 'var(--lab-radius)',
          boxShadow: 'var(--lab-shadow-lg)',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column'
        }}
      >
        {/* Header */}
        <div style={{ padding: '24px 32px', borderBottom: '1px solid var(--lab-border)', display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'var(--lab-accent-soft)', color: 'var(--lab-accent)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Settings size={20} />
          </div>
          <div>
            <h2 style={{ fontSize: 18, fontWeight: 700, color: 'var(--lab-text)', margin: 0 }}>Environment Setup</h2>
            <p style={{ fontSize: 12, color: 'var(--lab-text-secondary)', margin: '2px 0 0 0' }}>Configure your workspace to get started</p>
          </div>
        </div>

        {/* Content */}
        <div style={{ padding: '24px 32px', display: 'flex', flexDirection: 'column', gap: 24 }}>
          {/* OS */}
          <div>
            <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11, fontWeight: 700, color: 'var(--lab-text-muted)', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 12 }}>
              <Monitor size={14} /> Operating System
            </label>
            <div style={{ display: 'flex', gap: 8 }}>
              {['windows', 'macOS', 'linux'].map(os => (
                <button
                  key={os}
                  onClick={() => setEnv({ ...env, os })}
                  className={env.os === os ? 'lab-btn lab-btn-run' : 'lab-btn lab-btn-secondary'}
                  style={{ flex: 1, justifyContent: 'center', textTransform: 'capitalize' }}
                >
                  {os}
                </button>
              ))}
            </div>
          </div>

          {/* Tools */}
          <div>
            <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11, fontWeight: 700, color: 'var(--lab-text-muted)', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 12 }}>
              <Package size={14} /> Installed Tools
            </label>
            <div style={{ display: 'flex', gap: 20 }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  style={{ width: 16, height: 16, accentColor: 'var(--lab-accent)' }}
                  checked={env.hasNode}
                  onChange={() => setEnv({ ...env, hasNode: !env.hasNode })}
                />
                <span style={{ fontSize: 14, color: 'var(--lab-text)', fontWeight: 500 }}>Node.js</span>
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  style={{ width: 16, height: 16, accentColor: 'var(--lab-accent)' }}
                  checked={env.hasPython}
                  onChange={() => setEnv({ ...env, hasPython: !env.hasPython })}
                />
                <span style={{ fontSize: 14, color: 'var(--lab-text)', fontWeight: 500 }}>Python</span>
              </label>
            </div>
          </div>

          {/* Editor */}
          <div>
            <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11, fontWeight: 700, color: 'var(--lab-text-muted)', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 12 }}>
              <Edit3 size={14} /> Preferred Editor
            </label>
            <select
              value={env.editor}
              onChange={(e) => setEnv({ ...env, editor: e.target.value, editorOther: '' })}
              style={{
                width: '100%',
                padding: '10px 12px',
                borderRadius: 'var(--lab-radius-sm)',
                background: 'var(--lab-surface-elevated)',
                border: '1px solid var(--lab-border)',
                color: 'var(--lab-text)',
                fontSize: 14,
                outline: 'none',
                cursor: 'pointer'
              }}
            >
              <option>VS Code</option>
              <option>Cursor</option>
              <option>IntelliJ</option>
              <option>Other</option>
            </select>
            {env.editor === 'Other' && (
              <input
                type="text"
                value={env.editorOther}
                onChange={(e) => setEnv({ ...env, editorOther: e.target.value })}
                placeholder="Enter editor name"
                style={{
                  marginTop: 12,
                  width: '100%',
                  padding: '10px 12px',
                  borderRadius: 'var(--lab-radius-sm)',
                  background: 'var(--lab-surface-elevated)',
                  border: '1px solid var(--lab-accent)',
                  color: 'var(--lab-text)',
                  fontSize: 14,
                  outline: 'none'
                }}
                autoFocus
              />
            )}
          </div>
        </div>

        {/* Footer */}
        <div style={{ padding: '24px 32px', background: 'var(--lab-surface-elevated)', borderTop: '1px solid var(--lab-border)' }}>
          <button
            onClick={handleFinish}
            className="lab-btn lab-btn-run"
            style={{ width: '100%', justifyContent: 'center', padding: '12px', fontSize: 14 }}
          >
            <Check size={18} strokeWidth={2.5} />
            Start Learning
          </button>
        </div>
      </Motion.div>
    </div>
  );
}
