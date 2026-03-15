import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, X, Zap, ArrowRight, Check, Flame, Sparkles, ThumbsUp, Armchair } from 'lucide-react';

const QUIZ_COLORS = [
  { bg: '#ef4444', hover: '#dc2626', border: '#b91c1c' },   // Red
  { bg: '#3b82f6', hover: '#2563eb', border: '#1d4ed8' },   // Blue
  { bg: '#f59e0b', hover: '#d97706', border: '#b45309' },   // Amber
  { bg: '#22c55e', hover: '#16a34a', border: '#15803d' },   // Green
];

const DEMO_QUESTIONS = [
  {
    question: "What does the 'async' keyword do in JavaScript?",
    answers: [
      "Makes a function return a Promise",
      "Stops code execution",
      "Creates a new thread",
      "Imports a module"
    ],
    correct: 0,
    timeLimit: 15,
  },
  {
    question: "Which hook is used for side effects in React?",
    answers: [
      "useState",
      "useEffect",
      "useContext",
      "useReducer"
    ],
    correct: 1,
    timeLimit: 12,
  },
  {
    question: "What is the purpose of a try/catch block?",
    answers: [
      "Loop through arrays",
      "Define variables",
      "Handle errors gracefully",
      "Import modules"
    ],
    correct: 2,
    timeLimit: 10,
  },
];

export default function QuizModal({ onComplete, onClose }) {
  const [currentQ, setCurrentQ] = useState(0);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [selected, setSelected] = useState(null);
  const [timeLeft, setTimeLeft] = useState(DEMO_QUESTIONS[0].timeLimit);
  const [phase, setPhase] = useState('question'); // 'question' | 'result' | 'summary'
  const [showCorrect, setShowCorrect] = useState(false);

  const question = DEMO_QUESTIONS[currentQ];

  useEffect(() => {
    if (phase !== 'question') return;
    if (timeLeft <= 0) {
      handleAnswer(-1);
      return;
    }
    const timer = setTimeout(() => setTimeLeft(t => t - 1), 1000);
    return () => clearTimeout(timer);
  }, [timeLeft, phase]);

  const handleAnswer = useCallback((idx) => {
    if (selected !== null) return;
    setSelected(idx);
    setShowCorrect(true);

    const isCorrect = idx === question.correct;
    if (isCorrect) {
      setScore(s => s + 100 + (streak * 25));
      setStreak(s => s + 1);
    } else {
      setStreak(0);
    }

    setTimeout(() => {
      if (currentQ < DEMO_QUESTIONS.length - 1) {
        setCurrentQ(q => q + 1);
        setSelected(null);
        setShowCorrect(false);
        setTimeLeft(DEMO_QUESTIONS[currentQ + 1].timeLimit);
        setPhase('question');
      } else {
        setPhase('summary');
      }
    }, 1500);
  }, [selected, question, currentQ, streak]);

  const handleProceed = () => {
    onComplete?.(score);
  };

  const timerPercent = (timeLeft / question.timeLimit) * 100;

  return (
    <AnimatePresence>
      <motion.div
        className="lab-quiz-overlay"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <motion.div
          className="lab-quiz-modal"
          initial={{ scale: 0.85, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.85, opacity: 0 }}
          transition={{ type: 'spring', stiffness: 300, damping: 25 }}
        >
          {/* Close button */}
          <button className="lab-quiz-close" onClick={onClose}>
            <X size={18} />
          </button>

          {phase !== 'summary' ? (
            <>
              {/* Header */}
              <div className="lab-quiz-header">
                <div className="lab-quiz-progress">
                  <span>{currentQ + 1} / {DEMO_QUESTIONS.length}</span>
                </div>
                <div className="lab-quiz-score-bar">
                  <Zap size={14} />
                  <span>{score} pts</span>
                  {streak > 1 && (
                    <span className="lab-quiz-streak">{streak}x</span>
                  )}
                </div>
              </div>

              {/* Timer Bar */}
              <div className="lab-quiz-timer-track">
                <motion.div
                  className="lab-quiz-timer-fill"
                  animate={{ width: `${timerPercent}%` }}
                  transition={{ duration: 0.3 }}
                  style={{
                    backgroundColor: timerPercent > 50 ? '#6366F1' : timerPercent > 25 ? '#f39c12' : '#e74c3c'
                  }}
                />
              </div>

              {/* Question */}
              <div className="lab-quiz-question">
                <h2>{question.question}</h2>
              </div>

              {/* Answer Grid */}
              <div className="lab-quiz-answers">
                {question.answers.map((answer, idx) => {
                  const color = QUIZ_COLORS[idx];
                  let stateClass = '';
                  if (showCorrect) {
                    if (idx === question.correct) stateClass = 'correct';
                    else if (idx === selected) stateClass = 'wrong';
                    else stateClass = 'dimmed';
                  }

                  return (
                    <motion.button
                      key={idx}
                      className={`lab-quiz-answer ${stateClass}`}
                      style={{ 
                        backgroundColor: stateClass === 'wrong' ? '#ef4444' : stateClass === 'correct' ? '#22c55e' : color.bg,
                        borderColor: color.border,
                      }}
                      onClick={() => handleAnswer(idx)}
                      disabled={selected !== null}
                      whileHover={selected === null ? { scale: 1.02, y: -2 } : {}}
                      whileTap={selected === null ? { scale: 0.98 } : {}}
                    >
                      <span className="lab-quiz-answer-text">{answer}</span>
                      {stateClass === 'correct' && <Check size={20} className="lab-quiz-answer-icon" />}
                      {stateClass === 'wrong' && <X size={20} className="lab-quiz-answer-icon" />}
                    </motion.button>
                  );
                })}
              </div>
            </>
          ) : (
            /* Summary Screen */
            <div className="lab-quiz-summary">
              <motion.div
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ type: 'spring', stiffness: 200, damping: 15, delay: 0.1 }}
              >
                <div className="lab-quiz-trophy-wrap">
                  <Trophy size={64} className="lab-quiz-trophy" />
                </div>
              </motion.div>
              <motion.h2 
                className="lab-quiz-summary-title"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                Quiz Complete!
              </motion.h2>
              <motion.p 
                className="lab-quiz-summary-score"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.3, type: 'spring' }}
              >
                {score} points
              </motion.p>
              <motion.p 
                className="lab-quiz-summary-detail"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
              >
                {score >= 350 ? (
                  <Flame size={20} className="lab-quiz-summary-icon" />
                ) : score >= 250 ? (
                  <Sparkles size={20} className="lab-quiz-summary-icon" />
                ) : score >= 150 ? (
                  <ThumbsUp size={20} className="lab-quiz-summary-icon" />
                ) : (
                  <Armchair size={20} className="lab-quiz-summary-icon" />
                )}
                {score >= 350 ? "Perfect! You're on fire!" :
                 score >= 250 ? "Amazing work! Keep it up!" :
                 score >= 150 ? "Good job! Keep learning!" :
                 "Don't give up - practice makes perfect!"}
              </motion.p>
              <motion.button 
                className="lab-quiz-proceed" 
                onClick={handleProceed}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.98 }}
              >
                <span>Proceed to Next Milestone</span>
                <ArrowRight size={16} />
              </motion.button>
            </div>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
