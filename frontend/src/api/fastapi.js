import axios from 'axios';

const FASTAPI_URL = import.meta.env.VITE_FASTAPI_URL || 'http://localhost:8000';

const fastapi = axios.create({
  baseURL: FASTAPI_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// ─── Projects API ─────────────────────────────────────────
export const projectsApi = {
  listProjects: async () => {
    const { data } = await fastapi.get('/projects/');
    return data;
  },

  getProject: async (projectId) => {
    const { data } = await fastapi.get(`/projects/${projectId}`);
    return data;
  },

  getProjectOverview: async (projectId) => {
    const { data } = await fastapi.get(`/projects/${projectId}/overview`);
    return data;
  },

  getProjectQuiz: async (projectId, numQuestions = 5) => {
    const { data } = await fastapi.get(`/projects/${projectId}/quiz`, {
      params: { num_questions: numQuestions },
    });
    return data;
  },
};

// ─── Milestones API ───────────────────────────────────────
export const milestonesApi = {
  getMilestoneGuide: async (projectId, milestoneNumber) => {
    const { data } = await fastapi.get(
      `/projects/${projectId}/milestones/${milestoneNumber}/guide`
    );
    return data;
  },

  getMilestoneHint: async (projectId, milestoneNumber) => {
    const { data } = await fastapi.get(
      `/projects/${projectId}/milestones/${milestoneNumber}/hint`
    );
    return data;
  },

  askMilestoneQuestion: async (projectId, milestoneNumber, question, files = []) => {
    // Basic mapping to strip out large unnecessary UI state elements from files
    const cleanFiles = files.map(f => ({
      name: f.name,
      content: f.content,
      language: f.language
    }));

    const response = await fastapi.post(`/projects/${projectId}/milestones/${milestoneNumber}/ask`, {
      question,
      files: cleanFiles,
      lab_mode: 'browser'
    });
    return response.data;
  },

  completeMilestone: async (projectId, milestoneNumber) => {
    const { data } = await fastapi.post(
      `/projects/${projectId}/milestones/${milestoneNumber}/complete`
    );
    return data;
  },

  getMilestoneQuiz: async (projectId, milestoneNumber, numQuestions = 5) => {
    const { data } = await fastapi.get(
      `/projects/${projectId}/milestones/${milestoneNumber}/quiz`,
      { params: { num_questions: numQuestions } }
    );
    return data;
  },

  // ─── Step-level endpoints ─────────────────────────────────
  listSteps: async (projectId, milestoneNumber) => {
    const { data } = await fastapi.get(
      `/projects/${projectId}/milestones/${milestoneNumber}/steps`
    );
    return data;
  },

  getStep: async (projectId, milestoneNumber, stepNumber) => {
    const { data } = await fastapi.get(
      `/projects/${projectId}/milestones/${milestoneNumber}/steps/${stepNumber}`
    );
    return data;
  },

  getStepGuide: async (projectId, milestoneNumber, stepNumber) => {
    const { data } = await fastapi.get(
      `/projects/${projectId}/milestones/${milestoneNumber}/steps/${stepNumber}/guide`
    );
    return data;
  },

  askStepQuestion: async (projectId, milestoneNumber, stepNumber, question) => {
    const { data } = await fastapi.post(
      `/projects/${projectId}/milestones/${milestoneNumber}/steps/${stepNumber}/ask`,
      { question }
    );
    return data;
  },

  completeStep: async (projectId, milestoneNumber, stepNumber) => {
    const { data } = await fastapi.post(
      `/projects/${projectId}/milestones/${milestoneNumber}/steps/${stepNumber}/complete`
    );
    return data;
  },
};

export default fastapi;
