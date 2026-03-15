import React, { useRef, useState } from 'react';
import { ChevronsRight, Send, Check, X, Sparkles, ArrowRight, HelpCircle } from 'lucide-react';
import useLabStore from '../../store/useLabStore';

export default function AiPanel() {
  const {
    aiMessages, aiSuggestion, isAiThinking,
    toggleRightSidebar, acceptAiSuggestion, rejectAiSuggestion,
    addAiUserMessage, milestones, currentMilestoneId,
    proceedToNextMilestone, showQuiz
  } = useLabStore();

  const [input, setInput] = useState('');
  const chatEndRef = useRef(null);

  const handleSend = () => {
    if (!input.trim()) return;
    addAiUserMessage(input.trim());
    setInput('');
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // Determine if current milestone is near completion
  const currentMilestone = milestones.find(m => m.id === currentMilestoneId);
  const milestoneProgress = currentMilestone?.steps
    ? currentMilestone.steps.filter(s => s.status === 'completed').length / currentMilestone.steps.length
    : 0;
  const showMilestonePrompt = milestoneProgress >= 0.7 && milestoneProgress < 1;
  const milestoneCompleted = milestoneProgress === 1;

  return (
    <aside className="lab-sidebar-right">
      <div className="lab-sidebar-header">
        <button className="lab-sidebar-collapse" onClick={toggleRightSidebar} title="Collapse panel">
          <ChevronsRight size={16} />
        </button>
        <div className="lab-ai-badge">
          <Sparkles size={14} />
          <span>AI TUTOR</span>
        </div>
      </div>

      {/* Chat Messages */}
      <div className="lab-ai-chat">
        {aiMessages.map((msg, idx) => (
          <div key={idx} className={`lab-ai-msg lab-ai-msg-${msg.role}`}>
            {msg.role === 'ai' && (
              <div className="lab-ai-msg-avatar">
                <Sparkles size={12} />
              </div>
            )}
            <div className="lab-ai-msg-content">
              <p>{msg.content}</p>
              {msg.diff && (
                <div className="lab-ai-diff-preview">
                  <div className="lab-ai-diff-line lab-ai-diff-remove">{msg.diff.original}</div>
                  <div className="lab-ai-diff-line lab-ai-diff-add">{msg.diff.replacement}</div>
                </div>
              )}
            </div>
          </div>
        ))}

        {/* AI Suggestion Action Buttons */}
        {aiSuggestion && (
          <div className="lab-ai-actions">
            <button className="lab-ai-accept" onClick={acceptAiSuggestion}>
              <Check size={15} />
              <span>Accept Change</span>
            </button>
            <button className="lab-ai-reject" onClick={rejectAiSuggestion}>
              <X size={15} />
              <span>Reject</span>
            </button>
          </div>
        )}

        {/* Thinking indicator */}
        {isAiThinking && (
          <div className="lab-ai-msg lab-ai-msg-ai">
            <div className="lab-ai-msg-avatar">
              <Sparkles size={12} />
            </div>
            <div className="lab-ai-msg-content">
              <div className="lab-ai-thinking">
                <span></span><span></span><span></span>
              </div>
            </div>
          </div>
        )}

        {/* Milestone progression prompt */}
        {milestoneCompleted && (
          <div className="lab-ai-milestone-prompt">
            <div className="lab-ai-milestone-card">
              <Sparkles size={16} className="lab-ai-milestone-icon" />
              <p className="lab-ai-milestone-text">
                Milestone complete! Ready to move forward?
              </p>
              <div className="lab-ai-milestone-btns">
                <button className="lab-ai-milestone-proceed" onClick={showQuiz}>
                  <ArrowRight size={14} />
                  <span>Take Quiz & Proceed</span>
                </button>
                <button className="lab-ai-milestone-question" onClick={() => { addAiUserMessage("I have a question about this milestone."); }}>
                  <HelpCircle size={14} />
                  <span>I have questions</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {showMilestonePrompt && !milestoneCompleted && (
          <div className="lab-ai-milestone-prompt">
            <div className="lab-ai-milestone-hint">
              <Sparkles size={14} />
              <span>You're almost done with this milestone! Keep going!</span>
            </div>
          </div>
        )}

        <div ref={chatEndRef} />
      </div>

      {/* Chat Input */}
      <div className="lab-ai-input-wrap">
        <textarea
          className="lab-ai-input"
          placeholder="Ask the AI tutor..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          rows={1}
        />
        <button
          className="lab-ai-send"
          onClick={handleSend}
          disabled={!input.trim()}
        >
          <Send size={16} />
        </button>
      </div>
    </aside>
  );
}
