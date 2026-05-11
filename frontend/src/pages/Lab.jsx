import React, { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ChevronsRight, ChevronsLeft, Monitor } from 'lucide-react';
import useLabStore from '../store/useLabStore';
import useAuthStore from '../store/useAuthStore';
import LabHeader from '../components/lab/LabHeader';
import FileSidebar from '../components/lab/FileSidebar';
import EditorPane from '../components/lab/EditorPane';
import AiPanel from '../components/lab/AiPanel';
import QuizModal from '../components/lab/QuizModal';
import MilestoneCompleteModal from '../components/lab/MilestoneCompleteModal';
import OnboardingModal from '../components/lab/OnboardingModal';
import CreditModal from '../components/lab/CreditModal';
import UnlockConfirmationModal from '../components/lab/UnlockConfirmationModal';
import { SidebarSkeleton, EditorSkeleton, AiPanelSkeleton } from '../components/lab/LabSkeleton';
import { useParams, useNavigate } from 'react-router-dom';

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
  const { id: routeProjectId } = useParams();
  const navigate = useNavigate();
  const {
    loadRealProject,
    projectId,
    leftSidebarOpen, rightSidebarOpen,
    toggleLeftSidebar, toggleRightSidebar,
    quizOpen, closeQuiz, proceedToNextMilestone,
    saveProject, milestoneCompletedModalOpen, milestones, currentMilestoneId, markProjectComplete,
    showOnboarding, isLabLoading, isSandbox
  } = useLabStore();
  const { getProfile } = useAuthStore();

  const [isMobile, setIsMobile] = useState(false);
  const [hasInitialized, setHasInitialized] = useState(false);

  useEffect(() => {
    const prepareLab = async () => {
      await getProfile(); // Refresh user data from server
      
      // Prioritize URL parameter, fallback to sessionStorage
      const targetProjectId = routeProjectId || sessionStorage.getItem('pendingProjectId');
      
      if (targetProjectId && !hasInitialized) {
        // We have a target ID
        const isPurchased = sessionStorage.getItem('projectPurchased') === 'true';
        sessionStorage.removeItem('pendingProjectId');
        sessionStorage.removeItem('projectPurchased');
        
        loadRealProject(targetProjectId, isPurchased);
        setHasInitialized(true);
      } else if (!targetProjectId && !hasInitialized && !isSandbox) {
        // No project pending and not sandbox—redirect to dashboard
        setHasInitialized(true);
        navigate('/dashboard');
      }
    };
    prepareLab();
  }, [routeProjectId, hasInitialized, isSandbox]);

  // Cleanup sessionStorage on unmount
  useEffect(() => {
    return () => {
      sessionStorage.removeItem('pendingProjectId');
      sessionStorage.removeItem('projectPurchased');
    };
  }, []);


  // Global Ctrl+S override
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        saveProject();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [saveProject]);

  useEffect(() => {
    const checkWidth = () => setIsMobile(window.innerWidth < 768);
    checkWidth();
    window.addEventListener('resize', checkWidth);
    return () => window.removeEventListener('resize', checkWidth);
  }, []);

  if (isMobile) return <MobileGuard />;

  const handleQuizComplete = (score) => {
    closeQuiz();
    const { milestones, currentMilestoneId } = useLabStore.getState();
    const currentM = milestones.find(m => m.id === currentMilestoneId);
    const assessmentStep = currentM?.steps?.find(s => s.title.toLowerCase().includes('assessment'));
    
    if (assessmentStep) {
      // Use the store's logic to complete the step. 
      // Since it's an assessment, we already verified the pass in the QuizModal.
      // We need a way to force complete it now.
      
      useLabStore.setState(s => {
        const updatedMilestones = s.milestones.map(m => {
          if (m.id !== s.currentMilestoneId) return m;
          return {
            ...m,
            steps: m.steps.map(step => 
              step.id === assessmentStep.id ? { ...step, status: 'completed' } : step
            )
          };
        });

        const updatedM = updatedMilestones.find(m => m.id === s.currentMilestoneId);
        const allDone = updatedM?.steps.every(step => step.status === 'completed');

        return {
          milestones: updatedMilestones,
          milestoneCompletedModalOpen: allDone
        };
      });
    }
  };

  const handleMilestoneProceed = async () => {
    const idx = milestones.findIndex(m => m.id === currentMilestoneId);
    if (idx === milestones.length - 1) {
      await markProjectComplete();
      useLabStore.setState({ milestoneCompletedModalOpen: false });
      return;
    }
    useLabStore.setState({ milestoneCompletedModalOpen: false });
    proceedToNextMilestone();
  };

  const currentMilestone = milestones.find(m => m.id === currentMilestoneId);

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
              {isLabLoading ? <SidebarSkeleton /> : <FileSidebar />}
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
          {isLabLoading ? <EditorSkeleton /> : <EditorPane />}
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
              {isLabLoading ? <AiPanelSkeleton /> : <AiPanel />}
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

      {/* Milestone Complete Modal */}
      <AnimatePresence>
        {milestoneCompletedModalOpen && (
          <MilestoneCompleteModal
            milestone={currentMilestone}
            onProceed={handleMilestoneProceed}
          />
        )}
      </AnimatePresence>

      {/* Onboarding Modal */}
      <AnimatePresence>
        {showOnboarding && (
          <OnboardingModal key="onboarding" />
        )}
      </AnimatePresence>

      {/* Credit Modal */}
      <AnimatePresence>
        <CreditModal />
      </AnimatePresence>

      {/* Unlock Confirmation Modal */}
      <AnimatePresence>
        <UnlockConfirmationModal />
      </AnimatePresence>
    </div>
  );
}
