import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import useAuthStore from '../store/useAuthStore';
import { projectsExpressApi, githubApi } from '../api/express';
import { ChevronRight, ChevronLeft, Loader2, Sparkles, CheckCircle2 } from 'lucide-react';

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
        const mediaImages = (project.screenshots || [])
          .map((image) => {
            if (!image) return null;
            if (typeof image === 'string') return { secure_url: image, public_id: '' };
            return { secure_url: image.secure_url || image.url || '', public_id: image.public_id || '' };
          })
          .filter((image) => image?.secure_url);

        const thumbnailImage = project.thumbnail?.secure_url
          ? [{ secure_url: project.thumbnail.secure_url, public_id: project.thumbnail.public_id || '' }]
          : [];

        const uploadedImages = mediaImages.length > 0 ? mediaImages : thumbnailImage;

        setProjectData({
          title: project.title || '',
          description: project.description || '',
          category: project.category || 'all',
          badge: project.badge || 'silver',
          price: project.price || 99,
          techStack: project.techStack || [],
          downloadLink: project.downloadLink || '',
          thumbnailUrl: uploadedImages[0]?.secure_url || '',
          uploadedImages,
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
        screenshots: projectData.uploadedImages?.map(img => img.secure_url) || [],
        readme,
        codeFiles: selectedFilesContent.map(f => ({
          path: f.path,
          content: f.content,
          filename: f.path.split('/').pop(),
          language: f.path.split('.').pop() || 'text'
        })),
        milestones: aiGenerated.milestones.map((m, idx) => ({
          number: idx + 1,
          title: m.title || m.name || `Milestone ${idx + 1}`,
          description: m.description || m.objective || '',
          estimatedTime: m.estimatedTime || '2 hours',
          steps: m.steps && m.steps.length > 0 ? m.steps : [{ stepNumber: 1, title: m.title || m.name || `Milestone ${idx + 1}`, description: m.description || '' }],
        })),
        githubUrl: selectedRepo?.htmlUrl || '',
      };

      if (editModeId) {
        // Remove codeFiles to avoid overriding existing files unless we specifically support updating them
        delete payload.codeFiles;
        delete payload.githubUrl; 
        await projectsExpressApi.updateProject(editModeId, payload);
        await projectsExpressApi.submitForReview(editModeId);
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
       <div className="flex min-h-[70vh] items-center justify-center bg-[#F6F4EF] text-[#1E3A2F]">
         <Loader2 className="animate-spin" size={40} />
       </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F6F4EF] px-4 py-6 text-[#1C1A17] sm:px-6 lg:px-8 dark:bg-[#10130F] dark:text-[#F7F2E8]">
      <div className="mx-auto max-w-6xl">
      <section className="mb-5 overflow-hidden rounded-2xl border border-[#E2DDD4] bg-white shadow-[0_16px_42px_rgba(28,26,23,0.07)] dark:border-white/10 dark:bg-[#171B16]">
        <div className="grid gap-0 lg:grid-cols-[1fr_360px]">
          <div className="relative overflow-hidden bg-[#1E3A2F] p-5 text-white md:p-6 dark:bg-[#172319]">
            <div className="absolute right-8 top-6 h-20 w-20 rounded-full bg-white/8" />
            <div className="absolute bottom-5 right-20 h-12 w-12 rotate-6 rounded-xl bg-[#D4840A]/18" />
            <p className="relative inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-bold uppercase tracking-[0.22em] text-white/72">
              <Sparkles size={14} />
              {editModeId ? 'Course edit desk' : 'Creator upload wizard'}
            </p>
            <h1 className="relative mt-3 font-headline text-3xl font-semibold leading-tight">
              {editModeId ? 'Tune the learning journey.' : 'Convert a repo into a build course.'}
            </h1>
            <p className="relative mt-3 max-w-2xl text-sm leading-6 text-white/76">
              Pick a repository, choose the files that explain it, then let AI draft a course you can review before publishing.
            </p>
          </div>
          <div className="grid content-center gap-2 p-5 dark:bg-[#121711]">
            {[
              { label: 'Current step', value: `${currentStep}/${STEPS.length}` },
              { label: 'Repo', value: selectedRepo?.name || (editModeId ? 'Existing course' : 'Not selected') },
              { label: 'Milestones', value: aiGenerated.milestones?.length || 'Drafting' },
            ].map((item) => (
              <div key={item.label} className="rounded-xl border border-[#E2DDD4] bg-[#F6F4EF] p-3 dark:border-white/10 dark:bg-[#10130F]">
                <p className="text-[10px] font-bold uppercase tracking-widest text-[#9B9589] dark:text-[#8F9A8A]">{item.label}</p>
                <p className="mt-1 truncate font-headline text-xl font-semibold text-[#1E3A2F] dark:text-[#9DE6B8]">{item.value}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Step Indicator */}
      <div className="mb-5 rounded-2xl border border-[#E2DDD4] bg-white p-4 shadow-[0_12px_34px_rgba(28,26,23,0.05)] dark:border-white/10 dark:bg-[#171B16]">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-headline text-2xl font-semibold">{editModeId ? 'Edit course' : 'Upload course'}</h2>
          <span className="rounded-full bg-[#F0EDE6] px-3 py-1 text-xs font-bold text-[#5C5851] dark:bg-white/5 dark:text-[#B8C2B1]">Step {currentStep} of {STEPS.length}</span>
        </div>
        
        <div className="relative flex items-start justify-between gap-2 overflow-x-auto pb-5">
          <div className="absolute left-4 right-4 top-4 h-1 rounded-full bg-[#F0EDE6] dark:bg-[#10130F]" />
          <div 
            className="absolute left-4 top-4 h-1 rounded-full bg-[#1E3A2F] transition-all duration-300 dark:bg-[#7FC79C]" 
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
                className={`relative z-10 flex min-w-16 flex-col items-center gap-2 outline-none group ${isDisabledStr} ${!isClickable ? 'cursor-not-allowed' : 'cursor-pointer'}`}
              >
                <div className={`flex h-8 w-8 items-center justify-center rounded-full border text-sm font-bold transition-all duration-300 ${
                  isCurrent ? 'border-[#1E3A2F] bg-[#1E3A2F] text-white shadow-lg shadow-[#1E3A2F]/20 dark:border-[#7FC79C] dark:bg-[#2F6B49]' : 
                  isCompleted ? 'border-[#2A9D6F] bg-[#2A9D6F] text-white' : 
                  'border-[#E2DDD4] bg-white text-[#9B9589] dark:border-white/10 dark:bg-[#10130F]'
                }`}>
                  {isCompleted ? <CheckCircle2 size={14} /> : <step.icon size={14} />}
                </div>
                <span className={`text-[10px] whitespace-nowrap font-bold transition-colors ${
                  isCurrent ? 'text-[#1E3A2F] dark:text-[#9DE6B8]' : 
                  isCompleted ? 'text-[#5C5851] dark:text-[#B8C2B1]' : 
                  'text-[#9B9589] dark:text-[#8F9A8A]'
                }`}>
                  {step.title}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Step Content */}
      <div className="rounded-2xl border border-[#E2DDD4] bg-white p-5 shadow-[0_14px_38px_rgba(28,26,23,0.05)] transition-all dark:border-white/10 dark:bg-[#171B16] md:p-6">
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
        <div className="mt-5 flex items-center justify-between">
          <button
            onClick={prevStep}
            disabled={currentStep === 1 || (editModeId && currentStep === 6)}
            className="flex items-center gap-2 rounded-lg border border-[#E2DDD4] bg-white px-5 py-2.5 font-bold text-[#5C5851] shadow-sm transition-colors hover:bg-[#F0EDE6] disabled:opacity-30 dark:border-white/10 dark:bg-[#171B16] dark:text-[#B8C2B1] dark:hover:bg-white/5"
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
              className="flex items-center gap-2 rounded-lg bg-[#1E3A2F] px-5 py-2.5 font-bold text-white shadow-md shadow-[#1E3A2F]/20 transition-all hover:bg-[#2D5C42] disabled:opacity-50 dark:!bg-[#C8F7D4] dark:!text-[#08140D]"
            >
              Next <ChevronRight size={18} />
            </button>
          )}
        </div>
      )}
      </div>
    </div>
  );
}
