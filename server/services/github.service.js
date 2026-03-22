/**
 * GitHub Service - Handles repository downloads and ZIP generation
 * Used when a buyer purchases a project to deliver the code
 */

const GITHUB_API = 'https://api.github.com';

/**
 * Generate a ZIP download URL for a GitHub repository
 * @param {string} githubToken - Decrypted seller's GitHub access token
 * @param {string} owner - Repository owner
 * @param {string} repo - Repository name
 * @param {string} branch - Branch to download (default: main)
 * @returns {Object} { downloadUrl, expiresAt }
 */
export const getRepositoryDownloadUrl = async (githubToken, owner, repo, branch = 'main') => {
  try {
    // GitHub provides archive download links that work with tokens
    // Format: https://api.github.com/repos/{owner}/{repo}/zipball/{ref}
    const downloadUrl = `${GITHUB_API}/repos/${owner}/${repo}/zipball/${branch}`;

    // Verify the repo is accessible with the token
    const verifyResponse = await fetch(`${GITHUB_API}/repos/${owner}/${repo}`, {
      headers: {
        Authorization: `Bearer ${githubToken}`,
        Accept: 'application/vnd.github.v3+json',
      },
    });

    if (!verifyResponse.ok) {
      throw new Error(`Repository not accessible: ${verifyResponse.status}`);
    }

    return {
      success: true,
      downloadUrl,
      token: githubToken, // Needed for authenticated download
      repo: `${owner}/${repo}`,
      branch,
    };
  } catch (error) {
    console.error('GitHub Service - getRepositoryDownloadUrl error:', error.message);
    return { success: false, error: error.message };
  }
};

/**
 * Stream a repository ZIP to the buyer
 * This is called when the buyer clicks "Download" after purchase
 */
export const streamRepositoryZip = async (githubToken, owner, repo, branch = 'main') => {
  try {
    const response = await fetch(
      `${GITHUB_API}/repos/${owner}/${repo}/zipball/${branch}`,
      {
        headers: {
          Authorization: `Bearer ${githubToken}`,
          Accept: 'application/vnd.github.v3+json',
        },
        redirect: 'follow',
      }
    );

    if (!response.ok) {
      throw new Error(`GitHub download failed: ${response.status}`);
    }

    return {
      success: true,
      stream: response.body,
      headers: {
        'Content-Type': 'application/zip',
        'Content-Disposition': `attachment; filename="${repo}-${branch}.zip"`,
      },
    };
  } catch (error) {
    console.error('GitHub Service - streamRepositoryZip error:', error.message);
    return { success: false, error: error.message };
  }
};

/**
 * Get repository metadata (size, last updated, etc.)
 */
export const getRepositoryInfo = async (githubToken, owner, repo) => {
  try {
    const response = await fetch(`${GITHUB_API}/repos/${owner}/${repo}`, {
      headers: {
        Authorization: `Bearer ${githubToken}`,
        Accept: 'application/vnd.github.v3+json',
      },
    });

    if (!response.ok) throw new Error(`GitHub API ${response.status}`);
    const data = await response.json();

    return {
      success: true,
      name: data.name,
      fullName: data.full_name,
      description: data.description,
      size: data.size, // KB
      language: data.language,
      defaultBranch: data.default_branch,
      private: data.private,
      updatedAt: data.updated_at,
      htmlUrl: data.html_url,
    };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

export default {
  getRepositoryDownloadUrl,
  streamRepositoryZip,
  getRepositoryInfo,
};
