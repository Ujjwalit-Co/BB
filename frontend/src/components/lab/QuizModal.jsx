import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, X, Zap, ArrowRight, Check, Flame, Sparkles, ThumbsUp, RotateCcw, AlertCircle } from 'lucide-react';
import useLabStore from '../../store/useLabStore';

export default function QuizModal({ onComplete, onClose }) {
  const { currentQuiz } = useLabStore();
  const [currentQ, setCurrentQ] = useState(0);
  const [score, setScore] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [streak, setStreak] = useState(0);
  const [selected, setSelected] = useState(null);
  const [phase, setPhase] = useState('question'); // 'question' | 'summary' | 'failed'
  const [showCorrect, setShowCorrect] = useState(false);
  const [timeLeft, setTimeLeft] = useState(15);

  const questions = currentQuiz?.questions || [];
  const question = questions[currentQ];
  const passingScore = currentQuiz?.passingScore || 3;

  useEffect(() => {
    if (phase !== 'question' || !question) return;
    if (timeLeft <= 0) {
      handleAnswer(-1);
      return;
    }
    const timer = setTimeout(() => setTimeLeft(t => t - 1), 1000);
    return () => clearTimeout(timer);
  }, [timeLeft, phase, question]);

  const handleAnswer = useCallback((idx) => {
    if (selected !== null || !question) return;
    setSelected(idx);
    setShowCorrect(true);

    // Compare indices directly (correctAnswer is a number: 0, 1, 2, or 3)
    const isCorrect = idx === question.correctAnswer;

    if (isCorrect) {
      setScore(s => s + 100 + (streak * 25));
      setCorrectCount(c => c + 1);
      setStreak(s => s + 1);
    } else {
      setStreak(0);
    }

    setTimeout(() => {
      if (currentQ < questions.length - 1) {
        setCurrentQ(q => q + 1);
        setSelected(null);
        setShowCorrect(false);
        setTimeLeft(questions[currentQ + 1].timeLimit || 15);
      } else {
        const finalCorrectCount = isCorrect ? correctCount + 1 : correctCount;
        if (finalCorrectCount >= passingScore) {
          setPhase('summary');
        } else {
          setPhase('failed');
        }
      }
    }, 1500);
  }, [selected, question, currentQ, streak, questions, correctCount, passingScore]);

  const handleProceed = () => {
    onComplete?.(score);
  };

  const handleRetry = () => {
    setCurrentQ(0);
    setScore(0);
    setCorrectCount(0);
    setStreak(0);
    setSelected(null);
    setPhase('question');
    setShowCorrect(false);
    setTimeLeft(questions[0].timeLimit || 15);
  };

  if (!question && phase === 'question') {
    return (
      <div className="lab-quiz-overlay">
        <div className="lab-quiz-modal flex items-center justify-center">
          <div className="text-center">
            <AlertCircle size={48} className="mx-auto mb-4 text-amber-500" />
            <p>Loading assessment questions...</p>
          </div>
        </div>
      </div>
    );
  }

  const timerPercent = (timeLeft / (question?.timeLimit || 15)) * 100;

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

          {phase === 'question' ? (
            <>
              {/* Header */}
              <div className="lab-quiz-header">
                <div className="lab-quiz-progress">
                  {currentQuiz?.milestoneName || 'Assessment'} • {currentQ + 1} / {questions.length}
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
                {question.options.map((answer, idx) => {
                  let stateClass = '';
                  if (showCorrect) {
                    // Compare indices (both should be numbers)
                    if (idx === question.correctAnswer) stateClass = 'correct';
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
          ) : phase === 'summary' ? (
            /* Summary Screen (Pass) */
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
                Assessment Passed!
              </motion.h2>

              <motion.div 
                className="lab-quiz-summary-score"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
              >
                {correctCount} / {questions.length} Correct
              </motion.div>

              <motion.div 
                className="lab-quiz-summary-detail"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
              >
                <Sparkles size={18} className="text-blue-400" />
                <span>You've mastered this milestone! Proceed to unlock the next challenge.</span>
              </motion.div>

              <motion.button 
                className="lab-quiz-proceed" 
                onClick={handleProceed}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
              >
                <span>Complete Milestone</span>
                <ArrowRight size={18} />
              </motion.button>
            </div>
          ) : (
            /* Failed Screen */
            <div className="lab-quiz-summary">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', stiffness: 200, damping: 15 }}
              >
                <div className="lab-quiz-trophy-wrap bg-red-500/20 border-red-500/30">
                  <RotateCcw size={56} className="text-red-500" />
                </div>
              </motion.div>
              
              <motion.h2 
                className="lab-quiz-summary-title text-red-500"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                Keep Practicing!
              </motion.h2>

              <motion.div 
                className="lab-quiz-summary-score"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
              >
                {correctCount} / {questions.length} Correct
              </motion.div>

              <motion.p 
                className="text-center text-slate-400 text-sm mb-8 px-8"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
              >
                You need at least {passingScore} correct answers to pass this assessment and proceed. Review the milestone steps and try again!
              </motion.p>

              <div className="flex gap-4">
                <motion.button 
                  className="lab-quiz-proceed bg-slate-800 border-slate-700" 
                  onClick={onClose}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.5 }}
                >
                  <span>Review Steps</span>
                </motion.button>
                
                <motion.button 
                  className="lab-quiz-proceed" 
                  onClick={handleRetry}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.5 }}
                >
                  <RotateCcw size={18} />
                  <span>Try Again</span>
                </motion.button>
              </div>
            </div>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
