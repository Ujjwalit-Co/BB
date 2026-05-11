import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Play, Save, Check, User, Zap, LayoutDashboard, LogOut, Settings, ChevronDown, Sun, Moon, RefreshCcw, Loader2, Radio, TerminalSquare } from 'lucide-react';
import useLabStore from '../../store/useLabStore';

export default function LabHeader() {
  const {
    projectName, credits, smartRun, runCode, saveProject, saveFlash,
    profileMenuOpen, toggleProfileMenu, closeProfileMenu, resetOnboarding,
    getActiveFile, activeFileId, webcontainerInstance, isWebContainerLoading,
    webcontainerStatus, webcontainerError, webcontainerPreviewUrl, isTerminalRunning
  } = useLabStore();
  
  const menuRef = useRef(null);
  const [isDark, setIsDark] = useState(() => {
    const saved = localStorage.getItem('theme');
    return saved ? saved === 'dark' : true;
  });

  // Subscribe to activeFileId changes to trigger re-renders
  useEffect(() => {
  }, [activeFileId]);

  // Get active file to determine run button label
  const activeFile = getActiveFile();
  
  // Determine run button label and icon based on active file
  const getRunButtonConfig = () => {
    if (!activeFile) {
      return { label: 'Run Project', icon: Play, onClick: runCode };
    }
    
    const fileName = activeFile.name.toLowerCase();
    const language = activeFile.language;
    
    // Python files
    if (language === 'python' || fileName.endsWith('.py')) {
      return { label: 'Run Python', icon: Play, onClick: smartRun };
    }
    
    // JavaScript/TypeScript files
    if (['javascript', 'typescript'].includes(language) || 
        fileName.endsWith('.js') || fileName.endsWith('.ts') ||
        fileName.endsWith('.jsx') || fileName.endsWith('.tsx')) {
      return { label: 'Run JS', icon: Play, onClick: smartRun };
    }
    
    // HTML/CSS files - run full project
    if (language === 'html' || language === 'css' ||
        fileName.endsWith('.html') || fileName.endsWith('.css')) {
      return { label: 'Run Project', icon: Play, onClick: runCode };
    }
    
    // Default
    return { label: 'Run', icon: Play, onClick: smartRun };
  };

  const runButtonConfig = getRunButtonConfig();
  const RunIcon = runButtonConfig.icon;
  const envLabel = isWebContainerLoading
    ? 'Booting'
    : webcontainerStatus === 'serving'
      ? 'Serving'
      : webcontainerInstance
        ? 'Ready'
        : 'Fallback';
  const envTitle = webcontainerError || (webcontainerPreviewUrl ? `Preview server: ${webcontainerPreviewUrl}` : 'Browser preview and Pyodide are available.');

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
        <div className="lab-header-project">
          <h1 className="lab-header-title">{projectName || 'Untitled Project'}</h1>
          <div className={`lab-env-pill ${webcontainerInstance ? 'ready' : 'fallback'}`} title={envTitle}>
            {isWebContainerLoading ? (
              <Loader2 size={11} className="animate-spin" />
            ) : webcontainerStatus === 'serving' ? (
              <Radio size={11} />
            ) : webcontainerInstance ? (
              <TerminalSquare size={11} />
            ) : (
              <span className="lab-env-dot" />
            )}
            <span>{envLabel}</span>
          </div>
        </div>
      </div>

      <div className="lab-header-right">
        <button 
          className="lab-btn lab-btn-run" 
          onClick={runButtonConfig.onClick}
          title={activeFile ? `Run ${activeFile.name}` : 'Run full project'}
          disabled={isWebContainerLoading || isTerminalRunning}
        >
          {isTerminalRunning ? <Loader2 size={14} className="animate-spin" /> : <RunIcon size={14} />}
          <span>{isTerminalRunning ? 'Running' : runButtonConfig.label}</span>
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
              <button className="lab-profile-item" onClick={() => { resetOnboarding(); closeProfileMenu(); }}>
                <RefreshCcw size={14} />
                <span>Reset Environment</span>
              </button>
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

