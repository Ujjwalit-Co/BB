/**
 * Field Normalization Utility
 * 
 * Maps backend field names to frontend expectations to ensure
 * consistency between Express (MongoDB) and FastAPI (JSON) data sources.
 */

/**
 * Normalize project data from backend to frontend format
 * @param {Object} project - Raw project from backend
 * @returns {Object} Normalized project object
 */
export function normalizeProject(project) {
  if (!project) return null;

  return {
    // ID mapping
    id: project._id || project.id,
    _id: project._id || project.id,
    
    // Basic fields
    title: project.title,
    
    // Field name mappings for consistency
    description: project.description || project.summary,
    summary: project.summary || project.description,
    
    // Complexity/Level mapping
    complexity: project.complexity || project.level,
    level: project.level || project.complexity,
    
    // Tech stack mapping
    techStack: project.techStack || project.technology || [],
    technology: project.technology || project.techStack || [],
    
    // Badge/tags mapping
    badge: project.badge || 'beginner',
    tags: project.tags || [],
    
    // Price fields (ensure string format for display)
    price: project.price,
    isOnSale: project.isOnSale || false,
    originalPrice: project.originalPrice,
    
    // Category
    category: project.category || '',
    
    // Milestones with ID generation
    milestones: project.milestones?.map((milestone, idx) => ({
      ...milestone,
      id: milestone.id || `m${idx + 1}`,
      name: milestone.name || milestone.title,
      title: milestone.title || milestone.name,
      number: milestone.number || idx + 1,
      status: milestone.status || 'locked',
      
      // Steps with ID generation
      steps: milestone.steps?.map((step, stepIdx) => ({
        ...step,
        id: step.id || `m${idx + 1}-s${stepIdx + 1}`,
        stepNumber: step.stepNumber || step.step_number || stepIdx + 1,
        status: step.status || 'locked'
      })) || []
    })) || [],
    
    // Thumbnail
    thumbnail: project.thumbnail,
    
    // Seller
    seller: project.seller,
    
    // Metadata
    createdAt: project.createdAt,
    updatedAt: project.updatedAt,
    
    // Preserve all other fields
    ...project
  };
}

/**
 * Normalize milestone data
 * @param {Object} milestone - Raw milestone from backend
 * @param {number} index - Milestone index for ID generation
 * @returns {Object} Normalized milestone object
 */
export function normalizeMilestone(milestone, index = 0) {
  if (!milestone) return null;

  return {
    id: milestone.id || `m${index + 1}`,
    number: milestone.number || index + 1,
    name: milestone.name || milestone.title,
    title: milestone.title || milestone.name,
    description: milestone.description,
    status: milestone.status || 'locked',
    steps: milestone.steps?.map((step, stepIdx) => 
      normalizeStep(step, index, stepIdx)
    ) || [],
    quiz: milestone.quiz ? normalizeQuiz(milestone.quiz) : null
  };
}

/**
 * Normalize step data
 * @param {Object} step - Raw step from backend
 * @param {number} milestoneIndex - Parent milestone index
 * @param {number} stepIndex - Step index
 * @returns {Object} Normalized step object
 */
export function normalizeStep(step, milestoneIndex = 0, stepIndex = 0) {
  if (!step) return null;

  return {
    id: step.id || `m${milestoneIndex + 1}-s${stepIndex + 1}`,
    stepNumber: step.stepNumber || step.step_number || stepIndex + 1,
    title: step.title,
    description: step.description,
    content: step.content,
    codeBlocks: step.codeBlocks || [],
    verificationSteps: step.verificationSteps,
    hints: step.hints,
    status: step.status || 'locked'
  };
}

/**
 * Normalize quiz data to consistent format
 * @param {Object} quiz - Raw quiz from backend
 * @returns {Object} Normalized quiz object
 */
export function normalizeQuiz(quiz) {
  if (!quiz) return null;

  // Handle array format (FastAPI)
  if (Array.isArray(quiz)) {
    return {
      questions: quiz.map(q => ({
        question: q.question,
        options: q.options,
        correctAnswer: typeof q.correct_answer === 'number' 
          ? q.correct_answer 
          : q.options?.indexOf(q.correct_answer) || 0,
        explanation: q.explanation
      }))
    };
  }

  // Handle object format (Express)
  return {
    questions: quiz.questions?.map(q => ({
      question: q.question,
      options: q.options,
      correctAnswer: typeof q.correctAnswer === 'number'
        ? q.correctAnswer
        : q.options?.indexOf(q.correctAnswer) || 0,
      explanation: q.explanation
    })) || []
  };
}

/**
 * Normalize user data
 * @param {Object} user - Raw user from backend
 * @returns {Object} Normalized user object
 */
export function normalizeUser(user) {
  if (!user) return null;

  return {
    id: user._id || user.id,
    _id: user._id || user.id,
    email: user.email,
    name: user.name,
    fullName: user.fullName || user.name,
    role: user.role,
    credits: user.credits || 0,
    isSeller: user.isSeller || false,
    isVerifiedSeller: user.isVerifiedSeller || false,
    githubConnected: user.githubConnected || !!user.githubAccessToken,
    profileImage: user.profileImage
  };
}

export default {
  normalizeProject,
  normalizeMilestone,
  normalizeStep,
  normalizeQuiz,
  normalizeUser
};
