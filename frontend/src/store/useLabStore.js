import { create } from 'zustand';

const DEMO_FILES = [
  {
    id: 'f1',
    name: 'App.jsx',
    language: 'javascript',
    isDirty: false,
    status: 'clean', // 'clean' | 'unsaved' | 'warning' | 'error'
    content: `import React, { useState, useEffect } from 'react';
import { fetchWeather } from './api';

function App() {
  const [city, setCity] = useState('London');
  const [weather, setWeather] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSearch = async () => {
    setLoading(true);
    const data = await fetchWeather(city);
    setWeather(data);
    setLoading(false);
  };

  return (
    <div className="app">
      <h1>Weather App</h1>
      <div className="search">
        <input
          value={city}
          onChange={(e) => setCity(e.target.value)}
          placeholder="Enter city..."
        />
        <button onClick={handleSearch}>Search</button>
      </div>
      {loading && <p>Loading...</p>}
      {weather && (
        <div className="weather-card">
          <h2>{weather.city}</h2>
          <p>{weather.temp}&deg;C</p>
          <p>{weather.description}</p>
        </div>
      )}
    </div>
  );
}

export default App;`,
  },
  {
    id: 'f2',
    name: 'api.js',
    language: 'javascript',
    isDirty: false,
    status: 'warning',
    content: `const API_KEY = 'your_api_key_here';
const BASE_URL = 'https://api.weather.example.com/v1';

export async function fetchWeather(city) {
  // TODO: Add error handling
  const res = await fetch(
    \`\${BASE_URL}/weather?q=\${city}&appid=\${API_KEY}\`
  );
  const data = await res.json();
  return {
    city: data.name,
    temp: Math.round(data.main.temp - 273.15),
    description: data.weather[0].description,
  };
}`,
  },
  {
    id: 'f3',
    name: 'styles.css',
    language: 'css',
    isDirty: false,
    status: 'clean',
    content: `* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: 'Inter', sans-serif;
  background: #f7f7f5;
  color: #1a1a1a;
}

.app {
  max-width: 600px;
  margin: 40px auto;
  padding: 24px;
  text-align: center;
}

.search {
  display: flex;
  gap: 8px;
  margin: 24px 0;
}

.search input {
  flex: 1;
  padding: 10px 16px;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  font-size: 14px;
}

.search button {
  padding: 10px 20px;
  background: #6366f1;
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
}

.weather-card {
  margin-top: 24px;
  padding: 24px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.06);
}`,
  },
  {
    id: 'f4',
    name: 'index.html',
    language: 'html',
    isDirty: false,
    status: 'clean',
    content: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Weather App</title>
  <link rel="stylesheet" href="styles.css" />
</head>
<body>
  <div class="app">
    <h1>Weather App</h1>
    <div class="search">
      <input type="text" placeholder="Enter city..." />
      <button>Search</button>
    </div>
    <div class="weather-card">
      <h2>London</h2>
      <p>15&deg;C</p>
      <p>Partly cloudy</p>
    </div>
  </div>
  <script src="api.js"></script>
</body>
</html>`,
  },
];

const DEMO_MILESTONES = [
  {
    id: 'm1',
    title: 'Project Setup',
    status: 'active', // 'active' | 'completed' | 'locked'
    steps: [
      { id: 's1', title: 'Create file structure', status: 'completed' },
      { id: 's2', title: 'Build UI layout', status: 'completed' },
      { id: 's3', title: 'Add base styling', status: 'active' },
    ],
  },
  {
    id: 'm2',
    title: 'API Integration',
    status: 'locked',
    steps: [
      { id: 's4', title: 'Create fetchWeather function', status: 'locked' },
      { id: 's5', title: 'Add error handling', status: 'locked' },
      { id: 's6', title: 'Display weather data', status: 'locked' },
    ],
  },
  {
    id: 'm3',
    title: 'Polish & Deploy',
    status: 'locked',
    steps: [
      { id: 's7', title: 'Add loading states', status: 'locked' },
      { id: 's8', title: 'Responsive design', status: 'locked' },
      { id: 's9', title: 'Deploy to production', status: 'locked' },
    ],
  },
];

const DEMO_AI_MESSAGES = [
  {
    role: 'ai',
    content: "Welcome to your Weather App project! I'll guide you through building this step by step. Let's start with Milestone 1 -- Project Setup.",
  },
  {
    role: 'user',
    content: "I've set up the basic structure. Can you check my api.js file?",
  },
  {
    role: 'ai',
    content: "I noticed your fetchWeather function is missing error handling. If the API call fails, the app will crash. I've prepared a fix -- wrapping it in a try/catch block.",
    diff: {
      original: '  const res = await fetch(...);',
      replacement: '  try {\n    const res = await fetch(...);\n  } catch (e) {\n    console.error(e);\n    return null;\n  }',
    },
  },
];

const DEMO_AI_SUGGESTION = {
  fileId: 'f2',
  lineStart: 5,
  lineEnd: 9,
  original: `  // TODO: Add error handling
  const res = await fetch(
    \`\${BASE_URL}/weather?q=\${city}&appid=\${API_KEY}\`
  );
  const data = await res.json();`,
  replacement: `  try {
    const res = await fetch(
      \`\${BASE_URL}/weather?q=\${city}&appid=\${API_KEY}\`
    );
    if (!res.ok) throw new Error('City not found');
    const data = await res.json();`,
};

let fileCounter = 10;

const useLabStore = create((set, get) => ({
  // Project Metadata
  projectId: null,
  projectName: '',

  // File System
  files: [],
  openTabs: [],
  activeFileId: null,

  // PBL Milestones
  milestones: [],
  currentMilestoneId: null,

  // Economy & AI State
  credits: 20,
  isAiThinking: false,

  // UI State
  leftSidebarOpen: true,
  rightSidebarOpen: true,
  bottomPanelOpen: true,
  bottomPanelTab: 'console',
  quizOpen: false,
  profileMenuOpen: false,
  saveFlash: false, // true briefly after save
  newFileDialogOpen: false,

  // Console
  consoleLogs: [],

  // AI Chat
  aiMessages: [],
  aiSuggestion: null,

  // --- ACTIONS ---

  initDemoProject: () => set({
    projectId: 'demo',
    projectName: 'Weather AI App',
    files: DEMO_FILES,
    milestones: DEMO_MILESTONES,
    currentMilestoneId: 'm1',
    openTabs: ['f1', 'f2'],
    activeFileId: 'f1',
    credits: 20,
    consoleLogs: [],
    aiMessages: DEMO_AI_MESSAGES,
    aiSuggestion: DEMO_AI_SUGGESTION,
    leftSidebarOpen: true,
    rightSidebarOpen: true,
    bottomPanelOpen: true,
    bottomPanelTab: 'console',
    quizOpen: false,
    profileMenuOpen: false,
    saveFlash: false,
    newFileDialogOpen: false,
  }),

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

  createFile: (filename) => {
    if (!filename || !filename.trim()) return;
    const name = filename.trim();
    const { files, openTabs } = get();
    // Prevent duplicates
    if (files.some(f => f.name === name)) return;

    const ext = name.split('.').pop()?.toLowerCase();
    const langMap = { js: 'javascript', jsx: 'javascript', ts: 'typescript', tsx: 'typescript', html: 'html', css: 'css', json: 'json', md: 'markdown' };
    const newId = `f_${++fileCounter}_${Date.now()}`;
    const newFile = {
      id: newId,
      name,
      language: langMap[ext] || 'text',
      isDirty: false,
      status: 'clean',
      content: '',
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

  closeTab: (id) => set((state) => {
    const newTabs = state.openTabs.filter(tabId => tabId !== id);
    const newActiveId = state.activeFileId === id
      ? (newTabs.length > 0 ? newTabs[newTabs.length - 1] : null)
      : state.activeFileId;
    return { openTabs: newTabs, activeFileId: newActiveId };
  }),

  // Save — marks all dirty files as clean, flashes checkmark
  saveProject: () => {
    set((s) => ({
      files: s.files.map(f => f.status === 'unsaved' ? { ...f, isDirty: false, status: 'clean' } : f),
      saveFlash: true,
    }));
    // Reset flash after animation
    setTimeout(() => set({ saveFlash: false }), 1500);
  },

  // UI Toggles
  toggleLeftSidebar: () => set((s) => ({ leftSidebarOpen: !s.leftSidebarOpen })),
  toggleRightSidebar: () => set((s) => ({ rightSidebarOpen: !s.rightSidebarOpen })),
  toggleBottomPanel: () => set((s) => ({ bottomPanelOpen: !s.bottomPanelOpen })),
  setBottomPanelTab: (tab) => set({ bottomPanelTab: tab }),
  toggleProfileMenu: () => set((s) => ({ profileMenuOpen: !s.profileMenuOpen })),
  closeProfileMenu: () => set({ profileMenuOpen: false }),
  toggleNewFileDialog: () => set((s) => ({ newFileDialogOpen: !s.newFileDialogOpen })),

  // Console
  addConsoleLog: (text, type = 'log') => set((s) => ({
    consoleLogs: [...s.consoleLogs, {
      type,
      text,
      timestamp: new Date().toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' })
    }]
  })),

  // Run "code" — compiles preview + console output
  runCode: () => {
    const { addConsoleLog, setBottomPanelTab } = get();
    set({ bottomPanelOpen: true });
    setBottomPanelTab('console');
    addConsoleLog('Compiling project...', 'info');
    setTimeout(() => addConsoleLog('Server started on http://localhost:3000', 'success'), 600);
    setTimeout(() => {
      addConsoleLog('Build completed in 143ms', 'success');
      // Switch to preview after build
      setTimeout(() => setBottomPanelTab('preview'), 400);
    }, 1200);
  },

  // AI Operations
  setAiThinking: (status) => set({ isAiThinking: status }),
  deductCredit: (amount = 2) => set((state) => ({ credits: Math.max(0, state.credits - amount) })),
  setCurrentMilestone: (id) => set({ currentMilestoneId: id }),

  addAiUserMessage: (content) => {
    const { deductCredit, setAiThinking } = get();
    set((s) => ({
      aiMessages: [...s.aiMessages, { role: 'user', content }]
    }));
    deductCredit(1);
    setAiThinking(true);

    setTimeout(() => {
      set((s) => ({
        aiMessages: [...s.aiMessages, {
          role: 'ai',
          content: "That's a great question! Let me look at your code and find the best approach. Try adding error boundaries to handle edge cases gracefully."
        }],
        isAiThinking: false,
      }));
    }, 1500);
  },

  acceptAiSuggestion: () => {
    const { aiSuggestion, updateFileContent, files } = get();
    if (!aiSuggestion) return;
    const file = files.find(f => f.id === aiSuggestion.fileId);
    if (!file) return;

    const newContent = file.content.replace(aiSuggestion.original, aiSuggestion.replacement);
    updateFileContent(aiSuggestion.fileId, newContent);

    set((s) => ({
      aiSuggestion: null,
      aiMessages: [...s.aiMessages, { role: 'ai', content: 'Change applied! The error handling is now in place.' }]
    }));
  },

  rejectAiSuggestion: () => set((s) => ({
    aiSuggestion: null,
    aiMessages: [...s.aiMessages, { role: 'ai', content: "No problem! Let me know if you'd like a different approach." }]
  })),

  // Complete a milestone step (for triggering quiz)
  completeStep: (stepId) => set((s) => {
    const updatedMilestones = s.milestones.map(m => ({
      ...m,
      steps: m.steps.map(step =>
        step.id === stepId ? { ...step, status: 'completed' } : step
      ),
    }));

    // Check if current milestone is now fully completed
    const currentM = updatedMilestones.find(m => m.id === s.currentMilestoneId);
    const allDone = currentM?.steps.every(step => step.status === 'completed');

    if (allDone) {
      // Mark milestone as completed
      const finalMilestones = updatedMilestones.map(m =>
        m.id === s.currentMilestoneId ? { ...m, status: 'completed' } : m
      );
      return {
        milestones: finalMilestones,
        quizOpen: true, // Auto-trigger quiz when milestone completes
      };
    }

    return { milestones: updatedMilestones };
  }),

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
      aiMessages: [...s.aiMessages, {
        role: 'ai',
        content: `Welcome to Milestone: "${nextMilestone.title}"! Let's get started with the first step.`
      }]
    };
  }),

  showQuiz: () => set({ quizOpen: true }),
  closeQuiz: () => set({ quizOpen: false }),

  // Helpers
  getActiveFile: () => {
    const state = get();
    return state.files.find(f => f.id === state.activeFileId) || null;
  },

  getCompiledPreview: () => {
    const state = get();
    const htmlFile = state.files.find(f => f.name.endsWith('.html'))?.content || '';
    const cssFile = state.files.find(f => f.name.endsWith('.css'))?.content || '';
    const jsFile = state.files.find(f => f.name.endsWith('.js') && !f.name.endsWith('.jsx'))?.content || '';

    // If no HTML file, create a basic scaffold
    const htmlContent = htmlFile || `<div class="app"><h1>${state.projectName || 'Preview'}</h1><p>Add an index.html file for a full preview.</p></div>`;

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
    <script>
      try { ${jsFile} } catch(e) { console.error(e); }
    <\/script>
  </body>
</html>`;
  }
}));

export default useLabStore;
