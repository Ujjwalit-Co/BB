import React, { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ChevronsRight, ChevronsLeft, Monitor } from 'lucide-react';
import useLabStore from '../store/useLabStore';
import LabHeader from '../components/lab/LabHeader';
import FileSidebar from '../components/lab/FileSidebar';
import EditorPane from '../components/lab/EditorPane';
import AiPanel from '../components/lab/AiPanel';
import QuizModal from '../components/lab/QuizModal';

function MobileGuard() {
  return (
    <div className="lab-mobile-guard">
      <div className="lab-mobile-guard-card">
        <Monitor size={48} strokeWidth={1.5} />
        <h2>Desktop or Tablet Required</h2>
        <p>
          The BrainBazaar Labs are built for larger screens. Please switch to a
          desktop or tablet device for the best coding experience.
        </p>
      </div>
    </div>
  );
}

export default function Lab() {
  const {
    initDemoProject,
    leftSidebarOpen, rightSidebarOpen,
    toggleLeftSidebar, toggleRightSidebar,
    quizOpen, closeQuiz, proceedToNextMilestone,
  } = useLabStore();

  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    initDemoProject();
  }, []);

  useEffect(() => {
    const checkWidth = () => setIsMobile(window.innerWidth < 768);
    checkWidth();
    window.addEventListener('resize', checkWidth);
    return () => window.removeEventListener('resize', checkWidth);
  }, []);

  if (isMobile) return <MobileGuard />;

  const handleQuizComplete = (score) => {
    proceedToNextMilestone();
  };

  return (
    <div className="lab-root">
      <LabHeader />

      <div className="lab-body">
        {/* Left Sidebar */}
        <AnimatePresence mode="wait">
          {leftSidebarOpen && (
            <motion.div
              className="lab-sidebar-left-wrap"
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: 260, opacity: 1 }}
              exit={{ width: 0, opacity: 0 }}
              transition={{ duration: 0.2, ease: 'easeInOut' }}
            >
              <FileSidebar />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Collapse toggle when sidebar is hidden */}
        {!leftSidebarOpen && (
          <button className="lab-sidebar-reveal lab-sidebar-reveal-left" onClick={toggleLeftSidebar}>
            <ChevronsRight size={16} />
          </button>
        )}

        {/* Main Editor */}
        <div className="lab-editor-wrap">
          <EditorPane />
        </div>

        {/* Right Sidebar */}
        <AnimatePresence mode="wait">
          {rightSidebarOpen && (
            <motion.div
              className="lab-sidebar-right-wrap"
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: 320, opacity: 1 }}
              exit={{ width: 0, opacity: 0 }}
              transition={{ duration: 0.2, ease: 'easeInOut' }}
            >
              <AiPanel />
            </motion.div>
          )}
        </AnimatePresence>

        {!rightSidebarOpen && (
          <button className="lab-sidebar-reveal lab-sidebar-reveal-right" onClick={toggleRightSidebar}>
            <ChevronsLeft size={16} />
          </button>
        )}
      </div>

      {/* Quiz Modal */}
      <AnimatePresence>
        {quizOpen && (
          <QuizModal
            onComplete={handleQuizComplete}
            onClose={closeQuiz}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
