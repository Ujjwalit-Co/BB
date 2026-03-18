import React, { useRef, useState, useEffect } from 'react';
import { X, Terminal as TerminalIcon, Eye, ExternalLink, ChevronsDown, ChevronsUp, Trash2, Play } from 'lucide-react';
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

export default function EditorPane() {
  const {
    files, openTabs, activeFileId, closeTab, openFile,
    updateFileContent, getActiveFile, getCompiledPreview,
    bottomPanelTab, setBottomPanelTab, bottomPanelOpen, toggleBottomPanel,
    consoleLogs, addConsoleLog, clearConsoleLogs
  } = useLabStore();

  const iframeRef = useRef(null);
  const inputRef = useRef(null);
  const logsEndRef = useRef(null);
  const activeFile = getActiveFile();
  const tabFiles = openTabs.map(id => files.find(f => f.id === id)).filter(Boolean);

  const [consoleInput, setConsoleInput] = useState('');
  const [commandHistory, setCommandHistory] = useState([]);
  const [historyIndex, setHistoryIndex] = useState(-1);

  // Debounce the preview HTML by 600ms to prevent constant flashing while typing
  const livePreviewHtml = getCompiledPreview();
  const debouncedHtml = useDebounce(livePreviewHtml, 600);

  // Listen for console messages from the iframe
  useEffect(() => {
    const handleMessage = (e) => {
      if (e.data && e.data.type === 'CONSOLE') {
        // Use functional update to avoid stale closure
        useLabStore.getState().addConsoleLog(e.data.args.join(' '), e.data.level);
      } else if (e.data && e.data.type === 'CONSOLE_CLEAR') {
        // Clear console when iframe calls console.clear()
        useLabStore.getState().clearConsoleLogs();
      }
    };
    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);

  // Auto-scroll console to bottom when new logs arrive
  useEffect(() => {
    logsEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [consoleLogs]);

  // Handle console command execution with persistent context
  const handleExecuteCommand = (e) => {
    e?.preventDefault();
    if (!consoleInput.trim()) return;

    const command = consoleInput.trim();
    
    // Add command to history
    setCommandHistory(prev => [...prev, command]);
    setHistoryIndex(-1);

    // Log the command
    addConsoleLog(`> ${command}`, 'command');

    // Execute the command and capture any console output
    const originalLog = console.log;
    const originalWarn = console.warn;
    const originalError = console.error;
    const capturedOutputs = [];
    
    // Override console methods to capture output
    const capture = (level) => (...args) => {
      capturedOutputs.push({ level, text: args.join(' ') });
      originalLog(...args); // Also log to browser console
    };
    
    console.log = capture('log');
    console.warn = capture('warning');
    console.error = capture('error');

    try {
      // Use window.__consoleCtx as persistent storage for variables
      if (!window.__consoleCtx) window.__consoleCtx = {};
      
      // Add overridden console to context so eval can access it
      window.__consoleCtx.console = console;
      
      // Transform let/const to var so variables persist in the with scope
      const transformed = command
        .replace(/^\s*let\s+/gm, 'var ')
        .replace(/^\s*const\s+/gm, 'var ');
      
      // Execute code with console in context
      // eslint-disable-next-line no-new-func
      const execute = new Function('ctx', 'cmd', `
        with (ctx) {
          return eval(cmd);
        }
      `);
      
      const result = execute(window.__consoleCtx, transformed);
      
      // Restore console methods
      console.log = originalLog;
      console.warn = originalWarn;
      console.error = originalError;
      
      // Show captured console outputs
      capturedOutputs.forEach(({ level, text }) => {
        addConsoleLog(text, level);
      });
      
      // Only log the return value if it's meaningful and not from console
      if (result !== undefined && capturedOutputs.length === 0) {
        addConsoleLog(String(result), 'log');
      }
    } catch (error) {
      // Restore console methods
      console.log = originalLog;
      console.warn = originalWarn;
      console.error = originalError;
      addConsoleLog(error.message, 'error');
    }

    setConsoleInput('');
  };

  // Handle arrow keys for command history
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
    const html = getCompiledPreview();
    const blob = new Blob([html], { type: 'text/html' });
    window.open(URL.createObjectURL(blob), '_blank');
  };

  const hasHtmlFile = files.some(f => f.name.endsWith('.html'));

  // VS Code-style status dot color
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
    <div className="lab-editor-pane">
      {/* Tab Bar */}
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

      {/* Code Editor */}
      <div className="lab-editor-area">
        {activeFile ? (
          <Editor
            key={activeFile.id}
            code={activeFile.content}
            language={activeFile.language}
            onChange={(val) => updateFileContent(activeFile.id, val)}
          />
        ) : (
          <div className="lab-editor-empty">
            <p>Select a file to start editing</p>
          </div>
        )}
      </div>

      {/* Bottom Panel Toggle */}
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
          {consoleLogs.length > 0 && (
            <span className="lab-bottom-badge">{consoleLogs.length}</span>
          )}
        </button>
        {hasHtmlFile && (
          <button
            className={`lab-bottom-tab-btn ${bottomPanelTab === 'preview' ? 'active' : ''}`}
            onClick={() => { setBottomPanelTab('preview'); if (!bottomPanelOpen) toggleBottomPanel(); }}
          >
            <Eye size={13} />
            <span>Preview</span>
          </button>
        )}
        {hasHtmlFile && bottomPanelTab === 'preview' && (
          <button className="lab-bottom-tab-btn lab-bottom-external" onClick={handleOpenPreviewTab} title="Open in new tab">
            <ExternalLink size={13} />
          </button>
        )}
      </div>

      {/* Bottom Panel Content */}
      {bottomPanelOpen && (
        <div className="lab-bottom-panel">
          <div className="lab-console" style={{ display: bottomPanelTab === 'console' ? 'block' : 'none' }}>
            <div className="lab-console-header">
              <span className="lab-console-title">Console</span>
              <button 
                className="lab-console-clear-btn" 
                onClick={clearConsoleLogs}
                title="Clear console"
              >
                <Trash2 size={13} />
              </button>
            </div>
            <div className="lab-console-logs">
              {consoleLogs.length === 0 ? (
                <div className="lab-console-empty">No output yet. Click Run or type a command below.</div>
              ) : (
                consoleLogs.map((log, idx) => (
                  <div key={idx} className={`lab-console-line lab-console-${log.type}`}>
                    <span className="lab-console-time">{log.timestamp}</span>
                    <span className="lab-console-text">{log.text}</span>
                  </div>
                ))
              )}
              <div ref={logsEndRef} />
            </div>
            <form className="lab-console-input-form" onSubmit={handleExecuteCommand}>
              <span className="lab-console-prompt">&gt;</span>
              <input
                ref={inputRef}
                type="text"
                className="lab-console-input"
                value={consoleInput}
                onChange={(e) => setConsoleInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Enter JavaScript command..."
                autoComplete="off"
              />
              <button type="submit" className="lab-console-run-btn" title="Run command (Enter)">
                <Play size={12} />
              </button>
            </form>
          </div>
          
          <div className="lab-preview" style={{ display: (bottomPanelTab === 'preview' && hasHtmlFile) ? 'block' : 'none' }}>
            <iframe
              ref={iframeRef}
              title="Live Preview"
              className="lab-preview-iframe"
              srcDoc={debouncedHtml}
              sandbox="allow-scripts allow-same-origin"
            />
          </div>
        </div>
      )}
    </div>
  );
}
