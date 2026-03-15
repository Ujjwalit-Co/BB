import React, { useState } from 'react';
import { ChevronDown, ChevronRight, FolderOpen, ChevronsLeft, Check, ArrowRight, Lock, Plus, X } from 'lucide-react';
import { FileIcon } from './fileIcons.jsx';
import useLabStore from '../../store/useLabStore';

export default function FileSidebar() {
  const {
    files, openFile, activeFileId, milestones, currentMilestoneId,
    toggleLeftSidebar, createFile, newFileDialogOpen, toggleNewFileDialog, completeStep
  } = useLabStore();

  const [milestonesExpanded, setMilestonesExpanded] = useState({});
  const [newFileName, setNewFileName] = useState('');

  const handleCreateFile = () => {
    if (newFileName.trim()) {
      createFile(newFileName);
      setNewFileName('');
    }
  };

  const handleNewFileKeyDown = (e) => {
    if (e.key === 'Enter') handleCreateFile();
    if (e.key === 'Escape') { toggleNewFileDialog(); setNewFileName(''); }
  };

  const toggleMilestone = (id) => {
    // Only allow expanding if milestone is active or completed
    const milestone = milestones.find(m => m.id === id);
    if (milestone?.status === 'locked') return;
    setMilestonesExpanded(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const getStepIcon = (status) => {
    switch (status) {
      case 'completed': return <Check size={13} className="lab-step-icon lab-step-done" />;
      case 'active':    return <ArrowRight size={13} className="lab-step-icon lab-step-active" />;
      case 'locked':    return <Lock size={11} className="lab-step-icon lab-step-locked" />;
      default:          return <ArrowRight size={13} className="lab-step-icon lab-step-active" />;
    }
  };

  const getMilestoneStatus = (milestone) => {
    return milestone.status || 'locked';
  };

  const canExpandMilestone = (milestone) => {
    return milestone.status === 'active' || milestone.status === 'completed';
  };

  return (
    <aside className="lab-sidebar-left">
      <div className="lab-sidebar-header">
        <span className="lab-sidebar-label">EXPLORER</span>
        <button className="lab-sidebar-collapse" onClick={toggleLeftSidebar} title="Collapse sidebar">
          <ChevronsLeft size={16} />
        </button>
      </div>

      {/* Files Section */}
      <div className="lab-sidebar-section">
        <div className="lab-sidebar-section-title">
          <FolderOpen size={14} />
          <span>FILES</span>
          <button className="lab-sidebar-add" title="New file" onClick={toggleNewFileDialog}>
            <Plus size={13} />
          </button>
        </div>

        {/* New File Input */}
        {newFileDialogOpen && (
          <div className="lab-new-file-input">
            <input
              type="text"
              placeholder="filename.js"
              value={newFileName}
              onChange={(e) => setNewFileName(e.target.value)}
              onKeyDown={handleNewFileKeyDown}
              autoFocus
            />
            <button className="lab-new-file-ok" onClick={handleCreateFile} disabled={!newFileName.trim()}>
              <Check size={13} />
            </button>
            <button className="lab-new-file-cancel" onClick={() => { toggleNewFileDialog(); setNewFileName(''); }}>
              <X size={13} />
            </button>
          </div>
        )}

        <ul className="lab-file-list">
          {files.map(file => (
            <li key={file.id}>
              <button
                className={`lab-file-item ${file.id === activeFileId ? 'active' : ''}`}
                onClick={() => openFile(file.id)}
              >
                <FileIcon filename={file.name} size={15} />
                <span className="lab-file-name">{file.name}</span>
              </button>
            </li>
          ))}
        </ul>
      </div>

      {/* Milestones Section */}
      <div className="lab-sidebar-section">
        <div className="lab-sidebar-section-title">
          <span>MILESTONES</span>
        </div>
        <ul className="lab-milestone-list">
          {milestones.map((milestone, idx) => {
            const status = getMilestoneStatus(milestone);
            const canExpand = canExpandMilestone(milestone);
            const isExpanded = canExpand && (milestonesExpanded[milestone.id] ?? (milestone.id === currentMilestoneId));

            return (
              <li key={milestone.id} className={`lab-milestone ${status}`}>
                <button
                  className={`lab-milestone-header ${!canExpand ? 'disabled' : ''}`}
                  onClick={() => toggleMilestone(milestone.id)}
                >
                  {canExpand 
                    ? (isExpanded 
                        ? <ChevronDown size={14} className="lab-milestone-chevron" />
                        : <ChevronRight size={14} className="lab-milestone-chevron" />
                      )
                    : <Lock size={12} className="lab-milestone-chevron lab-step-locked" />
                  }
                  <span className="lab-milestone-idx">M{idx + 1}</span>
                  <span className="lab-milestone-title">{milestone.title}</span>
                </button>

                {isExpanded && milestone.steps && (
                  <ul className="lab-step-list">
                    {milestone.steps.map(step => (
                      <li key={step.id} className={`lab-step ${step.status}`}>
                        {step.status === 'active' ? (
                          <button
                            className="lab-step-complete-btn"
                            onClick={() => completeStep(step.id)}
                            title="Mark as complete"
                          >
                            {getStepIcon(step.status)}
                          </button>
                        ) : (
                          getStepIcon(step.status)
                        )}
                        <span>{step.title}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </li>
            );
          })}
        </ul>
      </div>
    </aside>
  );
}
