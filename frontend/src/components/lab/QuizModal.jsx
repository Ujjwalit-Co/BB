import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, X, Zap, ArrowRight, Check } from 'lucide-react';

const QUIZ_COLORS = [
  { bg: '#e74c3c', hover: '#c0392b' }, // Red
  { bg: '#2980b9', hover: '#2471a3' }, // Blue
  { bg: '#f39c12', hover: '#d68910' }, // Orange/Yellow
  { bg: '#27ae60', hover: '#229954' }, // Green
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
                    <span className="lab-quiz-streak">{streak}x streak!</span>
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
                      style={{ backgroundColor: stateClass === 'wrong' ? '#e74c3c' : stateClass === 'correct' ? '#27ae60' : color.bg }}
                      onClick={() => handleAnswer(idx)}
                      disabled={selected !== null}
                      whileHover={selected === null ? { scale: 1.03 } : {}}
                      whileTap={selected === null ? { scale: 0.97 } : {}}
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
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', stiffness: 200 }}
              >
                <Trophy size={56} className="lab-quiz-trophy" />
              </motion.div>
              <h2 className="lab-quiz-summary-title">Quiz Complete!</h2>
              <p className="lab-quiz-summary-score">{score} points</p>
              <p className="lab-quiz-summary-detail">
                {score >= 250 ? "Amazing work! You nailed it!" :
                 score >= 150 ? "Good job! Keep learning!" :
                 "Don't give up - practice makes perfect!"}
              </p>
              <button className="lab-quiz-proceed" onClick={handleProceed}>
                <span>Proceed to Next Milestone</span>
                <ArrowRight size={16} />
              </button>
            </div>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
