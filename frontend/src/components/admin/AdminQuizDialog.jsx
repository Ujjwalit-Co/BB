import React, { useState } from 'react';
import { X, Save, Edit3, ChevronDown, Check, Plus, Trash2 } from 'lucide-react';
import { projectsExpressApi } from '../../api/express';

export default function AdminQuizDialog({ project, onClose, onSave }) {
  const [milestones, setMilestones] = useState(project.milestones || []);
  const [expandedMilestone, setExpandedMilestone] = useState(null);
  const [saving, setSaving] = useState(false);

  // Auto-fill empty quizzes
  const handleAddQuestion = (mIndex) => {
    const newMilestones = [...milestones];
    const ms = newMilestones[mIndex];
    if (!ms.quiz) ms.quiz = { questions: [] };
    ms.quiz.questions.push({
      question: "New Question?",
      options: ["Option 1", "Option 2", "Option 3", "Option 4"],
      correctAnswer: "Option 1",
      explanation: "Explanation here..."
    });
    setMilestones(newMilestones);
  };

  const handleUpdateQuestion = (mIndex, qIndex, field, value) => {
    const newMilestones = [...milestones];
    const q = newMilestones[mIndex].quiz.questions[qIndex];
    
    if (field === 'correctAnswer' && typeof value === 'string') {
      // If we're setting correct answer by text, find its index
      const idx = q.options.indexOf(value);
      q.correctAnswer = idx !== -1 ? idx : 0;
    } else {
      q[field] = value;
    }
    
    setMilestones(newMilestones);
  };

  const handleUpdateOption = (mIndex, qIndex, optIndex, value) => {
    const newMilestones = [...milestones];
    const q = newMilestones[mIndex].quiz.questions[qIndex];
    
    // If we're updating the text of the CURRENT correct option, we don't need to change the index.
    // But if we want to store it as text for compatibility, we handle it here.
    q.options[optIndex] = value;
    setMilestones(newMilestones);
  };

  const handleSetCorrect = (mIndex, qIndex, optIndex) => {
    const newMilestones = [...milestones];
    newMilestones[mIndex].quiz.questions[qIndex].correctAnswer = optIndex;
    setMilestones(newMilestones);
  };

  const handleDeleteQuestion = (mIndex, qIndex) => {
    const newMilestones = [...milestones];
    newMilestones[mIndex].quiz.questions.splice(qIndex, 1);
    setMilestones(newMilestones);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await projectsExpressApi.updateProject(project._id, { milestones });
      onSave(); // Refresh data in dashboard
      onClose();
    } catch (e) {
      console.error(e);
      alert("Failed to save changes.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-[#1a1a1a] border border-slate-200 dark:border-white/10 rounded-2xl w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        <div className="flex items-center justify-between p-6 border-b border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-black/20">
          <div>
            <h2 className="text-xl font-bold flex items-center gap-2">
              <Edit3 className="text-indigo-500" size={24} />
              Edit Quizzes for {project.title}
            </h2>
            <p className="text-sm text-slate-500 mt-1">Review and modify the pre-generated AI quizzes.</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-200 dark:hover:bg-white/10 rounded-lg transition-colors">
            <X size={20} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {milestones.length === 0 && (
            <div className="text-center text-slate-500 py-10">No milestones found for this project yet.</div>
          )}
          {milestones.map((ms, mIndex) => (
            <div key={ms.number} className="border border-slate-200 dark:border-white/10 rounded-xl overflow-hidden">
              <div 
                className="bg-slate-50 dark:bg-white/5 p-4 flex items-center justify-between cursor-pointer hover:bg-slate-100 dark:hover:bg-white/10 transition-colors"
                onClick={() => setExpandedMilestone(expandedMilestone === mIndex ? null : mIndex)}
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-indigo-500/20 text-indigo-500 flex items-center justify-center font-bold text-sm">
                    {ms.number}
                  </div>
                  <h3 className="font-semibold">{ms.title || `Milestone ${ms.number}`}</h3>
                  <span className="text-xs px-2 py-1 rounded bg-slate-200 dark:bg-white/10 text-slate-600 dark:text-slate-300 font-medium">
                    {ms.quiz?.questions?.length || 0} Questions
                  </span>
                </div>
                <ChevronDown size={20} className={`text-slate-400 transition-transform ${expandedMilestone === mIndex ? 'rotate-180' : ''}`} />
              </div>

              {expandedMilestone === mIndex && (
                <div className="p-4 space-y-6">
                  {(!ms.quiz || !ms.quiz.questions || ms.quiz.questions.length === 0) ? (
                    <div className="text-center py-6 text-slate-500 bg-slate-50 dark:bg-white/2 rounded-lg border border-dashed border-slate-300 dark:border-white/10">
                      No quiz generated for this milestone yet. (It might still be generating in the background).
                    </div>
                  ) : (
                    <div className="space-y-6">
                      {ms.quiz.questions.map((q, qIndex) => (
                        <div key={qIndex} className="bg-white dark:bg-black/20 p-5 rounded-xl border border-slate-200 dark:border-white/10 relative group">
                          <button 
                            onClick={() => handleDeleteQuestion(mIndex, qIndex)}
                            className="absolute top-4 right-4 text-red-500 opacity-0 group-hover:opacity-100 transition-opacity p-2 hover:bg-red-500/10 rounded-lg"
                          >
                            <Trash2 size={16} />
                          </button>
                          
                          <div className="space-y-4">
                            <div>
                                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1 block">Question {qIndex + 1}</label>
                                <textarea 
                                  value={q.question || ''}
                                  onChange={(e) => handleUpdateQuestion(mIndex, qIndex, 'question', e.target.value)}
                                  className="w-full bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 p-3 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50 resize-y min-h-[80px]"
                                />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                              {(q.options || []).map((opt, optIndex) => {
                                const isCorrect = q.correctAnswer === optIndex || q.correct_answer === optIndex || q.correctAnswer === opt || q.correct_answer === opt;
                                
                                return (
                                  <div key={optIndex} className="relative group/opt">
                                    <input 
                                      value={opt}
                                      onChange={(e) => handleUpdateOption(mIndex, qIndex, optIndex, e.target.value)}
                                      placeholder={`Option ${optIndex + 1}`}
                                      className={`w-full bg-slate-50 dark:bg-white/5 border p-3 pl-10 rounded-lg text-sm pr-10 focus:outline-none transition-all ${
                                        isCorrect 
                                          ? 'border-emerald-500 ring-1 ring-emerald-500 bg-emerald-500/5 dark:bg-emerald-500/10' 
                                          : 'border-slate-200 dark:border-white/10 hover:border-slate-300 dark:hover:border-white/20'
                                      }`}
                                    />
                                    <div className={`absolute left-3 top-3.5 text-xs font-bold uppercase w-5 text-center transition-colors ${isCorrect ? 'text-emerald-500' : 'text-slate-400'}`}>
                                        {String.fromCharCode(65 + optIndex)}
                                    </div>
                                    <button
                                      title="Set as correct answer"
                                      onClick={() => handleSetCorrect(mIndex, qIndex, optIndex)}
                                      className={`absolute right-3 top-3.5 p-1 rounded-full transition-all ${
                                        isCorrect
                                          ? 'bg-emerald-500 text-white scale-110 shadow-lg shadow-emerald-500/40'
                                          : 'text-slate-300 dark:text-slate-600 hover:text-emerald-500 hover:scale-110 opacity-40 group-hover/opt:opacity-100'
                                      }`}
                                    >
                                      <Check size={12} strokeWidth={3} />
                                    </button>
                                  </div>
                                );
                              })}
                            </div>

                            <div>
                                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1 block">Explanation</label>
                                <textarea 
                                  value={q.explanation || ''}
                                  onChange={(e) => handleUpdateQuestion(mIndex, qIndex, 'explanation', e.target.value)}
                                  className="w-full bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 p-3 rounded-lg text-sm focus:outline-none inline-block resize-y min-h-[70px] text-slate-600 dark:text-slate-400"
                                />
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  <button 
                    onClick={() => handleAddQuestion(mIndex)}
                    className="w-full py-3 border-2 border-dashed border-slate-300 dark:border-white/20 rounded-xl text-slate-500 hover:text-indigo-500 hover:border-indigo-500/50 hover:bg-indigo-500/5 transition-all flex items-center justify-center gap-2 font-medium"
                  >
                    <Plus size={18} /> Add New Question
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="p-6 border-t border-slate-200 dark:border-white/10 flex items-center justify-end gap-3 bg-slate-50 dark:bg-black/20">
          <button 
            onClick={onClose}
            className="px-6 py-2.5 rounded-xl font-semibold hover:bg-slate-200 dark:hover:bg-white/10 transition-colors"
          >
            Cancel
          </button>
          <button 
            onClick={handleSave}
            disabled={saving}
            className="bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white px-8 py-2.5 rounded-xl font-semibold flex items-center gap-2 transition-colors disabled:cursor-not-allowed shadow-lg shadow-indigo-500/20"
          >
            {saving ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin shrink-0" /> : <Save size={18} />}
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>
    </div>
  );
}
