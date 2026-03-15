import React, { useState } from 'react';
import { ChevronDown, ChevronRight, FolderOpen, ChevronsLeft, Check, ArrowRight, Lock, Plus, X, Pencil, Trash2, Sparkles } from 'lucide-react';
import { FileIcon } from './fileIcons.jsx';
import useLabStore from '../../store/useLabStore';

export default function FileSidebar() {
  const {
    files, openFile, activeFileId, milestones, currentMilestoneId,
    toggleLeftSidebar, createFile, newFileDialogOpen, toggleNewFileDialog,
    completeStep, renameFile, deleteFile, triggerGuideForStep,
    fileToDelete, setFileToDelete
  } = useLabStore();

  const [milestonesExpanded, setMilestonesExpanded] = useState({});
  const [newFileName, setNewFileName] = useState('');
  
  // Rename state
  const [editingFileId, setEditingFileId] = useState(null);
  const [editingName, setEditingName] = useState('');

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

  const startRename = (e, file) => {
    e.stopPropagation();
    setEditingFileId(file.id);
    setEditingName(file.name);
  };

  const submitRename = (id) => {
    renameFile(id, editingName);
    setEditingFileId(null);
  };

  const handleRenameKeyDown = (e, id) => {
    if (e.key === 'Enter') submitRename(id);
    if (e.key === 'Escape') setEditingFileId(null);
  };

  const toggleMilestone = (id) => {
    const milestone = milestones.find(m => m.id === id);
    if (milestone?.status === 'locked') return;
    setMilestonesExpanded(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const getStepIcon = (status, isAssessment) => {
    if (isAssessment && status !== 'completed') return <Sparkles size={13} className="lab-step-icon lab-step-active" />;
    switch (status) {
      case 'completed': return <Check size={13} className="lab-step-icon lab-step-done" />;
      case 'active':    return <ArrowRight size={13} className="lab-step-icon lab-step-active" />;
      case 'locked':    return <Lock size={11} className="lab-step-icon lab-step-locked" />;
      default:          return <ArrowRight size={13} className="lab-step-icon lab-step-active" />;
    }
  };

  const canExpandMilestone = (milestone) => milestone.status === 'active' || milestone.status === 'completed';

  const fileToDeleteObj = files.find(f => f.id === fileToDelete);

  return (
    <aside className="lab-sidebar-left">
      {/* Delete Confirmation Modal */}
      {fileToDeleteObj && (
        <div className="lab-modal-overlay">
          <div className="lab-confirm-modal">
            <h3>Delete File</h3>
            <p>Are you sure you want to delete <strong>{fileToDeleteObj.name}</strong>? This cannot be undone.</p>
            <div className="lab-confirm-actions">
              <button className="lab-btn-cancel" onClick={() => setFileToDelete(null)}>Cancel</button>
              <button className="lab-btn-danger" onClick={() => deleteFile(fileToDelete)}>Delete</button>
            </div>
          </div>
        </div>
      )}

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
              {editingFileId === file.id ? (
                <div className="lab-rename-input">
                  <FileIcon filename={file.name} size={15} />
                  <input
                    type="text"
                    value={editingName}
                    onChange={(e) => setEditingName(e.target.value)}
                    onKeyDown={(e) => handleRenameKeyDown(e, file.id)}
                    onBlur={() => submitRename(file.id)}
                    autoFocus
                  />
                </div>
              ) : (
                <div className={`lab-file-item-wrapper ${file.id === activeFileId ? 'active' : ''}`}>
                  <button className="lab-file-item" onClick={() => openFile(file.id)}>
                    <FileIcon filename={file.name} size={15} />
                    <span className="lab-file-name">{file.name}</span>
                  </button>
                  <div className="lab-file-actions">
                    <button className="lab-file-action" onClick={(e) => startRename(e, file)} title="Rename">
                      <Pencil size={12} />
                    </button>
                    <button className="lab-file-action delete" onClick={(e) => { e.stopPropagation(); setFileToDelete(file.id); }} title="Delete">
                      <Trash2 size={12} />
                    </button>
                  </div>
                </div>
              )}
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
            const canExpand = canExpandMilestone(milestone);
            const isExpanded = canExpand && (milestonesExpanded[milestone.id] ?? (milestone.id === currentMilestoneId));

            return (
              <li key={milestone.id} className={`lab-milestone ${milestone.status}`}>
                <button
                  className={`lab-milestone-header ${!canExpand ? 'disabled' : ''}`}
                  onClick={() => toggleMilestone(milestone.id)}
                >
                  {canExpand ? (isExpanded ? <ChevronDown size={14} className="lab-milestone-chevron" /> : <ChevronRight size={14} className="lab-milestone-chevron" />) : <Lock size={12} className="lab-milestone-chevron lab-step-locked" />}
                  <span className="lab-milestone-idx">M{idx + 1}</span>
                  <span className="lab-milestone-title">{milestone.title}</span>
                </button>

                {isExpanded && milestone.steps && (
                  <ul className="lab-step-list">
                    {milestone.steps.map(step => {
                      const isAssessment = step.title.toLowerCase().includes('assessment');
                      
                      if (isAssessment && step.status === 'active') {
                        return (
                          <li key={step.id} className="lab-step-wrap active">
                            <button className="lab-btn lab-btn-assessment" onClick={() => completeStep(step.id)}>
                              <Sparkles size={12} />
                              <span>Take Assessment</span>
                            </button>
                          </li>
                        );
                      }

                      return (
                      <li key={step.id} className={`lab-step-wrap ${step.status}`}>
                        <div className="lab-step">
                          {step.status === 'active' ? (
                            <button
                              className="lab-step-complete-btn"
                              onClick={() => completeStep(step.id)}
                              title="Mark Verified & Complete"
                            >
                              {getStepIcon(step.status, false)}
                            </button>
                          ) : (
                            getStepIcon(step.status, isAssessment)
                          )}
                          <span>{step.title}</span>
                        </div>

                        {/* Hover Actions for regular steps */}
                        {step.status === 'active' && !isAssessment && (
                          <div className="lab-step-actions">
                            <button className="lab-step-guide-btn" onClick={() => triggerGuideForStep(step.id)}>
                              <Sparkles size={12} /> Generate Guide
                            </button>
                          </div>
                        )}
                        
                        {/* Retake button for completed assessments - always visible */}
                        {isAssessment && step.status === 'completed' && (
                          <div className="lab-step-actions lab-step-actions-visible">
                            <button className="lab-step-guide-btn" onClick={() => completeStep(step.id)} title="Retake Assessment">
                              Retake Test
                            </button>
                          </div>
                        )}
                      </li>
                    )})}
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
