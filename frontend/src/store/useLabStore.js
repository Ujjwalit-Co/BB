import { create } from 'zustand';
import { AIResponse } from '../services/aiModels';
import { projectsApi, milestonesApi } from '../api/fastapi';
import { purchaseApi, creditsApi, progressApi, projectsExpressApi } from '../api/express';

/**
 * Get auth token from Zustand store (single source of truth)
 */
function getAuthToken() {
  try {
    const authStorage = localStorage.getItem('auth-storage');
    if (authStorage) {
      const parsed = JSON.parse(authStorage);
      const token = parsed.state?.token || parsed.token;
      
      // Verify token is a non-empty string
      if (token && typeof token === 'string' && token.trim().length > 0) {
        return token;
      }
    }
  } catch (e) {
    console.error('Error getting auth token:', e);
  }
  return null;
}

/**
 * Get user from Zustand store
 */
function getAuthUser() {
  try {
    const authStorage = localStorage.getItem('auth-storage');
    if (authStorage) {
      const parsed = JSON.parse(authStorage);
      return parsed.state?.user || parsed.user || null;
    }
  } catch (e) {
    console.error('Error getting auth user:', e);
  }
  return null;
}







let fileCounter = 10;

const useLabStore = create((set, get) => ({
  // Project Metadata
  projectId: null,
  projectName: '',
  projectData: null,  // Full project metadata including milestones

  // File System
  files: [],
  openTabs: [],
  activeFileId: null,

  // PBL Milestones
  milestones: [],
  currentMilestoneId: null,

  // Economy & AI State
  credits: 0,
  isAiThinking: false,
  isLabLoading: false,
  loadingProgress: 0,
  loadingStatus: '',
  messageInfo: {
    used: 0,
    limit: 10,
    remaining: 10,
    canSendWithoutCredits: true,
  },

  // UI State
  leftSidebarOpen: true,
  rightSidebarOpen: true,
  bottomPanelOpen: true,
  bottomPanelTab: 'console',
  quizOpen: false,
  profileMenuOpen: false,
  saveFlash: false, // true briefly after save
  newFileDialogOpen: false,
  fileToDelete: null, // id of file to delete (shows modal)
  livePreviewHtml: '', // only updates on Run or Save
  insufficientCreditsError: false, // shown when credits < 2
  creditModalOpen: false,
  confirmationModalOpen: false,
  milestoneCompletedModalOpen: false,
  pendingUnlock: null, // { projectId, milestoneId }
  requiredCredits: 0,
  showOnboarding: false,
  userEnvironment: null,
  isPurchased: false, // Whether user has purchased this project
  currentQuiz: null, // Current quiz data
  isSandbox: false, // Sandbox mode flag
  questionsRemaining: null, // Track remaining free questions

  // Console
  consoleContext: {}, // Persistent context for variables across commands
  isPyodideLoading: false, // Pyodide loading state
  pyodide: null, // Pyodide instance

  // AI Chat
  aiMessages: [],
  aiSuggestion: null,
  aiInput: '',

  // --- ACTIONS ---

  startSandbox: () => {
    const initialFiles = [{
      id: 'f1',
      name: 'index.html',
      language: 'html',
      isDirty: false,
      status: 'clean',
      content: `<!DOCTYPE html>\n<html lang="en">\n<head>\n  <meta charset="UTF-8">\n  <meta name="viewport" content="width=device-width, initial-scale=1.0">\n  <title>Sandbox</title>\n  <link rel="stylesheet" href="style.css">\n</head>\n<body>\n  <div id="app">\n    <h1>Hello Sandbox</h1>\n    <p>Start coding with AI assistance.</p>\n  </div>\n  <script src="script.js"></script>\n</body>\n</html>`,
    }, {
      id: 'f2',
      name: 'style.css',
      language: 'css',
      isDirty: false,
      status: 'clean',
      content: `body {\n  font-family: sans-serif;\n  display: flex;\n  justify-content: center;\n  align-items: center;\n  height: 100vh;\n  margin: 0;\n  background: #f0f0f0;\n}\n\n#app {\n  background: white;\n  padding: 2rem;\n  border-radius: 8px;\n  box-shadow: 0 4px 6px rgba(0,0,0,0.1);\n  text-align: center;\n}`,
    }, {
      id: 'f3',
      name: 'script.js',
      language: 'javascript',
      isDirty: false,
      status: 'clean',
      content: `console.log("Sandbox initialized.");`,
    }];

    set({
      projectId: 'sandbox',
      projectName: 'Sandbox Workspace',
      projectData: null,
      files: initialFiles,
      milestones: [],
      currentMilestoneId: null,
      openTabs: ['f1', 'f2', 'f3'],
      activeFileId: 'f1',
      isSandbox: true,
      consoleMode: 'javascript',
      pythonLogs: [],
      jsLogs: [],
      aiMessages: [{
        role: 'ai',
        content: `Welcome to the Sandbox! Here you can experiment freely. Every question asked here will consume **2 credits** as there are no free milestone limits.`
      }],
      aiSuggestion: null,
      leftSidebarOpen: true,
      rightSidebarOpen: true,
      bottomPanelOpen: true,
      bottomPanelTab: 'preview',
      livePreviewHtml: '',
      isLabLoading: false,
    });
    get().saveProject(); // Trigger initial compile
  },

  setAiInput: (input) => set({ aiInput: input }),

  setCredits: (amount) => set({ credits: amount }),

  setUserEnvironment: (env) => {
    set({ userEnvironment: env, showOnboarding: false });
    localStorage.setItem('userEnvironment', JSON.stringify(env));
  },

  resetOnboarding: () => {
    localStorage.removeItem('userEnvironment');
    set({ userEnvironment: null, showOnboarding: true });
  },



  /**
   * Load a real project from FastAPI backend
   * @param {string} projectId - The project ID from FastAPI
   * @param {boolean} isPurchased - Whether the user has purchased this project
   */
  loadRealProject: async (projectId, isPurchased = false) => {
    if (!projectId) {
      console.error('[loadRealProject] No projectId provided');
      set({
        isLabLoading: false,
        aiMessages: [
          {
            role: 'ai',
            content: 'Error: No project ID provided. Please navigate to a project first.',
          },
        ],
      });
      return;
    }

    set({ isLabLoading: true, loadingStatus: 'Loading project...', loadingProgress: 10 });

    try {
      // Fetch project data from Express API (MongoDB)
      // Use plain fetch to avoid any interceptor issues with auth tokens
      const EXPRESS_API_URL = import.meta.env.VITE_EXPRESS_API_URL || 'http://localhost:5000/api/v1';
      const url = `${EXPRESS_API_URL}/projects/${projectId}`;

      console.log(`[loadRealProject] Fetching from: ${url}`);

      const fetchResponse = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          // Only add auth header if we have a valid token
          ...(getAuthToken() ? { 'Authorization': `Bearer ${getAuthToken()}` } : {}),
        },
        credentials: 'include', // Include cookies if any
      });

      if (!fetchResponse.ok) {
        throw new Error(`API Error: ${fetchResponse.status} ${fetchResponse.statusText}`);
      }

      const response = await fetchResponse.json();
      const projectData = response.project || response;

      set({ loadingProgress: 30, loadingStatus: 'Preparing code files...' });

      // Transform project milestones to Lab format
      const labMilestones = (projectData.milestones || []).map((m, idx) => {
        const steps = m.steps?.map((s, sIdx) => ({
          id: `m${idx + 1}-s${s.stepNumber || sIdx + 1}`,
          title: s.title,
          description: s.description,
          status: idx === 0 && sIdx === 0 ? 'active' : 'locked',
          codeBlocks: s.codeBlocks || [],
          verificationSteps: s.verificationSteps,
          hints: s.hints,
        })) || [];

        // Inject Assessment step if not present
        if (!steps.some(s => s.title.toLowerCase().includes('assessment'))) {
          steps.push({
            id: `m${idx + 1}-assessment`,
            title: 'Milestone Assessment',
            description: 'Complete the assessment to verify your knowledge and unlock the next milestone.',
            status: 'locked',
          });
        }

        return {
          id: `m${idx + 1}`,
          title: m.title || m.name || `Milestone ${idx + 1}`,
          description: m.description,
          status: idx === 0 ? 'active' : 'locked',
          steps,
          quiz: m.quiz, // Store quiz data inside the milestone for easier access
        };
      });

      set({ loadingProgress: 60, loadingStatus: 'Initializing environment...' });

      // Preload Pyodide
      try {
        const { loadPyodide: loadPyo } = await import('pyodide');
        const pyodideInstance = await loadPyo({
          indexURL: 'https://cdn.jsdelivr.net/pyodide/v0.29.3/full/',
        });
        set({ pyodide: pyodideInstance });
      } catch (error) {
        console.error('Failed to preload Pyodide:', error);
      }

      set({ loadingProgress: 85, loadingStatus: 'Setting up workspace...' });

      // Build editor files from the project's stored codeFiles
      const extLangMap = { js: 'javascript', jsx: 'javascript', ts: 'typescript', tsx: 'typescript', html: 'html', css: 'css', json: 'json', md: 'markdown', py: 'python' };
      let initialFiles = [];

      // For Project-Based Learning, we start from scratch with only a README
      initialFiles = [{
        id: 'f1',
        name: 'README.md',
        language: 'markdown',
        isDirty: false,
        status: 'clean',
        content: `# ${projectData.title}\n\n${projectData.description || ''}\n\n${projectData.readme || ''}\n\n---\n**Goal:** Follow the milestones and instructions to build this project.`,
      }];

      const savedEnv = localStorage.getItem('userEnvironment');
      const userEnvironment = savedEnv ? JSON.parse(savedEnv) : null;

      // Get credits from auth store
      let creditsFromAuth = 0;
      try {
        const authData = JSON.parse(localStorage.getItem('auth-storage'));
        creditsFromAuth = authData?.state?.user?.credits || 0;
      } catch (e) {}

      // Load user progress to get message limits
      let messageInfo = { used: 0, limit: 10, remaining: 10, canSendWithoutCredits: true };
      try {
        const { default: axios } = await import('axios');
        const EXPRESS_API_URL = import.meta.env.VITE_EXPRESS_API_URL || 'http://localhost:5000/api/v1';
        const token = getAuthToken();
        
        if (token) {
          const { data: progressData } = await axios.get(`${EXPRESS_API_URL}/users/${authData?.state?.user?._id}/progress/${projectData._id || projectData.id}`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          
          if (progressData.success && progressData.messageInfo) {
            messageInfo = progressData.messageInfo;
          }
        }
      } catch (err) {
        console.log('No progress found, using default message limits');
      }

      set({
        projectId: projectData._id || projectData.id,
        projectName: projectData.title,
        projectData: projectData, // Store full context to avoid 404s in AI chat
        files: initialFiles,
        milestones: labMilestones,
        currentMilestoneId: labMilestones[0]?.id || null,
        openTabs: [initialFiles[0].id],
        activeFileId: initialFiles[0].id,
        credits: creditsFromAuth,
        messageInfo,
        consoleMode: 'javascript',
        pythonLogs: [],
        jsLogs: [],
        aiMessages: [
          {
            role: 'ai',
            content: `Welcome to **${projectData.title}**! I'll guide you through building this project step by step. ${labMilestones.length > 0 ? "Let's start with Milestone 1." : "Explore the code files on the left sidebar."}`,
          },
        ],
        aiSuggestion: null,
        leftSidebarOpen: true,
        rightSidebarOpen: true,
        bottomPanelOpen: true,
        bottomPanelTab: 'console',
        quizOpen: false,
        profileMenuOpen: false,
        saveFlash: false,
        newFileDialogOpen: false,
        fileToDelete: null,
        livePreviewHtml: '',
        insufficientCreditsError: false,
        isPurchased,
        isSandbox: false,
        isLabLoading: false,
        loadingProgress: 100,
        userEnvironment,
        showOnboarding: !userEnvironment,
      });
    } catch (error) {
      console.error('Failed to load project:', error);
      
      let errorMessage = error.message;
      if (error.response?.status === 404) {
        errorMessage = `Project not found (ID: ${projectId}). It may have been deleted or the ID is invalid.`;
      } else if (error.response?.status === 500) {
        errorMessage = 'Server error loading project. Please try again later.';
      } else if (!error.response) {
        errorMessage = 'Network error: Could not connect to backend. Is the server running?';
      }

      console.error(`[loadRealProject Error] ${errorMessage}`);

      set({
        isLabLoading: false,
        loadingProgress: 0,
        aiMessages: [
          {
            role: 'ai',
            content: `❌ Error loading project: ${errorMessage}`,
          },
        ],
      });
    }
  },

  loadProjectData: (projectData) => set({
    projectId: projectData.id,
    projectName: projectData.name,
    files: projectData.files || [],
    milestones: projectData.milestones || [],
    currentMilestoneId: projectData.milestones?.[0]?.id || null,
    openTabs: projectData.files?.[0] ? [projectData.files[0].id] : [],
    activeFileId: projectData.files?.[0]?.id || null,
  }),

  // File Operations
  updateFileContent: (id, newContent) => set((state) => ({
    files: state.files.map(f =>
      f.id === id ? { ...f, content: newContent, isDirty: true, status: 'unsaved' } : f
    )
  })),

  createFile: (filename, content = '') => {
    if (!filename || !filename.trim()) return;
    const name = filename.trim();
    const { files, openTabs } = get();
    // Prevent duplicates
    if (files.some(f => f.name === name)) return;

    const ext = name.split('.').pop()?.toLowerCase();
    const langMap = { js: 'javascript', jsx: 'javascript', ts: 'typescript', tsx: 'typescript', html: 'html', css: 'css', json: 'json', md: 'markdown', py: 'python' };
    const newId = `f_${++fileCounter}_${Date.now()}`;
    const newFile = {
      id: newId,
      name,
      language: langMap[ext] || 'text',
      isDirty: false,
      status: content ? 'unsaved' : 'clean',
      content: content,
    };

    set({
      files: [...files, newFile],
      openTabs: [...openTabs, newId],
      activeFileId: newId,
      newFileDialogOpen: false,
    });
  },

  openFile: (id) => set((state) => {
    const tabs = state.openTabs.includes(id) ? state.openTabs : [...state.openTabs, id];
    return { openTabs: tabs, activeFileId: id };
  }),

  renameFile: (id, newName) => set((state) => {
    if (!newName || !newName.trim()) return state;
    const name = newName.trim();
    if (state.files.some(f => f.name === name && f.id !== id)) return state;
    
    const ext = name.split('.').pop()?.toLowerCase();
    const langMap = { js: 'javascript', jsx: 'javascript', ts: 'typescript', tsx: 'typescript', html: 'html', css: 'css', json: 'json', md: 'markdown', py: 'python' };
    
    return {
      files: state.files.map(f => f.id === id ? { ...f, name, language: langMap[ext] || f.language } : f)
    };
  }),

  setFileToDelete: (id) => set({ fileToDelete: id }),

  deleteFile: (id) => set((state) => {
    const newFiles = state.files.filter(f => f.id !== id);
    const newTabs = state.openTabs.filter(tabId => tabId !== id);
    const newActiveId = state.activeFileId === id
      ? (newTabs.length > 0 ? newTabs[newTabs.length - 1] : null)
      : state.activeFileId;
    return { files: newFiles, openTabs: newTabs, activeFileId: newActiveId, fileToDelete: null };
  }),

  closeTab: (id) => set((state) => {
    const newTabs = state.openTabs.filter(tabId => tabId !== id);
    const newActiveId = state.activeFileId === id
      ? (newTabs.length > 0 ? newTabs[newTabs.length - 1] : null)
      : state.activeFileId;
    return { openTabs: newTabs, activeFileId: newActiveId };
  }),

  // Save — marks all dirty files as clean, flashes checkmark, and updates preview
  saveProject: () => {
    const state = get();
    // Re-compile HTML to livePreviewHtml on save
    const newPreviewHtml = state.compilePreviewHtml(state);

    set((s) => ({
      files: s.files.map(f => f.status === 'unsaved' ? { ...f, isDirty: false, status: 'clean' } : f),
      saveFlash: true,
      livePreviewHtml: newPreviewHtml
    }));
    // Reset flash after animation
    setTimeout(() => set({ saveFlash: false }), 1500);
  },

  // UI Toggles
  toggleLeftSidebar: () => set((s) => ({ leftSidebarOpen: !s.leftSidebarOpen })),
  toggleRightSidebar: () => set((s) => ({ rightSidebarOpen: !s.rightSidebarOpen })),
  toggleBottomPanel: () => set((s) => ({ bottomPanelOpen: !s.bottomPanelOpen })),
  setBottomPanelOpen: (open) => set({ bottomPanelOpen: open }),
  setBottomPanelTab: (tab) => set({ bottomPanelTab: tab }),
  toggleProfileMenu: () => set((s) => ({ profileMenuOpen: !s.profileMenuOpen })),
  closeProfileMenu: () => set({ profileMenuOpen: false }),
  toggleNewFileDialog: () => set((s) => ({ newFileDialogOpen: !s.newFileDialogOpen })),

  // Console
  consoleMode: 'javascript', // 'python' | 'javascript' - tracks which runtime is active
  pythonLogs: [],
  jsLogs: [],

  addConsoleLog: (text, type = 'log', mode = null) => set((s) => {
    // If mode is specified, use that log array; otherwise use current mode
    const targetMode = mode || s.consoleMode;
    const logEntry = {
      type,
      text,
      timestamp: new Date().toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' })
    };
    
    if (targetMode === 'python') {
      return { pythonLogs: [...s.pythonLogs, logEntry] };
    } else {
      return { jsLogs: [...s.jsLogs, logEntry] };
    }
  }),

  clearConsoleLogs: () => set((s) => ({
    pythonLogs: [],
    jsLogs: []
  })),

  setConsoleMode: (mode) => set({ consoleMode: mode }),

  loadPyodide: async () => {
    const state = get();
    // Return immediately if already loaded or loading
    if (state.pyodide) {
      console.log('[Pyodide] Already loaded from preload');
      return state.pyodide;
    }
    if (state.isPyodideLoading) {
      console.log('[Pyodide] Already loading...');
      return null;
    }

    set({ isPyodideLoading: true });
    get().addConsoleLog('Loading Pyodide (Python runtime)...', 'info');

    try {
      // Dynamically import pyodide from node_modules
      const { loadPyodide: loadPyo } = await import('pyodide');
      const pyodideInstance = await loadPyo({
        // Use the local pyodide package from node_modules
        indexURL: '/pyodide/',
      });

      set({ pyodide: pyodideInstance, isPyodideLoading: false });
      get().addConsoleLog('Python runtime loaded!', 'success');
      return pyodideInstance;
    } catch (error) {
      set({ isPyodideLoading: false });
      get().addConsoleLog(`Failed to load Pyodide: ${error.message}`, 'error');
      throw error;
    }
  },

  runPythonCode: async (code) => {
    const state = get();
    let pyodideInstance = state.pyodide;

    // Load Pyodide if not already loaded
    if (!pyodideInstance) {
      pyodideInstance = await get().loadPyodide();
    }

    if (!pyodideInstance) {
      get().addConsoleLog('Pyodide not loaded', 'error');
      return;
    }

    // Set up stdout capture for print() statements
    pyodideInstance.setStdout({
      batched: (output) => {
        get().addConsoleLog(output, 'log');
      },
    });

    try {
      // Run the Python code
      const result = await pyodideInstance.runPythonAsync(code);
      
      // If there's a return value, display it
      if (result !== undefined && result !== null) {
        const resultType = typeof result;
        if (resultType !== 'function') {
          get().addConsoleLog(String(result), 'log');
        }
      }
      return result;
    } catch (error) {
      get().addConsoleLog(error.message, 'error');
      throw error;
    }
  },

  runConsoleCommand: (command) => {
    // Execute JavaScript in global scope - variables persist naturally
    try {
      // Use direct eval which executes in the caller's scope
      // This means variables declared with var will be global
      // eslint-disable-next-line no-eval
      return eval(command);
    } catch (error) {
      throw error;
    }
  },

  // Run "code" — compiles preview + console output
  runCode: () => {
    const { addConsoleLog, setBottomPanelTab, compilePreviewHtml } = get();
    set({ bottomPanelOpen: true, pythonLogs: [], jsLogs: [] });
    setBottomPanelTab('console');
    addConsoleLog('Compiling project...', 'info');

    setTimeout(() => {
      const newPreviewHtml = compilePreviewHtml(get());
      set({ livePreviewHtml: newPreviewHtml });
      addConsoleLog('Server started on http://localhost:3000', 'success');
      addConsoleLog('Build completed in 143ms', 'success');
      setTimeout(() => setBottomPanelTab('preview'), 600);
    }, 600);
  },

  // Smart Run - runs current file based on type
  smartRun: async () => {
    const state = get();
    const activeFile = state.getActiveFile();

    if (!activeFile) {
      state.addConsoleLog('No file selected. Open a file to run.', 'warning');
      return;
    }

    const { addConsoleLog, setBottomPanelTab, setBottomPanelOpen, runPythonCode, runCode, setConsoleMode } = state;

    // Open console/preview panel
    setBottomPanelOpen(true);

    // Python files - run in Python console
    if (activeFile.language === 'python' || activeFile.name.endsWith('.py')) {
      setBottomPanelTab('console');
      setConsoleMode('python');
      try {
        await runPythonCode(activeFile.content);
      } catch (error) {
        addConsoleLog(`Python error: ${error.message}`, 'error', 'python');
      }
    }
    // JavaScript/TypeScript files - run in JS console
    else if (['javascript', 'typescript'].includes(activeFile.language) ||
             activeFile.name.endsWith('.js') || activeFile.name.endsWith('.ts') ||
             activeFile.name.endsWith('.jsx') || activeFile.name.endsWith('.tsx')) {
      setBottomPanelTab('console');
      setConsoleMode('javascript');
      try {
        // Capture console methods
        const originalLog = console.log;
        const originalWarn = console.warn;
        const originalError = console.error;

        console.log = (...args) => addConsoleLog(args.join(' '), 'log', 'javascript');
        console.warn = (...args) => addConsoleLog(args.join(' '), 'warning', 'javascript');
        console.error = (...args) => addConsoleLog(args.join(' '), 'error', 'javascript');

        // Transform and execute JS/TS code
        const transformed = activeFile.content
          .replace(/^\s*import\s+.*?;/gm, '') // Remove ES6 imports
          .replace(/^\s*export\s+(default\s+)?/gm, '') // Remove exports
          .replace(/^\s*let\s+/gm, 'var ')
          .replace(/^\s*const\s+/gm, 'var ');

        // eslint-disable-next-line no-eval
        const result = eval(transformed);

        // Restore console methods
        console.log = originalLog;
        console.warn = originalWarn;
        console.error = originalError;

        // Log return value if any
        if (result !== undefined) {
          addConsoleLog(String(result), 'log', 'javascript');
        }
      } catch (error) {
        addConsoleLog(error.message, 'error', 'javascript');
      }
    }
    // HTML/CSS files - run full project preview
    else if (activeFile.language === 'html' || activeFile.language === 'css' ||
             activeFile.name.endsWith('.html') || activeFile.name.endsWith('.css')) {
      runCode();
    }
    // Unknown file type
    else {
      setBottomPanelTab('console');
      addConsoleLog('File type not supported for execution.', 'warning');
    }
  },

  // AI Operations
  setAiThinking: (status) => set({ isAiThinking: status }),
  deductCredit: async (amount = 2) => {
    try {
      const token = getAuthToken();
      if (!token) return;

      const EXPRESS_API_URL = import.meta.env.VITE_EXPRESS_API_URL || 'http://localhost:5000/api/v1';
      const { data } = await import('axios').then(m => m.default.post(`${EXPRESS_API_URL}/credits/consume`,
        { amount },
        { headers: { Authorization: `Bearer ${token}` } }
      ));
      
      if (data.success) {
        set({ credits: data.credits });
        // Also update useAuthStore user if possible, or just rely on this
      }
    } catch (error) {
      console.error('Failed to deduct credits:', error);
      // Fallback to local deduction if needed, or just let it be
      set((state) => ({ credits: Math.max(0, state.credits - amount) }));
    }
  },
  toggleCreditModal: (open, cost = 0) => set({ creditModalOpen: open, requiredCredits: cost }),
  setConfirmationModalOpen: (open) => set({ confirmationModalOpen: open }),
  setPendingUnlock: (data) => set({ pendingUnlock: data }),

  unlockMilestone: async (projectId, milestoneId) => {
    // Try to get latest credits from auth-storage first for more accuracy
    let currentCredits = get().credits;
    try {
      const authData = JSON.parse(localStorage.getItem('auth-storage'));
      if (authData?.state?.user?.credits !== undefined) {
        currentCredits = authData.state.user.credits;
      }
    } catch (e) {}

    if (currentCredits < 70) {
      set({ creditModalOpen: true, requiredCredits: 70 });
      return false;
    }

    // If enough credits, show confirmation modal
    set({ 
      confirmationModalOpen: true, 
      pendingUnlock: { projectId, milestoneId } 
    });
    return false; // Success will be handled in confirmUnlock
  },

  confirmUnlock: async () => {
    const { pendingUnlock, setConfirmationModalOpen } = get();
    if (!pendingUnlock) return false;

    const { projectId, milestoneId } = pendingUnlock;
    set({ confirmationModalOpen: false });

    try {
      const token = getAuthToken();
      if (!token) {
        alert("Authentication token missing. Please log in again.");
        return false;
      }

      const { data } = await import('axios').then(m => m.default.post(`${import.meta.env.VITE_BACKEND_URL}/user/unlock-milestone`,
        { projectId, milestoneId },
        { headers: { Authorization: `Bearer ${token}` } }
      ));

      if (data.success) {
        const { milestones } = get();
        const updatedMilestones = milestones.map(m => 
          m.id === milestoneId ? { ...m, status: 'active' } : m
        );
        
        set({ 
          credits: data.credits, 
          milestones: updatedMilestones 
        });

        // Sync with useAuthStore correctly
        try {
          const { default: useAuthStore } = await import('./useAuthStore');
          const authState = useAuthStore.getState();
          if (authState.user) {
            authState.setUser({
              ...authState.user,
              credits: data.credits,
              unlockedMilestones: data.unlockedMilestones
            });
          }
        } catch (e) {
          console.error("Failed to sync auth store via state", e);
        }
        
        return true;
      }
    } catch (error) {
      console.error('Failed to unlock milestone:', error);
      const message = error.response?.data?.message || 'Failed to unlock milestone';
      alert(message);
      return false;
    }
  },

  setCurrentMilestone: (id) => set({ currentMilestoneId: id }),
  setInsufficientCreditsError: (show) => set({ insufficientCreditsError: show }),

  /**
   * Send a message to AI and get response from FastAPI backend via Express proxy
   */
  addAiUserMessage: async (content) => {
    const { setAiThinking, setInsufficientCreditsError, projectId, currentMilestoneId, files, isSandbox, messageInfo } = get();

    // Basic credit check before we even try (Express will enforce strictly)
    const { credits } = get();
    if (credits < 2 && isSandbox) {
      setInsufficientCreditsError(true);
      setTimeout(() => setInsufficientCreditsError(false), 3000);
      return;
    }

    // Check message limits
    if (!messageInfo.canSendWithoutCredits && credits < 2 && !isSandbox) {
      setInsufficientCreditsError(true);
      setTimeout(() => setInsufficientCreditsError(false), 3000);
      return;
    }

    // Add user message immediately
    set((s) => ({
      aiMessages: [...s.aiMessages, { role: 'user', content }]
    }));
    setAiThinking(true);

    try {
      // Extract milestone index from currentMilestoneId (e.g., 'm1' -> 0, 'm2' -> 1)
      const milestoneIndex = currentMilestoneId ? parseInt(currentMilestoneId.replace('m', '')) - 1 : 0;

      // Basic mapping to strip out large unnecessary UI state elements from files
      const cleanFiles = files.map(f => ({
        name: f.name,
        content: f.content,
        language: f.language
      }));

      // Call Express Proxy backend with milestoneIndex (0-based)
      const response = await progressApi.askQuestion(projectId || 'sandbox', {
        milestoneIndex,
        question: content,
        files: cleanFiles,
        projectContext: get().projectData,
        isSandbox
      });

      // Update credits and message info from server response
      if (response.credits !== undefined) {
         set({ credits: response.credits });
      }
      
      if (response.messagesRemaining !== undefined) {
        const currentMilestoneIdx = currentMilestoneId ? parseInt(currentMilestoneId.replace('m', '')) - 1 : 0;
        set((s) => ({
          messageInfo: {
            ...s.messageInfo,
            remaining: response.messagesRemaining,
            canSendWithoutCredits: response.messagesRemaining > 0,
          }
        }));
      }

      // Process structured response
      const { answer, suggestedFiles = [], suggestedCommands = [] } = response;

      // Apply file suggestions automatically
      let feedbackMessage = '';
      if (suggestedFiles.length > 0) {
        suggestedFiles.forEach(file => {
          const { createFile, updateFileContent } = get();
          if (file.action === 'create') {
            createFile(file.name, file.suggestedCode);
            feedbackMessage += `✓ Created ${file.name}. `;
          } else if (file.action === 'edit') {
            const existingFile = get().files.find(f => f.name === file.name);
            if (existingFile) {
              updateFileContent(existingFile.id, file.suggestedCode);
              feedbackMessage += `✓ Updated ${file.name}. `;
            }
          }
        });
      }

      // Build AI response with code suggestions
      const aiResponse = {
        role: 'ai',
        content: answer || 'I\'ve analyzed your request.',
        responseModel: {
          answer: answer || '',
          suggestions: suggestedFiles.map(f => ({
            name: f.name,
            action: f.action,
            suggestedCode: f.suggestedCode
          })),
          commands: suggestedCommands.map(cmd => ({ command: cmd }))
        }
      };

      // Add feedback about applied changes
      if (feedbackMessage) {
        aiResponse.content = `${answer}\n\n${feedbackMessage}`;
      }

      set((s) => ({
        aiMessages: [...s.aiMessages, aiResponse],
        isAiThinking: false,
      }));
    } catch (error) {
      console.error('AI API error:', error);

      if (error.response?.status === 403) {
         setInsufficientCreditsError(true);
         setTimeout(() => setInsufficientCreditsError(false), 3000);
      }

      set((s) => ({
        aiMessages: [...s.aiMessages, {
          role: 'ai',
          content: `I encountered an error while processing your question: ${error.response?.data?.message || error.message}. Please try again.`,
        }],
        isAiThinking: false,
      }));
    }
  },

  /**
   * Ask AI for step-specific guidance
   */
  askStepQuestion: async (stepId, question) => {
    const { setAiThinking, setInsufficientCreditsError, projectId, currentMilestoneId, milestones, isSandbox, messageInfo } = get();

    // Check message limits
    const { credits } = get();
    if (!messageInfo.canSendWithoutCredits && credits < 2 && !isSandbox) {
      setInsufficientCreditsError(true);
      setTimeout(() => setInsufficientCreditsError(false), 3000);
      return;
    }

    set((s) => ({
      aiMessages: [...s.aiMessages, { role: 'user', content: question }]
    }));
    setAiThinking(true);

    try {
      // Find milestone and step numbers
      const currentMilestone = milestones.find(m => m.id === currentMilestoneId);
      const step = currentMilestone?.steps?.find(s => s.id === stepId);

      if (!step) {
        throw new Error('Step not found');
      }

      const milestoneIndex = parseInt(currentMilestoneId.replace('m', '')) - 1;

      const response = await progressApi.askQuestion(projectId || 'sandbox', {
        milestoneIndex,
        question,
        isSandbox
      });

      // Update credits from server response
      if (response.credits !== undefined) {
         set({ credits: response.credits });
      }
      
      if (response.questionsRemaining !== undefined) {
         set({ questionsRemaining: response.questionsRemaining });
      }

      set((s) => ({
        aiMessages: [...s.aiMessages, {
          role: 'ai',
          content: response.answer,
        }],
        isAiThinking: false,
      }));
    } catch (error) {
      console.error('Step AI API error:', error);
      
      if (error.response?.status === 403) {
         setInsufficientCreditsError(true);
         setTimeout(() => setInsufficientCreditsError(false), 3000);
      }

      set((s) => ({
        aiMessages: [...s.aiMessages, {
          role: 'ai',
          content: `Error: ${error.response?.data?.message || error.message}`,
        }],
        isAiThinking: false,
      }));
    }
  },

  acceptAiSuggestion: (suggestion = null) => {
    const { aiSuggestion: legacySuggestion, updateFileContent, createFile, deleteFile, files } = get();
    const target = suggestion || legacySuggestion;
    if (!target) return;

    // Handle new model or legacy diff
    let feedbackMessage = 'Changes applied!';

    if (target.action === 'create') {
      createFile(target.name, target.suggestedCode);
      feedbackMessage = `File ${target.name} created!`;
    } else if (target.action === 'delete') {
      const file = files.find(f => f.name === target.name);
      if (file) {
        deleteFile(file.id);
        feedbackMessage = `File ${target.name} deleted.`;
      }
    } else if (target.action === 'edit' || (!target.action && (target.original || target.suggestedCode))) {
      // Handle either the new model ('target.name') or legacy ('target.fileId')
      const file = files.find(f => 
        (target.name && f.name === target.name) || 
        (target.fileId && f.id === target.fileId)
      );

      if (file) {
        // Surgical diff if original/replacement exist, otherwise full replacement
        const newContent = (target.original && target.replacement) 
          ? file.content.replace(target.original, target.replacement)
          : (target.suggestedCode || file.content);
          
        updateFileContent(file.id, newContent);
        feedbackMessage = `Changes applied to ${file.name}!`;
      }
    }

    set((s) => ({
      aiSuggestion: null,
      aiMessages: [...s.aiMessages, { role: 'ai', content: feedbackMessage }]
    }));
  },

  rejectAiSuggestion: () => set((s) => ({
    aiSuggestion: null,
    aiMessages: [...s.aiMessages, { role: 'ai', content: "No problem! Let me know if you'd like a different approach." }]
  })),

  // Complete a milestone step (for triggering quiz)
  completeStep: (stepId) => {
    const { milestones, currentMilestoneId, showQuiz } = get();
    const currentM = milestones.find(m => m.id === currentMilestoneId);
    const step = currentM?.steps.find(st => st.id === stepId);

    if (!step) return;

    const isAssessment = step.title.toLowerCase().includes('assessment');

    if (isAssessment) {
      // Don't mark as completed yet, just trigger the quiz
      showQuiz();
      return;
    }

    set((s) => {
      const updatedMilestones = s.milestones.map(m => {
        const stepIndex = m.steps.findIndex(step => step.id === stepId);
        if (stepIndex === -1) return m;

        // Update the target step to completed
        const updatedSteps = m.steps.map((step, idx) => {
          if (idx === stepIndex) return { ...step, status: 'completed' };
          
          // Auto-unlock the NEXT step if it's currently locked (and not the assessment)
          if (idx === stepIndex + 1 && step.status === 'locked' && !step.title.toLowerCase().includes('assessment')) {
            return { ...step, status: 'active' };
          }
          return step;
        });

        // Special logic: unlock assessment if all other steps are completed
        const finalSteps = updatedSteps.map(step => {
          if (step.title.toLowerCase().includes('assessment') && step.status === 'locked') {
            const allOthersCompleted = updatedSteps
              .filter(st => st.id !== step.id)
              .every(st => st.status === 'completed');
            if (allOthersCompleted) {
              return { ...step, status: 'active' };
            }
          }
          return step;
        });

        return { ...m, steps: finalSteps };
      });

      // Check if current milestone is now fully completed (all steps including assessment are done)
      const newCurrentM = updatedMilestones.find(m => m.id === s.currentMilestoneId);
      const allDone = newCurrentM?.steps.every(step => step.status === 'completed');

      if (allDone) {
        // Mark milestone as completed
        const finalMilestones = updatedMilestones.map(m =>
          m.id === s.currentMilestoneId ? { ...m, status: 'completed' } : m
        );
        return {
          milestones: finalMilestones,
          milestoneCompletedModalOpen: true, // Show the celebration modal
        };
      }

      return { milestones: updatedMilestones };
    });
  },

  triggerGuideForStep: (stepId) => {
    const { milestones, addAiUserMessage } = get();
    for (const m of milestones) {
      const step = m.steps?.find(s => s.id === stepId);
      if (step) {
        addAiUserMessage(`Can you provide a guide or summary for the task: "${step.title}"?`);
        break;
      }
    }
  },

  // Milestone progression
  proceedToNextMilestone: () => set((s) => {
    const idx = s.milestones.findIndex(m => m.id === s.currentMilestoneId);
    if (idx < 0 || idx >= s.milestones.length - 1) return {};
    const nextMilestone = s.milestones[idx + 1];
    const updatedMilestones = s.milestones.map((m, i) => {
      if (i === idx + 1) {
        return {
          ...m,
          status: 'active',
          steps: m.steps.map((step, si) => si === 0 ? { ...step, status: 'active' } : step)
        };
      }
      return m;
    });
    return {
      milestones: updatedMilestones,
      currentMilestoneId: nextMilestone.id,
      quizOpen: false,
      milestoneCompletedModalOpen: false,
      aiMessages: [...s.aiMessages, {
        role: 'ai',
        content: `Welcome to Milestone: "${nextMilestone.title}"! Let's get started with the first step.`
      }]
    };
  }),

  showQuiz: async () => {
    const { projectId, currentMilestoneId, milestones } = get();
    const milestoneNumber = currentMilestoneId ? parseInt(currentMilestoneId.replace('m', '')) : 1;

    // Helper to shuffle array randomly
    const shuffleArray = (array) => {
      const newArr = [...array];
      for (let i = newArr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [newArr[i], newArr[j]] = [newArr[j], newArr[i]];
      }
      return newArr;
    };

    try {
      let questions = [];
      const milestoneData = milestones.find(m => m.id === currentMilestoneId) || milestones[milestoneNumber - 1];
      
      // Check if quiz exists in the DB-loaded milestone data
      if (milestoneData?.quiz?.questions && milestoneData.quiz.questions.length > 0) {
        // Detect if the quiz is broken (missing correct answer field)
        const isBroken = milestoneData.quiz.questions.some(q => q.correctAnswer === undefined && q.correct_answer === undefined);
        if (!isBroken) {
          questions = milestoneData.quiz.questions;
        } else {
           console.log(`[showQuiz] Local quiz data is broken for milestone ${milestoneNumber}. Fetching fresh quiz...`);
        }
      } 
      
      // If we don't have questions (or they were broken), fetch from API
      if (questions.length === 0 && projectId) {
        // Route to Express dynamic generation backend
        const quizData = await projectsExpressApi.getMilestoneQuiz(projectId, milestoneNumber);
        // API now returns { questions: [...] } instead of { quiz: [...] }
        questions = quizData.questions || quizData.quiz || quizData;
      }

      if (!questions || questions.length === 0) {
        throw new Error('No questions found for this milestone.');
      }

      // Prepare the questions
      const preparedQuestions = questions.map((q, idx) => {
        // Determine correct answer index - more robust
        let correctAnswerIndex = -1;
        const correctVal = q.correctAnswer ?? q.correct_answer;

        if (correctVal === undefined || (typeof correctVal === 'number' && isNaN(correctVal))) {
           // Skip or throw - we shouldn't have broken data here
           console.warn(`[showQuiz] Question ${idx+1} is missing a correct answer!`);
           return null;
        }

        // Case 1: correctVal is a valid number index
        if (typeof correctVal === 'number' && q.options[correctVal]) {
          correctAnswerIndex = correctVal;
        } 
        // Case 2: correctVal is a string that matches an option text
        else if (typeof correctVal === 'string') {
          const optionIndex = q.options.indexOf(correctVal);
          if (optionIndex !== -1) {
            correctAnswerIndex = optionIndex;
          } else {
            // Case 3: Try parsing as number index
            const possibleIdx = parseInt(correctVal);
            if (!isNaN(possibleIdx) && q.options[possibleIdx]) {
              correctAnswerIndex = possibleIdx;
            }
          }
        }

        // Final fallback: if we still don't have a valid index, skip this question
        if (correctAnswerIndex === -1 || !q.options[correctAnswerIndex]) {
          console.warn(`[showQuiz] Question ${idx+1} has invalid correctAnswer!`, correctVal);
          return null;
        }

        // Shuffle the options but keep track of the correct answer INDEX
        const correctAnswerText = q.options[correctAnswerIndex];
        const shuffledOptions = shuffleArray([...(q.options || [])]);
        
        // Find the NEW index of the correct answer after shuffling
        const shuffledCorrectIndex = shuffledOptions.indexOf(correctAnswerText);

        return {
          id: `q${idx + 1}`,
          question: q.question,
          options: shuffledOptions,
          correctAnswer: shuffledCorrectIndex, // Store as NUMBER index
          explanation: q.explanation,
          timeLimit: 15,
        };
      }).filter(Boolean); // Remove invalid questions

      // Take max 5 questions
      const finalQuestions = shuffleArray(preparedQuestions).slice(0, 5);

      set({
        quizOpen: true,
        currentQuiz: {
          projectId,
          milestoneName: milestoneData?.title || milestoneData?.name || `Milestone ${milestoneNumber}`,
          questions: finalQuestions,
          passingScore: Math.ceil(finalQuestions.length * 0.6), // 60% to pass
        },
      });
    } catch (error) {
      console.error('Failed to load quiz:', error);
      // Fallback or error message?
      set({ quizOpen: false });
      const { addConsoleLog } = get();
      addConsoleLog(`Failed to load assessment: ${error.message}`, 'error');
    }
  },
  closeQuiz: () => set({ quizOpen: false }),

  // Helpers
  getActiveFile: () => {
    const state = get();
    return state.files.find(f => f.id === state.activeFileId) || null;
  },

  compilePreviewHtml: (state) => {
    const htmlFile = state.files.find(f => f.name.endsWith('.html'))?.content || '';
    const cssFile = state.files.find(f => f.name.endsWith('.css'))?.content || '';
    const jsFile = state.files.find(f => f.name.endsWith('.js') && !f.name.endsWith('.jsx'))?.content || '';

    // If no HTML file, create a basic scaffold
    const rawHtmlContent = htmlFile || `<div class="app"><h1>${state.projectName || 'Preview'}</h1><p>Add an index.html file for a full preview.</p></div>`;

    // Strip remote/relative script and stylesheet tags to avoid 404s inside about:srcdoc (no host path)
    const sanitizedHtmlContent = rawHtmlContent
      .replace(/<script[^>]*src=["'][^"']*["'][^>]*>[\s\S]*?<\/script>/gi, '')
      .replace(/<link[^>]*rel=["']stylesheet["'][^>]*>/gi, '');

    const htmlContent = sanitizedHtmlContent;

    // Script to intercept console methods and forward to parent window
    const interceptorScript = `
      <script>
        (function() {
          const originalLog = console.log;
          const originalWarn = console.warn;
          const originalError = console.error;
          const originalClear = console.clear;

          console.log = function(...args) {
            originalLog.apply(console, args);
            window.parent.postMessage({ type: 'CONSOLE', level: 'log', args: args.map(String) }, '*');
          };
          console.warn = function(...args) {
            originalWarn.apply(console, args);
            window.parent.postMessage({ type: 'CONSOLE', level: 'warning', args: args.map(String) }, '*');
          };
          console.error = function(...args) {
            originalError.apply(console, args);
            window.parent.postMessage({ type: 'CONSOLE', level: 'error', args: args.map(String) }, '*');
          };
          console.clear = function() {
            originalClear.apply(console);
            window.parent.postMessage({ type: 'CONSOLE_CLEAR' }, '*');
          };

          window.onerror = function(message, source, lineno, colno, error) {
            window.parent.postMessage({ type: 'CONSOLE', level: 'error', args: [\`\${message} at line \${lineno}\`] }, '*');
          };
        })();
      </script>
    `;

    return `<!DOCTYPE html>
<html>
  <head>
    <meta charset="UTF-8" />
    <style>
      body { font-family: 'Inter', -apple-system, sans-serif; margin: 0; }
      ${cssFile}
    </style>
  </head>
  <body>
    ${htmlContent}
    ${interceptorScript}
    <script>
      try { ${jsFile} } catch(e) { console.error(e); }
    <\/script>
  </body>
</html>`;
  },
  
  getCompiledPreview: () => get().livePreviewHtml,
}));

export default useLabStore;
