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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#1C1A17]/60 p-4 backdrop-blur-sm">
      <div className="flex max-h-[90vh] w-full max-w-5xl flex-col overflow-hidden rounded-3xl border border-[#E2DDD4] bg-[#F6F4EF] shadow-2xl">
        <div className="flex items-center justify-between border-b border-[#E2DDD4] bg-white px-8 py-6">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#FEF3DC] text-[#D4840A]">
              <Edit3 size={24} />
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-[#D4840A]">Quality Control</p>
              <h2 className="mt-1 font-headline text-2xl font-semibold text-[#1C1A17]">
                Review Quizzes: {project.title}
              </h2>
            </div>
          </div>
          <button onClick={onClose} className="rounded-full p-2 text-[#5C5851] hover:bg-[#F0EDE6] hover:text-[#1C1A17]">
            <X size={22} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-8 space-y-6">
          {milestones.length === 0 && (
            <div className="py-20 text-center">
              <p className="font-headline text-xl font-semibold text-[#5C5851]">No milestones found for this build course.</p>
            </div>
          )}
          {milestones.map((ms, mIndex) => (
            <div key={ms.number} className="overflow-hidden rounded-2xl border border-[#E2DDD4] bg-white">
              <div
                className="flex cursor-pointer items-center justify-between bg-[#FBF9F6] px-6 py-4 transition-colors hover:bg-[#F0EDE6]"
                onClick={() => setExpandedMilestone(expandedMilestone === mIndex ? null : mIndex)}
              >
                <div className="flex items-center gap-4">
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#1E3A2F] text-sm font-bold text-white">
                    {ms.number}
                  </div>
                  <div>
                    <h3 className="font-headline text-lg font-semibold">{ms.title || `Milestone ${ms.number}`}</h3>
                    <p className="text-xs font-bold text-[#5C5851] uppercase tracking-wide">
                      {ms.quiz?.questions?.length || 0} Questions
                    </p>
                  </div>
                </div>
                <div className={`flex h-8 w-8 items-center justify-center rounded-full transition-all ${expandedMilestone === mIndex ? 'bg-[#1E3A2F] text-white' : 'text-[#5C5851]'}`}>
                  <ChevronDown size={18} className={`transition-transform duration-300 ${expandedMilestone === mIndex ? 'rotate-180' : ''}`} />
                </div>
              </div>

              {expandedMilestone === mIndex && (
                <div className="p-6 space-y-8 bg-white">
                  {(!ms.quiz || !ms.quiz.questions || ms.quiz.questions.length === 0) ? (
                    <div className="rounded-xl border-2 border-dashed border-[#E2DDD4] bg-[#F6F4EF] py-10 text-center text-[#5C5851]">
                      No quiz has been generated for this milestone yet.
                    </div>
                  ) : (
                    <div className="space-y-8">
                      {ms.quiz.questions.map((q, qIndex) => (
                        <div key={qIndex} className="relative rounded-2xl border border-[#E2DDD4] bg-[#FBF9F6] p-6 group">
                          <button
                            onClick={() => handleDeleteQuestion(mIndex, qIndex)}
                            className="absolute right-4 top-4 rounded-lg p-2 text-[#C0392B] opacity-0 transition hover:bg-[#FCE8E8] group-hover:opacity-100"
                          >
                            <Trash2 size={18} />
                          </button>

                          <div className="space-y-6">
                            <div>
                              <label className="text-[10px] font-bold uppercase tracking-[0.15em] text-[#D4840A]">Question {qIndex + 1}</label>
                              <textarea
                                value={q.question || ''}
                                onChange={(e) => handleUpdateQuestion(mIndex, qIndex, 'question', e.target.value)}
                                className="mt-2 w-full rounded-xl border border-[#E2DDD4] bg-white p-4 text-sm font-semibold leading-6 focus:border-[#1E3A2F] focus:outline-none min-h-[100px]"
                              />
                            </div>

                            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                              {(q.options || []).map((opt, optIndex) => {
                                const isCorrect = q.correctAnswer === optIndex || q.correct_answer === optIndex || q.correctAnswer === opt || q.correct_answer === opt;

                                return (
                                  <div key={optIndex} className="relative group/opt">
                                    <input
                                      value={opt}
                                      onChange={(e) => handleUpdateOption(mIndex, qIndex, optIndex, e.target.value)}
                                      placeholder={`Option ${optIndex + 1}`}
                                      className={`w-full rounded-xl border p-4 pl-12 pr-12 text-sm font-bold transition-all focus:outline-none ${
                                        isCorrect
                                          ? 'border-[#2A9D6F] bg-[#E8F2EC] text-[#1E3A2F] ring-1 ring-[#2A9D6F]'
                                          : 'border-[#E2DDD4] bg-white text-[#5C5851] hover:border-[#1E3A2F]'
                                      }`}
                                    />
                                    <div className={`absolute left-4 top-4 font-mono text-sm font-bold ${isCorrect ? 'text-[#1E3A2F]' : 'text-[#9B9589]'}`}>
                                      {String.fromCharCode(65 + optIndex)}
                                    </div>
                                    <button
                                      title="Set as correct answer"
                                      onClick={() => handleSetCorrect(mIndex, qIndex, optIndex)}
                                      className={`absolute right-4 top-4 flex h-6 w-6 items-center justify-center rounded-full transition-all ${
                                        isCorrect
                                          ? 'bg-[#2A9D6F] text-white shadow-lg'
                                          : 'bg-[#F0EDE6] text-[#9B9589] hover:bg-[#1E3A2F] hover:text-white'
                                      }`}
                                    >
                                      <Check size={14} strokeWidth={3} />
                                    </button>
                                  </div>
                                );
                              })}
                            </div>

                            <div>
                              <label className="text-[10px] font-bold uppercase tracking-[0.15em] text-[#D4840A]">Explanation</label>
                              <textarea
                                value={q.explanation || ''}
                                onChange={(e) => handleUpdateQuestion(mIndex, qIndex, 'explanation', e.target.value)}
                                className="mt-2 w-full rounded-xl border border-[#E2DDD4] bg-white p-4 text-sm font-medium leading-6 text-[#5C5851] focus:border-[#1E3A2F] focus:outline-none min-h-[80px]"
                              />
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  <button
                    onClick={() => handleAddQuestion(mIndex)}
                    className="flex w-full items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-[#E2DDD4] py-4 font-bold text-[#5C5851] transition hover:border-[#1E3A2F] hover:bg-[#E8F2EC] hover:text-[#1E3A2F]"
                  >
                    <Plus size={20} /> Add New Question
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="flex items-center justify-end gap-4 border-t border-[#E2DDD4] bg-white px-8 py-6">
          <button
            onClick={onClose}
            className="rounded-lg px-6 py-3 text-sm font-bold text-[#5C5851] hover:bg-[#F0EDE6] hover:text-[#1C1A17]"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2 rounded-lg bg-[#1E3A2F] px-8 py-3 text-sm font-bold text-white shadow-[0_8px_20px_rgba(30,58,47,0.18)] transition hover:bg-[#2D5C42] disabled:opacity-50"
          >
            {saving ? <Loader2 className="animate-spin" size={20} /> : <Save size={20} />}
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>
    </div>
  );
}
