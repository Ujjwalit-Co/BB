import React, { useRef } from 'react';
import { X, Terminal as TerminalIcon, Eye, ExternalLink, ChevronsDown, ChevronsUp } from 'lucide-react';
import { FileIcon } from './fileIcons.jsx';
import Editor from '../Editor';
import useLabStore from '../../store/useLabStore';

export default function EditorPane() {
  const {
    files, openTabs, activeFileId, closeTab, openFile,
    updateFileContent, getActiveFile, getCompiledPreview,
    bottomPanelTab, setBottomPanelTab, bottomPanelOpen, toggleBottomPanel,
    consoleLogs
  } = useLabStore();

  const iframeRef = useRef(null);
  const activeFile = getActiveFile();
  const tabFiles = openTabs.map(id => files.find(f => f.id === id)).filter(Boolean);

  const handleOpenPreviewTab = () => {
    const html = getCompiledPreview();
    const blob = new Blob([html], { type: 'text/html' });
    window.open(URL.createObjectURL(blob), '_blank');
  };

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
            code={activeFile.content}
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
        <button
          className={`lab-bottom-tab-btn ${bottomPanelTab === 'preview' ? 'active' : ''}`}
          onClick={() => { setBottomPanelTab('preview'); if (!bottomPanelOpen) toggleBottomPanel(); }}
        >
          <Eye size={13} />
          <span>Preview</span>
        </button>
        {bottomPanelTab === 'preview' && (
          <button className="lab-bottom-tab-btn lab-bottom-external" onClick={handleOpenPreviewTab} title="Open in new tab">
            <ExternalLink size={13} />
          </button>
        )}
      </div>

      {/* Bottom Panel Content */}
      {bottomPanelOpen && (
        <div className="lab-bottom-panel">
          {bottomPanelTab === 'console' ? (
            <div className="lab-console">
              {consoleLogs.length === 0 ? (
                <div className="lab-console-empty">No output yet. Click Run to execute.</div>
              ) : (
                consoleLogs.map((log, idx) => (
                  <div key={idx} className={`lab-console-line lab-console-${log.type}`}>
                    <span className="lab-console-time">{log.timestamp}</span>
                    <span className="lab-console-text">{log.text}</span>
                  </div>
                ))
              )}
            </div>
          ) : (
            <div className="lab-preview">
              <iframe
                ref={iframeRef}
                title="Live Preview"
                className="lab-preview-iframe"
                srcDoc={getCompiledPreview()}
                sandbox="allow-scripts"
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
}
