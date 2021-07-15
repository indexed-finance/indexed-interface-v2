import { GITHUB_KEY } from "config";
import { Octokit } from "@octokit/core";

const octokit = new Octokit({ auth: GITHUB_KEY });

export async function openDataPullRequest(
  title: string,
  slug: string,
  content: string
) {
  const mostRecentCommitSha = await getMostRecentCommitSha();
  const {
    name,
    ref,
    sha: newBranchSha,
  } = await createNewBranch(mostRecentCommitSha);
  const contributionBlobSha = await createContributionBlob(content);
  const updatedTreeSha = await createNewTree(
    slug,
    newBranchSha,
    contributionBlobSha
  );
  const newCommitSha = await createNewCommit(
    title,
    newBranchSha,
    updatedTreeSha
  );

  await updateNewBranch(ref, newCommitSha);
  await createPullRequest(name, title);

  window.location.reload();
}

// #region Helpers

async function getMostRecentCommitSha() {
  const {
    data: {
      object: { sha: mostRecentCommitSha },
    },
  } = await octokit.request("GET /repos/{owner}/{repo}/git/ref/{ref}", {
    owner: "indexed-finance",
    repo: "indexed-interface",
    ref: "heads/main",
  });

  return mostRecentCommitSha;
}

async function createNewBranch(commitSha: string) {
  const branchName = `automated-branch-${Math.floor(Math.random() * 13337)}`;
  const ref = `heads/${branchName}`;
  const {
    data: {
      object: { sha: branchSha },
    },
  } = await octokit.request("POST /repos/{owner}/{repo}/git/refs", {
    owner: "indexed-finance",
    repo: "indexed-interface",
    ref: `refs/${ref}`,
    sha: commitSha,
  });

  return { name: branchName, ref, sha: branchSha };
}

async function createContributionBlob(content: string) {
  const {
    data: { sha: contributionBlobSha },
  } = await octokit.request("POST /repos/{owner}/{repo}/git/blobs", {
    owner: "indexed-finance",
    repo: "indexed-interface",
    content,
  });

  return contributionBlobSha;
}

async function createNewTree(
  slug: string,
  newBranchTreeSha: string,
  blobSha: string
) {
  const {
    data: { sha: newTreeSha },
  } = await octokit.request("POST /repos/{owner}/{repo}/git/trees", {
    owner: "indexed-finance",
    repo: "indexed-interface",
    base_tree: newBranchTreeSha,
    tree: [
      {
        path: `src/data/learn/${slug}.md`,
        mode: "100644",
        type: "commit",
        sha: blobSha,
      },
    ],
  });

  return newTreeSha;
}

async function createNewCommit(
  title: string,
  mostRecentCommitSha: string,
  newTreeSha: string
) {
  const {
    data: { sha: commitSha },
  } = await octokit.request("POST /repos/{owner}/{repo}/git/commits", {
    owner: "indexed-finance",
    repo: "indexed-interface",
    message: title,
    parents: [mostRecentCommitSha],
    tree: newTreeSha,
  });

  return commitSha;
}

async function updateNewBranch(newBranchRef: string, newCommitSha: string) {
  await octokit.request("PATCH /repos/{owner}/{repo}/git/refs/{ref}", {
    owner: "indexed-finance",
    repo: "indexed-interface",
    ref: newBranchRef,
    sha: newCommitSha,
  });
}

async function createPullRequest(head: string, title: string) {
  await octokit.request("POST /repos/{owner}/{repo}/pulls", {
    owner: "indexed-finance",
    repo: "indexed-interface",
    head,
    base: "contribute",
    title,
  });
}
// #endregion
