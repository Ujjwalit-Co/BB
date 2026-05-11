/**
 * AI Service - Bridge between Express and FastAPI
 * Handles milestone generation, summaries, quizzes, and complexity analysis
 */

const FASTAPI_URL = process.env.FASTAPI_URL || 'http://127.0.0.1:8000';
console.log('[ai.service] Using FastAPI URL:', FASTAPI_URL);

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
export const generateQuiz = async (project, milestone, milestoneNumber) => {
  try {
    const response = await fetch(
      `${FASTAPI_URL}/projects/generate-quiz`,
      { 
        method: 'POST', 
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          project: project,
          milestone: milestone,
          milestone_number: milestoneNumber,
          num_questions: 5
        })
      }
    );

    if (!response.ok) throw new Error(`FastAPI ${response.status}`);
    return await response.json();
  } catch (error) {
    console.error('AI Service - generateQuiz error:', error.message);
    return { success: false, error: error.message };
  }
};

/**
 * Generate all quizzes for a project in the background
 */
import Project from '../models/Project.js';
export const generateQuizzesForProjectBg = async (projectId) => {
  try {
    const project = await Project.findById(projectId);
    if (!project) return;
    
    console.log(`[ai.service] Starting background quiz generation for project ${projectId}`);
    
    // Loop through each milestone and try to generate a quiz if missing
    for (let i = 0; i < project.milestones.length; i++) {
        const ms = project.milestones[i];
        if (!ms.quiz || !ms.quiz.questions || ms.quiz.questions.length === 0) {
            console.log(`[ai.service] Generating quiz for milestone ${ms.number}`);
            const quizData = await generateQuiz(project, ms, ms.number);
            
            if (quizData && quizData.quiz) {
                // Normalize questions
                const normalizedQuestions = quizData.quiz.map(q => {
                  let correctIdx = q.correctAnswer ?? q.correct_answer;
                  let finalIdx = 0;
                  
                  const options = (q.options || []).map(opt => String(opt).trim());
                  
                  if (typeof correctIdx === 'number') {
                    finalIdx = correctIdx;
                  } else if (typeof correctIdx === 'string') {
                    const trimmedCorrect = correctIdx.trim();
                    const exactIdx = options.indexOf(trimmedCorrect);
                    if (exactIdx !== -1) {
                      finalIdx = exactIdx;
                    } else {
                      const lowerCorrect = trimmedCorrect.toLowerCase();
                      const caseInsensitiveIdx = options.findIndex(opt => opt.toLowerCase() === lowerCorrect);
                      if (caseInsensitiveIdx !== -1) {
                        finalIdx = caseInsensitiveIdx;
                      } else {
                        const parsed = parseInt(trimmedCorrect);
                        if (!isNaN(parsed) && parsed >= 0 && parsed < options.length) {
                          finalIdx = parsed;
                        }
                      }
                    }
                  }
                  
                  return {
                    question: q.question,
                    options: options,
                    correctAnswer: finalIdx,
                    explanation: q.explanation || ""
                  };
                });

                // Atomic update to this specific milestone to avoid version conflicts
                await Project.updateOne(
                  { _id: projectId, "milestones.number": ms.number },
                  { $set: { "milestones.$.quiz": { questions: normalizedQuestions } } }
                );
                console.log(`[ai.service] Successfully saved quiz for milestone ${ms.number}`);
            }
        }
    }
    
    console.log(`[ai.service] Completed background quiz generation for project ${projectId}`);
  } catch (error) {
    console.error('AI Service - generateQuizzesForProjectBg error:', error.message);
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

/**
 * Enhance README for AI Tutor - rewrites in a teaching-friendly format
 */
export const enhanceReadmeForTutor = async (readme) => {
  try {
    const response = await fetch(`${FASTAPI_URL}/projects/enhance-readme`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ readme: readme }),
    });

    if (!response.ok) throw new Error(`FastAPI ${response.status}`);
    const data = await response.json();
    return { success: true, enhanced_readme: data.content || readme };
  } catch (error) {
    console.error('AI Service - enhanceReadmeForTutor error:', error.message);
    // Fallback: return original with structured sections
    return { success: false, enhanced_readme: readme, error: error.message };
  }
};

/**
 * Enhance project summary for better clarity
 */
export const enhanceSummary = async (summary, readme) => {
  try {
    const response = await fetch(`${FASTAPI_URL}/projects/enhance-summary`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ summary, readme: readme }),
    });

    if (!response.ok) throw new Error(`FastAPI ${response.status}`);
    const data = await response.json();
    return { success: true, enhanced_summary: data.content || summary };
  } catch (error) {
    console.error('AI Service - enhanceSummary error:', error.message);
    return { success: false, enhanced_summary: summary, error: error.message };
  }
};

/**
 * Enhance milestones with better descriptions and steps
 */
export const enhanceMilestones = async (milestones, readme) => {
  try {
    const response = await fetch(`${FASTAPI_URL}/projects/enhance-milestones`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ milestones, readme: readme }),
    });

    if (!response.ok) throw new Error(`FastAPI ${response.status}`);
    const data = await response.json();
    return { success: true, enhanced_milestones: data.content || milestones };
  } catch (error) {
    console.error('AI Service - enhanceMilestones error:', error.message);
    return { success: false, enhanced_milestones: milestones, error: error.message };
  }
};

export default {
  generateMilestones,
  generateProjectSummary,
  generateQuiz,
  generateQuizzesForProjectBg,
  analyzeComplexity,
  enhanceReadmeForTutor,
  enhanceSummary,
  enhanceMilestones,
};
