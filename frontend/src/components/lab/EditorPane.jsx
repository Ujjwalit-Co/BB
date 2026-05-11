import React, { useRef, useState, useEffect } from 'react';
import { X, Terminal as TerminalIcon, Eye, ExternalLink, ChevronsDown, ChevronsUp, Trash2, Play, Sparkles, Box, Square } from 'lucide-react';
import { motion as Motion, AnimatePresence } from 'framer-motion';
import { FileIcon } from './fileIcons.jsx';
import Editor from '../Editor';
import useLabStore from '../../store/useLabStore';

// Helper to debounce iframe updates
function useDebounce(value, delay) {
  const [debouncedValue, setDebouncedValue] = useState(value);
  useEffect(() => {
    const handler = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(handler);
  }, [value, delay]);
  return debouncedValue;
}

const LOADING_QUOTES = [
  "Setting up your lab environment...",
  "Knowledge requires patience. Good things come to those who wait.",
  "Compiling wisdom, one byte at a time...",
  "Preparing your coding workspace...",
  "Loading possibilities...",
];

const LoadingState = ({ message }) => {
  const { loadingProgress } = useLabStore();
  const [quoteIndex, setQuoteIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setQuoteIndex((prev) => (prev + 1) % LOADING_QUOTES.length);
    }, 2000); // Slightly slower for better readability
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="absolute inset-0 z-[60] flex flex-col items-center justify-center bg-white dark:bg-[#0d0d0d] transition-colors duration-500">
      <div className="flex flex-col items-center max-w-sm w-full p-12">
        <div className="lab-loading-spinner-container">
          <svg className="lab-loading-spinner" viewBox="0 0 50 50">
            <circle cx="25" cy="25" r="20" />
          </svg>
        </div>
        
        <div className="space-y-4 text-center mt-2">
          <Motion.h2 
            key={message}
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-lg font-black text-slate-900 dark:text-white uppercase tracking-[0.2em]"
          >
            {message}
          </Motion.h2>
          <div className="h-10 flex items-center justify-center overflow-hidden px-4">
            <AnimatePresence mode="wait">
              <Motion.p
                key={quoteIndex}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                className="text-[13px] text-slate-500 dark:text-gray-400 font-medium italic leading-relaxed"
              >
                "{LOADING_QUOTES[quoteIndex]}"
              </Motion.p>
            </AnimatePresence>
          </div>
        </div>
 
        <div className="w-64 h-2 bg-slate-100 dark:bg-white/5 rounded-full overflow-hidden border border-slate-200/50 dark:border-white/10 mt-10 shadow-inner">
          <Motion.div
            initial={{ width: "0%" }}
            animate={{ width: `${loadingProgress}%` }}
            transition={{ type: "spring", stiffness: 45, damping: 20 }}
            className="h-full bg-indigo-600 dark:bg-indigo-500 shadow-[0_0_12px_rgba(79,70,229,0.4)]"
          />
        </div>
      </div>
    </div>
  );
};

export default function EditorPane() {
  const {
    files, openTabs, activeFileId, closeTab, openFile,
    updateFileContent, getActiveFile, getCompiledPreview,
    bottomPanelTab, setBottomPanelTab, bottomPanelOpen, toggleBottomPanel,
    pythonLogs, jsLogs, consoleMode, addConsoleLog, clearConsoleLogs, setConsoleMode,
    setAiInput, toggleRightSidebar, rightSidebarOpen, runPythonCode,
    isLabLoading, loadingStatus, runCode,
    webcontainerPreviewUrl, webcontainerError, runShellCommand, stopTerminalProcess,
    isTerminalRunning, webcontainerInstance
  } = useLabStore();

  const iframeRef = useRef(null);
  const inputRef = useRef(null);
  const logsEndRef = useRef(null);
  const consoleRef = useRef(null);
  const activeFile = getActiveFile();
  const tabFiles = openTabs.map(id => files.find(f => f.id === id)).filter(Boolean);

  const [consoleInput, setConsoleInput] = useState('');
  const [commandHistory, setCommandHistory] = useState([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [selection, setSelection] = useState({ visible: false, x: 0, y: 0, text: '' });

  // Use the appropriate logs based on console mode
  const currentLogs = consoleMode === 'python' ? pythonLogs : jsLogs;

  // Debounce the preview HTML by 600ms to prevent constant flashing while typing
  const livePreviewHtml = getCompiledPreview();
  const debouncedHtml = useDebounce(livePreviewHtml, 600);

  // Listen for selection in console
  useEffect(() => {
    const handleMouseUp = (e) => {
      const selectedText = window.getSelection().toString();
      if (selectedText && consoleRef.current?.contains(e.target)) {
        setSelection({
          visible: true,
          x: e.clientX,
          y: e.clientY - 40,
          text: selectedText
        });
      } else {
        setSelection(prev => ({ ...prev, visible: false }));
      }
    };

    window.addEventListener('mouseup', handleMouseUp);
    return () => window.removeEventListener('mouseup', handleMouseUp);
  }, []);

  const handleSendToAi = (e) => {
    e.stopPropagation();
    setAiInput(`I'm seeing this in my console:\n\n\`\`\`\n${selection.text}\n\`\`\`\n\nCan you explain what's happening?`);
    if (!rightSidebarOpen) toggleRightSidebar();
    setSelection(prev => ({ ...prev, visible: false }));
    window.getSelection().removeAllRanges();
  };

  // Listen for console messages from the iframe
  useEffect(() => {
    const handleMessage = (e) => {
      if (e.data && e.data.type === 'CONSOLE') {
        useLabStore.getState().addConsoleLog(e.data.args.join(' '), e.data.level);
      } else if (e.data && e.data.type === 'CONSOLE_CLEAR') {
        useLabStore.getState().clearConsoleLogs();
      }
    };
    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);

  // Auto-scroll console to bottom when new logs arrive
  useEffect(() => {
    logsEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [currentLogs]);

  // Handle console command execution (JavaScript or Python)
  const handleExecuteCommand = async (e) => {
    e?.preventDefault();
    if (!consoleInput.trim()) return;

    const command = consoleInput.trim();
    setCommandHistory(prev => [...prev, command]);
    setHistoryIndex(-1);
    setConsoleInput('');
    if (consoleMode !== 'shell') {
      addConsoleLog(`> ${command}`, 'command', consoleMode);
    }

    if (consoleMode === 'shell') {
      await runShellCommand(command);
    } else if (consoleMode === 'python') {
      try {
        await runPythonCode(command);
      } catch {
        // Error already logged by runPythonCode
      }
    } else {
      const originalLog = console.log;
      const originalWarn = console.warn;
      const originalError = console.error;
      const capturedOutputs = [];

      const capture = (level) => (...args) => {
        capturedOutputs.push({ level, text: args.join(' ') });
        originalLog(...args);
      };

      console.log = capture('log');
      console.warn = capture('warning');
      console.error = capture('error');

      try {
        if (!window.__consoleCtx) window.__consoleCtx = {};
        window.__consoleCtx.console = console;
        const transformed = command
          .replace(/^\s*let\s+/gm, 'var ')
          .replace(/^\s*const\s+/gm, 'var ');

        const execute = new Function('ctx', 'cmd', `
          with (ctx) {
            return eval(cmd);
          }
        `);

        const result = execute(window.__consoleCtx, transformed);

        console.log = originalLog;
        console.warn = originalWarn;
        console.error = originalError;

        capturedOutputs.forEach(({ level, text }) => {
          addConsoleLog(text, level);
        });

        if (result !== undefined && capturedOutputs.length === 0) {
          addConsoleLog(String(result), 'log');
        }
      } catch (error) {
        console.log = originalLog;
        console.warn = originalWarn;
        console.error = originalError;
        addConsoleLog(error.message, 'error');
      }
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'ArrowUp' && !e.shiftKey) {
      e.preventDefault();
      if (commandHistory.length > 0) {
        const newIndex = historyIndex < commandHistory.length - 1 ? historyIndex + 1 : historyIndex;
        setHistoryIndex(newIndex);
        setConsoleInput(commandHistory[commandHistory.length - 1 - newIndex] || '');
      }
    } else if (e.key === 'ArrowDown' && !e.shiftKey) {
      e.preventDefault();
      if (historyIndex >= 0) {
        const newIndex = historyIndex - 1;
        setHistoryIndex(newIndex);
        setConsoleInput(newIndex < 0 ? '' : commandHistory[commandHistory.length - 1 - newIndex] || '');
      }
    }
  };

  const handleOpenPreviewTab = () => {
    if (webcontainerPreviewUrl) {
      window.open(webcontainerPreviewUrl, '_blank');
      return;
    }
    const html = getCompiledPreview();
    const blob = new Blob([html], { type: 'text/html' });
    window.open(URL.createObjectURL(blob), '_blank');
  };

  const hasHtmlFile = files.some(f => f.name.endsWith('.html'));
  const hasPreview = hasHtmlFile || Boolean(webcontainerPreviewUrl);

  const getTabDotClass = (file) => {
    if (!file.status || file.status === 'clean') return null;
    switch (file.status) {
      case 'unsaved':  return 'lab-tab-dot-unsaved';
      case 'warning':  return 'lab-tab-dot-warning';
      case 'error':    return 'lab-tab-dot-error';
      default:         return null;
    }
  };

  return (
    <div className="lab-editor-pane relative h-full">
      <AnimatePresence>
        {isLabLoading && (
          <Motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-[60]"
          >
            <LoadingState message={loadingStatus} />
          </Motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {selection.visible && (
          <Motion.button
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="fixed z-50 flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-indigo-600 text-white text-[11px] font-bold shadow-xl shadow-indigo-600/30 hover:bg-indigo-500 hover:-translate-y-0.5 active:scale-95 transition-all"
            style={{ left: selection.x, top: selection.y }}
            onClick={handleSendToAi}
          >
            <Sparkles size={12} />
            <span>Ask AI</span>
          </Motion.button>
        )}
      </AnimatePresence>

      <div className="lab-tab-bar">
        <div className="lab-tabs">
          {tabFiles.map(file => {
            const dotClass = getTabDotClass(file);
            return (
              <button
                key={file.id}
                className={`lab-tab ${file.id === activeFileId ? 'active' : ''}`}
                onClick={() => openFile(file.id)}
              >
                <FileIcon filename={file.name} size={13} />
                <span className="lab-tab-name">{file.name}</span>
                {dotClass && <span className={`lab-tab-dot ${dotClass}`} title={file.status} />}
                <span
                  className="lab-tab-close"
                  onClick={(e) => { e.stopPropagation(); closeTab(file.id); }}
                >
                  <X size={12} />
                </span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="lab-editor-area">
        {activeFile ? (
          <Editor
            key={activeFile.id}
            code={activeFile.content}
            language={activeFile.language}
            onChange={(val) => updateFileContent(activeFile.id, val)}
          />
        ) : !isLabLoading && (
          <div className="flex flex-col items-center justify-center h-full bg-slate-50 dark:bg-[#0d0d0d] text-center p-12 space-y-6 transition-colors duration-300">
            <div className="w-20 h-20 rounded-[2rem] bg-slate-200 dark:bg-white/5 border border-slate-300 dark:border-white/10 flex items-center justify-center text-slate-400 dark:text-gray-600 shadow-inner">
              <Box size={40} strokeWidth={1} />
            </div>
            <div className="space-y-2">
              <h3 className="text-base font-bold text-slate-900 dark:text-gray-300 tracking-tight">Your Workspace is Ready</h3>
              <p className="text-xs text-slate-500 dark:text-gray-500 max-w-[240px] leading-relaxed mx-auto">
                Select a file from the sidebar to start coding or ask the AI tutor for a hint.
              </p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setAiInput("How do I get started with this milestone?")}
                className="px-4 py-2 rounded-xl bg-slate-200 dark:bg-white/5 border border-slate-300 dark:border-white/10 text-[11px] font-bold text-slate-600 dark:text-gray-400 hover:bg-slate-300 dark:hover:bg-white/10 transition-all"
              >
                Get a Hint
              </button>
              <button
                className="px-4 py-2 rounded-xl bg-indigo-100 dark:bg-indigo-600/10 border border-indigo-200 dark:border-indigo-500/20 text-[11px] font-bold text-indigo-700 dark:text-indigo-400 hover:bg-indigo-200 dark:hover:bg-indigo-600/20 transition-all"
                onClick={() => toggleRightSidebar()}
              >
                Open AI Tutor
              </button>
            </div>
          </div>
        )}
      </div>

      <div className="lab-bottom-toggle">
        <button onClick={toggleBottomPanel} className="lab-bottom-toggle-btn">
          {bottomPanelOpen ? <ChevronsDown size={14} /> : <ChevronsUp size={14} />}
        </button>
        <button
          className={`lab-bottom-tab-btn ${bottomPanelTab === 'console' ? 'active' : ''}`}
          onClick={() => { setBottomPanelTab('console'); if (!bottomPanelOpen) toggleBottomPanel(); }}
        >
          <TerminalIcon size={13} />
          <span>Console</span>
          {(pythonLogs.length > 0 || jsLogs.length > 0) && (
            <span className="lab-bottom-badge">{pythonLogs.length + jsLogs.length}</span>
          )}
        </button>
        {hasPreview && (
          <button
            className={`lab-bottom-tab-btn ${bottomPanelTab === 'preview' ? 'active' : ''}`}
            onClick={() => { setBottomPanelTab('preview'); if (!bottomPanelOpen) toggleBottomPanel(); }}
          >
            <Eye size={13} />
            <span>Preview</span>
          </button>
        )}
      </div>

      {bottomPanelOpen && (
        <div className="lab-bottom-panel" ref={consoleRef}>
          <div className="lab-console" style={{ display: bottomPanelTab === 'console' ? 'block' : 'none' }}>
            <div className="lab-console-header">
              <div className="lab-console-header-left">
                <span className="lab-console-title">Console</span>
                <div className="lab-console-mode-group">
                  <button
                    className={`lab-console-chip ${consoleMode === 'shell' ? 'active shell' : ''}`}
                    onClick={() => setConsoleMode('shell')}
                    type="button"
                    title={webcontainerInstance ? 'Run WebContainer shell commands' : 'WebContainer is offline'}
                  >
                    Shell
                  </button>
                  <button
                    className={`lab-console-chip ${consoleMode === 'python' ? 'active python' : ''}`}
                    onClick={() => setConsoleMode('python')}
                    type="button"
                  >
                    Python
                  </button>
                  <button
                    className={`lab-console-chip ${consoleMode === 'javascript' ? 'active javascript' : ''}`}
                    onClick={() => setConsoleMode('javascript')}
                    type="button"
                  >
                    JavaScript
                  </button>
                </div>
              </div>
              <div className="lab-console-header-actions">
                {isTerminalRunning && (
                  <button className="lab-console-stop-btn" onClick={stopTerminalProcess} type="button">
                    <Square size={11} />
                    Stop
                  </button>
                )}
                <button className="lab-console-clear-btn" onClick={clearConsoleLogs} type="button">
                  <Trash2 size={13} />
                </button>
              </div>
            </div>
            <div className="lab-console-logs">
              {currentLogs.length === 0 ? (
                <div className="lab-console-empty">No output yet. Run a file or type a command below.</div>
              ) : (
                currentLogs.map((log, idx) => (
                  <div key={idx} className={`lab-console-line lab-console-${log.type}`}>
                    <span className="lab-console-time">{log.timestamp}</span>
                    <span className="lab-console-text">{log.text}</span>
                  </div>
                ))
              )}
              <div ref={logsEndRef} />
            </div>
            <form className="lab-console-input-form" onSubmit={handleExecuteCommand}>
              <span className="lab-console-prompt">{consoleMode === 'shell' ? '$' : '>'}</span>
              <input
                ref={inputRef}
                type="text"
                className="lab-console-input"
                value={consoleInput}
                onChange={(e) => setConsoleInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={consoleMode === 'python'
                  ? "Try: print('Hello'), x = 5, def foo(): ..., import math"
                  : consoleMode === 'shell'
                    ? "Try: npm install, npm run dev, node script.js, ls"
                    : "Try: console.log('Hello'), let x = 5, fetch('/api')..."}
                autoComplete="off"
                disabled={consoleMode === 'shell' && isTerminalRunning}
              />
              <button type="submit" className="lab-console-run-btn">
                <Play size={12} />
              </button>
            </form>
          </div>
          
          <div className="lab-preview" style={{ display: (bottomPanelTab === 'preview' && hasPreview) ? 'flex' : 'none' }}>
            <div className="lab-preview-toolbar">
              <div className="lab-preview-status">
                <span className={`lab-preview-dot ${webcontainerPreviewUrl ? 'live' : 'fallback'}`} />
                <span>{webcontainerPreviewUrl ? 'WebContainer preview' : 'Browser fallback preview'}</span>
                {webcontainerError && <span className="lab-preview-error">{webcontainerError}</span>}
              </div>
              <div className="lab-preview-actions">
                {!webcontainerPreviewUrl && (
                  <button className="lab-preview-action" onClick={runCode} type="button">
                    <Play size={12} />
                    Refresh
                  </button>
                )}
                <button className="lab-preview-action" onClick={handleOpenPreviewTab} type="button">
                  <ExternalLink size={12} />
                  Open
                </button>
              </div>
            </div>
            {webcontainerPreviewUrl ? (
              <iframe ref={iframeRef} title="WebContainer Preview" className="lab-preview-iframe with-toolbar" src={webcontainerPreviewUrl} sandbox="allow-scripts allow-same-origin allow-forms allow-popups" />
            ) : (
              <iframe ref={iframeRef} title="Live Preview" className="lab-preview-iframe with-toolbar" srcDoc={debouncedHtml} sandbox="allow-scripts allow-same-origin" />
            )}
          </div>
        </div>
      )}
    </div>
  );
}
