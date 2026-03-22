import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import useAuthStore from '../store/useAuthStore';
import { projectsExpressApi, githubApi } from '../api/express';
import {
  Github, Upload, FileText, Code, Sparkles, DollarSign, Shield,
  ChevronRight, ChevronLeft, Check, Loader2, X, FolderOpen, Eye
} from 'lucide-react';

const STEPS = [
  { id: 1, title: 'Connect GitHub', icon: Github },
  { id: 2, title: 'Select Repository', icon: FolderOpen },
  { id: 3, title: 'Upload README', icon: FileText },
  { id: 4, title: 'Select Files', icon: Code },
  { id: 5, title: 'AI Processing', icon: Sparkles },
  { id: 6, title: 'Review & Edit', icon: Eye },
  { id: 7, title: 'Set Pricing', icon: DollarSign },
  { id: 8, title: 'Terms & Submit', icon: Shield },
];

export default function UploadProject() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);

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
  });
  const [techInput, setTechInput] = useState('');
  const [agreedToTerms, setAgreedToTerms] = useState(false);

  useEffect(() => {
    if (!user || user.role !== 'seller') {
      navigate('/auth');
      return;
    }
    checkGitHubStatus();
  }, [user]);

  // Handle GitHub callback from URL
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get('code');
    if (code) {
      handleGitHubCallback(code);
      window.history.replaceState({}, '', '/seller/upload');
    }
  }, []);

  const checkGitHubStatus = async () => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_EXPRESS_API_URL || 'http://localhost:5000/api/v1'}/github/status`,
        { headers: { Authorization: `Bearer ${localStorage.getItem('authToken')}` } }
      );
      const data = await response.json();
      if (data.success && data.connected) {
        setGithubConnected(true);
        setGithubUsername(data.username);
        setCurrentStep(2);
      }
    } catch (e) { /* not connected yet */ }
  };

  const handleConnectGitHub = async () => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_EXPRESS_API_URL || 'http://localhost:5000/api/v1'}/github/connect`,
        { headers: { Authorization: `Bearer ${localStorage.getItem('authToken')}` } }
      );
      const data = await response.json();
      if (data.success) window.location.href = data.url;
    } catch (error) {
      console.error('Error connecting GitHub:', error);
    }
  };

  const handleGitHubCallback = async (code) => {
    setLoading(true);
    try {
      const response = await fetch(
        `${import.meta.env.VITE_EXPRESS_API_URL || 'http://localhost:5000/api/v1'}/github/callback`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${localStorage.getItem('authToken')}`
          },
          body: JSON.stringify({ code }),
        }
      );
      const data = await response.json();
      if (data.success) {
        setGithubConnected(true);
        setGithubUsername(data.githubUsername);
        setCurrentStep(2);
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
      const response = await fetch(
        `${import.meta.env.VITE_EXPRESS_API_URL || 'http://localhost:5000/api/v1'}/github/repositories`,
        { headers: { Authorization: `Bearer ${localStorage.getItem('authToken')}` } }
      );
      const data = await response.json();
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
      const response = await fetch(
        `${import.meta.env.VITE_EXPRESS_API_URL || 'http://localhost:5000/api/v1'}/github/repos/${owner}/${repoName}/files`,
        { headers: { Authorization: `Bearer ${localStorage.getItem('authToken')}` } }
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
          { headers: { Authorization: `Bearer ${localStorage.getItem('authToken')}` } }
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
      // 1. Fetch content for selected files if any
      const fileContents = [];
      const [owner, repoName] = selectedRepo.fullName.split('/');
      
      if (selectedFiles.length > 0) {
        for (const path of selectedFiles) {
          try {
            const resp = await fetch(
              `${import.meta.env.VITE_EXPRESS_API_URL || 'http://localhost:5000/api/v1'}/github/repos/${owner}/${repoName}/content?path=${path}`,
              { headers: { Authorization: `Bearer ${localStorage.getItem('authToken')}` } }
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

      // 2. Call AI Service via Express
      const aiResponse = await projectsExpressApi.generateAI({
        readme,
        files: fileContents,
        techStack: projectData.techStack,
      });

      if (aiResponse.success) {
        // Readme is now reliably inside the summary (overview) object if generated
        const finalReadme = aiResponse.summary?.readme || readme;
        const generatedSummary = aiResponse.summary?.summary || 'Project overview generated by AI.';

        setAiGenerated({
          summary: generatedSummary,
          description: finalReadme.substring(0, 500),
          milestones: aiResponse.milestones?.milestones || [],
        });

        // Try to set title from readme if not set
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
      // Fallback if AI is completely down
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
        thumbnail: { secure_url: projectData.thumbnailUrl },
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
          estimatedTime: m.estimatedTime,
          steps: m.steps && m.steps.length > 0 ? m.steps : [{ stepNumber: 1, title: m.title, description: m.description }],
        })),
        githubUrl: selectedRepo?.htmlUrl || '',
        reviewStatus: 'pending',
        submittedAt: new Date(),
      };

      await projectsExpressApi.upload(payload);
      navigate('/seller');
    } catch (error) {
      console.error('Error submitting project:', error);
    } finally {
      setLoading(false);
    }
  };

  const nextStep = () => setCurrentStep(prev => Math.min(prev + 1, 8));
  const prevStep = () => setCurrentStep(prev => Math.max(prev - 1, 1));

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="text-center py-12 space-y-6">
            <div className="w-20 h-20 bg-slate-100 dark:bg-white/5 rounded-2xl flex items-center justify-center mx-auto">
              <Github size={40} className="text-slate-600 dark:text-slate-300" />
            </div>
            <div>
              <h2 className="text-2xl font-bold mb-2">Connect Your GitHub Account</h2>
              <p className="text-slate-500 dark:text-slate-400 max-w-md mx-auto">
                We'll use your GitHub account to access your repositories and project files.
              </p>
            </div>
            {githubConnected ? (
              <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-emerald-500 font-medium inline-flex items-center gap-2">
                <Check size={20} /> Connected as @{githubUsername}
              </div>
            ) : (
              <button
                onClick={handleConnectGitHub}
                className="bg-slate-900 dark:bg-white dark:text-black text-white font-semibold py-3 px-8 rounded-xl inline-flex items-center gap-2 hover:opacity-90 transition-opacity"
              >
                <Github size={20} /> Connect GitHub
              </button>
            )}
          </div>
        );

      case 2:
        if (repos.length === 0 && !loading) fetchRepos();
        return (
          <div className="space-y-4">
            <h2 className="text-2xl font-bold mb-2">Select Repository</h2>
            <p className="text-slate-500 dark:text-slate-400 mb-6">Choose the project repository you want to upload.</p>
            {loading ? (
              <div className="flex items-center justify-center py-12"><Loader2 className="animate-spin text-indigo-500" size={32} /></div>
            ) : (
              <div className="space-y-2 max-h-[400px] overflow-y-auto pr-2">
                {repos.map(repo => (
                  <button
                    key={repo.id}
                    onClick={() => { handleRepoSelect(repo); nextStep(); }}
                    className={`w-full text-left p-4 rounded-xl border transition-colors ${
                      selectedRepo?.id === repo.id
                        ? 'border-indigo-500 bg-indigo-500/5'
                        : 'border-slate-200 dark:border-white/10 hover:bg-slate-50 dark:hover:bg-white/5'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-semibold">{repo.name}</h3>
                        <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">{repo.description || 'No description'}</p>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                        {repo.language && <span className="px-2 py-0.5 bg-slate-100 dark:bg-white/5 rounded">{repo.language}</span>}
                        {repo.private && <span className="px-2 py-0.5 bg-amber-500/10 text-amber-500 rounded">Private</span>}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        );

      case 3:
        return (
          <div className="space-y-4">
            <h2 className="text-2xl font-bold mb-2">Upload README</h2>
            <p className="text-slate-500 dark:text-slate-400 mb-4">
              {readme ? 'README auto-detected from your repository. You can edit it below.' : 'Paste your project README here. This is mandatory.'}
            </p>
            <textarea
              value={readme}
              onChange={(e) => setReadme(e.target.value)}
              rows={16}
              placeholder="# My Project\n\nDescription of your project..."
              className="w-full p-4 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl font-mono text-sm resize-none focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
            />
            {!readme && <p className="text-sm text-red-400">README is required to proceed.</p>}
          </div>
        );

      case 4:
        return (
          <div className="space-y-4">
            <h2 className="text-2xl font-bold mb-2">Select Main Files</h2>
            <p className="text-slate-500 dark:text-slate-400 mb-4">Select the key entry-point files (app.js, server.js, etc.) that AI will use for context.</p>
            {loading ? (
              <div className="flex items-center justify-center py-12"><Loader2 className="animate-spin text-indigo-500" size={32} /></div>
            ) : (
              <div className="space-y-1 max-h-[400px] overflow-y-auto pr-2">
                {repoFiles.map(file => (
                  <button
                    key={file.path}
                    onClick={() => toggleFileSelection(file)}
                    className={`w-full text-left p-3 rounded-lg border transition-colors flex items-center gap-3 ${
                      selectedFiles.includes(file.path)
                        ? 'border-indigo-500 bg-indigo-500/5'
                        : 'border-transparent hover:bg-slate-50 dark:hover:bg-white/5'
                    }`}
                  >
                    <Code size={16} className={selectedFiles.includes(file.path) ? 'text-indigo-500' : 'text-slate-400'} />
                    <span className="font-mono text-sm">{file.path}</span>
                    {selectedFiles.includes(file.path) && <Check size={16} className="text-indigo-500 ml-auto" />}
                  </button>
                ))}
                {repoFiles.length === 0 && (
                  <p className="text-slate-500 dark:text-slate-400 text-center py-8">No files found. You can skip this step.</p>
                )}
              </div>
            )}
          </div>
        );

      case 5:
        if (!loading && !aiGenerated.summary) handleAIProcessing();
        return (
          <div className="text-center py-16 space-y-6">
            <div className="relative w-24 h-24 mx-auto">
              <div className="absolute inset-0 bg-indigo-500/20 rounded-full animate-ping" />
              <div className="relative w-24 h-24 bg-indigo-500/10 rounded-full flex items-center justify-center">
                <Sparkles size={40} className="text-indigo-500 animate-pulse" />
              </div>
            </div>
            <h2 className="text-2xl font-bold">AI is Analyzing Your Project</h2>
            <p className="text-slate-500 dark:text-slate-400 max-w-md mx-auto">
              Generating milestones, summary, and description from your README and code files...
            </p>
            <Loader2 className="animate-spin text-indigo-500 mx-auto" size={24} />
          </div>
        );

      case 6:
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold">Review AI-Generated Content</h2>
            <p className="text-slate-500 dark:text-slate-400 mb-4">Edit the AI-generated content below. Click on any field to modify it.</p>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Project Title</label>
                <input
                  value={projectData.title}
                  onChange={(e) => setProjectData(prev => ({ ...prev, title: e.target.value }))}
                  className="w-full p-3 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Summary</label>
                <textarea
                  value={aiGenerated.summary}
                  onChange={(e) => setAiGenerated(prev => ({ ...prev, summary: e.target.value }))}
                  rows={3}
                  className="w-full p-3 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Milestones</label>
                <div className="space-y-2">
                  {aiGenerated.milestones.map((m, idx) => (
                    <div key={idx} className="p-4 bg-slate-50 dark:bg-white/5 rounded-xl border border-slate-200 dark:border-white/10">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="w-7 h-7 bg-indigo-500 text-white rounded-full flex items-center justify-center text-xs font-bold">{idx + 1}</span>
                        <input
                          value={m.title}
                          onChange={(e) => {
                            const updated = [...aiGenerated.milestones];
                            updated[idx].title = e.target.value;
                            setAiGenerated(prev => ({ ...prev, milestones: updated }));
                          }}
                          className="flex-1 bg-transparent font-semibold focus:outline-none"
                        />
                      </div>
                      <input
                        value={m.description}
                        onChange={(e) => {
                          const updated = [...aiGenerated.milestones];
                          updated[idx].description = e.target.value;
                          setAiGenerated(prev => ({ ...prev, milestones: updated }));
                        }}
                        className="w-full bg-transparent text-sm text-slate-500 dark:text-slate-400 focus:outline-none mt-1 pl-9"
                      />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        );

      case 7:
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold">Set Pricing & Details</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Badge Tier</label>
                <select
                  value={projectData.badge}
                  onChange={(e) => setProjectData(prev => ({ ...prev, badge: e.target.value }))}
                  className="w-full p-3 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                >
                  <option value="silver">🥈 Silver (₹99-₹299)</option>
                  <option value="gold">🥇 Gold (₹499-₹999)</option>
                  <option value="diamond">💎 Diamond (₹1499-₹3999)</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Price (₹)</label>
                <input
                  type="number"
                  value={projectData.price}
                  onChange={(e) => setProjectData(prev => ({ ...prev, price: parseInt(e.target.value) || 0 }))}
                  className="w-full p-3 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Category</label>
                <select
                  value={projectData.category}
                  onChange={(e) => setProjectData(prev => ({ ...prev, category: e.target.value }))}
                  className="w-full p-3 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                >
                  <option value="all">All</option>
                  <option value="trending">🔥 Trending in Market</option>
                  <option value="hackathon">🏆 Hackathon Critic</option>
                  <option value="last-minute">⚡ Last Minute Helpers</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Download Link</label>
                <input
                  required
                  value={projectData.downloadLink}
                  onChange={(e) => setProjectData(prev => ({ ...prev, downloadLink: e.target.value }))}
                  placeholder="GitHub URL or Google Drive link"
                  className="w-full p-3 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium mb-1">Thumbnail Image URL <span className="text-slate-500 font-normal">(Optional)</span></label>
                <input
                  value={projectData.thumbnailUrl}
                  onChange={(e) => setProjectData(prev => ({ ...prev, thumbnailUrl: e.target.value }))}
                  placeholder="https://imgur.com/... or via Unsplash"
                  className="w-full p-3 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Tech Stack</label>
              <div className="flex gap-2 mb-2">
                <input
                  value={techInput}
                  onChange={(e) => setTechInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addTech())}
                  placeholder="e.g. React, Node.js, MongoDB"
                  className="flex-1 p-3 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                />
                <button onClick={addTech} className="px-4 py-3 bg-indigo-600 text-white rounded-xl font-medium hover:bg-indigo-700 transition-colors">Add</button>
              </div>
              <div className="flex flex-wrap gap-2">
                {projectData.techStack.map(tech => (
                  <span key={tech} className="px-3 py-1.5 bg-indigo-500/10 text-indigo-500 rounded-lg text-sm font-medium flex items-center gap-1.5">
                    {tech}
                    <button onClick={() => removeTech(tech)} className="hover:text-red-400"><X size={14} /></button>
                  </span>
                ))}
              </div>
            </div>
          </div>
        );

      case 8:
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold">Terms & Submit</h2>

            <div className="p-6 bg-slate-50 dark:bg-white/5 rounded-2xl border border-slate-200 dark:border-white/10 space-y-4">
              <h3 className="font-bold text-lg">Seller Agreement</h3>
              <ul className="space-y-2 text-sm text-slate-600 dark:text-slate-400">
                <li className="flex items-start gap-2"><Check size={16} className="text-emerald-500 mt-0.5 shrink-0" /> BrainBazaar charges a <strong className="text-white">20% platform fee</strong> on each sale</li>
                <li className="flex items-start gap-2"><Check size={16} className="text-emerald-500 mt-0.5 shrink-0" /> You retain 80% of all revenue from your project sales</li>
                <li className="flex items-start gap-2"><Check size={16} className="text-emerald-500 mt-0.5 shrink-0" /> Your project will be reviewed by our team before publishing</li>
                <li className="flex items-start gap-2"><Check size={16} className="text-emerald-500 mt-0.5 shrink-0" /> You certify that this is your original work or you have rights to sell it</li>
                <li className="flex items-start gap-2"><Check size={16} className="text-emerald-500 mt-0.5 shrink-0" /> Payouts are processed monthly to your connected payment account</li>
              </ul>
            </div>

            <label className="flex items-center gap-3 cursor-pointer p-4 rounded-xl border border-slate-200 dark:border-white/10 hover:bg-slate-50 dark:hover:bg-white/5 transition-colors">
              <input
                type="checkbox"
                checked={agreedToTerms}
                onChange={(e) => setAgreedToTerms(e.target.checked)}
                className="w-5 h-5 rounded text-indigo-600 focus:ring-indigo-500"
              />
              <span className="text-sm font-medium">I agree to the BrainBazaar Seller Terms & Conditions (20% platform fee)</span>
            </label>

            <button
              onClick={handleSubmit}
              disabled={!agreedToTerms || loading}
              className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-4 px-8 rounded-xl flex items-center justify-center gap-2 transition-colors text-lg"
            >
              {loading ? <Loader2 className="animate-spin" size={20} /> : <Upload size={20} />}
              Submit for Review
            </button>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="p-8 max-w-4xl mx-auto">
      {/* Step Indicator */}
      <div className="mb-10">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-black">Upload Project</h1>
          <span className="text-sm text-slate-500 dark:text-slate-400">Step {currentStep} of {STEPS.length}</span>
        </div>
        <div className="flex items-center gap-1">
          {STEPS.map((step, idx) => (
            <div key={step.id} className="flex-1 flex items-center">
              <div className={`h-1.5 w-full rounded-full transition-colors ${
                idx + 1 <= currentStep ? 'bg-indigo-500' : 'bg-slate-200 dark:bg-white/10'
              }`} />
            </div>
          ))}
        </div>
        <div className="flex justify-between mt-2">
          {STEPS.map(step => (
            <span key={step.id} className={`text-[10px] font-medium ${
              step.id <= currentStep ? 'text-indigo-500' : 'text-slate-400'
            }`}>
              {step.title}
            </span>
          ))}
        </div>
      </div>

      {/* Step Content */}
      <div className="bg-white dark:bg-[#1a1a1a] border border-slate-200 dark:border-white/10 rounded-2xl p-8 min-h-[400px]">
        {renderStep()}
      </div>

      {/* Navigation */}
      {currentStep !== 5 && (
        <div className="flex items-center justify-between mt-6">
          <button
            onClick={prevStep}
            disabled={currentStep === 1}
            className="px-6 py-3 border border-slate-200 dark:border-white/10 rounded-xl font-medium disabled:opacity-30 hover:bg-slate-50 dark:hover:bg-white/5 transition-colors flex items-center gap-2"
          >
            <ChevronLeft size={18} /> Back
          </button>
          {currentStep < 8 && (
            <button
              onClick={nextStep}
              disabled={(currentStep === 3 && !readme) || (currentStep === 1 && !githubConnected)}
              className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white rounded-xl font-medium transition-colors flex items-center gap-2"
            >
              Next <ChevronRight size={18} />
            </button>
          )}
        </div>
      )}
    </div>
  );
}
