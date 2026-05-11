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

function normalizeWebContainerPath(path = '') {
  return String(path)
    .replace(/\\/g, '/')
    .replace(/^\/+/, '')
    .split('/')
    .filter(Boolean)
    .filter(part => part !== '.' && part !== '..')
    .join('/');
}

function buildWebContainerTree(filesToMount = []) {
  const root = {};

  filesToMount.forEach((file) => {
    const safePath = normalizeWebContainerPath(file.name);
    if (!safePath) return;

    const parts = safePath.split('/');
    let cursor = root;

    parts.forEach((part, index) => {
      const isLeaf = index === parts.length - 1;

      if (isLeaf) {
        cursor[part] = {
          file: {
            contents: file.content || '',
          },
        };
        return;
      }

      if (!cursor[part]) {
        cursor[part] = { directory: {} };
      }
      cursor = cursor[part].directory;
    });
  });

  return root;
}

function splitShellCommand(command = '') {
  const tokens = [];
  let current = '';
  let quote = null;

  for (const char of command.trim()) {
    if ((char === '"' || char === "'") && !quote) {
      quote = char;
      continue;
    }
    if (char === quote) {
      quote = null;
      continue;
    }
    if (/\s/.test(char) && !quote) {
      if (current) tokens.push(current);
      current = '';
      continue;
    }
    current += char;
  }

  if (current) tokens.push(current);
  return tokens;
}

const ignoredWorkspaceFilePattern = /(^|\/)(node_modules|\.git|dist|build|coverage|__pycache__|\.pytest_cache|\.venv|venv|env|\.next|\.turbo|\.cache)(\/|$)|(\.pyc|\.pyo|\.log|\.map)$/i;

function getPersistableFiles(files = []) {
  return files
    .filter((file) => {
      const name = String(file.name || file.filename || '').replace(/\\/g, '/');
      if (!name || ignoredWorkspaceFilePattern.test(name)) return false;
      return String(file.content || '').length <= 160000;
    })
    .slice(0, 80)
    .map((file) => ({
      filename: String(file.name || file.filename).replace(/\\/g, '/'),
      content: String(file.content || ''),
      language: file.language || 'text',
    }));
}

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

  // WebContainer & Terminal State
  webcontainerInstance: null,
  isWebContainerLoading: false,
  webcontainerStatus: 'idle',
  webcontainerError: '',
  webcontainerPreviewUrl: '',
  webcontainerServerProcess: null,
  activeTerminalProcess: null,
  isTerminalRunning: false,

  // --- ACTIONS ---

  bootWebContainer: async () => {
    const state = get();
    if (state.webcontainerInstance || state.isWebContainerLoading) return state.webcontainerInstance;

    set({
      isWebContainerLoading: true,
      webcontainerStatus: 'booting',
      webcontainerError: '',
      loadingStatus: 'Booting WebContainer...',
      loadingProgress: 20
    });
    
    try {
      // Dynamic import to prevent crash if package not yet installed
      const { WebContainer } = await import('@webcontainer/api');
      const instance = await WebContainer.boot();
      
      set({
        webcontainerInstance: instance,
        isWebContainerLoading: false,
        webcontainerStatus: 'ready',
        loadingProgress: 40
      });
      console.log('[WebContainer] Booted successfully');
      
      // Setup listener for server ready (Vite/Node)
      instance.on('server-ready', (port, url) => {
        console.log(`[WebContainer] Server ready at ${url} on port ${port}`);
        set({
          webcontainerPreviewUrl: url,
          webcontainerStatus: 'serving',
          bottomPanelOpen: true,
          bottomPanelTab: 'preview'
        });
      });

      return instance;
    } catch (error) {
      console.error('[WebContainer] Failed to boot:', error);
      set({
        isWebContainerLoading: false,
        webcontainerStatus: 'offline',
        webcontainerError: error?.message || 'WebContainer could not start in this browser.'
      });
      return null;
    }
  },

  mountFiles: async (filesToMount) => {
    const { webcontainerInstance } = get();
    if (!webcontainerInstance) return;

    const fileTree = buildWebContainerTree(filesToMount);
    await webcontainerInstance.mount(fileTree);
    console.log('[WebContainer] Files mounted');
  },

  ensureWebContainerDir: async (filePath) => {
    const { webcontainerInstance } = get();
    if (!webcontainerInstance) return;

    const safePath = normalizeWebContainerPath(filePath);
    const parts = safePath.split('/');
    parts.pop();
    if (parts.length === 0) return;

    let current = '';
    for (const part of parts) {
      current = current ? `${current}/${part}` : part;
      try {
        await webcontainerInstance.fs.mkdir(current);
      } catch (error) {
        if (!String(error?.message || '').toLowerCase().includes('exist')) {
          throw error;
        }
      }
    }
  },

  writeFileToWebContainer: async (file) => {
    const { webcontainerInstance, ensureWebContainerDir } = get();
    if (!webcontainerInstance || !file?.name) return;

    const safePath = normalizeWebContainerPath(file.name);
    if (!safePath) return;

    await ensureWebContainerDir(safePath);
    await webcontainerInstance.fs.writeFile(safePath, file.content || '');
  },

  startWebContainerPreviewServer: async () => {
    const {
      webcontainerInstance,
      webcontainerServerProcess,
      writeFileToWebContainer,
      ensureWebContainerDir,
      files,
      addConsoleLog,
    } = get();

    if (!webcontainerInstance || webcontainerServerProcess) return;

    for (const file of files) {
      await writeFileToWebContainer(file);
    }

    const serverPath = '.brainbazaar/preview-server.mjs';
    const serverSource = `
import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { extname, normalize, join } from 'node:path';

const types = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp'
};

createServer(async (req, res) => {
  try {
    const urlPath = decodeURIComponent(new URL(req.url, 'http://localhost').pathname);
    const requested = urlPath === '/' ? '/index.html' : urlPath;
    const safePath = normalize(requested).replace(/^(\\.\\.[/\\\\])+/, '');
    const filePath = join('/', safePath).slice(1);
    const body = await readFile(filePath);
    res.writeHead(200, { 'content-type': types[extname(filePath)] || 'text/plain; charset=utf-8' });
    res.end(body);
  } catch {
    res.writeHead(404, { 'content-type': 'text/html; charset=utf-8' });
    res.end('<!doctype html><title>BrainBazaar Preview</title><body style="font-family:system-ui;padding:32px"><h1>No preview file found</h1><p>Create an index.html file or run a JavaScript file from the console.</p></body>');
  }
}).listen(3000, '0.0.0.0');
`;

    await ensureWebContainerDir(serverPath);
    await webcontainerInstance.fs.writeFile(serverPath, serverSource);

    const process = await webcontainerInstance.spawn('node', [serverPath]);
    set({ webcontainerServerProcess: process, webcontainerStatus: 'serving' });

    process.output.pipeTo(new WritableStream({
      write(data) {
        addConsoleLog(String(data).trim(), 'info', 'javascript');
      }
    })).catch(() => {});

    process.exit.then(() => {
      set({ webcontainerServerProcess: null, webcontainerStatus: webcontainerInstance ? 'ready' : 'offline' });
    });
  },

  runShellCommand: async (command) => {
    const {
      webcontainerInstance,
      writeFileToWebContainer,
      files,
      addConsoleLog,
    } = get();

    const trimmed = command.trim();
    if (!trimmed) return;

    set({ bottomPanelOpen: true, bottomPanelTab: 'console', consoleMode: 'shell' });
    addConsoleLog(`$ ${trimmed}`, 'command', 'shell');

    if (!webcontainerInstance) {
      addConsoleLog('WebContainer is not ready yet. Refresh the lab or check that Vite is serving with COOP/COEP headers.', 'error', 'shell');
      return;
    }

    for (const file of files) {
      await writeFileToWebContainer(file);
    }

    set({ isTerminalRunning: true });

    let process;
    try {
      try {
        process = await webcontainerInstance.spawn('jsh', ['-c', trimmed]);
      } catch (shellError) {
        const [binary, ...args] = splitShellCommand(trimmed);
        if (!binary) throw shellError;
        process = await webcontainerInstance.spawn(binary, args);
      }

      set({ activeTerminalProcess: process });

      process.output.pipeTo(new WritableStream({
        write(data) {
          const text = String(data);
          if (text.trim()) addConsoleLog(text, 'log', 'shell');
        }
      })).catch(() => {});

      const exitCode = await process.exit;
      if (exitCode === 0) {
        addConsoleLog(`Command finished with exit code 0`, 'success', 'shell');
      } else {
        addConsoleLog(`Command exited with code ${exitCode}`, 'error', 'shell');
      }
    } catch (error) {
      addConsoleLog(error.message, 'error', 'shell');
    } finally {
      if (get().activeTerminalProcess === process) {
        set({ activeTerminalProcess: null, isTerminalRunning: false });
      }
    }
  },

  stopTerminalProcess: () => {
    const { activeTerminalProcess, addConsoleLog } = get();
    if (!activeTerminalProcess) return;

    try {
      activeTerminalProcess.kill();
      addConsoleLog('Process stopped.', 'warning', 'shell');
    } catch (error) {
      addConsoleLog(error.message, 'error', 'shell');
    } finally {
      set({ activeTerminalProcess: null, isTerminalRunning: false });
    }
  },

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
      webcontainerPreviewUrl: '',
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

    set({
      isLabLoading: true,
      loadingStatus: 'Loading project...',
      loadingProgress: 10,
      webcontainerPreviewUrl: '',
      webcontainerError: ''
    });

    try {
      // 1. Boot WebContainer in parallel
      const containerPromise = get().bootWebContainer();

      // 2. Fetch project data from Express API (MongoDB)
      const EXPRESS_API_URL = import.meta.env.VITE_EXPRESS_API_URL || 'http://localhost:5000/api/v1';
      const url = `${EXPRESS_API_URL}/projects/${projectId}`;

      console.log(`[loadRealProject] Fetching from: ${url}`);

      const fetchResponse = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          ...(getAuthToken() ? { 'Authorization': `Bearer ${getAuthToken()}` } : {}),
        },
        credentials: 'include',
      });

      if (!fetchResponse.ok) {
        throw new Error(`API Error: ${fetchResponse.status} ${fetchResponse.statusText}`);
      }

      const response = await fetchResponse.json();
      const projectData = response.project || response;

      set({ loadingProgress: 30, loadingStatus: 'Preparing roadmap...' });

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
          quiz: m.quiz,
        };
      });

      set({ loadingProgress: 60, loadingStatus: 'Initializing engines...' });

      // Preload Pyodide & Wait for WebContainer
      const [container] = await Promise.all([
        containerPromise,
        get().loadPyodide().catch(e => console.error('Pyodide fail:', e))
      ]);

      set({ loadingProgress: 85, loadingStatus: 'Mounting file system...' });

      // Build initial files
      const initialFiles = [{
        id: 'f1',
        name: 'README.md',
        language: 'markdown',
        isDirty: false,
        status: 'clean',
        content: `# ${projectData.title}\n\n${projectData.description || ''}\n\n${projectData.readme || ''}\n\n---\n**Goal:** Follow the milestones to build this project.`,
      }];

      // Mount to WebContainer if available
      if (container) {
        await get().mountFiles(initialFiles);
      }

      const savedEnv = localStorage.getItem('userEnvironment');
      const userEnvironment = savedEnv ? JSON.parse(savedEnv) : null;

      // Get credits from auth store
      let creditsFromAuth = 0;
      try {
        const authData = JSON.parse(localStorage.getItem('auth-storage'));
        creditsFromAuth = authData?.state?.user?.credits || 0;
      } catch (e) {}

      // Load user progress
      let messageInfo = { used: 0, limit: 10, remaining: 10, canSendWithoutCredits: true };
      try {
        if (getAuthToken()) {
          const progressData = await progressApi.getProgress(projectData._id || projectData.id);
          if (progressData.success && progressData.messageInfo) {
            messageInfo = progressData.messageInfo;
          }
        }
      } catch (err) {}

      set({
        projectId: projectData._id || projectData.id,
        projectName: projectData.title,
        projectData: projectData,
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
            content: `Welcome to **${projectData.title}**! I'll guide you through building this project step by step.`,
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
        webcontainerPreviewUrl: '',
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
      set({ isLabLoading: false });
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

  createFile: async (filename, content = '') => {
    if (!filename || !filename.trim()) return;
    const name = filename.trim();
    const { files, openTabs, webcontainerInstance, writeFileToWebContainer } = get();
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

    // Sync to WebContainer
    if (webcontainerInstance) {
      await writeFileToWebContainer(newFile);
    }

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
  saveProject: async () => {
    const { files, webcontainerInstance, compilePreviewHtml, writeFileToWebContainer } = get();
    
    // Sync dirty files to WebContainer
    if (webcontainerInstance) {
      for (const file of files) {
        if (file.status === 'unsaved') {
          await writeFileToWebContainer(file);
        }
      }
    }

    const newPreviewHtml = compilePreviewHtml(get());

    set((s) => ({
      files: s.files.map(f => f.status === 'unsaved' ? { ...f, isDirty: false, status: 'clean' } : f),
      saveFlash: true,
      livePreviewHtml: newPreviewHtml
    }));
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
  consoleMode: 'javascript', // 'python' | 'javascript' | 'shell'
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
      return state.pyodide;
    }
    if (state.isPyodideLoading) {
      return null;
    }

    set({ isPyodideLoading: true });
    try {
      const { loadPyodide: loadPyo } = await import('pyodide');
      const pyodideInstance = await loadPyo({
        indexURL: 'https://cdn.jsdelivr.net/pyodide/v0.29.3/full/',
      });

      set({ pyodide: pyodideInstance, isPyodideLoading: false });
      return pyodideInstance;
    } catch (error) {
      set({ isPyodideLoading: false });
      throw error;
    }
  },

  runPythonCode: async (code) => {
    const state = get();
    let pyodideInstance = state.pyodide;

    if (!pyodideInstance) {
      pyodideInstance = await get().loadPyodide();
    }

    if (!pyodideInstance) return;

    pyodideInstance.setStdout({
      batched: (output) => {
        get().addConsoleLog(output, 'log', 'python');
      },
    });

    try {
      const result = await pyodideInstance.runPythonAsync(code);
      if (result !== undefined && result !== null && typeof result !== 'function') {
        get().addConsoleLog(String(result), 'log', 'python');
      }
      return result;
    } catch (error) {
      get().addConsoleLog(error.message, 'error', 'python');
      throw error;
    }
  },

  runConsoleCommand: (command) => {
    try {
      // eslint-disable-next-line no-eval
      return eval(command);
    } catch (error) {
      throw error;
    }
  },

  // Run "code" — compiles preview + console output
  runCode: async () => {
    const { addConsoleLog, setBottomPanelTab, compilePreviewHtml, webcontainerInstance, startWebContainerPreviewServer } = get();
    set({ bottomPanelOpen: true, pythonLogs: [], jsLogs: [] });
    setBottomPanelTab('console');
    addConsoleLog('Compiling project...', 'info');

    if (webcontainerInstance) {
      try {
        await startWebContainerPreviewServer();
        addConsoleLog('WebContainer preview server is running.', 'success');
      } catch (error) {
        addConsoleLog(`WebContainer preview failed: ${error.message}`, 'error', 'javascript');
      }
    }

    setTimeout(() => {
      const newPreviewHtml = compilePreviewHtml(get());
      set({ livePreviewHtml: newPreviewHtml });
      addConsoleLog('Build completed successfully.', 'success');
      setTimeout(() => setBottomPanelTab('preview'), 600);
    }, 600);
  },

  // Smart Run - runs current file based on type
  smartRun: async () => {
    const state = get();
    const activeFile = state.getActiveFile();

    if (!activeFile) return;

    const {
      addConsoleLog, setBottomPanelTab, setBottomPanelOpen, runPythonCode,
      runCode, setConsoleMode, webcontainerInstance, writeFileToWebContainer
    } = state;

    setBottomPanelOpen(true);
    set({ isTerminalRunning: true });

    try {
      // Python files
      if (activeFile.language === 'python' || activeFile.name.endsWith('.py')) {
        setBottomPanelTab('console');
        setConsoleMode('python');
        await runPythonCode(activeFile.content);
      }
      // JavaScript files - run in WebContainer when available.
      else if (activeFile.name.endsWith('.js') || activeFile.name.endsWith('.mjs') || activeFile.name.endsWith('.cjs')) {
        setBottomPanelTab('console');
        setConsoleMode('javascript');
        addConsoleLog(`> node ${activeFile.name}`, 'command', 'javascript');
        
        if (!webcontainerInstance) {
          addConsoleLog('WebContainer is offline. HTML/CSS/JS preview still works in the browser fallback.', 'error', 'javascript');
          return;
        }

        await writeFileToWebContainer(activeFile);
        const process = await webcontainerInstance.spawn('node', [activeFile.name]);
        
        process.output.pipeTo(new WritableStream({
          write(data) {
            addConsoleLog(data, 'log', 'javascript');
          }
        }));

        const exitCode = await process.exit;
        if (exitCode !== 0) {
          addConsoleLog(`Process exited with code ${exitCode}`, 'error', 'javascript');
        }
      }
      // HTML/CSS
      else if (activeFile.language === 'html' || activeFile.name.endsWith('.html')) {
        runCode();
      }
    } catch (error) {
      addConsoleLog(error.message, 'error', activeFile.language === 'python' ? 'python' : 'javascript');
    } finally {
      set({ isTerminalRunning: false });
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
      const cleanFiles = getPersistableFiles(files).map(f => ({
        name: f.filename,
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

  markProjectComplete: async () => {
    const { projectId, files, milestones } = get();
    if (!projectId || projectId === 'sandbox') return null;

    try {
      const response = await progressApi.saveProgress(projectId, {
        isComplete: true,
        currentMilestoneIndex: Math.max(0, milestones.length - 1),
        savedCode: getPersistableFiles(files),
      });

      if (response?.certificate) {
        set((s) => ({
          aiMessages: [...s.aiMessages, {
            role: 'ai',
            content: `Your Builder Certificate is ready: **${response.certificate.title}**. It will now appear on your profile.`,
          }],
        }));
      }
      return response;
    } catch (error) {
      get().addConsoleLog(`Could not issue certificate: ${error.message}`, 'error', 'javascript');
      return null;
    }
  },

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
