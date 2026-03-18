import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, X, Zap, ArrowRight, Check, Flame, Sparkles, ThumbsUp, Armchair } from 'lucide-react';

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
  const [phase, setPhase] = useState('question'); // 'question' | 'summary'
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
          initial={{ y: 20, opacity: 0, scale: 0.95 }}
          animate={{ y: 0, opacity: 1, scale: 1 }}
          exit={{ y: 20, opacity: 0, scale: 0.95 }}
          transition={{ type: 'spring', stiffness: 300, damping: 25 }}
        >
          {/* Close button */}
          <button className="lab-quiz-close" onClick={onClose}>
            <X size={20} />
          </button>

          {phase !== 'summary' ? (
            <>
              {/* Header */}
              <div className="lab-quiz-header">
                <div className="lab-quiz-progress">
                  Module {currentQ + 1} / {DEMO_QUESTIONS.length}
                </div>
                <div className="lab-quiz-score-bar">
                  <Zap size={16} className="text-amber-400" />
                  <span>{score.toLocaleString()}</span>
                  {streak > 1 && (
                    <span className="lab-quiz-streak">
                      <Flame size={10} /> {streak}x Streak
                    </span>
                  )}
                </div>
              </div>

              {/* Timer Bar */}
              <div className="lab-quiz-timer-track">
                <motion.div
                  className="lab-quiz-timer-fill"
                  initial={{ width: '100%' }}
                  animate={{ width: `${timerPercent}%` }}
                  transition={{ duration: 0.3 }}
                />
              </div>

              {/* Question */}
              <div className="lab-quiz-question">
                <motion.h2
                  key={currentQ}
                  initial={{ x: 20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                >
                  {question.question}
                </motion.h2>
              </div>

              {/* Answer Grid */}
              <div className="lab-quiz-answers">
                {question.answers.map((answer, idx) => {
                  let stateClass = '';
                  if (showCorrect) {
                    if (idx === question.correct) stateClass = 'correct';
                    else if (idx === selected) stateClass = 'wrong';
                    else stateClass = 'dimmed';
                  }

                  return (
                    <motion.button
                      key={`${currentQ}-${idx}`}
                      className={`lab-quiz-answer ${stateClass}`}
                      onClick={() => handleAnswer(idx)}
                      disabled={selected !== null}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.05 }}
                    >
                      <span className="lab-quiz-answer-text">{answer}</span>
                      <AnimatePresence>
                        {stateClass === 'correct' && (
                          <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}>
                            <Check size={18} className="lab-quiz-answer-icon" />
                          </motion.div>
                        )}
                        {stateClass === 'wrong' && (
                          <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}>
                            <X size={18} className="lab-quiz-answer-icon" />
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </motion.button>
                  );
                })}
              </div>
            </>
          ) : (
            /* Summary Screen */
            <div className="lab-quiz-summary">
              <motion.div
                initial={{ scale: 0, rotate: -20 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ type: 'spring', stiffness: 200, damping: 15 }}
              >
                <div className="lab-quiz-trophy-wrap">
                  <Trophy size={56} className="lab-quiz-trophy" />
                </div>
              </motion.div>
              
              <motion.h2 
                className="lab-quiz-summary-title"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                Assessment Complete
              </motion.h2>

              <motion.div 
                className="lab-quiz-summary-score"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
              >
                {score.toLocaleString()}
              </motion.div>

              <motion.div 
                className="lab-quiz-summary-detail"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
              >
                {score >= 350 ? (
                  <Flame size={18} className="text-orange-500" />
                ) : score >= 250 ? (
                  <Sparkles size={18} className="text-blue-400" />
                ) : (
                  <ThumbsUp size={18} className="text-emerald-400" />
                )}
                <span>
                  {score >= 350 ? "Exceptional performance!" :
                   score >= 250 ? "Great job, you've mastered this!" :
                   "Good progress. Keep it up!"}
                </span>
              </motion.div>

              <motion.button 
                className="lab-quiz-proceed" 
                onClick={handleProceed}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
              >
                <span>Continue to Milestone</span>
                <ArrowRight size={18} />
              </motion.button>
            </div>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

