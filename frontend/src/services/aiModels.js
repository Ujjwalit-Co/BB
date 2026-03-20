/**
 * Represents a single file suggestion from the AI.
 */
class AISuggestion {
  /**
   * @param {Object} data
   * @param {string} data.name - The filename (e.g., 'App.jsx')
   * @param {'edit' | 'create' | 'delete'} data.action - The action to perform
   * @param {string} [data.suggestedCode] - The new code (full replacement)
   * @param {string} [data.original] - Original text to replace (partial update)
   * @param {string} [data.replacement] - Replacement text (partial update)
   */
  constructor({ name, action, suggestedCode, original, replacement }) {
    this.name = name;
    this.action = action;
    this.suggestedCode = suggestedCode || '';
    this.original = original || '';
    this.replacement = replacement || '';
  }

  /**
   * Returns a clean summary of the suggestion.
   */
  get summary() {
    return `${this.action.charAt(0).toUpperCase() + this.action.slice(1)} ${this.name}`;
  }
}

/**
 * Represents a terminal command suggested by the AI.
 */
class AICommand {
  /**
   * @param {string} command - The raw shell command
   */
  constructor(command) {
    this.command = command;
  }
}

/**
 * Represents a full response from the AI Tutor.
 */
class AIResponse {
  /**
   * @param {Object} data
   * @param {string} data.answer - The main text response
   * @param {Object[]} [data.suggestedFiles] - Raw file suggestion objects
   * @param {string[]} [data.suggestedCommands] - Raw command strings
   */
  constructor({ answer, suggestedFiles = [], suggestedCommands = [] }) {
    this.answer = answer;
    this.suggestions = suggestedFiles.map(f => new AISuggestion(f));
    this.commands = suggestedCommands.map(c => new AICommand(c));
    this.timestamp = new Date().toISOString();
  }

  /**
   * Checks if the response contains any actionable suggestions.
   */
  get hasActions() {
    return this.suggestions.length > 0 || this.commands.length > 0;
  }

  /**
   * Static helper to parse raw API response.
   * @param {Object} rawData 
   * @returns {AIResponse}
   */
  static fromAPI(rawData) {
    return new AIResponse({
      answer: rawData.answer || '',
      suggestedFiles: rawData.suggestedFiles || [],
      suggestedCommands: rawData.suggestedCommands || []
    });
  }
}

export { AIResponse, AISuggestion, AICommand };
