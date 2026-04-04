import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import useAuthStore from '../store/useAuthStore';
import { projectsExpressApi, githubApi } from '../api/express';
import { ChevronRight, ChevronLeft, Loader2 } from 'lucide-react';

// Helper to get auth token from Zustand store
const getAuthToken = () => {
  try {
    const authStorage = localStorage.getItem('auth-storage');
    if (authStorage) {
      const parsed = JSON.parse(authStorage);
      return parsed.state?.token || parsed.token || localStorage.getItem('authToken');
    }
  } catch (e) {
    console.error('Error getting auth token:', e);
  }
  return localStorage.getItem('authToken');
};

// Step components
import { STEPS } from './upload/constants';
import StepGithub from './upload/StepGithub';
import StepRepos from './upload/StepRepos';
import StepReadme from './upload/StepReadme';
import StepFiles from './upload/StepFiles';
import StepAI from './upload/StepAI';
import StepReview from './upload/StepReview';
import StepPricing from './upload/StepPricing';
import StepPreview from './upload/StepPreview';
import StepSubmit from './upload/StepSubmit';

export default function UploadProject() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const editModeId = searchParams.get('edit');
  
  const { user } = useAuthStore();
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [globalLoading, setGlobalLoading] = useState(!!editModeId);

  // Form state
  const [githubConnected, setGithubConnected] = useState(false);
  const [githubUsername, setGithubUsername] = useState('');
  const [repos, setRepos] = useState([]);
  const [selectedRepo, setSelectedRepo] = useState(null);
  const [readme, setReadme] = useState('');
  const [repoFiles, setRepoFiles] = useState([]);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [selectedFilesContent, setSelectedFilesContent] = useState([]);

  // AI Generated
  const [aiGenerated, setAiGenerated] = useState({ summary: '', description: '', milestones: [] });

  // Project Details
  const [projectData, setProjectData] = useState({
    title: '', description: '', category: 'all', badge: 'silver',
    price: 99, techStack: [], downloadLink: '', thumbnailUrl: '',
    uploadedImages: []
  });
  
  const [techInput, setTechInput] = useState('');
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const fetchedReposRef = useRef(false);
  const aiProcessedRef = useRef(false);

  useEffect(() => {
    if (!user || user.role !== 'seller') {
      navigate('/auth');
      return;
    }
    
    if (editModeId) {
      loadEditData(editModeId);
    } else {
      checkGitHubStatus();
    }
  }, [user, editModeId]);

  // Handle GitHub callback from URL
  useEffect(() => {
    if (editModeId) return; // Ignore github callback if in edit mode
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get('code');
    if (code) {
      handleGitHubCallback(code);
      window.history.replaceState({}, '', '/seller/upload');
    }
  }, [editModeId]);

  const loadEditData = async (projectId) => {
    try {
      const { project } = await projectsExpressApi.getById(projectId);
      if (project) {
        setProjectData({
          title: project.title || '',
          description: project.description || '',
          category: project.category || 'all',
          badge: project.badge || 'silver',
          price: project.price || 99,
          techStack: project.techStack || [],
          downloadLink: project.downloadLink || '',
          thumbnailUrl: project.thumbnail?.secure_url || '',
          uploadedImages: project.thumbnail?.secure_url ? [{ secure_url: project.thumbnail.secure_url, public_id: project.thumbnail.public_id }] : []
        });
        
        setReadme(project.readme || '');
        
        if (project.milestones) {
           setAiGenerated({
             summary: project.description || '',
             description: project.readme ? project.readme.substring(0, 500) : '',
             milestones: project.milestones
           });
        }
        
        // Skip GitHub steps when editing, jump directly to Review (Step 6)
        setCurrentStep(6);
      }
    } catch (error) {
      console.error('Failed to load project for editing', error);
      alert('Failed to load project data.');
    } finally {
      setGlobalLoading(false);
    }
  }

  const checkGitHubStatus = async () => {
    try {
      const authToken = getAuthToken();

      if (!authToken) {
        console.warn('No auth token found, redirecting to login');
        navigate('/auth');
        return;
      }

      const response = await fetch(
        `${import.meta.env.VITE_EXPRESS_API_URL || 'http://localhost:5000/api/v1'}/github/status`,
        { headers: { Authorization: `Bearer ${authToken}` } }
      );

      if (!response.ok) {
        console.warn('GitHub status check failed:', response.status);
        return;
      }

      const data = await response.json();
      if (data.success && data.connected) {
        setGithubConnected(true);
        setGithubUsername(data.username);
        setCurrentStep(2);
      }
    } catch (e) {
      console.log('GitHub not connected yet:', e.message);
    }
  };

  const handleConnectGitHub = (accessLevel) => {
    githubApi.connect(accessLevel);
  };

  const handleGitHubCallback = async (code) => {
    setLoading(true);
    try {
      const authToken = getAuthToken();

      const response = await fetch(
        `${import.meta.env.VITE_EXPRESS_API_URL || 'http://localhost:5000/api/v1'}/github/callback`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${authToken}`
          },
          body: JSON.stringify({ code }),
        }
      );
      const data = await response.json();
      if (data.success) {
        setGithubConnected(true);
        setGithubUsername(data.githubUsername);
        setCurrentStep(2);
        
        // Update user in auth store with new GitHub status
        const { getProfile } = useAuthStore.getState();
        await getProfile();
      }
    } catch (error) {
      console.error('GitHub callback error:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchRepos = async () => {
    setLoading(true);
    try {
      const data = await githubApi.getRepositories();
      if (data.success) setRepos(data.repositories || []);
    } catch (error) {
      console.error('Error fetching repos:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchRepoFiles = async (owner, repoName) => {
    setLoading(true);
    try {
      const authToken = getAuthToken();
      
      const response = await fetch(
        `${import.meta.env.VITE_EXPRESS_API_URL || 'http://localhost:5000/api/v1'}/github/repos/${owner}/${repoName}/files`,
        { headers: { Authorization: `Bearer ${authToken}` } }
      );
      const data = await response.json();
      if (data.success) setRepoFiles(data.files || []);

      // Try to auto-detect README
      const readmeFile = (data.files || []).find(f =>
        f.path.toLowerCase() === 'readme.md' || f.path.toLowerCase() === 'readme'
      );
      if (readmeFile) {
        const contentResp = await fetch(
          `${import.meta.env.VITE_EXPRESS_API_URL || 'http://localhost:5000/api/v1'}/github/repos/${owner}/${repoName}/content?path=${readmeFile.path}`,
          { headers: { Authorization: `Bearer ${authToken}` } }
        );
        const contentData = await contentResp.json();
        if (contentData.success) setReadme(contentData.content);
      }
    } catch (error) {
      console.error('Error fetching repo files:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRepoSelect = (repo) => {
    setSelectedRepo(repo);
    setProjectData(prev => ({
      ...prev,
      title: repo.name.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase()),
      downloadLink: repo.htmlUrl,
    }));
    fetchRepoFiles(repo.fullName.split('/')[0], repo.name);
    nextStep();
  };

  const toggleFileSelection = (file) => {
    setSelectedFiles(prev =>
      prev.includes(file.path)
        ? prev.filter(f => f !== file.path)
        : [...prev, file.path]
    );
  };

  const handleAIProcessing = async () => {
    setLoading(true);
    try {
      const fileContents = [];
      const [owner, repoName] = selectedRepo.fullName.split('/');
      const authToken = getAuthToken();

      if (selectedFiles.length > 0) {
        for (const path of selectedFiles) {
          try {
            const resp = await fetch(
              `${import.meta.env.VITE_EXPRESS_API_URL || 'http://localhost:5000/api/v1'}/github/repos/${owner}/${repoName}/content?path=${path}`,
              { headers: { Authorization: `Bearer ${authToken}` } }
            );
            const data = await resp.json();
            if (data.success && data.content) {
              fileContents.push({ path, content: data.content });
            }
          } catch (e) {
            console.warn(`Failed to fetch content for ${path}`, e);
          }
        }
        setSelectedFilesContent(fileContents);
      }

      const aiResponse = await projectsExpressApi.generateAI({
        readme,
        files: fileContents,
        techStack: projectData.techStack,
      });

      if (aiResponse.success) {
        const finalReadme = aiResponse.readme || readme;
        const generatedSummary = aiResponse.summary || 'Project overview generated by AI.';
        const milestonesArr = Array.isArray(aiResponse.milestones) ? aiResponse.milestones : [];

        setAiGenerated({
          summary: generatedSummary,
          description: finalReadme.substring(0, 500),
          milestones: milestonesArr,
        });

        const lines = finalReadme.split('\n').filter(l => l.trim());
        const title = lines[0]?.replace(/^#+\s*/, '') || projectData.title;

        setProjectData(prev => ({
          ...prev,
          title: title || prev.title,
          description: generatedSummary.substring(0, 500) || prev.description,
          badge: aiResponse.complexity?.complexity === 'advanced' ? 'diamond' : 
                 aiResponse.complexity?.complexity === 'intermediate' ? 'gold' : 'silver',
        }));
      } else {
        throw new Error("AI generation failed");
      }
    } catch (error) {
      console.error('Error in AI processing:', error);
      alert('AI processing failed. Please check backend services.');
    } finally {
      setLoading(false);
      setCurrentStep(6);
    }
  };

  const addTech = () => {
    if (techInput.trim() && !projectData.techStack.includes(techInput.trim())) {
      setProjectData(prev => ({
        ...prev,
        techStack: [...prev.techStack, techInput.trim()],
      }));
      setTechInput('');
    }
  };

  const removeTech = (tech) => {
    setProjectData(prev => ({
      ...prev,
      techStack: prev.techStack.filter(t => t !== tech),
    }));
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const payload = {
        ...projectData,
        thumbnail: projectData.uploadedImages?.length > 0 
           ? { secure_url: projectData.uploadedImages[0].secure_url, public_id: projectData.uploadedImages[0].public_id } 
           : { secure_url: projectData.thumbnailUrl },
        readme,
        codeFiles: selectedFilesContent.map(f => ({
          path: f.path,
          content: f.content,
          filename: f.path.split('/').pop(),
          language: f.path.split('.').pop() || 'text'
        })),
        milestones: aiGenerated.milestones.map((m, idx) => ({
          number: idx + 1,
          title: m.title,
          description: m.description,
          estimatedTime: m.estimatedTime || '2 hours',
          steps: m.steps && m.steps.length > 0 ? m.steps : [{ stepNumber: 1, title: m.title, description: m.description }],
        })),
        githubUrl: selectedRepo?.htmlUrl || '',
      };

      if (editModeId) {
        // Remove codeFiles to avoid overriding existing files unless we specifically support updating them
        delete payload.codeFiles;
        delete payload.githubUrl; 
        await projectsExpressApi.updateProject(editModeId, payload);
      } else {
        payload.reviewStatus = 'pending';
        payload.submittedAt = new Date();
        await projectsExpressApi.upload(payload);
      }
      
      navigate('/seller');
    } catch (error) {
      console.error('Error submitting project:', error);
      alert('Failed to submit project');
    } finally {
      setLoading(false);
    }
  };

  const nextStep = () => setCurrentStep(prev => Math.min(prev + 1, 9));
  const prevStep = () => setCurrentStep(prev => Math.max(prev - 1, (editModeId ? 6 : 1))); 
  const goToStep = (stepId) => {
    if (editModeId && stepId < 6) return; // Prevent going to github steps while editing
    setCurrentStep(stepId);
  }

  // Effect to load data
  useEffect(() => {
    if (currentStep === 2 && !loading && !fetchedReposRef.current && !editModeId) {
      fetchedReposRef.current = true;
      fetchRepos();
    }
    if (currentStep === 5 && !loading && !aiGenerated.summary && !aiProcessedRef.current && !editModeId) {
      aiProcessedRef.current = true;
      handleAIProcessing();
    }
  }, [currentStep, loading, editModeId]);

  if (globalLoading) {
    return (
       <div className="flex items-center justify-center min-h-[60vh]">
         <Loader2 className="animate-spin text-indigo-500" size={40} />
       </div>
    );
  }

  return (
    <div className="p-8 max-w-4xl mx-auto">
      {/* Step Indicator */}
      <div className="mb-10">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-black">{editModeId ? 'Edit Project' : 'Upload Project'}</h1>
          <span className="text-sm text-slate-500 dark:text-slate-400 font-medium">Step {currentStep} of {STEPS.length}</span>
        </div>
        
        <div className="flex items-center justify-between relative">
          <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-1 bg-slate-200 dark:bg-white/10 rounded-full z-0" />
          <div 
            className="absolute left-0 top-1/2 -translate-y-1/2 h-1 bg-indigo-500 rounded-full z-0 transition-all duration-300" 
            style={{ width: `${((currentStep - 1) / (STEPS.length - 1)) * 100}%` }}
          />
          
          {STEPS.map((step) => {
            const isCompleted = step.id < currentStep;
            const isCurrent = step.id === currentStep;
            const isClickable = editModeId ? step.id >= 6 : isCompleted || isCurrent || (step.id === 3 && githubConnected && selectedRepo) || (step.id === 6 && aiProcessedRef.current);
            const isDisabledStr = editModeId && step.id < 6 ? "opacity-30 cursor-not-allowed" : "";
            
            return (
              <button 
                key={step.id} 
                onClick={() => isClickable && goToStep(step.id)}
                disabled={!isClickable}
                className={`relative z-10 flex flex-col items-center gap-2 outline-none group ${isDisabledStr} ${!isClickable ? 'cursor-not-allowed' : 'cursor-pointer'}`}
              >
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-300 ${
                  isCurrent ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/30 scale-110' : 
                  isCompleted ? 'bg-indigo-500 text-white' : 
                  'bg-slate-200 dark:bg-slate-800 text-slate-500 dark:text-slate-400'
                }`}>
                  <step.icon size={14} />
                </div>
                <span className={`absolute top-10 text-[10px] whitespace-nowrap font-medium transition-colors ${
                  isCurrent ? 'text-indigo-600 dark:text-indigo-400 font-bold' : 
                  isCompleted ? 'text-slate-700 dark:text-slate-300' : 
                  'text-slate-400 dark:text-slate-500'
                }`}>
                  {step.title}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Step Content */}
      <div className="bg-white dark:bg-[#1a1a1a] shadow-sm border border-slate-200 dark:border-white/10 rounded-2xl p-8 min-h-[400px] mt-12 transition-all">
        {currentStep === 1 && <StepGithub githubConnected={githubConnected} githubUsername={githubUsername} onConnect={handleConnectGitHub} />}
        {currentStep === 2 && <StepRepos repos={repos} loading={loading} selectedRepo={selectedRepo} onSelect={handleRepoSelect} />}
        {currentStep === 3 && <StepReadme readme={readme} setReadme={setReadme} />}
        {currentStep === 4 && <StepFiles repoFiles={repoFiles} selectedFiles={selectedFiles} toggleFileSelection={toggleFileSelection} loading={loading} />}
        {currentStep === 5 && <StepAI loading={loading} />}
        {currentStep === 6 && <StepReview projectData={projectData} setProjectData={setProjectData} aiGenerated={aiGenerated} setAiGenerated={setAiGenerated} readme={readme} />}
        {currentStep === 7 && <StepPricing projectData={projectData} setProjectData={setProjectData} techInput={techInput} setTechInput={setTechInput} addTech={addTech} removeTech={removeTech} />}
        {currentStep === 8 && <StepPreview projectData={projectData} aiGenerated={aiGenerated} readme={readme} />}
        {currentStep === 9 && <StepSubmit agreedToTerms={agreedToTerms} setAgreedToTerms={setAgreedToTerms} onSubmit={handleSubmit} loading={loading} isEditing={!!editModeId} />}
      </div>

      {/* Navigation Constraints */}
      {currentStep !== 5 && (
        <div className="flex items-center justify-between mt-6">
          <button
            onClick={prevStep}
            disabled={currentStep === 1 || (editModeId && currentStep === 6)}
            className="px-6 py-3 bg-white dark:bg-[#1a1a1a] border border-slate-200 dark:border-white/10 rounded-xl font-medium disabled:opacity-30 hover:bg-slate-50 dark:hover:bg-white/5 transition-colors flex items-center gap-2 shadow-sm"
          >
            <ChevronLeft size={18} /> Back
          </button>
          
          {currentStep < 9 && (
            <button
              onClick={nextStep}
              disabled={
                (currentStep === 1 && !githubConnected) ||
                (currentStep === 2 && !selectedRepo) ||
                (currentStep === 3 && !readme) ||
                (currentStep === 4 && selectedFiles.length === 0) ||
                (currentStep === 7 && (projectData.price < 99 || projectData.price > 3999))
              }
              className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white rounded-xl font-medium transition-all shadow-md shadow-indigo-500/20 hover:shadow-indigo-500/40 flex items-center gap-2"
            >
              Next <ChevronRight size={18} />
            </button>
          )}
        </div>
      )}
    </div>
  );
}
