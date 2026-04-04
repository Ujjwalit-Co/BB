import crypto from "crypto";
import User from "../models/User.js";

const ENCRYPTION_KEY_BUFFER = crypto.createHash('sha256').update(String(process.env.GITHUB_ENCRYPTION_KEY || 'default_fallback_key')).digest();
const IV_LENGTH = 16;

function encrypt(text) {
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv("aes-256-cbc", ENCRYPTION_KEY_BUFFER, iv);
  let encrypted = cipher.update(text, "utf8", "hex");
  encrypted += cipher.final("hex");
  return iv.toString("hex") + ":" + encrypted;
}

function decrypt(text) {
  const parts = text.split(":");
  const iv = Buffer.from(parts[0], "hex");
  const encrypted = parts[1];
  const decipher = crypto.createDecipheriv("aes-256-cbc", ENCRYPTION_KEY_BUFFER, iv);
  let decrypted = decipher.update(encrypted, "hex", "utf8");
  decrypted += decipher.final("utf8");
  return decrypted;
}

// =====================
// CONNECT GITHUB - Redirect to GitHub OAuth
// =====================
export const connectGitHub = async (req, res) => {
  try {
    const clientId = process.env.GITHUB_CLIENT_ID;
    const redirectUri = `${process.env.FRONTEND_URL || "http://localhost:5173"}/seller/github-callback`;
    
    // Allow user to choose scope: 'public' = public repos only, 'all' = all repos
    const accessLevel = req.query.access || "public";
    const scope = accessLevel === "all" ? "repo read:user" : "public_repo read:user";
    const state = req.user?._id?.toString() || "anonymous";

    const githubAuthUrl = `https://github.com/login/oauth/authorize?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&scope=${encodeURIComponent(scope)}&state=${state}`;

    res.json({ success: true, url: githubAuthUrl });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// =====================
// GITHUB CALLBACK - Exchange code for token
// =====================
export const githubCallback = async (req, res) => {
  try {
    const { code } = req.body;

    if (!code) {
      return res.status(400).json({ message: "Authorization code is required" });
    }

    // Exchange code for access token
    const tokenResponse = await fetch("https://github.com/login/oauth/access_token", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({
        client_id: process.env.GITHUB_CLIENT_ID,
        client_secret: process.env.GITHUB_CLIENT_SECRET,
        code,
      }),
    });

    const tokenData = await tokenResponse.json();

    if (tokenData.error) {
      return res.status(400).json({ message: tokenData.error_description || "Failed to get access token" });
    }

    const accessToken = tokenData.access_token;

    // Get GitHub user info
    const userResponse = await fetch("https://api.github.com/user", {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    const githubUser = await userResponse.json();

    // Encrypt and store token
    const encryptedToken = encrypt(accessToken);

    await User.findByIdAndUpdate(req.user._id, {
      githubAccessToken: encryptedToken,
      githubConnected: true,
      githubUsername: githubUser.login,
    });

    res.json({
      success: true,
      message: "GitHub connected successfully",
      githubUsername: githubUser.login,
    });
  } catch (error) {
    res.status(500).json({ error: error.message, message: "Failed to connect GitHub" });
  }
};

// =====================
// DISCONNECT GITHUB
// =====================
export const disconnectGitHub = async (req, res) => {
  try {
    await User.findByIdAndUpdate(req.user._id, {
      githubAccessToken: null,
      githubConnected: false,
      githubUsername: null,
    });

    res.json({ success: true, message: "GitHub disconnected" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// =====================
// LIST REPOSITORIES
// =====================
export const listRepositories = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (!user.githubConnected || !user.githubAccessToken) {
      return res.status(400).json({ message: "GitHub not connected" });
    }

    const accessToken = decrypt(user.githubAccessToken);

    const response = await fetch("https://api.github.com/user/repos?per_page=100&sort=updated&type=all", {
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    if (!response.ok) {
      return res.status(400).json({ message: "Failed to fetch repositories" });
    }

    const repos = await response.json();

    const formattedRepos = repos.map((repo) => ({
      id: repo.id,
      name: repo.name,
      fullName: repo.full_name,
      description: repo.description,
      private: repo.private,
      htmlUrl: repo.html_url,
      language: repo.language,
      updatedAt: repo.updated_at,
      stargazersCount: repo.stargazers_count,
      defaultBranch: repo.default_branch,
    }));

    res.json({ success: true, repositories: formattedRepos });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// =====================
// GET REPO FILES - Fetch file tree from a repo
// =====================
export const getRepoFiles = async (req, res) => {
  try {
    const { owner, repo } = req.params;
    const user = await User.findById(req.user._id);

    if (!user.githubConnected || !user.githubAccessToken) {
      return res.status(400).json({ message: "GitHub not connected" });
    }

    const accessToken = decrypt(user.githubAccessToken);

    // Get the file tree
    const response = await fetch(
      `https://api.github.com/repos/${owner}/${repo}/git/trees/HEAD?recursive=1`,
      { headers: { Authorization: `Bearer ${accessToken}` } }
    );

    if (!response.ok) {
      return res.status(400).json({ message: "Failed to fetch repository files" });
    }

    const data = await response.json();

    // Filter to only show relevant files
    const files = data.tree
      .filter((item) => item.type === "blob")
      .filter((item) => {
        const ext = item.path.split(".").pop().toLowerCase();
        return ["js", "jsx", "ts", "tsx", "py", "java", "cpp", "c", "html", "css", "json", "md", "yml", "yaml", "env", "txt"].includes(ext);
      })
      .map((item) => ({
        path: item.path,
        size: item.size,
        sha: item.sha,
      }));

    res.json({ success: true, files });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// =====================
// GET FILE CONTENT - Fetch a specific file from repo
// =====================
export const getFileContent = async (req, res) => {
  try {
    const { owner, repo } = req.params;
    const { path } = req.query;
    const user = await User.findById(req.user._id);

    if (!user.githubConnected || !user.githubAccessToken) {
      return res.status(400).json({ message: "GitHub not connected" });
    }

    const accessToken = decrypt(user.githubAccessToken);

    const response = await fetch(
      `https://api.github.com/repos/${owner}/${repo}/contents/${path}`,
      { headers: { Authorization: `Bearer ${accessToken}` } }
    );

    if (!response.ok) {
      return res.status(400).json({ message: "Failed to fetch file content" });
    }

    const data = await response.json();

    // Decode base64 content
    const content = Buffer.from(data.content, "base64").toString("utf-8");

    res.json({
      success: true,
      filename: data.name,
      path: data.path,
      content,
      size: data.size,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// =====================
// GET GITHUB STATUS - Check if GitHub is connected
// =====================
export const getGitHubStatus = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    res.json({
      success: true,
      connected: user.githubConnected || false,
      username: user.githubUsername || null,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
