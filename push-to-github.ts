import { Octokit } from "@octokit/rest";
import * as fs from "fs";
import * as path from "path";

async function getAccessToken() {
  const hostname = process.env.REPLIT_CONNECTORS_HOSTNAME;
  const xReplitToken = process.env.REPL_IDENTITY 
    ? "repl " + process.env.REPL_IDENTITY 
    : process.env.WEB_REPL_RENEWAL 
    ? "depl " + process.env.WEB_REPL_RENEWAL 
    : null;

  if (!xReplitToken || !hostname) {
    throw new Error("Missing REPLIT_CONNECTORS_HOSTNAME or identity token");
  }

  const resp = await fetch(
    "https://" + hostname + "/api/v2/connection?include_secrets=true&connector_names=github",
    { headers: { "Accept": "application/json", "X-Replit-Token": xReplitToken } }
  );
  const data = await resp.json();
  const conn = data.items?.[0];
  const accessToken = conn?.settings?.access_token || conn?.settings?.oauth?.credentials?.access_token;
  if (!accessToken) throw new Error("GitHub not connected");
  return accessToken;
}

async function main() {
  const token = await getAccessToken();
  const octokit = new Octokit({ auth: token });

  const { data: user } = await octokit.rest.users.getAuthenticated();
  console.log("Authenticated as:", user.login);
  
  const owner = user.login;
  const repo = "bdo-beans";

  // Create repo if not exists
  try {
    const { data: repoData } = await octokit.rest.repos.get({ owner, repo });
    console.log("Repo exists:", owner + "/" + repo);
    
    // If empty, initialize with a README via Contents API
    if (repoData.size === 0) {
      console.log("Repo is empty, initializing with README...");
      await octokit.rest.repos.createOrUpdateFileContents({
        owner, repo,
        path: "README.md",
        message: "Initial commit",
        content: Buffer.from("# Bdo Beans\n").toString("base64")
      });
      console.log("Initialized repo");
      await new Promise(r => setTimeout(r, 2000));
    }
  } catch (e: any) {
    if (e.status === 404) {
      await octokit.rest.repos.createForAuthenticatedUser({
        name: repo,
        description: "Bdo Beans (بدو بينز) - Arabic RTL marketplace for specialty coffee, tea, and matcha",
        private: false,
        auto_init: true
      });
      console.log("Created repo:", owner + "/" + repo);
      await new Promise(r => setTimeout(r, 3000));
    } else throw e;
  }

  // Collect all project files
  const root = "/home/runner/workspace";
  const skipDirs = new Set([".git", "node_modules", ".local", "attached_assets", ".config", ".cache", ".upm", "tmp", "dist"]);
  const skipFiles = new Set([".replit", "replit.nix", "generated-icon.png", "package-lock.json"]);

  function collectFiles(dir: string, prefix: string = ""): { path: string; fullPath: string }[] {
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    const results: { path: string; fullPath: string }[] = [];
    for (const entry of entries) {
      const relPath = prefix ? prefix + "/" + entry.name : entry.name;
      if (entry.isDirectory()) {
        if (skipDirs.has(entry.name)) continue;
        results.push(...collectFiles(path.join(dir, entry.name), relPath));
      } else {
        if (skipFiles.has(entry.name)) continue;
        results.push({ path: relPath, fullPath: path.join(dir, entry.name) });
      }
    }
    return results;
  }

  const files = collectFiles(root);
  console.log("Files to push:", files.length);

  // Create blobs for each file
  const treeItems: any[] = [];
  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    const content = fs.readFileSync(file.fullPath);
    const isText = !file.path.match(/\.(png|jpg|jpeg|gif|ico|woff|woff2|ttf|eot|svg)$/i);
    
    if (isText) {
      const { data: blob } = await octokit.rest.git.createBlob({
        owner, repo,
        content: content.toString("base64"),
        encoding: "base64"
      });
      treeItems.push({ path: file.path, mode: "100644" as const, type: "blob" as const, sha: blob.sha });
    } else {
      const { data: blob } = await octokit.rest.git.createBlob({
        owner, repo,
        content: content.toString("base64"),
        encoding: "base64"
      });
      treeItems.push({ path: file.path, mode: "100644" as const, type: "blob" as const, sha: blob.sha });
    }
    
    if ((i + 1) % 20 === 0) console.log(`  Uploaded ${i + 1}/${files.length} files...`);
  }
  console.log(`  Uploaded ${files.length}/${files.length} files`);

  // Create tree
  const { data: tree } = await octokit.rest.git.createTree({ owner, repo, tree: treeItems });
  console.log("Tree created:", tree.sha);

  // Check if there's an existing commit
  let parentSha: string | undefined;
  try {
    const { data: ref } = await octokit.rest.git.getRef({ owner, repo, ref: "heads/main" });
    parentSha = ref.object.sha;
  } catch (e) {
    // No main branch yet
  }

  // Create commit
  const commitData: any = {
    owner, repo,
    message: "Bdo Beans - Full-stack Arabic RTL marketplace for specialty coffee, tea, and matcha\n\nFeatures:\n- Multi-role (Buyer/Supplier/Admin) with Supabase Auth\n- Apple Minimal Luxury × Bedouin Identity design\n- Product catalog with filters, price tiers, shipping zones\n- Cart, checkout, order management\n- Arabic/English i18n with RTL support\n- Framer Motion animations",
    tree: tree.sha
  };
  if (parentSha) commitData.parents = [parentSha];

  const { data: commit } = await octokit.rest.git.createCommit(commitData);
  console.log("Commit created:", commit.sha);

  // Update or create main branch ref
  try {
    await octokit.rest.git.updateRef({ owner, repo, ref: "heads/main", sha: commit.sha, force: true });
    console.log("Updated main branch");
  } catch (e) {
    await octokit.rest.git.createRef({ owner, repo, ref: "refs/heads/main", sha: commit.sha });
    console.log("Created main branch");
  }

  console.log(`\nDone! Code pushed to: https://github.com/${owner}/${repo}`);
}

main().catch(e => { console.error("Error:", e.message); process.exit(1); });
