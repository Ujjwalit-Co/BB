import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Play, Save, Check, User, Zap, LayoutDashboard, LogOut, Settings, ChevronDown, Sun, Moon } from 'lucide-react';
import useLabStore from '../../store/useLabStore';

export default function LabHeader() {
  const { projectName, credits, runCode, saveProject, saveFlash, profileMenuOpen, toggleProfileMenu, closeProfileMenu } = useLabStore();
  const menuRef = useRef(null);
  const [isDark, setIsDark] = useState(() => {
    const saved = localStorage.getItem('theme');
    return saved ? saved === 'dark' : true;
  });

  // Close profile menu on outside click
  useEffect(() => {
    const handler = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        closeProfileMenu();
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [closeProfileMenu]);

  // Theme toggle
  useEffect(() => {
    const root = window.document.documentElement;
    localStorage.setItem('theme', isDark ? 'dark' : 'light');
    if (isDark) {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [isDark]);

  return (
    <header className="lab-header">
      <div className="lab-header-left">
        <Link to="/catalog" className="lab-header-back">
          <ArrowLeft size={16} />
          <span>Dashboard</span>
        </Link>
        <div className="lab-header-divider" />
        <h1 className="lab-header-title">{projectName || 'Untitled Project'}</h1>
      </div>

      <div className="lab-header-right">
        <button className="lab-btn lab-btn-run" onClick={runCode}>
          <Play size={14} />
          <span>Run</span>
        </button>

        <button className={`lab-btn lab-btn-secondary ${saveFlash ? 'lab-btn-saved' : ''}`} onClick={saveProject}>
          {saveFlash ? <Check size={14} className="lab-save-check" /> : <Save size={14} />}
          <span>{saveFlash ? 'Saved' : 'Save'}</span>
        </button>

        <button
          onClick={() => setIsDark(!isDark)}
          className="lab-btn lab-btn-secondary"
          title={isDark ? 'Light mode' : 'Dark mode'}
        >
          {isDark ? <Sun size={14} /> : <Moon size={14} />}
        </button>

        {/* Profile Dropdown */}
        <div className="lab-profile-wrap" ref={menuRef}>
          <button className="lab-profile-trigger" onClick={toggleProfileMenu}>
            <div className="lab-profile-avatar">
              <User size={14} />
            </div>
            <ChevronDown size={12} className={`lab-profile-chevron ${profileMenuOpen ? 'open' : ''}`} />
          </button>

          {profileMenuOpen && (
            <div className="lab-profile-dropdown">
              <div className="lab-profile-credits">
                <Zap size={13} />
                <span>{credits} credits remaining</span>
              </div>
              <div className="lab-profile-sep" />
              <button className="lab-profile-item" onClick={() => { saveProject(); closeProfileMenu(); }}>
                <Save size={14} />
                <span>Save Project</span>
                <kbd>Ctrl+S</kbd>
              </button>
              <Link to="/dashboard" className="lab-profile-item" onClick={closeProfileMenu}>
                <LayoutDashboard size={14} />
                <span>Go to Dashboard</span>
              </Link>
              <Link to="/catalog" className="lab-profile-item" onClick={closeProfileMenu}>
                <Settings size={14} />
                <span>Project Settings</span>
              </Link>
              <div className="lab-profile-sep" />
              <Link to="/" className="lab-profile-item lab-profile-logout" onClick={closeProfileMenu}>
                <LogOut size={14} />
                <span>Logout</span>
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
