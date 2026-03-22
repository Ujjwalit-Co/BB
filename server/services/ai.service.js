/**
 * AI Service - Bridge between Express and FastAPI
 * Handles milestone generation, summaries, quizzes, and complexity analysis
 */

const FASTAPI_URL = process.env.FASTAPI_URL || 'http://localhost:8000';

/**
 * Generate milestones from project README and code files
 */
export const generateMilestones = async (readme, files, techStack) => {
  try {
    const response = await fetch(`${FASTAPI_URL}/projects/generate-overview`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        readme_content: readme,
        code_files: files || [],
        tech_stack: techStack || [],
      }),
    });

    if (!response.ok) {
      throw new Error(`FastAPI returned ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('AI Service - generateMilestones error:', error.message);
    // Return fallback milestones if FastAPI is down
    return {
      success: false,
      error: error.message,
      milestones: generateFallbackMilestones(readme),
    };
  }
};

/**
 * Generate project summary from README
 */
export const generateProjectSummary = async (readme, files) => {
  try {
    const response = await fetch(`${FASTAPI_URL}/projects/generate-overview`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        readme_content: readme,
        code_files: files || [],
      }),
    });

    if (!response.ok) throw new Error(`FastAPI ${response.status}`);
    return await response.json();
  } catch (error) {
    console.error('AI Service - generateProjectSummary error:', error.message);
    return { success: false, summary: readme?.substring(0, 300) || '' };
  }
};

/**
 * Generate quiz for a milestone
 */
export const generateQuiz = async (projectId, milestoneNumber) => {
  try {
    const response = await fetch(
      `${FASTAPI_URL}/milestones/${projectId}/${milestoneNumber}/quiz`,
      { method: 'GET', headers: { 'Content-Type': 'application/json' } }
    );

    if (!response.ok) throw new Error(`FastAPI ${response.status}`);
    return await response.json();
  } catch (error) {
    console.error('AI Service - generateQuiz error:', error.message);
    return { success: false, error: error.message };
  }
};

/**
 * Analyze project complexity from code files
 */
export const analyzeComplexity = async (files, techStack) => {
  try {
    // Estimate complexity based on file count and tech stack
    const fileCount = files?.length || 0;
    const complexity = fileCount <= 3 ? 'beginner' : fileCount <= 8 ? 'intermediate' : 'advanced';
    return { success: true, complexity, fileCount };
  } catch (error) {
    return { success: false, complexity: 'beginner' };
  }
};

/**
 * Fallback milestone generation when FastAPI is unavailable
 */
function generateFallbackMilestones(readme) {
  const lines = (readme || '').split('\n').filter(l => l.trim());
  const title = lines[0]?.replace(/^#+\s*/, '') || 'Project';

  return [
    {
      number: 1,
      title: 'Project Setup & Environment',
      description: `Set up the development environment for ${title}. Install dependencies and configure the project structure.`,
      estimatedTime: '30 min',
      isFree: true,
    },
    {
      number: 2,
      title: 'Core Implementation',
      description: 'Build the main functionality and core logic of the application.',
      estimatedTime: '1-2 hours',
      isFree: false,
    },
    {
      number: 3,
      title: 'UI & Frontend Development',
      description: 'Create the user interface and connect it to the backend services.',
      estimatedTime: '1-2 hours',
      isFree: false,
    },
    {
      number: 4,
      title: 'Testing & Deployment',
      description: 'Write tests, fix bugs, and prepare the project for deployment.',
      estimatedTime: '1 hour',
      isFree: false,
    },
  ];
}

export default {
  generateMilestones,
  generateProjectSummary,
  generateQuiz,
  analyzeComplexity,
};
